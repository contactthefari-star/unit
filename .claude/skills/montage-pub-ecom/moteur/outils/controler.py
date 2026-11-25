#!/usr/bin/env python3
"""Passe un montage au controle. Chaque regle vient d'une mesure faite sur une
pub gagnante ou d'un defaut de montage observe, jamais d'une intuition.

Un controle qui ne dit pas d'ou vient son seuil ne se discute pas, donc chaque
verdict porte sa reference. Rien n'est bloquant : ce sont des ecarts, pas des
notes.
"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import format_bp      # le format du blueprint : version, migrations,
                      # et « entree() », le point d'entree canonique

RACINE = Path(__file__).resolve().parent.parent
REC = format_bp.DOSSIER_PROJETS

# Valeurs de comparaison, mesurees sur une pub gagnante. Seuils utilises plus bas :
# mots par seconde, duree, duree du premier plan.
REF = {"mots_s": 3.98, "parole_pct": 99.8, "plan_moyen": 1.87,
       "plan_ouverture": 1.33, "duree": 50.5}

SEUIL_SILENCE_DBFS = -45.0
SEUIL_SILENCE_S = 0.30
PREUVE_MINI = 2.50      # sous 2,5 s une preuve ne se croit pas
HOOK_MAXI = 2.00        # le winner ouvre a 1,33 s
RAFALE_N = 4            # 4 plans de suite sous 0,5 s sur le meme cadre
RAFALE_S = 0.50
# Un montage dont tous les plans font la meme longueur n'obeit a aucun texte,
# il obeit a un minuteur.
METRONOME_ECART = 0.18      # ecart-type relatif sous lequel le rythme est plat
METRONOME_MINI = 6          # en dessous de 6 plans la mesure ne veut rien dire


def a_du_son(bp):
    """Le bloc `audio` a-t-il ete mesure ?

    Sans lui, « 0 silence » et « 0 coupe dans un silence » ne sont pas VRAIS,
    ils ne sont pas MESURES. Un blueprint fraichement bati n'a pas ce bloc :
    il s'ecrit apres le rendu. Le distinguer est tout l'objet de rapport().
    Mesure : sans ce garde, un blueprint sans `audio` faisait lever
    le controle ENTIER sur un KeyError, et l'interface perdait les douze
    regles pour une seule donnee absente."""
    return isinstance(bp.get("audio"), dict) and "silences" in bp["audio"]


def silences(bp):
    """L'analyse a deja mesure les silences et les a ranges dans le blueprint.
    Les recalculer ici donnerait un deuxieme chiffre pour la meme chose, et
    c'est exactement comme ca qu'on finit par citer le mauvais."""
    return [(s["debut"], s["duree"])
            for s in (bp.get("audio") or {}).get("silences", [])
            if s["duree"] >= SEUIL_SILENCE_S]


def controler(nom):
    chemin = REC / f"{nom}.blueprint.json"
    bp = format_bp.charger(chemin, dire=False)
    plans, ry = bp["plans"], bp.get("rythme", {})
    # On mesure le MONTAGE COURANT, jamais les valeurs figees a l'analyse.
    # `conteneur.duree` et `rythme.plan_ouverture` decrivent le fichier
    # d'origine : apres un raccourcissement du hook, le controle continuait
    # d'annoncer la duree d'origine et l'ecart ne se refermait jamais.
    duree = sum(p["duree"] for p in plans)
    ecarts = []

    # --- rythme ------------------------------------------------------------
    ouv = plans[0]["duree"] if plans else 0.0
    if ouv > HOOK_MAXI:
        ecarts.append(("hook", f"le premier plan dure {ouv:.2f} s ; le winner "
                       f"ouvre a {REF['plan_ouverture']} s. Un hook long laisse "
                       f"le temps de glisser"))

    sil = [x for x in silences(bp) if x[0] < duree]
    if sil:
        total = sum(d for _, d in sil)
        ecarts.append(("vide", f"{len(sil)} silences de plus de {SEUIL_SILENCE_S} s, "
                       f"{total:.1f} s de rien sur {duree:.1f} s. Le winner en a 0"))

    # recalcule sur les plans courants : une valeur figee decrivait un montage
    # qui n'existe plus des la premiere modification
    bornes, t = [], 0.0
    for q in plans:
        t += q["duree"]; bornes.append(t)
    dans_silence = sum(1 for b in bornes[:-1]
                       for d, dur in silences(bp) if d <= b < d + dur)
    if dans_silence:
        ecarts.append(("coupe", f"{dans_silence} coupes tombent dans un "
                       f"silence. Une coupe se pose sur la parole, pas dans le trou"))

    # --- densite de parole -------------------------------------------------
    mots = sum(len(p.get("mots") or []) for p in plans)
    mots_s = mots / duree if duree else 0
    if mots_s < REF["mots_s"] * 0.9:
        manque = (1 - mots_s / REF["mots_s"]) * 100
        ecarts.append(("densite", f"{mots_s:.2f} mots par seconde contre "
                       f"{REF['mots_s']} au winner, soit {manque:.0f} pourcent "
                       f"d arguments en moins par seconde"))

    if duree > REF["duree"] * 1.3:
        ecarts.append(("longueur", f"{duree:.1f} s contre {REF['duree']} s. "
                       f"Chaque seconde en trop est une occasion de partir"))

    # --- la preuve doit avoir le temps -------------------------------------
    courtes = [p for p in plans
               if (p.get("vision") or {}).get("role") in ("preuve", "comparaison")
               and p["duree"] < PREUVE_MINI]
    if courtes:
        ecarts.append(("preuve", f"{len(courtes)} plans de preuve sous {PREUVE_MINI} s "
                       f"(le plus court {min(p['duree'] for p in courtes):.2f} s). "
                       f"On accelere sur ce qu il faut retenir, on ralentit sur ce "
                       f"qu il faut croire"))

    # --- rafales sur le meme cadre -----------------------------------------
    suite, pire = 1, (0, None)
    for a, b in zip(plans, plans[1:]):
        meme = ((a.get("vision") or {}).get("sujet", "x")
                == (b.get("vision") or {}).get("sujet", "y"))
        if meme and a["duree"] < RAFALE_S and b["duree"] < RAFALE_S:
            suite += 1
            if suite > pire[0]:
                pire = (suite, a["n"])
        else:
            suite = 1
    if pire[0] >= RAFALE_N:
        ecarts.append(("rafale", f"{pire[0]} plans de suite sous {RAFALE_S} s sur le "
                       f"meme cadre a partir du plan {pire[1]}. Ce n est pas un "
                       f"rythme, c est un begaiement"))

    # --- la fin ------------------------------------------------------------
    if bp.get("carte_finale") is False:
        ecarts.append(("fin", "aucune carte finale. Le winner finit sur une capture "
                       "reelle de la page produit, prix barre et prix remise. "
                       "C est le seul plan qui demande l achat"))

    # --- le texte incruste --------------------------------------------------
    for d in bp.get("defauts") or []:
        if re.search(r"chiffre 1|'1'|2in|pouces|milieu d un mot|apostrophe|manque",
                     d, re.I):
            ecarts.append(("texte", d))

    d = [p["duree"] for p in bp["plans"]]
    if len(d) >= METRONOME_MINI:
        moy = sum(d) / len(d)
        ec = (sum((x - moy) ** 2 for x in d) / len(d)) ** 0.5
        if moy and ec / moy < METRONOME_ECART:
            ecarts.append(("metronome",
                f"le rythme est plat : {len(d)} plans de {moy:.2f} s en moyenne, "
                f"dispersion {ec/moy*100:.0f} % seulement. Un montage qui coupe "
                f"toujours au meme intervalle suit un minuteur, pas le texte."))

    # --- les mots ont-ils suivi les plans ? --------------------------------
    # Un remontage peut sortir avec tous les mots du script entasses dans
    # le premier plan, horodates sur une fraction de seconde, et des plans muets
    # derriere. Le film se rend sans erreur : un seul sous-titre illisible au
    # debut, rien ensuite. Un montage qui perd ses paroles doit le DIRE.
    parlants = [p_ for p_ in plans if (p_.get("mots") or p_.get("paroles"))]
    if len(plans) >= 4 and len(parlants) <= max(1, len(plans) // 8):
        ecarts.append(("paroles", f"{len(parlants)} plan(s) sur {len(plans)} "
                       f"portent des paroles. Si le film parle du debut a la "
                       f"fin, les mots n'ont pas suivi les plans : les "
                       f"sous-titres seront absents presque partout"))
    # Des mots ecrasses : tout le texte d'un plan tient dans une fraction de sa
    # duree. C'est la signature d'horodates relatives prises pour absolues.
    for p_ in plans:
        ms = p_.get("mots") or []
        if len(ms) < 8:
            continue
        etendue = ms[-1].get("f", 0) - ms[0].get("d", 0)
        if p_.get("duree", 0) > 0.3 and etendue < p_["duree"] / 4:
            ecarts.append(("mots_ecrases", f"plan {p_.get('n', '?')} : "
                           f"{len(ms)} mots tiennent dans {etendue:.2f} s alors "
                           f"que le plan dure {p_['duree']:.2f} s. Le sous-titre "
                           f"sortira en un bloc illisible"))
            break

    return bp, ecarts


# ======================================================= LA TABLE COMPLETE ====
# `controler()` ne rend que les ECHECS. Dans cette liste, une regle TENUE et une
# regle NON MESUREE se taisent exactement pareil : la donnee manquait, ou le
# montage etait bon, et rien ne les distingue. Un panneau bati sur cette seule
# liste afficherait donc du vert sans avoir rien mesure, ce qui est pire que de
# n'afficher rien du tout.
#
# rapport() rend les douze regles avec TROIS etats, jamais deux :
#   « tenue »      la regle a ete evaluee et le montage la tient
#   « ecart »      la regle a ete evaluee et le montage s'en ecarte
#   « non mesure » la donnee necessaire n'est pas dans le blueprint
#
# Il n'invente aucun seuil et ne recalcule rien : il rappelle controler() et
# se contente de dire, pour chaque regle, si elle POUVAIT etre evaluee.

REGLES = [
    ("hook",         "Ouverture",        f"au plus {HOOK_MAXI:.2f} s (le winner ouvre a {REF['plan_ouverture']} s)"),
    ("vide",         "Silences",         f"aucun silence de plus de {SEUIL_SILENCE_S} s"),
    ("coupe",        "Coupes",           "aucune coupe dans un silence"),
    ("densite",      "Densite de parole", f"au moins {REF['mots_s'] * 0.9:.2f} mots par seconde (le winner tient {REF['mots_s']})"),
    ("longueur",     "Longueur",         f"au plus {REF['duree'] * 1.3:.0f} s"),
    ("preuve",       "Plans de preuve",  f"au moins {PREUVE_MINI:.2f} s par plan de preuve"),
    ("rafale",       "Rafales",          f"moins de {RAFALE_N} plans de suite sous {RAFALE_S} s sur le meme cadre"),
    ("fin",          "La fin demande l'achat", "le dernier plan montre la page produit"),
    ("texte",        "Texte incruste",   "aucun defaut releve dans le texte cuit dans l'image"),
    ("metronome",    "Rythme",           f"dispersion des durees au-dessus de {METRONOME_ECART * 100:.0f} pourcent"),
    ("paroles",      "Les mots ont suivi les plans", "les paroles sont reparties sur les plans"),
    ("mots_ecrases", "Mots ecrases",     "le texte d'un plan occupe plus du quart de sa duree"),
]


def rapport(nom):
    """Les douze regles avec leur etat, leur seuil et leur mesure."""
    bp, ecarts = controler(nom)
    dit = dict(ecarts)
    plans = bp.get("plans") or []
    duree = sum(p["duree"] for p in plans)
    mots = sum(len(p.get("mots") or []) for p in plans)
    avec_vision = [p for p in plans if (p.get("vision") or {}).get("sujet")]
    preuves = [p for p in plans
               if (p.get("vision") or {}).get("role") in ("preuve", "comparaison")]

    # Pour chaque regle : la condition sous laquelle elle a pu etre EVALUEE, et
    # le chiffre a montrer quand elle est tenue. Une regle dont la condition est
    # fausse ne rend ni vert ni rouge.
    son = a_du_son(bp)
    evaluable = {
        "hook":         (bool(plans), f"{plans[0]['duree']:.2f} s" if plans else "", "aucun plan"),
        "vide":         (son, "0 silence de plus de %s s" % SEUIL_SILENCE_S,
                         "le son n'a pas ete mesure : le bloc `audio` du blueprint est absent"),
        "coupe":        (son, "0 coupe dans un silence",
                         "le son n'a pas ete mesure : le bloc `audio` du blueprint est absent"),
        "densite":      (mots > 0 and duree > 0, "%.2f mots par seconde" % (mots / duree) if duree else "",
                         "aucun mot horodate : le montage n'a pas ete transcrit"),
        "longueur":     (duree > 0, "%.1f s" % duree, "aucun plan"),
        "preuve":       (bool(preuves), "%d plan(s) de preuve, le plus court %.2f s"
                         % (len(preuves), min(p["duree"] for p in preuves)) if preuves else "",
                         "aucun plan ne porte le role « preuve » : la vision n'est pas remplie"),
        "rafale":       (len(avec_vision) >= 2, "aucune rafale sur le meme cadre",
                         "la vision n'est pas remplie : on ne sait pas quels plans montrent la meme chose"),
        "fin":          (bp.get("carte_finale") is not None, "une carte finale est declaree",
                         "personne n'a encore regarde le dernier plan"),
        "texte":        (bp.get("defauts") is not None, "aucun defaut releve",
                         "le texte incruste n'a pas ete releve"),
        "metronome":    (len(plans) >= METRONOME_MINI, "le rythme respire",
                         "moins de %d plans : la dispersion ne veut rien dire" % METRONOME_MINI),
        "paroles":      (len(plans) >= 4, "les paroles suivent les plans",
                         "moins de 4 plans"),
        "mots_ecrases": (any(len(p.get("mots") or []) >= 8 for p in plans),
                         "aucun plan n'entasse son texte",
                         "aucun plan ne porte au moins 8 mots"),
    }

    table = []
    for tag, titre, seuil in REGLES:
        peut, tenue, pourquoi = evaluable[tag]
        if tag in dit:
            table.append({"tag": tag, "titre": titre, "seuil": seuil,
                          "etat": "ecart", "texte": dit[tag]})
        elif peut:
            table.append({"tag": tag, "titre": titre, "seuil": seuil,
                          "etat": "tenue", "texte": tenue})
        else:
            table.append({"tag": tag, "titre": titre, "seuil": seuil,
                          "etat": "non mesure", "texte": pourquoi})
    return bp, ecarts, table


if __name__ == "__main__":
    noms = sys.argv[1:] or [p.name[:-len(".blueprint.json")]
                            for p in sorted(REC.glob("*.blueprint.json"))]
    for n in noms:
        try:
            bp, ecarts = controler(n)
        except Exception as e:
            print(f"\n{n}\n  illisible : {e}")
            continue
        # L'en-tete lisait `conteneur.duree` et `rythme.n_plans`, qui
        # decrivent le fichier ANALYSE. Il annoncait la duree et le nombre de
        # plans du fichier d'origine pendant que les verdicts imprimes juste en
        # dessous portaient sur le montage courant, recalcule par controler().
        # Un en-tete FIXE et un corps CALCULE se contredisaient sur la meme fiche.
        plans_ = bp.get("plans") or []
        print(f"\n\033[1m{n}\033[0m  "
              f"{sum(p.get('duree', 0.0) for p in plans_):.1f} s, "
              f"{len(plans_)} plans")
        if not ecarts:
            print("  rien a signaler")
        for tag, txt in ecarts:
            print(f"  \033[33m{tag:9}\033[0m {txt}")
