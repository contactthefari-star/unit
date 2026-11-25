#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""remove_fillers.py : resserrer une prise parlee, a la maniere d'un monteur de pub gagnante.

Deux modes :

1. Prise de personne (par defaut) : retire les mots de remplissage (euh, hum, ben, du coup...)
   ET les blancs de plus de 0,28 s. Une prise brute contient 20 a 35 % de pauses et de
   remplissage.

2. --resserrer (voix GENEREE) : un generateur de voix met 0,5 a 0,9 s a chaque point, l'original
   jamais plus de 0,25 s. Chaque silence trop long est coupe AU MILIEU et ramene a 0,24 s apres
   un point, 0,18 s apres une virgule (ou sans ponctuation), avec des fondus de 10 ms.

Les bornes se calent sur l'ENVELOPPE du son (plancher -45 dBFS), pas sur la date de fin d'un mot :
la transcription date la fin du MOT, pas la fin du SON. Le premier mot est redresse sur
l'attaque mesuree. Le montage se fait en UNE passe (pas de recollage de segments AAC), les
coupes d'image tombent sur des images entieres, les coupes de son sur des echantillons entiers.

Usage :
  python3 remove_fillers.py prise.mp4 [-o sortie.mp4] [--model small] [--lang fr]
          [--pause 0.28] [--agressif] [--dry-run] [--keep-json plan.json] [--mots mots.json]
  python3 remove_fillers.py voix.wav --resserrer [-o voix_serree.wav] [--mots mots.json]
          [--apres-point 0.24] [--apres-virgule 0.18]

