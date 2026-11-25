# -*- coding: utf-8 -*-
"""Reglage et corrections de texte des sous-titres francais.

Ce module est la SEULE source de verite : la recette qui batit le blueprint et
toute retouche posterieure l'importent tous les deux. Deux copies du meme
reglage finissent toujours par diverger en silence.
"""
import sys, pathlib

OUTILS = pathlib.Path(__file__).resolve().parents[1] / "outils"
if str(OUTILS) not in sys.path:
    sys.path.insert(0, str(OUTILS))
import rendre          # noqa: E402
import format_bp       # noqa: E402

# --------------------------------------------------------------- le reglage
# On ne pose QUE les champs qu'on change. rendre fusionne par-dessus
# STYLE_DEFAUT (rendre.py, « style = {**STYLE_DEFAUT, **bp.get(...)} »), donc
# ecrire les onze champs refigerait les defauts du jour, ce qui est un bug deja
# corrige. Chaque valeur ci-dessous est MESUREE, pas choisie.
STYLE = {
    # Mesure sur un rendu : a 57 % le bloc vivait entre 54,9 % et
    # 63,8 % de la hauteur, soit le MILIEU de l'image. Le bloc cachait le
    # produit a l'image : le texte passait devant l'objet montre.
    # A 74 %, le bas du bloc tient a 79,0 % pour deux lignes et 77,7 % pour
    # une. Sous l'action, au-dessus de l'interface de TikTok et de Reels, qui
    # mange les 20 derniers pour cent.
    "hauteur_pct": 74.0,

    # Verdana Bold a ete dessinee pour l'ECRAN aux petites tailles. A 2,70 %
    # (51 px sur 1920) elle se LIT plus grosse qu'Arial Bold a 3,6 % (69 px)
    # parce que sa hauteur d'x est bien plus haute, et elle occupe 26 % de
    # hauteur en moins. C'est ce qui permet de reduire sans perdre en lisibilite
    # sur un ecran de telephone.
    "police": "verdana bold",
    "taille_pct": 2.70,

    # Le contour est en PIXELS et rendre.py le calibre pour un texte de 69 px
    # (mesure sur l'encode, pas dans Pillow). A 51 px, 4 px etouffe les
    # contrepoincons : 4 x 51 / 69 = 2,96, donc 3.
    "contour": 3,

    # Le retour a la ligne de rendre.png_sous_titre est GLOUTON : il remplit la
    # premiere ligne puis deverse le reste. Resserrer la largeur ne rattrape
    # rien, ca fabrique PLUS de lignes orphelines (mesure : 68 % en donne 7).
    # 85 % est une fenetre ETROITE, mesuree sur UN texte : la carte la plus
    # longue, « Vous avez 50 % de reduction et », fait 909 px soit 84,2 %. A
    # 84 % elle deborde et laisse « et » seul sur une ligne ; a 86 % une autre
    # carte prend assez de large pour laisser son dernier mot seul. A REMESURER
    # sur un autre montage : ce n'est pas un defaut universel, c'est un ajustement.
    "largeur_pct": 85.0,
    "mots_max": 5,
}


def souder_pourcent(mots):
    """« 50 » et « % » sont deux jetons chez Whisper, et rendre._faible les juge
    FAIBLES tous les deux (deux caracteres ou moins). Resultat mesure : la carte
    se fermait sur « Vous avez 50 » et la suivante ouvrait sur « % de reduction ».
    On les soude en amont pour que le nombre ne quitte jamais son signe."""
    out = []
    for w in mots:
        if out and w["m"].strip().startswith("%") and out[-1]["m"].strip()[-1:].isdigit():
            out[-1] = {"m": out[-1]["m"].rstrip() + " " + w["m"].strip(),
                       "d": out[-1]["d"], "f": w["f"]}
        else:
            out.append(dict(w))
    return out


# La ponctuation que Whisper peut rendre en jeton A PART. « % » n'y est pas :
# il a son propre soudage, juste au-dessus, parce qu'il se soude a un NOMBRE.
PONCTUATION_SEULE = set(".,!?;:\u2026")


def souder_ponctuation(mots):
    """Whisper rend parfois la ponctuation en JETON SEPARE. Mesure sur
    un clip d'ouverture : « la » puis « ? », ce dernier portant
    1,06 s d'horodatage a lui tout seul.

    Un jeton de ponctuation seul ne survit a AUCUN des deux chemins possibles
    dans rendre.cartes. `_faible` le juge faible (zero caractere une fois
    depouille), donc le repli sur mot faible le pousse sur la carte SUIVANTE ;
    et la carte suivante le retire avec son `lstrip("!?.,;: ")`. Mesure avant
    correction : le point d'interrogation avait DISPARU du film, sans un mot,
    et le mot d'avant restait seul sur une carte de 2,04 s.

    On le soude donc au mot d'avant, en amont, exactement comme « 50 » et son
    « % ». On garde l'espace avant le signe, qui est la regle francaise ; noter
    que `rendre.nettoyer` la retire a l'affichage (`\\s+([,.!?;:])`), donc le
    film montre « la? ». C'est le seul endroit ou ce reglage s'ecarte de la
    typographie francaise, et le corriger veut dire toucher au moteur valide."""
    out = []
    for w in mots:
        m = w["m"].strip()
        if out and m and all(c in PONCTUATION_SEULE for c in m):
            out[-1] = {"m": out[-1]["m"].rstrip() + " " + m,
                       "d": out[-1]["d"], "f": w["f"]}
        else:
            out.append(dict(w))
    return out


def _fins_de_carte(plan, mots_max):
    """Indices des mots qui FERMENT une carte, retrouves par les horodatages de
    debut que rendre.cartes rend deja. On ne recopie pas la boucle de decoupage
    du moteur : deux copies divergent."""
    mots = plan.get("mots") or []
    if not mots:
        return []
    debut = format_bp.entree(plan)
    cs = rendre.cartes(plan, mots_max)
    depart = []
    for c in cs:
        for i, w in enumerate(mots):
            if round(max(0.0, w["d"] - debut), 3) == c["d"]:
                depart.append(i)
                break
    if not depart:
        return []
    return [d - 1 for d in depart[1:]] + [len(mots) - 1]


def retirer_virgules_de_fin(plans, mots_max=None, tours=6):
    """Une carte qui se ferme sur une virgule pendante est une faute de
    sous-titrage : la coupure de carte EST deja la pause, la virgule fait doublon
    et reste suspendue dans le vide. On garde le point, le point d'exclamation,
    le point d'interrogation et les points de suspension, qui eux portent du sens.

    Boucle jusqu'au point fixe : retirer une virgule ne deplace aucune coupure
    (rendre.cartes ne rompt que sur . ! ? ; : et rendre._faible depouille la
    ponctuation avant de juger), mais on le VERIFIE au lieu de le supposer."""
    mm = mots_max if mots_max is not None else STYLE["mots_max"]
    total = 0
    for tour in range(tours):
        n = 0
        for plan in plans:
            mots = plan.get("mots") or []
            for i in _fins_de_carte(plan, mm):
                if 0 <= i < len(mots) and mots[i]["m"].rstrip().endswith(","):
                    mots[i]["m"] = mots[i]["m"].rstrip().rstrip(",")
                    n += 1
        total += n
        if n == 0:
            return total, tour
    raise RuntimeError("les virgules de fin ne se stabilisent pas : le decoupage bouge")
