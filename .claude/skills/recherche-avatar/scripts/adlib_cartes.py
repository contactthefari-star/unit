"""Range les résultats bruts du serveur MCP d'Ad Library : fusion par identifiant, regroupement par DOMAINE
d'arrivée, survie, durée, déclinaisons, squelette de fichier pour le décompte d'autorité.

Pourquoi : un vendeur = une boutique, pas une page Facebook ; le volume se lit sur le compteur de Meta, les cartes
(25 à 30 par recherche) ne sont qu'un ÉCHANTILLON ; la survie et la durée donnent la preuve. Ce script fait le calcul
à ta place, sur les cartes, et le dit.

Usage :
  python3 adlib_cartes.py ajoute resultat.json --etiquette "us_mot-cle" [--cartes adlib/cartes.json]
        Fusionne un résultat de search_ad_library (ou scrape_ad_library_url) enregistré dans un fichier JSON.
  python3 adlib_cartes.py domaines [--cartes adlib/cartes.json] [--aujourdhui AAAA-MM-JJ]
        Tableau par domaine d'arrivée : cartes, actives, survie (actives depuis 30 jours ou plus), plus longue, déclinaisons.
  python3 adlib_cartes.py pubs --domaine exemple.com [--n 10]
        Les pubs d'un domaine, de la plus longue à la plus courte, avec lien Ad Library et verdict de preuve PAR LA DURÉE.
  python3 adlib_cartes.py concepts --domaine exemple.com --csv concepts.csv
        Écrit un squelette de fichier pour decompte_autorite.py (porte_parole à remplir en REGARDANT chaque pub).

Champs lus (ceux que le serveur rend, selon sa version) : library_id, advertiser, body, started_running, stopped_running,
status, run_days, ads_using_creative, landing_domain, landing_url, cta. Si `run_days` et `status` manquent, la durée est
calculée depuis la date de début (formats reconnus : AAAA-MM-JJ, « Oct 1, 2025 », « 1 Oct 2025 », « 1 octobre 2025 »,
JJ/MM/AAAA) ; si la date n'est pas lisible, la durée reste NON MESURÉE. Une pub dont le statut n'est pas donné compte
comme « inconnue » : relance la recherche en incluant les pubs coupées (active_status = all) si ton serveur le permet.
Verdict de preuve par la durée seulement : 90 jours ou plus ET (3 variantes ou plus = forme forte, ou même texte sur
2 cartes ou plus = forme faible). Pour une pub diffusée en Europe, c'est la portée (900 000 ou plus) qui décide
(references/05) : ce script ne la connaît pas.
"""
import argparse
import csv
import datetime
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

CHAMPS = ("advertiser", "body", "status", "run_days", "started_running", "stopped_running", "ads_using_creative",
          "landing_domain", "landing_url", "cta", "platforms", "creative_image", "ad_details_url", "link_text")
MOIS = {"jan": 1, "janv": 1, "janvier": 1, "january": 1, "feb": 2, "fev": 2, "fév": 2, "fevr": 2, "février": 2, "february": 2,
        "mar": 3, "mars": 3, "march": 3, "apr": 4, "avr": 4, "avril": 4, "april": 4, "may": 5, "mai": 5,
        "jun": 6, "juin": 6, "june": 6, "jul": 7, "juil": 7, "juillet": 7, "july": 7, "aug": 8, "aou": 8, "août": 8, "august": 8,
        "sep": 9, "sept": 9, "septembre": 9, "september": 9, "oct": 10, "octobre": 10, "october": 10,
        "nov": 11, "novembre": 11, "november": 11, "dec": 12, "déc": 12, "décembre": 12, "december": 12}


def lit_date(t):
    """Date lisible ou None."""
    if not t:
        return None
    t = str(t).strip().lower().replace(".", "")
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", t)
    if m:
        return datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    m = re.match(r"(\d{1,2})/(\d{1,2})/(\d{4})", t)
    if m:
        return datetime.date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
    m = re.search(r"([a-zéûô]+)\s+(\d{1,2}),?\s+(\d{4})", t)
    if m and m.group(1) in MOIS:
        return datetime.date(int(m.group(3)), MOIS[m.group(1)], int(m.group(2)))
    m = re.search(r"(\d{1,2})\s+([a-zéûô]+)\s+(\d{4})", t)
    if m and m.group(2) in MOIS:
        return datetime.date(int(m.group(3)), MOIS[m.group(2)], int(m.group(1)))
    return None


