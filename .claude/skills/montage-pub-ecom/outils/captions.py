#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""captions.py : incruster des sous-titres de pub gagnante (reglage valide) sur une video verticale.

Beaucoup de ffmpeg n'ont ni drawtext ni libass : le texte est dessine par Pillow (un PNG rogne a
la boite du texte par carte) et pose avec `overlay`, aux instants des mots.

Reglage par defaut = le reglage valide (style « valide ») :
  - Verdana Bold, 2,70 % de la hauteur (51 px sur 1920), blanc, contour noir en PIXELS calibre
    sur un texte de 69 px (4 px a 69 px, donc 3 px a 51 px), sans boite
  - le HAUT de la premiere ligne a 74 % de la hauteur (un bloc plus haut cache le produit ;
    le bas du bloc doit rester sous 80 %, l'interface des reseaux occupe les 20 % du bas)
  - largeur du bloc 85 %, 5 mots par carte, 1,8 s au plus, 3 mots au moins
  - jamais de coupe apres un mot faible, jamais de carte orpheline, virgule de fin retiree
  - « 50 » soude a son « % », signe de ponctuation isole soude au mot d'avant, elisions recollees

Styles alternatifs : A (boite aux couleurs de la marque), B (boite noire translucide), C (karaoke),
E (un seul sous-titre tenu toute la video).

Usage :
  python3 captions.py video.mp4 -o sortie.mp4 [--mots mots.json | --from-json cartes.json]
          [--fautes fautes.json] [--souder "iso therme=isotherme"] [--hauteur 74] [--taille-pct 2.70]
          [--police fichier.ttf] [--contour auto] [--retour gloutonne|equilibre] [--espace-insecable]
          [--style valide|A|B|C|E] [--color "#FF4D8D"] [--text "..."] [--model small]
          [--planche planche.jpg] [--rapport rapport.json] [--dry-run]

Sans --mots ni --from-json, la video est transcrite (openai-whisper ou faster-whisper ; lourd,
une tache a la fois). --mots mots.json : [{"m": "Bonjour", "d": 0.10, "f": 0.52}, ...] en secondes
ABSOLUES de la video (les memes que celles d'une transcription). --dry-run ne rend rien : il
calcule les cartes et le rapport de mise en page.
"""
import argparse
import json
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402

FAIBLES = {"le", "la", "les", "un", "une", "des", "du", "de", "et", "ou", "a", "à", "au", "aux",
           "en", "dans", "sur", "sous", "pour", "par", "avec", "que", "qui", "quoi", "ce", "cette",
           "ces", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "je", "tu", "il",
           "elle", "on", "nous", "vous", "ils", "elles", "ne", "pas", "plus", "tres", "très", "est",
           "mais", "car", "donc"}
APOSTROPHES = ("'", "’")
FIN_PHRASE = (".", "!", "?", ";", ":")
SYMBOLES = {"%", "€", "$", "°"}
NBSP = " "
FINE = " "


def faible(mot):
    """Mot faible : article, preposition, pronom, elision, conjonction, tout jeton de deux
    caracteres ou moins, et tout jeton qui se termine par une apostrophe."""
    m = mot.lower().strip(".,!?;: ").rstrip("'’")
    return m in FAIBLES or len(m) <= 2 or mot.rstrip().endswith(APOSTROPHES)


def nettoyer(t, espace_insecable=False):
    """La transcription rend « Dis -toi » et « l 'eau » : on recolle autour des tirets et des
    apostrophes, et on retire l'espace avant la ponctuation (comme le moteur valide). Avec
    --espace-insecable, une espace insecable est remise avant ? ! : ; (typographie francaise)."""
    t = re.sub(r"\s+([-'’])", r"\1", t)
    t = re.sub(r"([-'’])\s+", r"\1", t)
    t = re.sub(r"\s+([,.!?;:])", r"\1", t).strip()
    if espace_insecable:
        t = re.sub(r"(?<=[^\s?!:;])([?!:;])(?=\s|$)", FINE + r"\1", t)
    return t


# --------------------------------------------------------------------------- mots

def souder(mots, paires=None, optionnel=False):
    """Soude EN AMONT (jamais dans le moteur) ce que le decoupage couperait a tort :
    - un signe de ponctuation isole rejoint le mot d'avant (sinon il DISPARAIT du film) ;
    - un symbole (%, euro, degre) rejoint son nombre par une espace insecable ;
    - une elision (« jusqu » puis « 'a ») est recollee ;
    - les paires demandees (« iso therme=isotherme ») sont soudees ; une paire introuvable LEVE
      une erreur : une correction annoncee qui ne s'applique pas est le silence le plus cher."""
    out = []
    for w in mots:
        m = w["m"]
        if out and m and all(c in ".,!?;:…»)" for c in m):
            out[-1]["m"] += m
            out[-1]["f"] = max(out[-1]["f"], w["f"])
            continue
        if out and len(m) > 1 and m[0] in APOSTROPHES:
            out[-1]["m"] += m
            out[-1]["f"] = w["f"]
            continue
        base = re.sub(r"[.,!?;:…]+$", "", m)
        if out and base in SYMBOLES and re.fullmatch(r"[0-9][0-9.,]*", re.sub(r"[.,!?;:…]+$", "", out[-1]["m"])):
            out[-1]["m"] += NBSP + m
            out[-1]["f"] = w["f"]
            continue
        out.append(dict(w))
    for spec in (paires or []):
        if "=" not in spec:
            C.erreur("--souder attend « mot1 mot2=mot » (recu : %s)" % spec)
        gauche, droite = spec.split("=", 1)
        cible = [x.lower() for x in gauche.split()]
        k, trouve = 0, 0
        while k <= len(out) - len(cible):
            fenetre = [re.sub(r"[.,!?;:…]+$", "", out[k + q]["m"]).lower() for q in range(len(cible))]
            if fenetre == cible:
                fin_ponct = re.search(r"[.,!?;:…]+$", out[k + len(cible) - 1]["m"])
                fusion = {"m": droite + (fin_ponct.group(0) if fin_ponct else ""),
                          "d": out[k]["d"], "f": out[k + len(cible) - 1]["f"]}
                out[k:k + len(cible)] = [fusion]
                trouve += 1
            k += 1
        if not trouve and not optionnel:
            C.erreur("soudure « %s » introuvable dans les mots : la correction ne s'appliquerait pas. "
                     "Relis la transcription (ou --souder-optionnel)." % spec)
    return out


def decouper(mots, mots_max=5, duree_max=1.8, mots_mini=3):
    """Un sous-titre n'est PAS un plan. On coupe sur les mots horodates, jamais apres un mot
    faible, jamais en laissant une carte orpheline de moins de `mots_mini` mots en fin de film.
    Meme algorithme que le moteur valide (la borne j part de i et avance avant tout recul)."""
    n, i, lots = len(mots), 0, []
    while i < n:
        j = i
        while j < n:
            j += 1
            if j - i >= mots_max:
                break
            if mots[j - 1]["f"] - mots[i]["d"] >= duree_max:
                break
            if j - i >= mots_mini and mots[j - 1]["m"].rstrip().endswith(FIN_PHRASE):
                break
        while j - i > mots_mini and j < n and faible(mots[j - 1]["m"]):
            j -= 1
        if 0 < n - j < mots_mini:
            j = n
        lots.append(mots[i:j])
        i = j
    return lots


def cartes_depuis_mots(lots, duree_video, espace_insecable=False):
    out = []
    for k, lot in enumerate(lots):
        d, f = lot[0]["d"], lot[-1]["f"]
        if f - d < 0.12:
            continue
        txt = nettoyer(" ".join(w["m"] for w in lot), espace_insecable).lstrip("!?.,;: ")
        txt = re.sub(r"\s*,\s*$", "", txt)         # la coupure de carte EST la pause
        if txt:
            out.append({"texte": txt, "d": round(d, 3), "f": round(f, 3), "mots": [w["m"] for w in lot]})
    # couverture continue : un trou de 0,30 s ou moins entre deux cartes est comble
    for a, b in zip(out, out[1:]):
        if 0 < b["d"] - a["f"] <= C.SEUIL_SILENCE_S:
            a["f"] = b["d"]
    if out:
        out[-1]["f"] = round(min(duree_video, out[-1]["f"] + 0.15), 3)
    return out


def appliquer_fautes(cartes, table):
    """Table de fautes : la PLUS LONGUE clef d'abord, rejouee jusqu'au point fixe. Une regle
    courte peut detruire l'ancre d'une regle longue (« cafe » avant « lecafe »)."""
    if not table:
        return cartes
    cles = sorted(table, key=len, reverse=True)
    for c in cartes:
        t = c["texte"]
        for _ in range(10):
            avant = t
            for k in cles:
                t = t.replace(k, table[k])
            if t == avant:
                break
        c["texte"] = t
    return cartes


# ------------------------------------------------------------------ mise en page

def lignes_gloutonnes(mots, mesure, largeur_max):
    lignes, cour = [], ""
    for m in mots:
        essai = (cour + " " + m).strip()
        if mesure(essai) <= largeur_max or not cour:
            cour = essai
        else:
            lignes.append(cour)
            cour = m
    if cour:
        lignes.append(cour)
    return lignes


def lignes_equilibrees(mots, mesure, largeur_max):
    """Option NON VALIDEE : choisit ou la deuxieme ligne casse (jamais apres un mot faible)."""
    glouton = lignes_gloutonnes(mots, mesure, largeur_max)
    if len(glouton) != 2:
        return glouton
    meilleur, score = None, None
    for k in range(1, len(mots)):
        l1, l2 = " ".join(mots[:k]), " ".join(mots[k:])
        w = max(mesure(l1), mesure(l2))
        if w > largeur_max:
            continue
        pen = w + (10000 if faible(mots[k - 1]) else 0)
        if score is None or pen < score:
            meilleur, score = [l1, l2], pen
    return meilleur or glouton


def rendre_carte(texte, W, H, st, fnt, taille, chemin_png, hauteur_pct=None):
    """Dessine une carte. Rend (png, x, y, infos). Le PNG est rogne a la boite du texte : composer
    une image pleine en RGBA a chaque image fait s'effondrer le rendu."""
    from PIL import Image, ImageDraw
    d0 = ImageDraw.Draw(Image.new("RGBA", (4, 4)))
    mesure = lambda s: d0.textlength(s, font=fnt)           # noqa: E731
    largeur_max = int(W * st["largeur_pct"] / 100)
    mots = texte.split(" ")                                  # l'espace insecable reste soudee
    lignes = (lignes_equilibrees if st["retour"] == "equilibre" else lignes_gloutonnes)(
        mots, mesure, largeur_max)
    inter = int(taille * 1.22)
    haut = int(H * (hauteur_pct if hauteur_pct is not None else st["hauteur_pct"]) / 100) \
        - (len(lignes) - 1) * inter // 2
    marge = st["contour"] + int(taille * 0.55) + 8
    img = Image.new("RGBA", (W, len(lignes) * inter + int(taille * 1.4) + 2 * marge), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    y_rel0 = marge
    for k, ligne in enumerate(lignes):
        w = mesure(ligne)
        x, y = (W - w) / 2, y_rel0 + k * inter
        if st["boite"]:
            m = int(taille * 0.42)
            d.rounded_rectangle([x - m, y - m * 0.55, x + w + m, y + taille * 1.18 + m * 0.35],
                                radius=int(taille * 0.34), fill=st["boite"])
            d.text((x, y), ligne, font=fnt, fill=st["boite_texte"])
            continue
        if st["ombre"]:
            for dx, dy in ((0, 3), (2, 2), (-2, 2)):
                d.text((x + dx, y + dy), ligne, font=fnt, fill=(0, 0, 0, 150))
        c = int(st["contour"])
        if c:
            for dx in range(-c, c + 1):
                for dy in range(-c, c + 1):
                    if dx or dy:
                        d.text((x + dx, y + dy), ligne, font=fnt, fill=(0, 0, 0, 255))
        d.text((x, y), ligne, font=fnt, fill=st["couleur"])
    bb = img.getbbox()
    if not bb:
        return None
    m6 = 6
    x0, y0 = max(0, bb[0] - m6), max(0, bb[1] - m6)
    x1, y1 = min(W, bb[2] + m6), min(img.height, bb[3] + m6)
    img.crop((x0, y0, x1, y1)).save(chemin_png)
    y_abs = haut - y_rel0 + y0
    return chemin_png, x0, y_abs, {"lignes": lignes, "bas_px": y_abs + (y1 - y0),
                                   "largeur_px": x1 - x0, "haut_px": y_abs}


def rendre_karaoke(mots_fenetre, actif, W, H, fnt, taille, chemin_png):
    from PIL import Image, ImageDraw
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    mots_fenetre = list(mots_fenetre)
    ligne = " ".join(m.upper() for m in mots_fenetre)
    tw = d.textlength(ligne, font=fnt)
    while tw > 0.92 * W and len(mots_fenetre) > 1:       # la fenetre doit tenir dans l'image
        if actif > 0:
            mots_fenetre.pop(0)
            actif -= 1
        else:
            mots_fenetre.pop()
        ligne = " ".join(m.upper() for m in mots_fenetre)
        tw = d.textlength(ligne, font=fnt)
    x, y = (W - tw) / 2, int(H * 0.76)
    for k, m in enumerate(mots_fenetre):
        t = m.upper() + " "
        wl = d.textlength(t, font=fnt)
        if k == actif:
            d.rounded_rectangle([x - 4, y - 6, x + d.textlength(m.upper(), font=fnt) + 4,
                                 y + taille + 6], radius=8, fill=(230, 30, 45, 255))
        for dx in (-2, 2):
            for dy in (-2, 2):
                d.text((x + dx, y + dy), t, font=fnt, fill=(0, 0, 0, 255))
        d.text((x, y), t, font=fnt, fill=(255, 255, 255, 255))
        x += wl
    bb = img.getbbox()
    if not bb:
        return None
    x0, y0, x1, y1 = max(0, bb[0] - 6), max(0, bb[1] - 6), min(W, bb[2] + 6), min(H, bb[3] + 6)
    img.crop((x0, y0, x1, y1)).save(chemin_png)
    return chemin_png, x0, y0, {"lignes": [ligne], "bas_px": y1, "largeur_px": x1 - x0, "haut_px": y0}


# ---------------------------------------------------------------------- rapport

def rapport(cartes, infos, W, H, duree, police_nom, police_chemin):
    r = {"police": police_nom, "fichier_police": police_chemin, "cartes": len(cartes)}
    if not cartes:
        return r
    bas = max(i["bas_px"] for i in infos)
    large = max(i["largeur_px"] for i in infos)
    orph = [k for k, i in enumerate(infos)
            if len(i["lignes"]) > 1 and len(i["lignes"][-1].split(" ")) == 1]
    orph_faible = [k for k in orph if faible(infos[k]["lignes"][-2].split(" ")[-1])]
    virg = [k for k, c in enumerate(cartes) if c["texte"].rstrip().endswith(",")]
    trous = []
    for a, b in zip(cartes, cartes[1:]):
        if b["d"] - a["f"] > C.SEUIL_SILENCE_S:
            trous.append((a["f"], b["d"] - a["f"]))
    r.update({"bas_du_bloc_pct": round(100.0 * bas / H, 1),
              "carte_la_plus_large_px": large, "carte_la_plus_large_pct": round(100.0 * large / W, 1),
              "lignes_orphelines": len(orph), "orphelines_apres_mot_faible": len(orph_faible),
              "virgules_pendantes": len(virg), "couverture": [cartes[0]["d"], cartes[-1]["f"]],
              "trous_sup_0_30s": len(trous),
              "plus_gros_trou_s": round(max([t[1] for t in trous] or [0.0]), 2)})
    return r


def afficher(r):
    print("\n  police          : %s (%s)" % (r["police"], r["fichier_police"]))
    print("  cartes          : %d" % r["cartes"])
    if r["cartes"]:
        print("  bas du bloc     : %.1f %% de la hauteur (cible : sous 80 %%)" % r["bas_du_bloc_pct"])
        print("  carte la + large: %d px = %.1f %% (visee : sous 85 %%)" %
              (r["carte_la_plus_large_px"], r["carte_la_plus_large_pct"]))
        print("  orphelines      : %d (dont apres mot faible : %d)" %
              (r["lignes_orphelines"], r["orphelines_apres_mot_faible"]))
        print("  virgules pend.  : %d" % r["virgules_pendantes"])
        print("  couverture      : %.2f s a %.2f s ; trous > 0,30 s : %d (le plus gros %.2f s)" %
              (r["couverture"][0], r["couverture"][1], r["trous_sup_0_30s"], r["plus_gros_trou_s"]))
    print("  MESURE sur la mise en page ; verifie le fichier LIVRE par une planche contact (--planche).")


# ------------------------------------------------------------------------ main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("-o", "--out")
    ap.add_argument("--style", default="valide", choices=["valide", "A", "B", "C", "E"])
    ap.add_argument("--mots", help="mots horodates (json)")
    ap.add_argument("--from-json", help='cartes deja faites : [{"start","end","text"}]')
    ap.add_argument("--fautes", help='table de fautes (json) {"faux": "juste"}, plus longue clef d\'abord')
    ap.add_argument("--souder", action="append", default=[], help='"iso therme=isotherme" (repetable)')
    ap.add_argument("--souder-optionnel", action="store_true")
    ap.add_argument("--hauteur", type=float, default=74.0, help="HAUT de la 1re ligne, en %% de la hauteur")
    ap.add_argument("--taille-pct", type=float, default=2.70, help="taille du texte, %% de la hauteur")
    ap.add_argument("--largeur", type=float, default=85.0)
    ap.add_argument("--mots-max", type=int, default=5)
    ap.add_argument("--duree-max", type=float, default=1.8)
    ap.add_argument("--mots-mini", type=int, default=3)
    ap.add_argument("--contour", default="auto", help="pixels, ou auto = round(4 x taille / 69)")
    ap.add_argument("--police", help="fichier .ttf (sinon Verdana Bold, repli ANNONCE)")
    ap.add_argument("--retour", default="gloutonne", choices=["gloutonne", "equilibre"])
    ap.add_argument("--espace-insecable", action="store_true")
    ap.add_argument("--color", help="couleur de boite du style A (#RRGGBB)")
    ap.add_argument("--text", help="texte du style E")
    ap.add_argument("--model", default="small")
    ap.add_argument("--lang", default="fr")
    ap.add_argument("--planche")
    ap.add_argument("--rapport")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    C.exiger_binaires()
    info = C.sonde(a.input, compter=True)
    if not info["a_video"]:
        C.erreur("captions.py attend une video.")
    W, H, duree, fps = info["largeur"], info["hauteur"], info["duree_flux"], info["fps"]
    sortie = a.out or os.path.splitext(a.input)[0] + "_cap.mp4"

    taille = max(12, int(H * a.taille_pct / 100))      # 2,70 % de 1920 = 51 px
    contour = max(1, int(round(4.0 * taille / 69.0))) if a.contour == "auto" else int(float(a.contour))
    chemin_police, nom_police = C.trouver_police(a.police)
    fnt = C.charger_police(chemin_police, taille)
    st = {"largeur_pct": a.largeur, "hauteur_pct": a.hauteur, "contour": contour, "ombre": True,
          "couleur": "#FFFFFF", "boite": None, "boite_texte": "#111111", "retour": a.retour}
    if a.style == "A":
        st.update({"boite": a.color or "#FF4D8D", "boite_texte": "#FFFFFF", "contour": 0, "ombre": False})
    elif a.style in ("B", "E"):
        st.update({"boite": (0, 0, 0, 175), "boite_texte": "#FFFFFF", "contour": 0, "ombre": False})
    print("  police %s ; taille %d px ; contour %d px ; haut du bloc a %.0f %%" %
          (nom_police, taille, st["contour"], a.hauteur), file=sys.stderr)

    # 1) les cartes
    if a.style == "E":
        if not a.text:
            C.erreur("--style E demande --text.")
        cartes = [{"texte": a.text, "d": 0.0, "f": duree, "mots": a.text.split()}]
        mots = []
    elif a.from_json:
        brut = json.load(open(a.from_json, encoding="utf-8"))
        cartes = [{"texte": c["text"], "d": float(c["start"]), "f": float(c["end"]),
                   "mots": c["text"].split()} for c in brut]
        mots = []
    else:
        if a.mots:
            mots = C.lire_mots_json(a.mots)
        else:
            mots, segs = C.transcrire(a.input, a.model, a.lang)
            h = C.hallucination(segs)
            if h:
                C.avertir("transcription suspecte (%s) : texte peut-etre invente. Relis chaque carte "
                          "contre le son avant de livrer." % h)
        if not mots:
            C.erreur("aucun mot. La video parle-t-elle ? Sinon donne --from-json ou --text.")
        env = C.enveloppe_dbfs(a.input)
        mots, redresse = C.redresser_premier_mot(mots, env)
        if redresse:
            print("  premier mot redresse sur l'attaque du son : %.2f s -> %.2f s" % redresse, file=sys.stderr)
        mots = souder(mots, a.souder, a.souder_optionnel)
        if a.style == "C":
            cartes = [{"texte": m["m"], "d": m["d"], "f": m["f"], "mots": [m["m"]]} for m in mots]
        else:
            lots = decouper(mots, a.mots_max, a.duree_max, a.mots_mini)
            cartes = cartes_depuis_mots(lots, duree, a.espace_insecable)
    if a.fautes:
        cartes = appliquer_fautes(cartes, json.load(open(a.fautes, encoding="utf-8")))

    # 2) la mise en page et le rapport
    tmp = tempfile.mkdtemp(prefix="cartes_")
    elements, infos = [], []
    if a.style == "C":
        for k, c in enumerate(cartes):
            fen = [x["texte"] for x in cartes[max(0, k - 2):k + 3]]
            actif = min(k, 2)
            r = rendre_karaoke(fen, actif, W, H, fnt, taille, os.path.join(tmp, "k%04d.png" % k))
            if r:
                elements.append((r[0], r[1], r[2], c["d"], min(duree, c["f"] + 0.02)))
                infos.append(r[3])
    else:
        for k, c in enumerate(cartes):
            r = rendre_carte(c["texte"], W, H, st, fnt, taille, os.path.join(tmp, "c%04d.png" % k))
            if r:
                elements.append((r[0], r[1], r[2], c["d"], c["f"]))
                infos.append(r[3])
    rap = rapport(cartes, infos, W, H, duree, nom_police, chemin_police)
    afficher(rap)
    if a.rapport:
        json.dump({"rapport": rap, "cartes": cartes}, open(a.rapport, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
    if rap.get("bas_du_bloc_pct", 0) > 80.0:
        C.avertir("le bas du bloc depasse 80 % de la hauteur : il entre dans l'interface des reseaux. "
                  "Remonte --hauteur ou raccourcis les cartes.")
    if a.dry_run:
        for c in cartes[:40]:
            print("   %6.2f -> %6.2f  %s" % (c["d"], c["f"], c["texte"]))
        return

    # 3) l'incrustation, en UNE passe. Un PNG sans -loop est une image unique que overlay
    #    repete (eof_action=repeat) : pas d'entree infinie, donc pas de -shortest.
    if not elements:
        C.erreur("aucune carte a incruster.")
    if len(elements) > 150:
        C.avertir("%d incrustations : le rendu sera long. Pense a --mots-max plus grand." % len(elements))
    graphe, prec = [], "[0:v]"
    for k, (png, x, y, d, f) in enumerate(elements, start=1):
        sortie_lab = "[o%d]" % k
        graphe.append("%s[%d:v]overlay=%d:%d:format=auto:enable='between(t,%.3f,%.3f)'%s" %
                      (prec, k, x, y, d, f, sortie_lab))
        prec = sortie_lab
    opt, tmpf = C.option_graphe(";".join(graphe))
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.input]
    for png, *_ in elements:
        cmd += ["-i", png]
    cmd += opt + ["-map", prec]
    if info["a_audio"]:
        cmd += ["-map", "0:a:0", "-c:a", "copy"]
    cmd += C.encodeur_video() + ["-frames:v", str(info["images"]), "-t", "%.6f" % (info["images"] / fps),
                                 "-movflags", "+faststart", sortie]
    try:
        C.sh(cmd)
    finally:
        if tmpf:
            os.unlink(tmpf)
    print("  -> %s (%d images, %d cartes)" % (sortie, info["images"], len(elements)), file=sys.stderr)
    if a.planche:
        inst = [(c["d"] + c["f"]) / 2 for c in cartes]
        if len(inst) > 18:
            pas = len(inst) / 18.0
            inst = [inst[int(k * pas)] for k in range(18)]
        C.planche(sortie, inst, a.planche, colonnes=6, largeur=240)
        print("  planche contact -> %s : REGARDE-LA (texte lisible ? produit cache ?)" % a.planche,
              file=sys.stderr)


if __name__ == "__main__":
    C.lancer(main)
