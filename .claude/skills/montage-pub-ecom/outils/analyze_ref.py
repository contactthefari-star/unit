#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""analyze_ref.py : etudier le MONTAGE d'une pub gagnante (la tienne ou celle d'un concurrent).

Mesure (passe 1) : format, cadence, duree du flux video, coupes, plan moyen et median, plan
d'ouverture, dispersion des durees, silences et part active du son, et les ecarts aux seuils
valides. Fabrique une planche contact (passe 2) : une vignette par plan, etiquetee, QU'IL FAUT
REGARDER. Les chiffres ne voient pas ce qui MANQUE (un film peut passer toutes les mesures de
rythme et ne jamais demander l'achat : seule la planche le montre).

Usage :
  python3 analyze_ref.py pub.mp4 [pub2.mp4 ...] [--seuil 0.30] [--out DOSSIER] [--json]
                         [--transcrire] [--modele small] [--sans-audio]

Aucune transcription n'est lancee sans --transcrire (elle demande un modele : lourd, une tache
a la fois). Seuils (references/grammaire-montage.md) : ouverture 2,00 s, preuve 2,50 s,
silence 0,30 s, dispersion 18 % sur 6 plans ou plus, 3,58 mots/s, longueur 65 s, plan de
transition 0,9 s au moins.
"""
import argparse
import json
import os
import re
import statistics
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402

HOOK_MAXI = 2.00
PLAN_TRANSITION_MINI = 0.9
METRONOME_ECART = 0.18
METRONOME_MINI = 6
MOTS_S_MINI = 3.58          # 90 % de 3,98 mots par seconde
LONGUEUR_MAXI = 65.0        # longueur maximale d'une pub courte, en secondes
RAFALE_N, RAFALE_S = 4, 0.50
FUSION_COUPES_S = 0.30      # un fondu compte pour une coupe, pas pour trois
MAX_TUILES = 30


def coupes(video, duree, seuil):
    """Instants de coupe dure (score de scene > seuil). Les coupes plus proches que 0,30 s
    sont fusionnees : un fondu enchaine se lit comme plusieurs coupes sinon."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", video, "-vf",
                        "scale=240:-2,select='gt(scene,%s)',showinfo" % seuil, "-an", "-f", "null", "-"],
                       capture_output=True, text=True)
    brut = sorted(set(round(float(x), 3) for x in re.findall(r"pts_time:([0-9.]+)", r.stderr)))
    t = []
    for x in brut:
        if x <= 0.05 or x >= duree - 0.05:
            continue
        if t and x - t[-1] < FUSION_COUPES_S:
            continue
        t.append(x)
    return t


