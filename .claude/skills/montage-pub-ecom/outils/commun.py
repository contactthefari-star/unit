#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""commun.py : ce que les quatre outils partagent, ecrit UNE seule fois.

Deux copies d'une meme primitive finissent toujours par diverger : la recherche de
police, la lecture d'une duree, la transcription, la mesure du son vivent donc ici.

Dependances : ffmpeg et ffprobe (binaires), Pillow, numpy. La transcription demande
en plus openai-whisper (commande `whisper`) OU faster-whisper (module Python) ; elle
n'est importee que dans la fonction qui s'en sert, jamais en tete de module.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

# Le plancher de silence est UNE constante, partagee par l'enveloppe, les silences,
# l'attaque et tous les controles : deux seuils differents donneraient deux verites.
PLANCHER_DBFS = -45.0
SEUIL_SILENCE_S = 0.30
# Redressement du premier mot (valeurs validees) : la transcription rabat parfois a 0,00
# le premier mot d'un rush qui ouvre sur un silence.
RABAT_MAXI = 0.05
REDRESSE_MINI = 0.05


def erreur(msg):
    sys.exit("ERREUR : " + msg)


def avertir(msg):
    sys.stdout.flush()
    print("ATTENTION : " + msg, file=sys.stderr, flush=True)


def exiger_binaires():
    for b in ("ffmpeg", "ffprobe"):
        if shutil.which(b) is None:
            erreur(b + " est introuvable. Installe ffmpeg (macOS : brew install ffmpeg ; "
                   "Debian ou Ubuntu : sudo apt install ffmpeg ; Windows : winget install ffmpeg).")


def sh(cmd, capture=True, check=True):
    r = subprocess.run([str(c) for c in cmd], capture_output=capture, text=True)
    if check and r.returncode != 0:
        queue = (r.stderr or "")[-1500:]
        erreur("la commande a echoue :\n  " + " ".join(str(c) for c in cmd[:14]) + "\n" + queue)
    return r


def option_graphe(graphe):
    """Options ffmpeg pour un graphe de filtres. En ligne si le graphe est court ; par fichier
    au-dela (`-/filter_complex`, ffmpeg 7 et plus : l'ancienne option -filter_complex_script a
    disparu). Rend (options, fichier_temporaire_ou_None)."""
    if len(graphe) < 60000:
        return ["-filter_complex", graphe], None
    f = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8")
    f.write(graphe)
    f.close()
    return ["-/filter_complex", f.name], f.name


def encodeur_video():
    """libx264 par defaut (portable). MONTAGE_ENCODEUR=h264_videotoolbox pour l'encodeur
    materiel de macOS, plus rapide mais a debit impose."""
    e = os.environ.get("MONTAGE_ENCODEUR", "libx264")
    if e == "libx264":
        return ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p"]
    return ["-c:v", e, "-b:v", "9M", "-pix_fmt", "yuv420p"]


def nb_images(duree, fps):
    """Une duree se compte en IMAGES. ffmpeg garde floor(t x fps) images : demander pile
    la duree en perd une par plan."""
    return max(1, int(round(duree * fps)))


def duree_demandee(n_images, fps):
    """Le milieu de l'image suivante : floor(n + 0,5) = n, a l'abri des arrondis."""
    return (n_images + 0.5) / float(fps)


# ---------------------------------------------------------------- sonde d'un film

def _fraction(txt):
    try:
        a, b = (txt or "0/1").split("/")
        return float(a) / float(b) if float(b) else 0.0
    except Exception:
        return 0.0


def sonde(chemin, compter=False):
    """Carte d'identite MESUREE d'un fichier. La duree retenue est celle du FLUX video,
    jamais celle du conteneur (l'audio peut durer plus longtemps que l'image)."""
    r = sh(["ffprobe", "-v", "error", "-print_format", "json", "-show_format",
            "-show_streams", chemin])
    d = json.loads(r.stdout or "{}")
    v = next((s for s in d.get("streams", []) if s.get("codec_type") == "video"), None)
    a = next((s for s in d.get("streams", []) if s.get("codec_type") == "audio"), None)
    out = {"chemin": chemin, "a_video": v is not None, "a_audio": a is not None,
           "duree_conteneur": float((d.get("format") or {}).get("duration") or 0)}
    if v:
        fps = _fraction(v.get("r_frame_rate"))
        dv = v.get("duration")
        try:
            dv = float(dv)
        except (TypeError, ValueError):
            nb = v.get("nb_frames")
            dv = (float(nb) / fps) if (nb and fps) else out["duree_conteneur"]
        out.update({"largeur": int(v["width"]), "hauteur": int(v["height"]),
                    "fps": round(fps, 3), "duree_flux": round(dv, 4),
                    "codec_video": v.get("codec_name"),
                    "color_transfer": v.get("color_transfer", "")})
        out["ratio"] = "9:16" if out["hauteur"] > out["largeur"] * 1.5 else (
            "carre" if out["hauteur"] == out["largeur"] else
            "16:9" if out["largeur"] > out["hauteur"] else "vertical autre")
        if compter:
            r2 = sh(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
                     "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", chemin])
            try:
                out["images"] = int(r2.stdout.strip().split(",")[0])
            except ValueError:
                out["images"] = None
    if a:
        da = a.get("duration")
        out.update({"audio_sr": int(a.get("sample_rate") or 0),
                    "audio_canaux": int(a.get("channels") or 0),
                    "audio_duree": float(da) if da else out["duree_conteneur"]})
    return out


