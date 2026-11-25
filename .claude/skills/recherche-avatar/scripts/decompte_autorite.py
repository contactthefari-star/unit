"""Décompte des porte-parole dans les pubs PROUVÉES d'une niche : quelle autorité convertit ?

Tu remplis un tableau, UNE LIGNE PAR CONCEPT de pub (un texte distinct = un concept, quel que soit le nombre
d'identifiants Ad Library qui le portent), puis le script applique la règle de preuve et compte.

Règle de preuve (WINNER PROUVÉ), seuils modifiables :
  - couverture totale en Europe (UE ou Royaume-Uni) >= 900 000 personnes : PROUVÉ par la portée ;
  - sinon, pub hors UE seule (marché US et autres, Royaume-Uni compris) : en ligne depuis 90 jours ou plus
    ET déclinée : au moins 3 variantes = forme FORTE ; le même texte sur 2 cartes ou plus = forme FAIBLE ;
  - pub diffusée en UE seulement (marche = UE ou FR) dont la portée est sous le seuil ou inconnue : non prouvée.
  - tout le reste : non prouvé (une idée, jamais un modèle).
Le porte-parole est QUI PARLE dans la pub (le « je » du texte ou le visage à l'écran), pas qui est cité.

Colonnes du fichier (CSV avec en-tête, séparateur virgule ou point-virgule, UTF-8 ; ou JSON = liste d'objets) :
  code, groupe (niche ou sous-niche), marche (US, UE, FR, UK...), domaine (la marque), id (identifiant de la pub),
  jours (jours en ligne), variantes, cartes_meme_texte, portee_ue_uk (nombre ou vide), porte_parole
  (libre : pair, specialiste, chirurgien, soignant_proximite, enfant_adulte, jeune_proche, conjoint,
  autre_proche, communaute, marque_texte, createur...), enjeu_famille (texte libre : enfants,
  parents ou proches cités comme ENJEU, pas comme porte-parole), methode (vu ou texte : as-tu REGARDÉ la pub ?),
  accroche.

Usage :
  python3 decompte_autorite.py concepts.csv
  python3 decompte_autorite.py concepts.csv --seuil-ue 900000 --seuil-jours 90 --json decompte.json
  python3 decompte_autorite.py --modele > concepts.csv      (affiche un fichier modèle à remplir)

Ce que le script imprime : (1) le tableau par porte-parole ; (2) les deux contrôles de robustesse, SANS la
marque dominante puis en forme forte seule (+ portée UE) : le classement change-t-il ? (3) les concepts où
la famille est l'enjeu ; (4) la liste des prouvés. Écris ensuite le verdict À LA MAIN, avec ses limites.
Un classement fait sur le texte seul (methode = texte) n'est pas un classement vu : le script le signale.
"""
import argparse
from pathlib import Path
import collections
import csv
import io
import json
import sys

MODELE = """code;groupe;marche;domaine;id;jours;variantes;cartes_meme_texte;portee_ue_uk;porte_parole;enjeu_famille;methode;accroche
EX1;niche_a;US;marque-exemple-1.com;1000000000001;120;5;4;;pair;enfants;vu;EXEMPLE FICTIF a remplacer
EX2;niche_a;UE;marque-exemple-2.fr;1000000000002;58;2;3;1200000;specialiste;;texte;EXEMPLE FICTIF a remplacer
"""

ALIAS = {"porte-parole": "porte_parole", "portee": "portee_ue_uk", "portée": "portee_ue_uk", "reach": "portee_ue_uk",
         "days": "jours", "variants": "variantes", "marque": "domaine", "market": "marche", "marché": "marche"}


def nombre(v):
    if v is None:
        return None
    if isinstance(v, (int, float)):
        return v
    s = str(v).strip().replace(" ", "").replace(" ", "").replace(",", ".")
    if not s:
        return None
    try:
        x = float(s)
        return int(x) if x == int(x) else x
    except ValueError:
        return None


def lit(chemin):
    brut = Path(chemin).read_text(encoding="utf-8-sig")
    if brut.lstrip().startswith("["):
        lignes = json.loads(brut)
    else:
        dialecte = csv.Sniffer().sniff(brut.split("\n", 1)[0], delimiters=",;\t")
        lignes = list(csv.DictReader(io.StringIO(brut), dialect=dialecte))
    out = []
    for l in lignes:
        d = {}
        for k, v in l.items():
            if k is None:
                continue
            k2 = ALIAS.get(k.strip().lower(), k.strip().lower())
            d[k2] = v
        for k in ("jours", "variantes", "cartes_meme_texte", "portee_ue_uk"):
            d[k] = nombre(d.get(k))
        for k in ("code", "groupe", "marche", "domaine", "id", "porte_parole", "enjeu_famille", "methode", "accroche"):
            v = d.get(k)
            d[k] = "" if v is None else str(v).strip()
        out.append(d)
    return out


def preuve(c, seuil_ue=900000, seuil_jours=90):
    p, j = c.get("portee_ue_uk"), c.get("jours") or 0
    v, mt = c.get("variantes") or 0, c.get("cartes_meme_texte") or 0
    if p and p >= seuil_ue:
        return "PROUVE_UE"
    if c.get("marche", "").upper() in ("FR", "UE", "EU"):
        return "non (portée sous le seuil)" if p else "non mesuré (UE)"
    if j >= seuil_jours and v >= 3:
        return "PROUVE_fort"
    if j >= seuil_jours and mt >= 2:
        return "PROUVE_faible"
    return "non"


