"""Cherche une expression régulière dans un corpus (corpus.py) et affiche les messages triés par likes.

Usage :
  python3 cherche_corpus.py corpus_fr.tsv "mal à la nuque|cervicales" --n 30
  python3 cherche_corpus.py corpus_fr.tsv "j'arrête" --type forum --url youtube --min-len 80
  python3 cherche_corpus.py corpus_fr.tsv "regex" --sans-reponses

Options :
  --n N            nombre de lignes affichées (défaut 40).
  --type T         garde un seul type de source (youtube, tiktok, instagram, forum, blog, avis, presse, pub, vendeur).
  --url MORCEAU    garde les lignes dont l'URL contient ce morceau.
  --min-len L      ignore les messages de moins de L caractères.
  --sans-reponses  ignore les réponses YouTube (lignes qui commencent par « ↳ »).

Chaque ligne affichée : [likes] type date url :: texte (coupé à 450 caractères). Pour citer, recopie le
texte MOT POUR MOT depuis le corpus avec son URL ; une citation sans URL est interdite.
"""
import argparse
import re
import sys


def lit(chemin):
    with open(chemin, encoding="utf-8") as f:
        for l in f:
            p = l.rstrip("\n").split("\t")
            if len(p) >= 5:
                yield p


def cherche(chemin, regex, type_=None, url=None, mini=0, sans_reponses=False):
    rx = re.compile(regex, re.I)
    res = []
    for p in lit(chemin):
        if type_ and p[1] != type_:
            continue
        if url and url not in p[3]:
            continue
        if len(p[4]) < mini:
            continue
        if sans_reponses and p[4].startswith("↳"):
            continue
        if rx.search(p[4]):
            try:
                lk = int(float(p[0] or 0))
            except ValueError:
                lk = 0
            res.append((lk, p))
    res.sort(key=lambda x: -x[0])
    return res


def principal(argv=None):
    ap = argparse.ArgumentParser(description="Cherche dans un corpus")
    ap.add_argument("corpus")
    ap.add_argument("regex")
    ap.add_argument("--n", type=int, default=40)
    ap.add_argument("--type")
    ap.add_argument("--url")
    ap.add_argument("--min-len", type=int, default=0)
    ap.add_argument("--sans-reponses", action="store_true")
    a = ap.parse_args(argv)
    try:
        res = cherche(a.corpus, a.regex, a.type, a.url, a.min_len, a.sans_reponses)
    except re.error as e:
        sys.exit("Expression régulière invalide : %s" % e)
    except OSError:
        sys.exit("Corpus introuvable : %s. Crée-le avec corpus.py." % a.corpus)
    print(len(res), "résultats")
    for lk, p in res[:a.n]:
        print("[%d] %s %s %s :: %s" % (lk, p[1], p[2], p[3], p[4][:450]))
    return res


if __name__ == "__main__":
    principal()
