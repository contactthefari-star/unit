#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mesure le film RENDU et reverse le resultat dans son blueprint.

`controler.py` lit `bp["audio"]` : sans ce bloc il rend « illisible : 'audio' ».
Le bloc ne peut pas venir de la recette qui ecrit le blueprint, car elle tourne AVANT que le
film existe, et il ne doit pas venir des sources : les silences qu'on juge sont ceux du MONTAGE,
apres coupes et transitions, pas ceux des rushes.

Usage :  python3 recettes/mesurer_le_rendu.py "mon montage"
Le nom est celui de la RECETTE, sans « .blueprint.json » : c'est la clef que
controler.py attend, et un chemin complet le fait echouer.
"""
import json, sys
from pathlib import Path

PROJ = Path(__file__).resolve().parent.parent          # la racine du moteur
sys.path.insert(0, str(PROJ / "outils"))
import analyser_winner as A

nom = sys.argv[1]
bpc = PROJ / "recettes" / "projets" / (nom + ".blueprint.json")
film = PROJ / "sorties" / (nom + ".mp4")
if not film.exists():
    sys.exit("film absent : %s" % film)

bp = json.loads(bpc.read_text(encoding="utf-8"))
duree = A.ffprobe(str(film))["duree"]
bp["audio"] = A.analyser_audio(str(film), duree)
bp["duree"] = duree
bp["conteneur"]["duree"] = duree
bp["rendu"] = {"chemin": str(film), "duree": duree,
               "mesure_le": __import__("datetime").date.today().isoformat()}
bpc.write_text(json.dumps(bp, ensure_ascii=False, indent=1), encoding="utf-8")

a = bp["audio"]
print("%s | %.3f s | %d silence(s) de 0,25 s et plus, dont %d au-dela de 0,30 s"
      " | part active %.1f %%"
      % (nom, duree, len(a["silences"]), a["silences_sup_300ms"], a["part_active_pct"]))
for s in a["silences"]:
    print("   silence  %5.2f -> %5.2f  (%4.2f s)" % (s["debut"], s["fin"], s["duree"]))
