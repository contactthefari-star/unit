"""Vérifie que la machine peut faire tourner les deux skills. Ne montre JAMAIS une clé.

Usage : python3 verifier_installation.py

Ce qui est OBLIGATOIRE pour monter : ffmpeg, ffprobe, Python 3.11 ou plus, Pillow, numpy.
Ce qui est FACULTATIF : openai-whisper ou faster-whisper (transcription mot à mot),
les clés (voir CLES.md : gratuit / payant), demucs (séparation voix et musique, lourd).
"""
import importlib.util
import os
import shutil
import subprocess
import sys

OK, MANQUE, OPT = "OK     ", "MANQUE ", "option "


def ligne(etat, nom, aide=""):
    print(f"{etat} {nom}" + (f" : {aide}" if aide else ""))


def commande(nom):
    chemin = shutil.which(nom)
    if not chemin:
        return None
    try:
        sortie = subprocess.run([nom, "-version"], capture_output=True, text=True, timeout=15).stdout
        return sortie.splitlines()[0] if sortie else chemin
    except Exception:
        return chemin


def module(nom):
    return importlib.util.find_spec(nom) is not None


def cle_presente(nom):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "recherche-avatar", "scripts"))
    try:
        from charge_cles import cle  # noqa: E402
        return bool(cle(nom, obligatoire=False))
    except Exception:
        return False


def main():
    bloquant = 0
    print("== Obligatoire pour monter ==")
    v = sys.version_info
    if v >= (3, 11):
        ligne(OK, "Python", f"{v.major}.{v.minor}.{v.micro}")
    else:
        ligne(MANQUE, "Python 3.11 ou plus", f"trouvé {v.major}.{v.minor}")
        bloquant += 1
    for c in ("ffmpeg", "ffprobe"):
        r = commande(c)
        if r:
            ligne(OK, c, r[:70])
        else:
            ligne(MANQUE, c, "installe ffmpeg (macOS : brew install ffmpeg ; Windows : winget install ffmpeg ; Linux : apt install ffmpeg)")
            bloquant += 1
    for m, pip in (("PIL", "Pillow"), ("numpy", "numpy")):
        if module(m):
            ligne(OK, pip)
        else:
            ligne(MANQUE, pip, f"python3 -m pip install {pip}")
            bloquant += 1

    print("\n== Facultatif (utile) ==")
    if module("whisper") or module("faster_whisper"):
        ligne(OK, "transcription (whisper)")
    else:
        ligne(OPT, "transcription (whisper)", "python3 -m pip install faster-whisper (sert aux sous-titres mot à mot)")
    if shutil.which("demucs") or module("demucs"):
        ligne(OK, "demucs (séparation voix / musique)")
    else:
        ligne(OPT, "demucs", "seulement pour adapter une pub concurrente ; lourd, voir adapter-une-pub-concurrente.md")

    print("\n== Clés (présente ou absente, jamais la valeur) ==")
    for nom, role in (
        ("BRAVE_API_KEY", "recherche web par API (avatar)"),
        ("YOUTUBE_API_KEY", "YouTube (avatar), gratuit"),
        ("SCRAPECREATORS_API_KEY", "commentaires TikTok/Instagram (avatar), PAYANT, facultatif"),
        ("GEMINI_API_KEY", "images et voix par IA, PAYANT"),
        ("OPENROUTER_API_KEY", "autres générateurs vidéo, PAYANT"),
        ("CARTESIA_API_KEY", "voix off de repli (PAYANT, facultatif)"),
    ):
        ligne("présente" if cle_presente(nom) else "absente ", nom, role)
    print("\nUne clé absente n'est pas une erreur : chaque skill te dit quand elle devient utile, et combien mettre.")

    if bloquant:
        print(f"\n{bloquant} élément(s) obligatoire(s) manquant(s) : corrige-les avant de monter.")
        sys.exit(1)
    print("\nTout ce qui est obligatoire est là.")


if __name__ == "__main__":
    main()