def analyser(video, a):
    i = C.sonde(video, compter=True)
    if not i["a_video"]:
        C.erreur(video + " n'a pas de flux video.")
    dur = i["duree_flux"]
    ct = coupes(video, dur, a.seuil)
    bornes = [0.0] + ct + [dur]
    plans = [round(bornes[k + 1] - bornes[k], 3) for k in range(len(bornes) - 1)]
    moy = sum(plans) / len(plans)
    ec = statistics.pstdev(plans) if len(plans) > 1 else 0.0
    disp = ec / moy if moy else 0.0
    res = {"fichier": os.path.basename(video), "largeur": i["largeur"], "hauteur": i["hauteur"],
           "ratio": i["ratio"], "fps": i["fps"], "duree_flux": dur, "images": i.get("images"),
           "n_coupes": len(ct), "n_plans": len(plans), "plan_moyen": round(moy, 2),
           "plan_median": round(statistics.median(plans), 2), "plan_min": min(plans),
           "plan_max": max(plans), "ouverture": plans[0], "coupes_0_3s": sum(1 for t in ct if t <= 3.0),
           "dispersion_pct": round(100 * disp, 1), "durees": plans}
    ecarts = []
    if plans[0] > HOOK_MAXI:
        ecarts.append("ouverture : le premier plan dure %.2f s (seuil %.2f s ; une pub gagnante mesuree ouvre a "
                      "1,33 s). Si c'est la phrase parlee qui est longue, c'est la matiere, pas le "
                      "montage." % (plans[0], HOOK_MAXI))
    if len(plans) >= METRONOME_MINI and disp < METRONOME_ECART:
        ecarts.append("rythme plat : dispersion %.0f %% sous %.0f %% (le film suit un minuteur, pas "
                      "le texte)" % (100 * disp, 100 * METRONOME_ECART))
    if dur > LONGUEUR_MAXI:
        ecarts.append("longueur : %.1f s pour un seuil de %.0f s" % (dur, LONGUEUR_MAXI))
    courts = [p for p in plans if p < PLAN_TRANSITION_MINI]
    suite, pire = 1, 1
    for x, y in zip(plans, plans[1:]):
        suite = suite + 1 if (x < RAFALE_S and y < RAFALE_S) else 1
        pire = max(pire, suite)
    if pire >= RAFALE_N:
        ecarts.append("rafale : %d plans de suite sous %.1f s (regarde la planche : meme cadre ?)" %
                      (pire, RAFALE_S))
    res["plans_sous_0_9s"] = len(courts)
    if i["a_audio"] and not a.sans_audio:
        env = C.enveloppe_dbfs(video)
        sil = C.silences_enveloppe(env)
        actif = 100.0 * sum(1 for v in env if v >= C.PLANCHER_DBFS) / len(env)
        dans = 0
        for t in ct:
            for d0, dd in sil:
                if d0 <= t < d0 + dd:
                    dans += 1
        res.update({"silences": len(sil), "part_active_pct": round(actif, 1),
                    "coupes_en_silence": dans})
        if sil:
            ecarts.append("vide : %d silence(s) de %.2f s et plus (une pub gagnante mesuree en a 0)" %
                          (len(sil), C.SEUIL_SILENCE_S))
        if dans:
            ecarts.append("coupe : %d coupe(s) tombent dans un silence (une coupe se pose sur la "
                          "parole)" % dans)
    if a.transcrire and i["a_audio"]:
        mots, segs = C.transcrire(video, a.modele)
        mps = len(mots) / dur if dur else 0
        res["mots_par_s"] = round(mps, 2)
        res["hallucination"] = C.hallucination(segs)
        if mps < MOTS_S_MINI:
            ecarts.append("densite : %.2f mots par seconde sous %.2f (le compteur est biaise a la "
                          "baisse par les jetons recolles)" % (mps, MOTS_S_MINI))
        if res["hallucination"]:
            ecarts.append("transcription suspecte (%s) : texte peut-etre invente" %
                          res["hallucination"])
    res["ecarts"] = ecarts
    return res, ct, bornes


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("videos", nargs="+")
    ap.add_argument("--seuil", type=float, default=0.30, help="score de scene (0,22 detecte plus de coupes)")
    ap.add_argument("--out", default=".", help="dossier de sortie (planche, json)")
    ap.add_argument("--json", action="store_true", help="ecrit aussi <nom>_mesures.json")
    ap.add_argument("--transcrire", action="store_true", help="mesure les mots par seconde (modele de transcription)")
    ap.add_argument("--modele", default="small")
    ap.add_argument("--sans-audio", action="store_true")
    a = ap.parse_args()
    C.exiger_binaires()
    os.makedirs(a.out, exist_ok=True)
    for v in a.videos:
        res, ct, bornes = analyser(v, a)
        print("\n=== %s ===" % res["fichier"])
        print("  %dx%d (%s), %.3f i/s, %.2f s de flux video, %s images" %
              (res["largeur"], res["hauteur"], res["ratio"], res["fps"], res["duree_flux"], res["images"]))
        print("  coupes %d, plans %d ; plan moyen %.2f s, median %.2f s, min %.2f s, max %.2f s" %
              (res["n_coupes"], res["n_plans"], res["plan_moyen"], res["plan_median"],
               res["plan_min"], res["plan_max"]))
        print("  ouverture (1er plan) %.2f s ; coupes dans les 3 premieres secondes : %d ; "
              "dispersion %.0f %%" % (res["ouverture"], res["coupes_0_3s"], res["dispersion_pct"]))
        print("  durees des plans : %s" % res["durees"])
        if "silences" in res:
            print("  son : %d silence(s) >= 0,30 s, part active %.1f %%, %d coupe(s) dans un silence" %
                  (res["silences"], res["part_active_pct"], res["coupes_en_silence"]))
        if "mots_par_s" in res:
            print("  parole : %.2f mots par seconde" % res["mots_par_s"])
        for e in res["ecarts"]:
            print("  ECART : " + e)
        if not res["ecarts"]:
            print("  aucun ecart aux seuils mesures")
        items = [((bornes[k] + bornes[k + 1]) / 2, k + 1, bornes[k], bornes[k + 1])
                 for k in range(len(bornes) - 1)]
        if len(items) > MAX_TUILES:
            pas = len(items) / MAX_TUILES
            items = [items[int(k * pas)] for k in range(MAX_TUILES)]
        base = os.path.splitext(os.path.basename(v))[0]
        sortie = os.path.join(a.out, base + "_planche.jpg")
        lab = ["#%d %.1f-%.1fs (%.1fs)" % (n, d, f, f - d) for _, n, d, f in items]
        C.planche(v, [m for m, _, _, _ in items], sortie, colonnes=6, etiquettes=lab)
        print("  planche contact -> %s" % sortie)
        print("  A FAIRE : REGARDE la planche, plan par plan (cadre, sujet, role). La fin demande-t-elle "
              "l'achat ? Le produit est-il montre ? Les chiffres ne le voient pas.")
        if a.json:
            js = os.path.join(a.out, base + "_mesures.json")
            json.dump(res, open(js, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            print("  mesures -> %s" % js)


if __name__ == "__main__":
    C.lancer(main)
