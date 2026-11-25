"""ÉTAPE PAYANTE : génère les images candidates de l'avatar visuel par l'API Google AI Studio (route B de CLES.md).

Ce que ça apporte : les 4 candidats du canonical (puis les retouches et les plans suivants), sans passer par le
navigateur. Route A (abonnement Google dans le navigateur, prompts collés à la main) : pas besoin de ce script.

Clé : GEMINI_API_KEY (clé personnelle Google AI Studio), lue par charge_cles.py, jamais affichée.
Les noms de modèle, les champs de la requête et les prix ci-dessous sont ceux connus au 05/10/2026 : VÉRIFIE-LES
dans la documentation et sur la page de tarifs de Google AI Studio avant le premier lot (ils changent).

GARDE-FOUS (non négociables) :
- Sans --oui, le script AFFICHE le plan (nombre d'images, taille, coût estimé) et s'arrête (code 2). Tu annonces le
  coût à la personne ; si elle dit oui, tu relances la même commande avec --oui.
- --max-images (défaut 8) plafonne le lot.
- Chaque image écrite est CONTRÔLÉE : fichier complet (pas tronqué), format, dimensions. Les dimensions de chaque
  référence jointe sont imprimées avant l'envoi (un outil peut joindre une autre image que prévu) ; avec
  --ref-attendue LxH, le script refuse d'envoyer si la première référence n'a pas cette forme.

Usage :
  python3 genere_image.py prompt.txt --ref ref-jour.jpg --n 2 --taille 2K --ratio 9:16 --sortie generees/ [--oui]
  Les références sont jointes AVANT le texte, dans l'ordre donné. Le canonical (s'il existe) se met en premier.

Prix indicatifs (ESTIMATION, à revérifier) : 0,134 $ par image en 1K ou 2K, 0,24 $ en 4K.
Journal : generees/_journal.log (heure, modèle, taille, fichier, contrôle).
"""
import argparse
import base64
import json
import mimetypes
import os
import struct
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
from charge_cles import cle, masque  # noqa: E402

MODELE = "gemini-3-pro-image-preview"
BASE = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent"
PRIX = {"1K": 0.134, "2K": 0.134, "4K": 0.24}


def http_post_json(url, entetes, corps, delai=180):
    """Seule fonction qui touche le réseau : les tests la remplacent."""
    req = urllib.request.Request(url, data=json.dumps(corps).encode("utf-8"), headers=entetes, method="POST")
    with urllib.request.urlopen(req, timeout=delai) as f:
        return json.load(f)


def dimensions(octets):
    """(format, largeur, hauteur) d'un PNG ou d'un JPEG, ou (None, 0, 0)."""
    if octets[:8] == b"\x89PNG\r\n\x1a\n" and len(octets) >= 24:
        l, h = struct.unpack(">II", octets[16:24])
        return "png", l, h
    if octets[:2] == b"\xff\xd8":
        i = 2
        while i + 9 < len(octets):
            if octets[i] != 0xFF:
                i += 1
                continue
            marqueur = octets[i + 1]
            if marqueur in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                h, l = struct.unpack(">HH", octets[i + 5:i + 9])
                return "jpeg", l, h
            if marqueur == 0xD8 or 0xD0 <= marqueur <= 0xD7 or marqueur == 0x01:
                i += 2
                continue
            longueur = struct.unpack(">H", octets[i + 2:i + 4])[0]
            i += 2 + longueur
        return "jpeg", 0, 0
    return None, 0, 0


def complet(octets):
    """Vrai si le fichier se termine comme il doit (PNG : bloc IEND ; JPEG : marqueur de fin FFD9)."""
    fmt, _, _ = dimensions(octets)
    if fmt == "png":
        return b"IEND" in octets[-12:]
    if fmt == "jpeg":
        return octets.rstrip(b"\x00").endswith(b"\xff\xd9")
    return False


def requete(prompt, refs, ratio, taille):
    parts = []
    for r in refs:
        octets = Path(r).read_bytes()
        mime = mimetypes.guess_type(r)[0] or "image/jpeg"
        parts.append({"inline_data": {"mime_type": mime, "data": base64.b64encode(octets).decode("ascii")}})
    parts.append({"text": prompt})
    return {"contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["TEXT", "IMAGE"],
                                 "imageConfig": {"aspectRatio": ratio, "imageSize": taille}}}


def images_de(reponse):
    out = []
    for c in reponse.get("candidates", []):
        for p in (c.get("content") or {}).get("parts", []):
            d = p.get("inlineData") or p.get("inline_data")
            if d and d.get("data"):
                out.append((d.get("mimeType") or d.get("mime_type") or "image/png", base64.b64decode(d["data"])))
    return out