# ------------------------------------------------------------------------ polices

CANDIDATES_VERDANA = [
    "/System/Library/Fonts/Supplemental/Verdana Bold.ttf",
    "/Library/Fonts/Verdana Bold.ttf",
    "C:/Windows/Fonts/verdanab.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Verdana_Bold.ttf",
    "/usr/share/fonts/TTF/Verdana_Bold.ttf",
]
CANDIDATES_REPLI = [
    ("DejaVu Sans Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
    ("DejaVu Sans Bold", "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf"),
    ("Arial Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    ("Arial Bold", "C:/Windows/Fonts/arialbd.ttf"),
    ("Liberation Sans Bold", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"),
    ("Liberation Sans Bold", "/usr/share/fonts/TTF/LiberationSans-Bold.ttf"),
]


def trouver_police(chemin_force=None):
    """Rend (chemin, nom). JAMAIS de repli silencieux : un nom de police absent d'une
    table qui retombe sur Arial livre un film en Arial pendant que le reglage annonce
    Verdana. Ici soit la police voulue est trouvee, soit le repli est ANNONCE, soit on
    s'arrete. Les .ttc sont refuses (Pillow prend l'index 0, souvent un Regular, sans
    prevenir)."""
    cand = chemin_force or os.environ.get("MONTAGE_POLICE")
    if cand:
        cand = os.path.expanduser(cand)
        if not os.path.isfile(cand):
            erreur("la police demandee n'existe pas : " + cand)
        if cand.lower().endswith(".ttc"):
            erreur("une collection .ttc prend l'index 0 (souvent un Regular) sans prevenir : "
                   "donne un fichier .ttf (la variante Bold voulue).")
        return cand, os.path.basename(cand)
    for c in CANDIDATES_VERDANA:
        if os.path.isfile(c):
            return c, "Verdana Bold"
    for nom, c in CANDIDATES_REPLI:
        if os.path.isfile(c):
            avertir("Verdana Bold est introuvable : repli ANNONCE sur " + nom + " (" + c + "). "
                    "Pour la police validee, installe Verdana Bold ou donne --police "
                    "chemin.ttf (ou la variable MONTAGE_POLICE).")
            return c, nom
    erreur("aucune police Bold trouvee. Donne --police chemin.ttf (ou la variable "
           "MONTAGE_POLICE).")


def charger_police(chemin, taille):
    from PIL import ImageFont
    try:
        return ImageFont.truetype(chemin, int(taille))
    except Exception as e:  # pas de load_default() : il changerait le rendu sans le dire
        erreur("la police " + chemin + " ne s'ouvre pas : " + str(e))


# -------------------------------------------------------------------------- son

def enveloppe_dbfs(chemin, pas=0.02):
    """Niveau (dBFS, RMS) toutes les `pas` secondes. C'est la mesure du JUGE : la
    transcription date la fin d'un MOT, pas la fin du SON."""
    import numpy as np
    sr = 16000
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", chemin, "-vn", "-ac", "1", "-ar", str(sr),
                        "-f", "s16le", "-"], capture_output=True)
    brut = np.frombuffer(r.stdout, dtype="<i2").astype(np.float32) / 32768.0
    n = max(1, int(sr * pas))
    k = len(brut) // n
    if k == 0:
        return np.array([-120.0], dtype=np.float32)
    blocs = brut[:k * n].reshape(k, n)
    rms = np.sqrt((blocs ** 2).mean(axis=1) + 1e-12)
    return (20.0 * np.log10(rms)).astype(np.float32)


def silences_enveloppe(env, pas=0.02, seuil_s=SEUIL_SILENCE_S, plancher=PLANCHER_DBFS):
    """Liste de (debut, duree) des silences d'au moins `seuil_s`."""
    out, debut = [], None
    for i, v in enumerate(list(env) + [0.0]):
        if v < plancher and debut is None:
            debut = i
        elif v >= plancher and debut is not None:
            d = (i - debut) * pas
            if d >= seuil_s - 1e-9:
                out.append((round(debut * pas, 3), round(d, 3)))
            debut = None
    return out


def attaque(env, pas=0.02, plancher=PLANCHER_DBFS):
    """Instant ou le son passe le plancher."""
    for i, v in enumerate(env):
        if v >= plancher:
            return round(i * pas, 3)
    return None


def mesure_loudnorm(chemin, filtre_avant=""):
    """Sonie integree (LUFS) et crete vraie (dBTP) par la passe d'analyse de loudnorm.
    Rend (input_i, input_tp) ou (None, None) si le fichier est muet."""
    af = (filtre_avant + "," if filtre_avant else "") + \
        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", chemin, "-vn", "-af", af,
                        "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S)
    if not m:
        return None, None
    try:
        j = json.loads(m.group(0))
        i = float(j["input_i"])
        tp = float(j["input_tp"])
        if i < -90:
            return None, None
        return i, tp
    except (ValueError, KeyError):
        return None, None


def niveau_dbfs(chemin, debut, duree):
    """Niveau moyen et maximum (dBFS) sur une fenetre : sert a juger une jonction. Un mot
    tranche a plein niveau passe de -21 a -84 dBFS en une image."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-ss", "%.4f" % debut, "-t",
                        "%.4f" % duree, "-i", chemin, "-vn", "-af", "volumedetect", "-f", "null",
                        "-"], capture_output=True, text=True)
    mean = re.search(r"mean_volume: (-?[0-9.]+|-inf) dB", r.stderr)
    mx = re.search(r"max_volume: (-?[0-9.]+|-inf) dB", r.stderr)

    def f(m):
        if not m or m.group(1) == "-inf":
            return -120.0
        return float(m.group(1))
    return f(mean), f(mx)


# -------------------------------------------------------------- transcription

GENERIQUES = ("sous-titres realises par", "sous-titres réalisés par", "amara.org",
              "merci d'avoir regarde", "merci d'avoir regardé", "n'oubliez pas de vous abonner",
              "subtitles by", "sous-titrage st")


def transcrire(chemin, modele="small", langue="fr"):
    """Rend (mots, segments). mots = [{"m", "d", "f"}] en secondes ABSOLUES du fichier.
    segments = [{"texte", "temperature", "avg_logprob"}] pour juger l'hallucination.

    Essaie la commande `whisper` (openai-whisper), puis le module faster_whisper. Le
    modele se telecharge a la premiere utilisation. Lourd : une tache a la fois."""
    if shutil.which("whisper"):
        with tempfile.TemporaryDirectory() as tmp:
            print("[transcription] whisper %s/%s (le modele se telecharge a la 1re utilisation)"
                  % (modele, langue), file=sys.stderr)
            sh(["whisper", chemin, "--model", modele, "--language", langue,
                "--word_timestamps", "True", "--output_format", "json", "--output_dir", tmp,
                "--verbose", "False"])
            base = os.path.splitext(os.path.basename(chemin))[0]
            j = json.load(open(os.path.join(tmp, base + ".json"), encoding="utf-8"))
        mots, segs = [], []
        for s in j.get("segments", []):
            segs.append({"texte": s.get("text", ""), "temperature": s.get("temperature", 0.0),
                         "avg_logprob": s.get("avg_logprob", 0.0)})
            for w in s.get("words", []):
                mots.append({"m": w["word"].strip(), "d": float(w["start"]), "f": float(w["end"])})
        return mots, segs
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        erreur("aucun moteur de transcription. Installe l'un des deux :\n"
               "  pip install openai-whisper      (fournit la commande `whisper`, tire torch)\n"
               "  pip install faster-whisper      (plus leger)\n"
               "ou fournis les mots deja horodates avec --mots mots.json.")
    print("[transcription] faster-whisper %s/%s" % (modele, langue), file=sys.stderr)
    mod = WhisperModel(modele, device="auto", compute_type="int8")
    gen, _ = mod.transcribe(chemin, language=langue, word_timestamps=True)
    mots, segs = [], []
    for s in gen:
        segs.append({"texte": s.text, "temperature": getattr(s, "temperature", 0.0),
                     "avg_logprob": s.avg_logprob})
        for w in (s.words or []):
            mots.append({"m": w.word.strip(), "d": float(w.start), "f": float(w.end)})
    return mots, segs


def lire_mots_json(chemin):
    """Mots horodates deja prets : [{"m","d","f"}] ou le format {"word","start","end"}.
    Permet de tout faire sans modele de transcription."""
    data = json.load(open(chemin, encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("mots") or data.get("words") or []
    out = []
    for w in data:
        if "m" in w:
            out.append({"m": str(w["m"]).strip(), "d": float(w["d"]), "f": float(w["f"])})
        else:
            out.append({"m": str(w["word"]).strip(), "d": float(w["start"]), "f": float(w["end"])})
    return out


def hallucination(segments, texte=""):
    """Rend un MOTIF ou None. Deux detecteurs qui se completent, aucun ne remplace l'autre :
    - 'generique' : un texte de sous-titrage que la transcription sort avec assurance ;
    - 'confiance' : l'invention. Une temperature non nulle est l'aveu du repli de Whisper
      (il echantillonne, donc le texte change a chaque passe) ; avg_logprob sous -1,0 est le
      seuil que Whisper s'applique a lui-meme. Le OU des deux est ce qui tient."""
    t = (texte or " ".join(s.get("texte", "") for s in segments)).lower()
    if any(g in t for g in GENERIQUES):
        return "generique"
    for s in segments:
        if float(s.get("temperature") or 0.0) > 0.0 or float(s.get("avg_logprob") or 0.0) < -1.0:
            return "confiance"
    return None


def redresser_premier_mot(mots, env, pas=0.02):
    """Redresse le PREMIER mot seulement, et seulement si la transcription l'a date sous
    RABAT_MAXI alors que le son attaque plus tard de plus de REDRESSE_MINI. Jamais au-dela
    de la fin du mot lui-meme."""
    if not mots:
        return mots, None
    att = attaque(env, pas)
    if att is None:
        return mots, None
    m0 = mots[0]
    if m0["d"] < RABAT_MAXI and (att - m0["d"]) > REDRESSE_MINI:
        nouveau = min(att, m0["f"])
        avant = m0["d"]
        m0["d"] = round(nouveau, 3)
        return mots, (avant, m0["d"])
    return mots, None


# -------------------------------------------------------------- planche contact

def planche(video, instants, sortie, colonnes=6, largeur=240, etiquettes=None):
    """Planche contact : une vignette par instant, etiquetee. A REGARDER, pas seulement a
    produire."""
    from PIL import Image, ImageDraw
    police, _ = trouver_police()
    fnt = charger_police(police, 16)
    tmp = tempfile.mkdtemp(prefix="planche_")
    tuiles = []
    for k, t in enumerate(instants):
        o = os.path.join(tmp, "f%03d.png" % k)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", "%.3f" % t, "-i",
                        video, "-frames:v", "1", "-vf", "scale=%d:-2" % largeur, o])
        if not os.path.exists(o):
            continue
        im = Image.open(o).convert("RGB")
        d = ImageDraw.Draw(im)
        lab = etiquettes[k] if etiquettes else "%.1fs" % t
        bb = d.textbbox((0, 0), lab, font=fnt)
        d.rectangle([0, 0, bb[2] + 10, bb[3] + 8], fill=(0, 0, 0))
        d.text((5, 2), lab, fill=(255, 235, 0), font=fnt)
        tuiles.append(im)
    if not tuiles:
        shutil.rmtree(tmp, True)
        return None
    tw, th = tuiles[0].size
    lignes = (len(tuiles) + colonnes - 1) // colonnes
    pad = 4
    feuille = Image.new("RGB", (colonnes * tw + (colonnes + 1) * pad,
                                lignes * th + (lignes + 1) * pad), (255, 255, 255))
    for i, im in enumerate(tuiles):
        r, c = divmod(i, colonnes)
        feuille.paste(im, (pad + c * (tw + pad), pad + r * (th + pad)))
    feuille.save(sortie, quality=82, optimize=True)
    shutil.rmtree(tmp, True)
    return sortie


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lancer(principale):
    """Lance la fonction principale d'un outil. Si numpy ou Pillow manquent, dit quoi faire
    en une phrase au lieu d'afficher une trace Python."""
    import sys
    try:
        principale()
    except ModuleNotFoundError as e:
        paquets = {"numpy": "numpy", "PIL": "Pillow"}
        if e.name in paquets:
            sys.exit(f"Il manque {paquets[e.name]} pour CE python ({sys.executable}). Lance : "
                     f"{sys.executable} -m pip install {paquets[e.name]} "
                     f"(ou un environnement virtuel : python3 -m venv venv && ./venv/bin/pip install numpy Pillow).")
        raise