def prouve(c):
    return c["preuve"].startswith("PROUVE")


def table(concepts):
    t = collections.OrderedDict()
    for c in concepts:
        r = t.setdefault(c["porte_parole"] or "(non classé)", {"concepts": 0, "prouves": 0, "ue": 0, "fort": 0, "faible": 0, "fr_ue": 0})
        r["concepts"] += 1
        if prouve(c):
            r["prouves"] += 1
            r["ue"] += c["preuve"] == "PROUVE_UE"
            r["fort"] += c["preuve"] == "PROUVE_fort"
            r["faible"] += c["preuve"] == "PROUVE_faible"
    return t


def classement(t):
    return [k for k, v in sorted(t.items(), key=lambda kv: (-kv[1]["prouves"], -kv[1]["concepts"], kv[0]))]


def imprime_table(t, titre):
    total = sum(v["prouves"] for v in t.values())
    print("\n## %s (%d concepts, %d prouvés)" % (titre, sum(v["concepts"] for v in t.values()), total))
    print("| Porte-parole | Concepts vus | Prouvés | Part des prouvés | dont portée UE | dont forme forte | dont forme faible |")
    print("|---|---|---|---|---|---|---|")
    for k in classement(t):
        v = t[k]
        part = "%d %%" % round(100 * v["prouves"] / total) if total else "0 %"
        print("| %s | %d | %d | %s | %d | %d | %d |" % (k, v["concepts"], v["prouves"], part, v["ue"], v["fort"], v["faible"]))


def principal(argv=None):
    ap = argparse.ArgumentParser(description="Décompte des porte-parole prouvés")
    ap.add_argument("fichier", nargs="?")
    ap.add_argument("--modele", action="store_true")
    ap.add_argument("--seuil-ue", type=int, default=900000)
    ap.add_argument("--seuil-jours", type=int, default=90)
    ap.add_argument("--json")
    a = ap.parse_args(argv)
    if a.modele:
        sys.stdout.write(MODELE)
        return None
    if not a.fichier:
        sys.exit("Donne le fichier de concepts (CSV ou JSON), ou --modele pour en obtenir un à remplir.")
    try:
        concepts = lit(a.fichier)
    except OSError:
        sys.exit("Fichier introuvable : %s" % a.fichier)
    if not concepts:
        sys.exit("Le fichier ne contient aucun concept.")
    for c in concepts:
        c["preuve"] = preuve(c, a.seuil_ue, a.seuil_jours)
    t = table(concepts)
    imprime_table(t, "Tous les concepts")
    prouves = [c for c in concepts if prouve(c)]
    texte_seul = [c for c in concepts if c.get("methode", "").lower() == "texte"]
    if texte_seul:
        print("\nATTENTION : %d concept(s) classé(s) d'après le texte seul (methode = texte), pas regardés. "
              "Le dire dans le verdict." % len(texte_seul))
    if prouves:
        marques = collections.Counter(c["domaine"] for c in prouves if c.get("domaine"))
        if marques:
            dom, n = marques.most_common(1)[0]
            print("\nMarque dominante parmi les prouvés : %s (%d sur %d)." % (dom, n, len(prouves)))
            t2 = table([c for c in concepts if c.get("domaine") != dom])
            imprime_table(t2, "Contrôle 1 : SANS la marque dominante « %s »" % dom)
            same = classement(t)[:2] == classement(t2)[:2]
            print("\nLe classement de tête %s sans cette marque." % ("ne change pas" if same else "CHANGE"))
        t3 = table([c for c in concepts if c["preuve"] in ("PROUVE_UE", "PROUVE_fort") or not prouve(c)])
        imprime_table(t3, "Contrôle 2 : forme forte seule + portée UE (les formes faibles sont retirées)")
        same3 = classement(t)[:2] == classement(t3)[:2]
        print("\nLe classement de tête %s en forme forte seule." % ("ne change pas" if same3 else "CHANGE"))
    famille = [c for c in concepts if c.get("enjeu_famille")]
    if famille:
        print("\n## Famille citée comme ENJEU (pas comme porte-parole)")
        for c in famille:
            print("- %s | %s | %s | enjeu : %s | %s" % (c.get("code"), c["preuve"], c["porte_parole"], c["enjeu_famille"], (c.get("accroche") or "")[:70]))
    print("\n## Les concepts prouvés")
    for c in prouves:
        print("- %s | %s | %s | %s | %s j, %s var., %s cartes | portée %s | %s | %s" % (
            c.get("code"), c.get("groupe"), c.get("marche"), c.get("domaine"), c.get("jours"), c.get("variantes"),
            c.get("cartes_meme_texte"), c.get("portee_ue_uk"), c["preuve"], c["porte_parole"]))
    if a.json:
        Path(a.json).write_text(json.dumps({"concepts": concepts}, ensure_ascii=False, indent=1), encoding="utf-8")
    return t


if __name__ == "__main__":
    principal()
