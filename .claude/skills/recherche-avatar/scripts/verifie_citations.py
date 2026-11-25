"""Vérifie que chaque citation du dossier existe VRAIMENT dans les sources récoltées.

Règle : une citation recopiée de mémoire est interdite, une citation sans URL aussi. Ce script relit ton
dossier (Markdown) et cherche chaque fragment entre guillemets français « ... » dans le corpus, les pages
lues et les extraits de recherche. Il écrit la liste de ce qu'il n'a PAS retrouvé : tu corriges le dossier
(ou tu retires la citation), jamais l'inverse.

Usage :
  python3 verifie_citations.py AVATAR_mon-produit.md --corpus corpus_fr.tsv --pages brut/pages --web brut
  python3 verifie_citations.py dossier.md --corpus corpus_fr.tsv --ignore etiquettes.txt --exige-url

Options :
  --corpus F      corpus TSV (corpus.py). Plusieurs fois possible.
  --pages D       dossier des pages lues (pages.py).
  --web D         dossier contenant les web_*.json de cherche_web.py.
  --min N         longueur minimale d'un fragment vérifié (défaut 25 caractères).
  --ignore F      fichier de fragments à ne pas vérifier (un par ligne : étiquettes, mots de produit...).
  --exige-url     liste aussi les citations longues (40 caractères ou plus) dont la ligne ne contient aucune URL.

Un fragment avec des coupes « [...] » ou « […] » est vérifié morceau par morceau (chaque morceau d'au moins
15 caractères). La comparaison ignore la casse, les apostrophes typographiques et les espaces multiples.
Code retour 1 s'il manque des citations.
"""
import argparse
from pathlib import Path
import glob
import html
import json
import os
import re
import sys


def norm(t):
    t = html.unescape(t or "")
    t = t.replace("’", "'").replace("‘", "'").replace("\xa0", " ").replace(" ", " ")
    t = t.replace("“", '"').replace("”", '"')
    return " ".join(t.lower().split())


def charge_sources(corpus=(), pages=None, web=None):
    morceaux = []
    for c in corpus:
        for l in Path(c).read_text(encoding="utf-8").splitlines():
            p = l.rstrip("\n").split("\t")
            if len(p) >= 5:
                morceaux.append(norm(p[4]))
    if pages:
        for f in glob.glob(os.path.join(pages, "*.txt")):
            morceaux.append(norm(Path(f).read_text(encoding="utf-8", errors="replace")))
    if web:
        for f in glob.glob(os.path.join(web, "web_*.json")):
            d = json.loads(Path(f).read_text(encoding="utf-8"))
            for res in d.values():
                for r in res:
                    for x in [r.get("title"), r.get("description")] + (r.get("extra_snippets") or []):
                        morceaux.append(norm(re.sub(r"<[^>]+>", "", x or "")))
    return "\n".join(morceaux)


def fragments(md, mini=25):
    out = []
    for no, l in enumerate(md.split("\n"), 1):
        for f in re.findall(r"«\s*([^»]+?)\s*»", l):
            if len(f) >= mini:
                out.append((no, f, l))
    return out


def retrouve(frag, grand):
    pieces = re.split(r"\s*(?:\[…\]|\[\.\.\.\]|…)\s*", frag)
    pieces = [norm(p).strip(" .,;:!?\"'") for p in pieces]
    pieces = [p for p in pieces if len(p) >= 15]
    if not pieces:
        return True  # rien d'assez long à vérifier
    return all(p in grand for p in pieces)


def verifie(md, grand, mini=25, ignore=(), exige_url=False):
    ign = {norm(x) for x in ignore}
    manquantes, sans_url, total = [], [], 0
    for no, f, ligne in fragments(md, mini):
        if norm(f) in ign:
            continue
        total += 1
        if not retrouve(f, grand):
            manquantes.append((no, f))
        if exige_url and len(f) >= 40 and "http" not in ligne:
            sans_url.append((no, f))
    return total, manquantes, sans_url


def principal(argv=None):
    ap = argparse.ArgumentParser(description="Vérifie que les citations du dossier existent dans les sources")
    ap.add_argument("dossier")
    ap.add_argument("--corpus", action="append", default=[])
    ap.add_argument("--pages")
    ap.add_argument("--web")
    ap.add_argument("--min", type=int, default=25)
    ap.add_argument("--ignore")
    ap.add_argument("--exige-url", action="store_true")
    a = ap.parse_args(argv)
    try:
        md = Path(a.dossier).read_text(encoding="utf-8")
    except OSError:
        sys.exit("Dossier introuvable : %s" % a.dossier)
    ign = Path(a.ignore).read_text(encoding="utf-8").splitlines() if a.ignore else []
    grand = charge_sources(a.corpus, a.pages, a.web)
    if not grand.strip():
        sys.exit("Aucune source lue : donne --corpus, --pages ou --web.")
    total, manquantes, sans_url = verifie(md, grand, a.min, ign, a.exige_url)
    print("%d citations vérifiées, %d non retrouvées dans les sources." % (total, len(manquantes)))
    for no, f in manquantes:
        print("  NON RETROUVÉE (ligne %d) : « %s »" % (no, f[:140]))
    if a.exige_url:
        print("%d citation(s) longue(s) sans URL sur leur ligne." % len(sans_url))
        for no, f in sans_url:
            print("  SANS URL (ligne %d) : « %s »" % (no, f[:140]))
    return 1 if (manquantes or sans_url) else 0


if __name__ == "__main__":
    sys.exit(principal())
