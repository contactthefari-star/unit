"""Aplatit tout ce qui a été récolté en UN corpus : une ligne par message, dédoublonné, avec son type de source.

Format de sortie (colonnes séparées par une tabulation) :
  likes  type  date  url  texte  auteur  marche
  - type : youtube, tiktok, instagram, forum, blog, avis, presse, pub, vendeur
  - les réponses YouTube sont marquées « ↳ » au début du texte (le comptage les ignore par défaut :
    elles contiennent les réponses du créateur lui-même)
  - auteur : pseudo quand le service le donne (sert à la règle « une occurrence = une autrice »)
  - marche : l'étiquette que tu donnes avec --marche (par exemple fr ou us). RÈGLE : un corpus par
    marché. Seul le marché de lancement, dans sa langue, compte pour classer un verbatim.

Usage :
  python3 corpus.py --brut brut --marche fr > corpus_fr.tsv
  python3 corpus.py --brut brut_source --marche us --vendeur site-du-concurrent.com > corpus_us.tsv
  python3 corpus.py --brut brut --types mes_types.txt > corpus.tsv
  python3 corpus.py --brut brut --sources sources.json > corpus.tsv     (écrit aussi la liste des sources)

Ce qui est lu dans le dossier brut :
  yt_comm_*.json (youtube.py)         sc_tt_comm_*.json et sc_ig_comm_*.json (commentaires_sociaux.py)
  pages/*.txt (pages.py)              web_*.json (cherche_web.py : extraits de recherche, avec leur URL)

Le type d'une page ou d'un extrait est deviné par son adresse. Corrige avec --types : un fichier texte,
une règle par ligne « morceau_d_adresse<TABULATION>type ». --vendeur DOMAINE[,DOMAINE] classe en
« vendeur » les pages et avis publiés par le site du concurrent étudié : ils ne servent JAMAIS de preuve
et le comptage les exclut.
"""
import argparse
from pathlib import Path
import datetime
import glob
import json
import os
import re
import sys

REGLES = [
    ("pub", ["facebook.com/ads", "adstransparency"]),
    ("youtube", ["youtube.com", "youtu.be"]),
    ("tiktok", ["tiktok.com"]),
    ("instagram", ["instagram.com"]),
    ("avis", ["trustpilot", "amazon.", "avis", "review", "etsy.", "ebay.", "cdiscount", "aliexpress", "fnac.", "darty."]),
    ("forum", ["reddit.com", "forum", "quora", "commentcamarche", "stackexchange", "discourse", "communaute", "community"]),
    ("blog", ["blog", "wordpress", "blogspot", "canalblog", "over-blog", "medium.com", "substack", "wixsite"]),
]


def propre(t):
    return " ".join((t or "").split())


def devine_type(url, extra=(), vendeurs=()):
    u = (url or "").lower()
    for d in vendeurs:
        if d and d.lower() in u:
            return "vendeur"
    for morceau, typ in extra:
        if morceau.lower() in u:
            return typ
    for typ, mots in REGLES:
        if any(m in u for m in mots):
            return typ
    return "presse"


def lit_types(chemin):
    regles = []
    if chemin:
        for l in Path(chemin).read_text(encoding="utf-8").splitlines():
            l = l.rstrip("\n")
            if l.strip() and not l.startswith("#") and "\t" in l:
                m, t = l.split("\t", 1)
                regles.append((m.strip(), t.strip()))
    return regles


def auteur_de(c):
    for k in ("auteur", "author", "username", "user_name"):
        if isinstance(c.get(k), str) and c.get(k):
            return c[k]
    u = c.get("user")
    if isinstance(u, dict):
        return u.get("unique_id") or u.get("username") or u.get("nickname") or u.get("uid") or ""
    return ""


def depuis_youtube(chemin):
    d = json.loads(Path(chemin).read_text(encoding="utf-8"))
    for f in (d if isinstance(d, list) else [d]):
        for c in f.get("commentaires", []):
            yield (c.get("likes", 0), "youtube", c.get("date", ""), f["url"], c.get("texte"), c.get("auteur", ""))
            for r in c.get("rep", []):
                yield (r.get("likes", 0), "youtube", "", f["url"], "↳ " + (r.get("texte") or ""), "")


def depuis_tiktok(chemin):
    d = json.loads(Path(chemin).read_text(encoding="utf-8"))
    for c in d.get("comments") or []:
        date = ""
        if c.get("create_time"):
            date = datetime.date.fromtimestamp(c["create_time"]).isoformat()
        yield (c.get("digg_count", 0), "tiktok", date, d.get("url") or "", c.get("text"), auteur_de(c))