def jours(c, aujourdhui):
    if isinstance(c.get("run_days"), (int, float)):
        return int(c["run_days"])
    debut = lit_date(c.get("started_running"))
    if not debut:
        return None
    fin = lit_date(c.get("stopped_running")) or aujourdhui
    return max(0, (fin - debut).days)


def statut(c):
    s = (c.get("status") or "").lower()
    if s in ("active", "inactive"):
        return s
    if c.get("stopped_running"):
        return "inactive"
    return "inconnu"


def domaine(c):
    d = (c.get("landing_domain") or "").strip().lower()
    if not d and c.get("landing_url"):
        d = (urlparse(c["landing_url"]).hostname or "").lower()
    return re.sub(r"^www\.", "", d) or "(inconnu)"


def clef_texte(c):
    return re.sub(r"\s+", " ", (c.get("body") or "")).strip().lower()[:80]


def charge(chemin):
    p = Path(chemin)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def fusionne(cartes, resultat, etiquette):
    n = 0
    for a in resultat.get("ads", []):
        lid = a.get("library_id")
        if not lid:
            continue
        e = cartes.get(lid, {})
        e.update({k: a.get(k) for k in CHAMPS if a.get(k) is not None})
        e.setdefault("requetes", [])
        if etiquette not in e["requetes"]:
            e["requetes"].append(etiquette)
        if resultat.get("country"):
            e["pays_requete"] = resultat["country"]
        cartes[lid] = e
        n += 1
    return n


def lien(lid):
    return "https://www.facebook.com/ads/library/?id=" + lid


def verdict_duree(j, variantes, memes):
    if j is None:
        return "durée NON MESURÉE"
    if j >= 90 and (variantes or 0) >= 3:
        return "prouvée par la durée (forme forte)"
    if j >= 90 and memes >= 2:
        return "prouvée par la durée (forme faible)"
    return "non prouvée"


def par_domaine(cartes, aujourdhui):
    g = {}
    for lid, c in cartes.items():
        g.setdefault(domaine(c), []).append((lid, c))
    lignes = []
    for d, cs in g.items():
        js = [(jours(c, aujourdhui), statut(c)) for _, c in cs]
        actives = [j for j, s in js if s == "active"]
        lignes.append({
            "domaine": d, "cartes": len(cs), "actives": sum(1 for _, s in js if s == "active"),
            "inactives": sum(1 for _, s in js if s == "inactive"), "inconnues": sum(1 for _, s in js if s == "inconnu"),
            "survie_30j": sum(1 for j in actives if j is not None and j >= 30),
            "plus_longue": max([j for j, _ in js if j is not None] or [None]) if any(j is not None for j, _ in js) else None,
            "declinaisons_max": max([c.get("ads_using_creative") or 0 for _, c in cs] or [0]),
            "pages": sorted({c.get("advertiser") or "?" for _, c in cs}),
            "textes_distincts": len({clef_texte(c) for _, c in cs})})
    lignes.sort(key=lambda r: (-r["survie_30j"], -r["actives"], -r["cartes"]))
    return lignes


def pubs_du_domaine(cartes, dom, aujourdhui):
    cs = [(lid, c) for lid, c in cartes.items() if domaine(c) == dom]
    memes = {}
    for _, c in cs:
        memes[clef_texte(c)] = memes.get(clef_texte(c), 0) + 1
    out = []
    for lid, c in cs:
        j = jours(c, aujourdhui)
        out.append({"id": lid, "page": c.get("advertiser"), "jours": j, "statut": statut(c),
                    "variantes": c.get("ads_using_creative") or 0, "cartes_meme_texte": memes[clef_texte(c)],
                    "verdict": verdict_duree(j, c.get("ads_using_creative"), memes[clef_texte(c)]),
                    "lien": lien(lid), "texte": (c.get("body") or "").replace("\n", " ")[:160]})
    out.sort(key=lambda r: (-(r["jours"] if r["jours"] is not None else -1), r["id"]))
    return out