def principal(argv=None, http=None):
    ap = argparse.ArgumentParser(description="ÉTAPE PAYANTE : images candidates de l'avatar (Google AI Studio)")
    ap.add_argument("prompt", help="fichier texte contenant le prompt")
    ap.add_argument("--ref", action="append", default=[])
    ap.add_argument("--n", type=int, default=1)
    ap.add_argument("--taille", default="2K", choices=["1K", "2K", "4K"])
    ap.add_argument("--ratio", default="9:16")
    ap.add_argument("--sortie", default="generees")
    ap.add_argument("--modele", default=MODELE)
    ap.add_argument("--max-images", type=int, default=8)
    ap.add_argument("--ref-attendue", help="forme attendue de la première référence, par exemple 640x480")
    ap.add_argument("--oui", action="store_true")
    a = ap.parse_args(argv)
    try:
        prompt = Path(a.prompt).read_text(encoding="utf-8").strip()
    except OSError:
        sys.exit("Prompt introuvable : %s" % a.prompt)
    if a.n > a.max_images:
        sys.exit("%d images demandées, le plafond est %d (--max-images). Dis-le à la personne." % (a.n, a.max_images))
    for i, r in enumerate(a.ref, 1):
        try:
            fmt, l, h = dimensions(Path(r).read_bytes())
        except OSError:
            sys.exit("Référence introuvable : %s" % r)
        print("Référence %d : %s, %s, %dx%d" % (i, os.path.basename(r), fmt or "format inconnu", l, h))
        if i == 1 and a.ref_attendue and "%dx%d" % (l, h) != a.ref_attendue:
            sys.exit("La première référence fait %dx%d, pas %s : mauvaise image jointe ? Rien n'a été envoyé." % (l, h, a.ref_attendue))
    cout = a.n * PRIX[a.taille]
    print("ÉTAPE PAYANTE. Plan : %d image(s) en %s, ratio %s, modèle %s, %d référence(s). Coût estimé : %.2f $ "
          "(ESTIMATION : %.3f $ par image, à revérifier sur la page de tarifs)." % (a.n, a.taille, a.ratio, a.modele, len(a.ref), cout, PRIX[a.taille]))
    if not a.oui:
        print("Rien n'a été envoyé. Annonce ce coût à la personne ; si elle dit oui, relance la même commande avec --oui.")
        return 2
    k = cle("GEMINI_API_KEY")
    http = http or http_post_json
    os.makedirs(a.sortie, exist_ok=True)
    corps = requete(prompt, a.ref, a.ratio, a.taille)
    ecrites = 0
    for n in range(a.n):
        try:
            rep = http(BASE % a.modele, {"Content-Type": "application/json", "x-goog-api-key": k}, corps)
        except urllib.error.HTTPError as e:
            msg = ""
            try:
                msg = masque(e.read().decode("utf-8", "replace"), k)[:300]
            except Exception:
                pass
            print("ERREUR (HTTP %s) : %s" % (e.code, msg))
            if e.code in (401, 403):
                print("La clé GEMINI_API_KEY est refusée ou n'a pas accès à ce modèle (voir CLES.md).")
            continue
        except Exception as e:
            print("ERREUR :", masque(str(e), k)[:200])
            continue
        imgs = images_de(rep)
        if not imgs:
            print("Image %d : aucune image dans la réponse (refus du modèle ou limite). Réponse non enregistrée." % (n + 1))
            continue
        for mime, octets in imgs:
            ext = ".png" if "png" in mime else ".jpg"
            nom = os.path.join(a.sortie, "candidat-%s-%d%s" % (time.strftime("%H%M%S"), n + 1, ext))
            Path(nom).write_bytes(octets)
            fmt, l, h = dimensions(octets)
            ok = complet(octets)
            with open(os.path.join(a.sortie, "_journal.log"), "a", encoding="utf-8") as j:
                j.write("%s\t%s\t%s\t%s\t%dx%d\t%s\n" % (time.strftime("%Y-%m-%d %H:%M:%S"), a.modele, a.taille, os.path.basename(nom), l, h, "complet" if ok else "TRONQUÉ"))
            print("Image %d : %s, %dx%d, %s" % (n + 1, nom, l, h, "fichier complet" if ok else "ATTENTION : fichier TRONQUÉ, ne le montre pas, régénère-le"))
            ecrites += ok
    print("%d image(s) complète(s) sur %d demandée(s)." % (ecrites, a.n))
    return 0


if __name__ == "__main__":
    sys.exit(principal() or 0)