def depuis_instagram(chemin):
    d = json.loads(Path(chemin).read_text(encoding="utf-8"))
    for c in d.get("comments") or []:
        yield (c.get("comment_like_count", 0), "instagram", (c.get("created_at") or "")[:10], d.get("url") or "",
               c.get("text"), auteur_de(c))


def depuis_pages(chemin, extra, vendeurs, mini=40):
    lignes = Path(chemin).read_text(encoding="utf-8").split("\n")
    url = lignes[0].strip()
    typ = devine_type(url, extra, vendeurs)
    for l in lignes[1:]:
        l = propre(l)
        if len(l) >= mini:
            yield (0, typ, "", url, l, "")


def depuis_web(chemin, extra, vendeurs, mini=40):
    d = json.loads(Path(chemin).read_text(encoding="utf-8"))
    for res in d.values():
        if not isinstance(res, list):
            continue
        for r in res:
            if not isinstance(r, dict):
                continue
            url = r.get("url", "")
            typ = devine_type(url, extra, vendeurs)
            for x in [r.get("description")] + (r.get("extra_snippets") or []):
                x = propre(re.sub(r"<[^>]+>", "", x or ""))
                if len(x) >= mini:
                    yield (0, typ, r.get("age", ""), url, x, "")


def construit(brut, extra=(), vendeurs=(), marche=""):
    vus, lignes = set(), []

    def ajoute(it):
        likes, typ, date, url, texte, auteur = it
        texte = propre(texte)
        if not texte or (url, texte) in vus:
            return
        vus.add((url, texte))
        lignes.append((likes or 0, typ, date, url, texte, auteur, marche))

    for p in sorted(glob.glob(os.path.join(brut, "yt_comm_*.json"))):
        for it in depuis_youtube(p):
            ajoute(it)
    for p in sorted(glob.glob(os.path.join(brut, "sc_tt_comm_*.json"))):
        for it in depuis_tiktok(p):
            ajoute(it)
    for p in sorted(glob.glob(os.path.join(brut, "sc_ig_comm_*.json"))):
        for it in depuis_instagram(p):
            ajoute(it)
    for p in sorted(glob.glob(os.path.join(brut, "pages", "*.txt"))):
        for it in depuis_pages(p, extra, vendeurs):
            ajoute(it)
    for p in sorted(glob.glob(os.path.join(brut, "web_*.json"))):
        for it in depuis_web(p, extra, vendeurs):
            ajoute(it)
    return lignes


def ecrit(lignes, flux):
    for l in lignes:
        flux.write("\t".join(str(x) for x in l) + "\n")


def principal(argv=None, flux=None):
    ap = argparse.ArgumentParser(description="Aplatit les récoltes en un corpus TSV dédoublonné")
    ap.add_argument("--brut", default="brut")
    ap.add_argument("--marche", default="")
    ap.add_argument("--types")
    ap.add_argument("--vendeur", default="")
    ap.add_argument("--sources", help="écrit aussi la liste des sources distinctes (url, type, marché, nombre de messages)")
    a = ap.parse_args(argv)
    if not os.path.isdir(a.brut):
        sys.exit("Dossier introuvable : %s. Lance d'abord les récoltes (cherche_web.py, pages.py, youtube.py...)." % a.brut)
    vendeurs = [v for v in a.vendeur.split(",") if v]
    lignes = construit(a.brut, lit_types(a.types), vendeurs, a.marche)
    ecrit(lignes, flux or sys.stdout)
    if a.sources:
        src = {}
        for l in lignes:
            if l[3]:
                e = src.setdefault(l[3], {"url": l[3], "type": l[1], "marche": l[6], "messages": 0})
                e["messages"] += 1
        Path(a.sources).write_text(json.dumps(sorted(src.values(), key=lambda e: e["url"]), ensure_ascii=False, indent=1), encoding="utf-8")
        print("%d sources distinctes écrites dans %s" % (len(src), a.sources), file=sys.stderr)
    par = {}
    for l in lignes:
        par[l[1]] = par.get(l[1], 0) + 1
    print("%d lignes : %s" % (len(lignes), ", ".join("%s %d" % kv for kv in sorted(par.items()))), file=sys.stderr)
    return lignes


if __name__ == "__main__":
    principal()