def principal(argv=None):
    ap = argparse.ArgumentParser(description="Range les résultats bruts d'Ad Library")
    ap.add_argument("commande", choices=["ajoute", "domaines", "pubs", "concepts"])
    ap.add_argument("fichier", nargs="?")
    ap.add_argument("--cartes", default="cartes.json")
    ap.add_argument("--etiquette", default="recherche")
    ap.add_argument("--aujourdhui")
    ap.add_argument("--domaine")
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--csv")
    a = ap.parse_args(argv)
    auj = lit_date(a.aujourdhui) if a.aujourdhui else datetime.date.today()
    cartes = charge(a.cartes)
    if a.commande == "ajoute":
        if not a.fichier:
            sys.exit("Donne le fichier JSON d'un résultat de recherche.")
        try:
            res = json.loads(Path(a.fichier).read_text(encoding="utf-8"))
        except (OSError, ValueError):
            sys.exit("Fichier illisible ou pas du JSON : %s" % a.fichier)
        n = fusionne(cartes, res, a.etiquette)
        Path(a.cartes).write_text(json.dumps(cartes, ensure_ascii=False, indent=1), encoding="utf-8")
        print("%d cartes fusionnées ; %d au total dans %s. Compteur annoncé par Meta : %s (le volume se lit sur ce compteur, "
              "pas sur les cartes)." % (n, len(cartes), a.cartes, res.get("result_count") or res.get("results_count") or res.get("total_results") or "NON LU"))
        return n
    if not cartes:
        sys.exit("Aucune carte dans %s. Lance d'abord la commande « ajoute »." % a.cartes)
    if a.commande == "domaines":
        lignes = par_domaine(cartes, auj)
        print("ÉCHANTILLON de %d cartes (25 à 30 par recherche). Jours calculés au %s." % (len(cartes), auj.isoformat()))
        print("| Domaine | Cartes | Actives | Coupées | Statut inconnu | Survie (actives depuis 30 j ou plus) | Plus longue (j) | Déclinaisons max | Textes distincts | Pages |")
        print("|---|---|---|---|---|---|---|---|---|---|")
        for r in lignes:
            print("| %s | %d | %d | %d | %d | %d | %s | %d | %d | %s |" % (
                r["domaine"], r["cartes"], r["actives"], r["inactives"], r["inconnues"], r["survie_30j"],
                "NON MESURÉ" if r["plus_longue"] is None else r["plus_longue"], r["declinaisons_max"], r["textes_distincts"], ", ".join(r["pages"])))
        return lignes
    if not a.domaine:
        sys.exit("Donne --domaine.")
    pubs = pubs_du_domaine(cartes, a.domaine.lower(), auj)
    if a.commande == "pubs":
        for p in pubs[:a.n]:
            print("- %s | %s | %s j | %s | %d variantes, %d cartes au même texte | %s\n    %s\n    %s" % (
                p["id"], p["page"], "NON MESURÉ" if p["jours"] is None else p["jours"], p["statut"], p["variantes"],
                p["cartes_meme_texte"], p["verdict"], p["lien"], p["texte"]))
        return pubs
    chemin = a.csv or "concepts.csv"
    vus, lignes = set(), []
    for p in pubs:
        k = p["texte"][:80].lower()
        if k in vus:
            continue
        vus.add(k)
        lignes.append([("C%d" % (len(lignes) + 1)), "", "US", a.domaine, p["id"], "" if p["jours"] is None else p["jours"],
                       p["variantes"], p["cartes_meme_texte"], "", "", "", "texte", p["texte"]])
    with open(chemin, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["code", "groupe", "marche", "domaine", "id", "jours", "variantes", "cartes_meme_texte", "portee_ue_uk",
                    "porte_parole", "enjeu_famille", "methode", "accroche"])
        w.writerows(lignes)
    print("%d concepts (un texte distinct = un concept) écrits dans %s. À remplir EN REGARDANT chaque pub : groupe, marché "
          "(US ou UE), portée si publiée, porte_parole, enjeu_famille, methode (vu)." % (len(lignes), chemin))
    return lignes


if __name__ == "__main__":
    principal()