--mots mots.json : mots deja horodates ([{"m","d","f"}]), pour ne lancer AUCUN modele de
transcription. Sans --mots, il faut openai-whisper (commande `whisper`) ou faster-whisper.
"""
import argparse
import json
import os
import sys
import tempfile
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402

# Remplissages sans risque (toujours retires)
FILL_SAFE = {"euh", "heu", "heuh", "hum", "hmm", "mmh", "mm", "bah", "ben", "beh", "euhm",
             "uh", "um", "umm", "uhh", "erm", "mhm"}
FILL_SAFE_MULTI = [("du", "coup"), ("en", "fait"), ("tu", "vois"), ("you", "know"), ("i", "mean")]
# Risques (--agressif) : peuvent changer le sens et la cadence
FILL_AGGR = {"voila", "genre", "quoi", "like", "basically", "literally", "actually"}
FILL_AGGR_MULTI = [("tu", "sais"), ("sort", "of"), ("kind", "of"), ("i", "guess")]

AMORCE = 0.06      # secondes gardees avant le premier son d'un segment
QUEUE = 0.12       # secondes gardees apres le dernier son
FONDU = 0.010      # 10 ms aux raccords : pas de clic
SR = 48000


def deaccent(w):
    return "".join(c for c in unicodedata.normalize("NFD", w) if unicodedata.category(c) != "Mn")


def norm(w):
    w = w.lower().strip()
    return "".join(c for c in w if not unicodedata.category(c).startswith("P"))


def marquer(mots, agressif):
    simples = set(FILL_SAFE)
    multi = list(FILL_SAFE_MULTI)
    if agressif:
        simples |= FILL_AGGR
        multi += FILL_AGGR_MULTI
    toks = [deaccent(norm(w["m"])) for w in mots]
    drop = [t in simples for t in toks]
    for i in range(len(toks) - 1):
        for a, b in multi:
            if toks[i] == a and toks[i + 1] == b:
                drop[i] = drop[i + 1] = True
    return drop


def caler_debut(env, pas, t):
    """Pose une coupe d'entree dans le calme juste AVANT un son : recule tant que le niveau est
    au-dessus du plancher (on ne coupe pas dans un mot), puis garde AMORCE secondes de calme."""
    i = max(0, min(len(env) - 1, int(t / pas)))
    n = 0
    while i > 0 and env[i] >= C.PLANCHER_DBFS and n < 8:      # 8 x 20 ms
        i -= 1
        n += 1
    j = i
    while j < len(env) - 1 and env[j] < C.PLANCHER_DBFS and (j - i) * pas < 0.30:
        j += 1                                              # premier son apres ce calme
    return max(i * pas, j * pas - AMORCE)


def caler_fin(env, pas, t):
    """Pose une coupe de sortie dans le calme juste APRES un son."""
    i = max(0, min(len(env) - 1, int(t / pas)))
    n = 0
    while i < len(env) - 1 and env[i] >= C.PLANCHER_DBFS and n < 8:
        i += 1
        n += 1
    j = i
    while j > 0 and env[j] < C.PLANCHER_DBFS and (i - j) * pas < 0.30:
        j -= 1                                              # dernier son avant ce calme
    return min(i * pas, j * pas + QUEUE)


def plages_a_garder(mots, drop, duree, pause, env, pas, cale=True):
    brut = []
    for w, d in zip(mots, drop):
        if d:
            continue
        brut.append((max(0.0, w["d"] - AMORCE), min(duree, w["f"] + QUEUE)))
    if not brut:
        return []
    brut.sort()
    fus = [list(brut[0])]
    for a, b in brut[1:]:
        if a - fus[-1][1] <= pause:         # petit blanc : on garde, c'est du debit
            fus[-1][1] = max(fus[-1][1], b)
        else:                               # grand blanc ou remplissage retire : on coupe
            fus.append([a, b])
    if cale:
        fus = [list((caler_debut(env, pas, a), caler_fin(env, pas, b))) for a, b in fus]
        # le calage peut faire se toucher deux plages : on les refusionne
        out = [fus[0]]
        for a, b in fus[1:]:
            if a <= out[-1][1]:
                out[-1][1] = max(out[-1][1], b)
            else:
                out.append([a, b])
        fus = out
    return [(round(a, 3), round(min(b, duree), 3)) for a, b in fus if b - a > 0.05]


def plages_resserrer(env, pas, duree, mots, apres_point, apres_virgule):
    """Garde tout, mais ramene chaque silence trop long a sa cible en coupant AU MILIEU."""
    sil = C.silences_enveloppe(env, pas, seuil_s=min(apres_point, apres_virgule) + 0.06)
    garder, curseur, n = [], 0.0, 0
    for d0, dl in sil:
        cible = apres_virgule
        if mots:
            prec = [w for w in mots if abs(w["f"] - d0) <= 0.20]
            if prec and prec[-1]["m"].rstrip().endswith((".", "!", "?", "…")):
                cible = apres_point
        else:
            cible = apres_point
        if dl <= cible + 0.02:
            continue
        coupe_a, coupe_b = d0 + cible / 2.0, d0 + dl - cible / 2.0
        garder.append((curseur, coupe_a))
        curseur = coupe_b
        n += 1
    garder.append((curseur, duree))
    return [(round(a, 3), round(b, 3)) for a, b in garder if b - a > 0.02], n


def construire(entree, sortie, plages, info):
    """UNE passe : trim (images entieres) et atrim (echantillons entiers), fondus de 10 ms."""
    fps = info.get("fps") or 0
    video = info["a_video"]
    audio = info["a_audio"]
    filtres, entrees, total_img, total_ech = [], "", 0, 0
    for k, (a, b) in enumerate(plages):
        if video:
            sf = int(round(a * fps))
            ef = max(sf + 1, int(round(b * fps)))
            a, b = sf / fps, ef / fps                     # le son suit les images
            filtres.append("[0:v]trim=start_frame=%d:end_frame=%d,setpts=PTS-STARTPTS[v%d]" % (sf, ef, k))
            total_img += ef - sf
        s0, s1 = int(round(a * SR)), int(round(b * SR))
        n = s1 - s0
        total_ech += n
        if audio:
            f = min(int(FONDU * SR), n // 2)
            filtres.append("[0:a]aresample=%d,atrim=start_sample=%d:end_sample=%d,asetpts=PTS-STARTPTS,"
                           "afade=t=in:st=0:d=%.4f,afade=t=out:st=%.4f:d=%.4f[a%d]" %
                           (SR, s0, s1, f / SR, (n - f) / SR, f / SR, k))
        entrees += ("[v%d]" % k if video else "") + ("[a%d]" % k if audio else "")
    sortie_lab = ("[v]" if video else "") + ("[a]" if audio else "")
    filtres.append(entrees + "concat=n=%d:v=%d:a=%d%s" % (len(plages), int(video), int(audio), sortie_lab))
    opt, tmpf = C.option_graphe(";".join(filtres))
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", entree] + opt
    if video:
        cmd += ["-map", "[v]"]
    if audio:
        cmd += ["-map", "[a]"]
    if video:
        cmd += C.encodeur_video() + ["-frames:v", str(total_img)]
    if audio:
        ext = os.path.splitext(sortie)[1].lower()
        if not video and ext in (".wav", ".aiff"):
            cmd += ["-c:a", "pcm_s16le", "-ar", str(SR), "-ac", "2"]
        else:
            cmd += ["-c:a", "aac", "-b:a", "160k", "-ar", str(SR), "-ac", "2"]
    cmd += ["-t", "%.6f" % ((total_img / fps) if video else (total_ech / SR))]
    if video:
        cmd += ["-movflags", "+faststart"]
    cmd += [sortie]
    try:
        C.sh(cmd)
    finally:
        if tmpf:
            os.unlink(tmpf)
    return (total_img / fps) if video else (total_ech / SR)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("-o", "--out")
    ap.add_argument("--model", default="small", help="modele de transcription (small, medium)")
    ap.add_argument("--lang", default="fr")
    ap.add_argument("--pause", type=float, default=0.28, help="les blancs plus longs sont coupes")
    ap.add_argument("--agressif", action="store_true", help="retire aussi voila, genre, quoi, tu sais")
    ap.add_argument("--resserrer", action="store_true", help="mode voix generee : ramene les silences a leur cible")
    ap.add_argument("--apres-point", type=float, default=0.24)
    ap.add_argument("--apres-virgule", type=float, default=0.18)
    ap.add_argument("--mots", help="mots horodates deja prets (json), evite la transcription")
    ap.add_argument("--sans-calage", action="store_true", help="ne cale pas les bornes sur l'enveloppe")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--keep-json")
    a = ap.parse_args()
    C.exiger_binaires()
    info = C.sonde(a.input)
    if not info["a_audio"]:
        C.erreur("aucune piste audio : rien a resserrer (pour une musique seule, utilise edit_toolkit).")
    duree = info["duree_flux"] if info["a_video"] else info["audio_duree"]
    ext = os.path.splitext(a.input)[1]
    sortie = a.out or os.path.splitext(a.input)[0] + ("_serre" if a.resserrer else "_tight") + ext
    pas = 0.02
    env = C.enveloppe_dbfs(a.input, pas)
    mots = None
    if a.mots:
        mots = C.lire_mots_json(a.mots)
    elif not a.resserrer:
        mots, segs = C.transcrire(a.input, a.model, a.lang)
        h = C.hallucination(segs)
        if h:
            C.avertir("transcription suspecte (%s) : le texte est peut-etre invente. Verifie le son "
                      "avant de couper sur ces mots." % h)
    if mots:
        mots, redresse = C.redresser_premier_mot(mots, env, pas)
        if redresse:
            print("  premier mot redresse sur l'attaque du son : %.2f s -> %.2f s" % redresse,
                  file=sys.stderr)
    if a.resserrer:
        plages, n = plages_resserrer(env, pas, duree, mots, a.apres_point, a.apres_virgule)
        retire = 0.0
        if plages:
            retire = duree - sum(b - x for x, b in plages)
        print("\n  voix de %.2f s ; %d silence(s) ramene(s) a %.2f s (point) ou %.2f s (virgule) ; "
              "%.2f s retirees" % (duree, n, a.apres_point, a.apres_virgule, retire), file=sys.stderr)
    else:
        if not mots:
            C.erreur("aucun mot detecte. Y a-t-il de la parole ? (musique seule : edit_toolkit).")
        drop = marquer(mots, a.agressif)
        plages = plages_a_garder(mots, drop, duree, a.pause, env, pas, cale=not a.sans_calage)
        gardees = sum(b - x for x, b in plages)
        print("\n  source : %.1f s, %d mots" % (duree, len(mots)), file=sys.stderr)
        print("  retires : %d mot(s) de remplissage et les blancs de plus de %.2f s" %
              (sum(drop), a.pause), file=sys.stderr)
        print("  resultat : %.1f s en %d segment(s), soit %.0f %% plus court" %
              (gardees, len(plages), 100 * (1 - gardees / duree)), file=sys.stderr)
        if a.keep_json:
            json.dump({"plages": plages, "mots_retires": [mots[i]["m"] for i in range(len(mots)) if drop[i]]},
                      open(a.keep_json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if not plages:
        C.erreur("rien a garder.")
    if a.dry_run:
        print("  [dry-run] plages gardees :", plages, file=sys.stderr)
        return
    reel = construire(a.input, sortie, plages, info)
    print("  -> %s (%.3f s ; chiffre MESURE sur le fichier produit : lance edit_toolkit.py info)" %
          (sortie, reel), file=sys.stderr)


if __name__ == "__main__":
    C.lancer(main)
