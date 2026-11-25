"""Compte les expressions d'un corpus PAR TYPE de source et rend FRÉQUENT / MOYEN / RARE.

Règle (règle du skill, validée à l'usage) :
  FRÉQUENT : au moins 5 occurrences, sur au moins 3 types de source. Seule classe qui entre dans une copie
             (hook, script, texte de pub, page produit).
  MOYEN    : 3 à 4 occurrences, ou beaucoup d'occurrences mais sur 2 types de source seulement ou moins.
             Note de recherche : on continue à la chercher, on ne l'écrit pas dans une copie.
  RARE     : 1 ou 2 occurrences. Interdit en copie, même si la phrase est belle. Aide à COMPRENDRE.
  ABSENT   : 0 occurrence (utile : un mot de ton produit qui n'est dans la bouche de personne).
Une occurrence = une autrice : la même personne qui répète sa phrase compte une fois (si le corpus
donne l'auteur ; sinon l'unité est le message, et tu le dis dans ton dossier).
Seules comptent les sources du MARCHÉ DE LANCEMENT, dans sa langue (--marche). Les pages et avis du site
du concurrent étudié (type « vendeur ») sont exclus. Les réponses YouTube sont exclues par défaut.

Usage :
  python3 compte_verbatims.py corpus_fr.tsv --expressions expressions.txt
  python3 compte_verbatims.py corpus_fr.tsv --exp "mal à la nuque|cervicales" --exp "ne plus pouvoir (dormir|tourner la tête)" \\
        --sujet "oreiller|dormir|nuit" --probleme "mal|douleur|souffr" --exemples 2 --marche fr --md lexique.md

expressions.txt : une expression par ligne, « libellé<TABULATION>regex » ou seulement la regex (qui sert alors
de libellé). Insensible à la casse. Pense aux variantes d'orthographe et de forme (« j'arrête », « arrêter »).

--sujet et --probleme définissent ta CIBLE : un message qui parle de ton sujet (--sujet) ET du problème
(--probleme). Le tableau donne alors deux colonnes en plus et une seconde classe calculée sur la cible.
Pourquoi : un corpus large fait sortir presque tout en FRÉQUENT ; ce qui compte, c'est que l'expression
revienne chez les personnes qui vivent TON problème. Si les deux classes divergent, dis-le et prends la plus
prudente pour la copie.

Sortie : un tableau Markdown (FRÉQUENT en tête) et, avec --exemples N, N citations d'exemple avec URL par
expression (mot pour mot, copiées du corpus). --json F écrit les comptes pour un autre outil.
"""
import argparse
from pathlib import Path
import json
import re
import sys

ORDRE_TYPES = ["youtube", "tiktok", "instagram", "forum", "blog", "avis", "presse", "pub"]
RANG = {"FRÉQUENT": 0, "MOYEN": 1, "RARE": 2, "ABSENT": 3}


def classe(total, nb_types):
    if total >= 5 and nb_types >= 3:
        return "FRÉQUENT"
    if total >= 3:
        return "MOYEN"
    if total >= 1:
        return "RARE"
    return "ABSENT"


def lit_corpus(chemin, marche=None, types_ok=None, exclure=("vendeur",), avec_reponses=False):
    lignes = []
    with open(chemin, encoding="utf-8") as f:
        for l in f:
            p = l.rstrip("\n").split("\t")
            if len(p) < 5:
                continue
            p = p + [""] * (7 - len(p))
            likes, typ, date, url, texte, auteur, m = p[:7]
            if typ in exclure or (types_ok and typ not in types_ok):
                continue
            if marche and m and m != marche:
                continue
            if not avec_reponses and texte.startswith("↳"):
                continue
            try:
                lk = int(float(likes or 0))
            except ValueError:
                lk = 0
            lignes.append({"likes": lk, "type": typ, "date": date, "url": url, "texte": texte, "auteur": auteur})
    return lignes


def lit_expressions(chemin=None, directes=()):
    out = []
    if chemin:
        for l in Path(chemin).read_text(encoding="utf-8").splitlines():
            l = l.rstrip("\n")
            if not l.strip() or l.startswith("#"):
                continue
            if "\t" in l:
                lib, rx = l.split("\t", 1)
            else:
                lib, rx = l, l
            out.append((lib.strip(), rx.strip()))
    for rx in directes:
        out.append((rx, rx))
    return out


def unite(ligne, par_message):
    if ligne["auteur"] and not par_message:
        return (ligne["type"], ligne["auteur"])
    return (ligne["type"], ligne["url"], ligne["texte"])


