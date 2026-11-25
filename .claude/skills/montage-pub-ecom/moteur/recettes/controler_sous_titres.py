#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Le controle de fin des sous-titres, sur le film LIVRE et jamais sur l'intention.

Il mesure ce qui ne se voit pas dans un reglage : bas du bloc le plus bas, largeur
reelle de la carte la plus longue, lignes orphelines, virgules pendantes, trous de
couverture.

ATTENTION : il n'implemente RIEN. Les cartes viennent de `rendre.cartes`, l'image vient de
`rendre.png_sous_titre`, le style vient de la meme fusion que le rendu
(`{**STYLE_DEFAUT, **bp["style_sous_titres"]}`). Une seconde implementation
mesurerait un film que le mp4 ne contient pas.

Usage :  python3 recettes/controler_sous_titres.py "mon montage"
"""
import json, sys, tempfile
from pathlib import Path
from PIL import Image

PROJ = Path(__file__).resolve().parent.parent          # la racine du moteur
sys.path.insert(0, str(PROJ / "outils"))
import rendre

MARGE = 6          # la marge que png_sous_titre ajoute autour de la boite
ORPHELINE = 2      # une ligne de 1 ou 2 mots sous une autre ligne est orpheline
TROU_MAXI = 0.30

nom = sys.argv[1]
bp = json.loads((PROJ / "recettes" / "projets" / (nom + ".blueprint.json")).read_text(encoding="utf-8"))
style = {**rendre.STYLE_DEFAUT, **(bp.get("style_sous_titres") or {})}
L, H = 1080, 1920      # la taille de RENDU, pas celle des rushes
mots_max = style["mots_max"]

# La police doit exister dans la table : `POLICES.get(nom, arial bold)` est un
# repli SILENCIEUX, un film peut sortir en Arial pendant que le blueprint
# annonce Verdana. On le dit ici, une fois, au lieu de le decouvrir a l'oeil.
police_connue = style["police"].lower() in rendre.POLICES
tmp = Path(tempfile.mkdtemp())

t0, cartes, souci = 0.0, [], []
for p in bp["plans"]:
    for c in rendre.cartes(p, mots_max):
        png = png_x = png_y = None
        r = rendre.png_sous_titre(c["texte"], L, H, style, str(tmp / "c.png"))
        if r:
            png, png_x, png_y = r
            im = Image.open(png)
            x0, y0 = png_x + MARGE, png_y + MARGE
            x1, y1 = png_x + im.width - MARGE, png_y + im.height - MARGE
        else:
            x0 = y0 = x1 = y1 = 0
        # le nombre de lignes se relit du MEME calcul que le moteur
        taille = max(12, int(H * style["taille_pct"] / 100))
        interligne = int(taille * 1.22)
        n_lignes = max(1, round((y1 - y0 - taille * 1.18) / interligne) + 1) if r else 1
        # decoupe en lignes, par la MEME mesure que png_sous_titre
        from PIL import ImageDraw, ImageFont
        police = ImageFont.truetype(rendre.POLICES.get(style["police"].lower(),
                                                       rendre.POLICES["arial bold"]), taille)
        d = ImageDraw.Draw(Image.new("RGBA", (L, H)))
        lmax = int(L * style["largeur_pct"] / 100)
        lignes, cour = [], ""
        txt = c["texte"].upper() if style["majuscules"] else c["texte"]
        for mot in txt.split():
            essai = (cour + " " + mot).strip()
            if d.textlength(essai, font=police) <= lmax or not cour:
                cour = essai
            else:
                lignes.append(cour); cour = mot
        if cour:
            lignes.append(cour)
        orph = len(lignes) > 1 and len(lignes[-1].split()) <= ORPHELINE
        virg = c["texte"].rstrip().endswith(",")
        cartes.append({"t": round(t0 + c["d"], 2), "f": round(t0 + c["f"], 2),
                       "texte": c["texte"], "lignes": lignes,
                       "largeur": x1 - x0, "bas": y1, "orpheline": orph, "virgule": virg})
    t0 += p["duree"]

trous = [(a["f"], b["t"], round(b["t"] - a["f"], 2))
         for a, b in zip(cartes, cartes[1:]) if b["t"] - a["f"] > TROU_MAXI]
orphelines = [c for c in cartes if c["orpheline"]]
virgules = [c for c in cartes if c["virgule"]]
lpire = max(cartes, key=lambda c: c["largeur"])
bpire = max(cartes, key=lambda c: c["bas"])

print("%s | %d cartes | police %s %s | taille %.2f %% | hauteur %.1f %% | "
      "largeur %.1f %% | contour %s | %d mots max"
      % (nom, len(cartes), style["police"],
         "(CONNUE)" if police_connue else "ATTENTION : ABSENTE DE POLICES, repli SILENCIEUX sur Arial",
         style["taille_pct"], style["hauteur_pct"], style["largeur_pct"],
         style["contour"], mots_max))
print("  couverture      %.2f s -> %.2f s, %d trou(s) de plus de %.2f s %s"
      % (cartes[0]["t"], cartes[-1]["f"], len(trous), TROU_MAXI,
         trous if trous else ""))
print("  carte la plus LARGE   %d px sur %d, soit %.1f %%   « %s »"
      % (lpire["largeur"], L, 100.0 * lpire["largeur"] / L, lpire["texte"]))
print("  bas du bloc le plus BAS  %d px sur %d, soit %.1f %%   « %s »"
      % (bpire["bas"], H, 100.0 * bpire["bas"] / H, bpire["texte"]))
print("  lignes orphelines  %d %s"
      % (len(orphelines), [c["lignes"] for c in orphelines] if orphelines else ""))
print("  virgules pendantes %d %s"
      % (len(virgules), [c["texte"] for c in virgules] if virgules else ""))
print("  cartes de 2 lignes %d sur %d"
      % (sum(1 for c in cartes if len(c["lignes"]) > 1), len(cartes)))
for c in cartes:
    print("   %6.2f -> %6.2f  %3d px %5.1f%%  %s"
          % (c["t"], c["f"], c["largeur"], 100.0 * c["largeur"] / L,
             " | ".join(c["lignes"])))