def compte(lignes, expressions, sujet=None, probleme=None, par_message=False):
    rs = re.compile(sujet, re.I) if sujet else None
    rp = re.compile(probleme, re.I) if probleme else None
    resultats = []
    for lib, rx in expressions:
        try:
            c = re.compile(rx, re.I)
        except re.error as e:
            sys.exit("Expression invalide « %s » : %s" % (lib, e))
        vus_tous, vus_cible, vus_sujet = {}, {}, {}
        trouvees = []
        for l in lignes:
            if not c.search(l["texte"]):
                continue
            u = unite(l, par_message)
            vus_tous.setdefault(u, l)
            dans_sujet = (not rs) or bool(rs.search(l["texte"]))
            dans_probleme = (not rp) or bool(rp.search(l["texte"]))
            if rs and dans_sujet:
                vus_sujet.setdefault(u, l)
            if dans_sujet and dans_probleme and (rs or rp):
                vus_cible.setdefault(u, l)
            trouvees.append((l, dans_sujet and dans_probleme))
        par_type = {}
        for u in vus_tous:
            par_type[u[0]] = par_type.get(u[0], 0) + 1
        total, nt = len(vus_tous), len(par_type)
        r = {"expression": lib, "par_type": par_type, "total": total, "types": nt, "classe": classe(total, nt)}
        if rs or rp:
            cible_type = {}
            for u in vus_cible:
                cible_type[u[0]] = cible_type.get(u[0], 0) + 1
            r["dans_sujet"] = len(vus_sujet) if rs else None
            r["cible"] = len(vus_cible)
            r["types_cible"] = len(cible_type)
            r["classe_cible"] = classe(len(vus_cible), len(cible_type))
        pref = [l for l, cib in trouvees if cib] if (rs or rp) else [l for l, _ in trouvees]
        pref = pref or [l for l, _ in trouvees]
        pref.sort(key=lambda x: -x["likes"])
        choisies, urls = [], set()
        for l in pref:
            if l["url"] not in urls:
                urls.add(l["url"])
                choisies.append(l)
        r["exemples"] = [{"texte": l["texte"][:400], "url": l["url"], "type": l["type"], "date": l["date"], "likes": l["likes"]}
                         for l in choisies[:5]]
        resultats.append(r)
    resultats.sort(key=lambda r: (RANG[r["classe"]], -r["total"]))
    return resultats


def volume(lignes):
    v = {}
    for l in lignes:
        v[l["type"]] = v.get(l["type"], 0) + 1
    return v


def tableau(resultats, avec_cible):
    types = [t for t in ORDRE_TYPES if any(t in r["par_type"] for r in resultats)]
    autres = sorted({t for r in resultats for t in r["par_type"]} - set(types))
    types += autres
    ent = ["Expression"] + types + ["Total", "Types"]
    if avec_cible:
        ent += ["Dans le sujet", "Sujet ET problème"]
    ent += ["Classe (corpus)"] + (["Classe (cible)"] if avec_cible else [])
    out = ["| " + " | ".join(ent) + " |", "|" + "---|" * len(ent)]
    for r in resultats:
        cel = [r["expression"]] + [str(r["par_type"].get(t, 0)) for t in types] + [str(r["total"]), str(r["types"])]
        if avec_cible:
            cel += [str(r["dans_sujet"]) if r["dans_sujet"] is not None else "", str(r["cible"])]
        cel += ["**%s**" % r["classe"]] + (["**%s**" % r["classe_cible"]] if avec_cible else [])
        out.append("| " + " | ".join(cel) + " |")
    return "\n".join(out)


def exemples(resultats, n):
    out = []
    for r in resultats:
        if not r["exemples"] or n <= 0:
            continue
        out.append("**%s** (%s)" % (r["expression"], r["classe"]))
        for e in r["exemples"][:n]:
            out.append("- « %s » · %s · %s · %s j'aime · %s" % (e["texte"], e["type"], e["date"] or "date inconnue", e["likes"], e["url"]))
    return "\n".join(out)


def principal(argv=None, flux=None):
    ap = argparse.ArgumentParser(description="Compte les expressions par type de source (FRÉQUENT / MOYEN / RARE)")
    ap.add_argument("corpus")
    ap.add_argument("--expressions")
    ap.add_argument("--exp", action="append", default=[])
    ap.add_argument("--sujet")
    ap.add_argument("--probleme")
    ap.add_argument("--marche")
    ap.add_argument("--types", help="liste de types gardés, séparés par des virgules")
    ap.add_argument("--exclure", default="vendeur")
    ap.add_argument("--avec-reponses", action="store_true")
    ap.add_argument("--par-message", action="store_true", help="l'unité est le message, même si l'auteur est connu")
    ap.add_argument("--exemples", type=int, default=0)
    ap.add_argument("--md")
    ap.add_argument("--json")
    a = ap.parse_args(argv)
    flux = flux or sys.stdout
    exps = lit_expressions(a.expressions, a.exp)
    if not exps:
        sys.exit("Donne au moins une expression (--expressions fichier ou --exp regex).")
    try:
        lignes = lit_corpus(a.corpus, a.marche, set(a.types.split(",")) if a.types else None,
                            tuple(x for x in a.exclure.split(",") if x), a.avec_reponses)
    except OSError:
        sys.exit("Corpus introuvable : %s. Crée-le avec corpus.py." % a.corpus)
    if not lignes:
        sys.exit("Le corpus est vide après filtres (marché, types). Vérifie --marche et --types.")
    res = compte(lignes, exps, a.sujet, a.probleme, a.par_message)
    avec_cible = bool(a.sujet or a.probleme)
    vol = "Volume des unités comptées : " + ", ".join("%s %d" % kv for kv in sorted(volume(lignes).items()))
    unite_txt = "Unité de comptage : un message (auteur inconnu)." if a.par_message or not any(l["auteur"] for l in lignes) \
        else "Unité de comptage : une autrice (la même personne compte une fois par type de source)."
    texte = vol + "\n" + unite_txt + "\n\n" + tableau(res, avec_cible)
    if a.exemples:
        texte += "\n\n" + exemples(res, a.exemples)
    flux.write(texte + "\n")
    if a.md:
        Path(a.md).write_text(texte + "\n", encoding="utf-8")
    if a.json:
        Path(a.json).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    return res


if __name__ == "__main__":
    principal()
