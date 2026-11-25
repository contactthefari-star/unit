#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""edit_toolkit.py : les gestes de montage d'une pub verticale, executables avec ffmpeg et Pillow.

Sous-commandes :
  info         carte d'identite MESUREE d'un film (cadence par division, flux contre conteneur,
               sonie, silences, HDR) : le controle de fin, a lancer sur le fichier LIVRE
  master       sonie -14 LUFS (crete -1,5 dBTP), 48 kHz stereo, musique de fond posee au
               rapport voix/musique MESURE (12 dB valide), gain et fondus apres la normalisation
  punch        zoom punch-in (105 a 110 %) en rampe sur une fenetre de temps
  transition   raccorde deux clips par une transition pensee en IMAGES (8 images par defaut)
  beforeafter  avant/apres cote a cote ou haut/bas
  endcard      carte de fin avec le VRAI logo ou une capture de la page produit
  assemble     colle des clips en UNE passe (aucun recollage d'audio AAC : pas de derive)

Exemples :
  python3 edit_toolkit.py info film.mp4 --fps-attendu 24
  python3 edit_toolkit.py master film.mp4 -o master.mp4 --bed musique.mp3 --rapport-db 12
  python3 edit_toolkit.py punch film.mp4 -o out.mp4 --at 6.2 --dur 0.6 --zoom 1.08
  python3 edit_toolkit.py transition a.mp4 b.mp4 -o ab.mp4 --type fondu --images 9
  python3 edit_toolkit.py beforeafter --before avant.mp4 --after apres.mp4 -o ba.mp4
  python3 edit_toolkit.py endcard -o fin.mp4 --logo logo.png --cta "Voir l'offre sur le site"
  python3 edit_toolkit.py assemble a.mp4 b.mp4 c.mp4 -o pub.mp4

Principes (voir references/pieges-ffmpeg.md) : on compte en IMAGES et en ECHANTILLONS, jamais
en secondes ; la duree retenue est celle du FLUX video ; pas de -shortest ; l'audio n'est
encode en AAC qu'UNE fois, a la fin.
"""
import argparse
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import commun as C  # noqa: E402

TRANSITIONS = {  # nom francais -> filtre xfade ; la duree se compte en images, pas en secondes
    "fondu": "fade", "fondu_noir": "fadeblack", "flash": "fadewhite", "whip": "hblur",
    "glisse_gauche": "slideleft", "glisse_droite": "slideright", "glisse_haut": "slideup",
    "glisse_bas": "slidedown", "balayage": "wipeleft", "zoom": "zoomin", "pixel": "pixelize",
    "cercle": "circleopen", "dissous": "dissolve", "radial": "radial", "gris": "fadegrays",
    "ecrase": "squeezeh", "etire": "squeezev", "fondu_rapide": "fadefast", "fondu_lent": "fadeslow",
}
PLANCHER_IMAGES = 3      # sous 3 images une transition ne se lit pas : coupe franche
IMAGES_DEFAUT = 8        # il en faut 8 a 9 pour qu'un mouvement monte et redescende
GABARITS = [r"\{[^}]*\}", r"[\[][^\]]*[\]]", r"<[^>]*>", r"!{3,}", r"\bX{3,}\b", r"\bTODO\b",
            r"(?i)lorem ipsum", r"%[sd]\b"]


def parse_taille(s):
    try:
        w, h = s.lower().split("x")
        return int(w), int(h)
    except Exception:
        C.erreur("taille attendue au format 1080x1920, recu : " + s)


def fps_depuis(clips, demande):
    """Cadence de sortie. `auto` prend celle du premier clip : on ne convertit jamais en
    silence du 24 en 30 (une image dupliquee sur cinq fabrique de la saccade)."""
    if demande not in (None, "auto"):
        return float(demande)
    f = C.sonde(clips[0])["fps"]
    return f if f else 30.0


# --------------------------------------------------------------------------- info

def cmd_info(a):
    for chemin in a.films:
        i = C.sonde(chemin, compter=True)
        print("\n=== %s ===" % os.path.basename(chemin))
        if i["a_video"]:
            print("  image      : %dx%d (%s), %.3f i/s annoncees" %
                  (i["largeur"], i["hauteur"], i["ratio"], i["fps"]))
            ecart = i["duree_conteneur"] - i["duree_flux"]
            print("  duree      : flux video %.3f s, conteneur %.3f s (ecart %+d ms)" %
                  (i["duree_flux"], i["duree_conteneur"], round(ecart * 1000)))
            n = i.get("images")
            if n and i["duree_flux"] > 0:
                div = n / i["duree_flux"]
                print("  images     : %d comptees ; %d / %.3f s = %.3f i/s par DIVISION" %
                      (n, n, i["duree_flux"], div))
                cible = a.fps_attendu or i["fps"]
                if abs(div - cible) > 0.05:
                    C.avertir("la cadence par division (%.3f) n'est pas %.3f : le contenu a "
                              "probablement ete re-echantillonne (un rendu a 30 i/s depuis des "
                              "sources a 24 se voit ici)." % (div, cible))
            if abs(ecart) > 0.05:
                print("  note       : le conteneur depasse le flux de plus de 50 ms (pavage AAC ou "
                      "audio plus long) ; c'est le FLUX video qui porte la verite du montage.")
            if i["color_transfer"] in ("arib-std-b67", "smpte2084"):
                C.avertir("source HDR (%s) : les reseaux la re-etalonneront et la crea partira "
                          "delavee. Refilme en SDR, ou convertis avec zscale ou libplacebo "
                          "(voir references/transitions-effets-formats.md)." % i["color_transfer"])
        if i["a_audio"]:
            print("  audio      : %d Hz, %d canaux, %.3f s" %
                  (i["audio_sr"], i["audio_canaux"], i["audio_duree"]))
            if i["audio_sr"] != 48000 or i["audio_canaux"] != 2:
                C.avertir("le master vise 48000 Hz stereo (-ar 48000 -ac 2).")
            lufs, tp = C.mesure_loudnorm(chemin)
            if lufs is None:
                print("  sonie      : piste muette")
            else:
                print("  sonie      : %.1f LUFS integres, crete vraie %.1f dBTP (cible -14 LUFS, "
                      "-1,5 dBTP)" % (lufs, tp))
            env = C.enveloppe_dbfs(chemin)
            sil = C.silences_enveloppe(env)
            actif = 100.0 * sum(1 for v in env if v >= C.PLANCHER_DBFS) / len(env)
            total = sum(d for _, d in sil)
            print("  silences   : %d de %.2f s et plus (%.2f s au total, plancher %.0f dBFS) ; "
                  "part active %.1f %%" % (len(sil), C.SEUIL_SILENCE_S, total,
                                           C.PLANCHER_DBFS, actif))
            for d, dur in sil[:8]:
                print("               a %.2f s pendant %.2f s" % (d, dur))
        else:
            print("  audio      : aucune piste")


# ------------------------------------------------------------------------- master

def cmd_master(a):
    i = C.sonde(a.input)
    if not i["a_video"]:
        C.erreur("master attend une video (image + son).")
    dur = i["duree_flux"]
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.input]
    queue = ""
    if abs(a.gain_db) > 0.01:
        queue += ",volume=%.1fdB" % max(-30.0, min(20.0, a.gain_db))
    if a.fondu_entree > 0.01:
        queue += ",afade=t=in:st=0:d=%.3f" % min(a.fondu_entree, dur / 2)
    if a.fondu_sortie > 0.01:
        fs = min(a.fondu_sortie, dur / 2)
        queue += ",afade=t=out:st=%.3f:d=%.3f" % (dur - fs, fs)
    L = "loudnorm=I=-14:TP=-1.5:LRA=11"
    if a.bed:
        cmd += ["-stream_loop", "-1", "-i", a.bed]
        fc = []
        if i["a_audio"]:
            l_voix, _ = C.mesure_loudnorm(a.input)
            l_bed, _ = C.mesure_loudnorm(a.bed)
            if l_voix is None or l_bed is None:
                C.erreur("impossible de mesurer la sonie de la voix ou de la musique.")
            g = (l_voix - a.rapport_db) - l_bed
            g = max(-40.0, min(20.0, g))
            print("voix %.1f LUFS ; musique %.1f LUFS ; gain de la musique %+.1f dB pour un rapport "
                  "voix/musique de %.0f dB" % (l_voix, l_bed, g, a.rapport_db), file=sys.stderr)
            fc.append("[0:a]aresample=48000,aformat=channel_layouts=stereo[v]")
            fc.append("[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=%.2fdB,"
                      "atrim=duration=%.4f,asetpts=PTS-STARTPTS[b]" % (g, dur))
            fc.append("[v][b]amix=inputs=2:duration=first:normalize=0:dropout_transition=0[m]")
            fc.append("[m]" + L + queue + "[a]")
        else:
            C.avertir("la video n'a pas de voix : la musique est normalisee seule a -14 LUFS.")
            fc.append("[1:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration=%.4f,"
                      "asetpts=PTS-STARTPTS," % dur + L + queue + "[a]")
        cmd += ["-filter_complex", ";".join(fc), "-map", "0:v:0", "-map", "[a]"]
    else:
        if not i["a_audio"]:
            C.erreur("pas de piste audio a normaliser (donne --bed pour poser une musique).")
        cmd += ["-map", "0:v:0", "-map", "0:a:0", "-af", L + queue]
    # l'image est la verite : on borne par la duree du flux video, jamais par -shortest
    cmd += ["-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
            "-t", "%.6f" % dur, "-movflags", "+faststart", a.out]
    C.sh(cmd)
    lufs, tp = C.mesure_loudnorm(a.out)
    print("master -> %s : %.1f LUFS, crete %.1f dBTP (MESURES sur le fichier produit)" %
          (a.out, lufs if lufs is not None else float("nan"),
           tp if tp is not None else float("nan")), file=sys.stderr)


# -------------------------------------------------------------------------- punch

def cmd_punch(a):
    i = C.sonde(a.input, compter=True)
    if not i["a_video"]:
        C.erreur("punch attend une video.")
    F, W, H = i["fps"], i["largeur"], i["hauteur"]
    z = a.zoom
    if not (1.05 <= z <= 1.10):
        C.avertir("le punch-in valide est de 105 a 110 %% ; %.0f %% se remarque." % (z * 100))
    r = a.rampe / F
    t0, t1 = a.at, a.at + r
    t3 = a.at + a.dur
    t4 = t3 + r
    if t4 > i["duree_flux"] + 1e-6:
        C.erreur("la fenetre depasse la fin du film (%.2f s)." % i["duree_flux"])
    T = "(on/%.4f)" % F
    expr = ("if(lt({T},{t0}),1,if(lt({T},{t1}),1+({z}-1)*({T}-{t0})/({r}),"
            "if(lt({T},{t3}),{z},if(lt({T},{t4}),{z}-({z}-1)*({T}-{t3})/({r}),1))))").format(
        T=T, t0=t0, t1=t1, t3=t3, t4=t4, z=z, r=r)
    vf = ("zoompan=z='%s':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=%dx%d:fps=%s,setsar=1"
          % (expr, W, H, ("%g" % F)))
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.input, "-vf", vf, "-map", "0:v:0"]
    cmd += ["-map", "0:a?", "-c:a", "copy"] if i["a_audio"] else []
    cmd += C.encodeur_video() + ["-frames:v", str(i["images"]), "-movflags", "+faststart", a.out]
    C.sh(cmd)
    print("punch %.2fx de %.2f s a %.2f s (rampe de %d images) -> %s" %
          (z, t0, t3, a.rampe, a.out), file=sys.stderr)


# --------------------------------------------------------------- assemblage en une passe

def _segment(idx, info, W, H, fps, fy):
    """Filtres d'un clip : video cadree, cadence imposee, bornee a un nombre ENTIER d'images ;
    audio 48 kHz stereo borne au compte d'echantillons exact (silence si la source est muette)."""
    n = C.nb_images(info["duree_flux"], fps)
    ns = int(round(n / fps * 48000))
    v = ("[%d:v]fps=%g,scale=%d:%d:force_original_aspect_ratio=increase,"
         "crop=%d:%d:(iw-ow)*0.5:(ih-oh)*%.3f,setsar=1,trim=end_frame=%d,setpts=PTS-STARTPTS[v%d]"
         % (idx, fps, W, H, W, H, fy, n, idx))
    if info["a_audio"]:
        au = ("[%d:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
              "apad=whole_len=%d,atrim=end_sample=%d,asetpts=PTS-STARTPTS[a%d]" % (idx, ns, ns, idx))
    else:
        au = ("anullsrc=r=48000:cl=stereo,atrim=end_sample=%d,asetpts=PTS-STARTPTS[a%d]" % (ns, idx))
    return v, au, n


def assembler(clips, sortie, W, H, fps, fy=0.5):
    infos = [C.sonde(c) for c in clips]
    for c, i in zip(clips, infos):
        if not i["a_video"]:
            C.erreur(c + " n'a pas de flux video.")
        if i["fps"] and abs(i["fps"] - fps) > 0.01:
            C.avertir("%s est a %.3f i/s et sera converti a %g i/s : des images seront "
                      "dupliquees ou supprimees." % (os.path.basename(c), i["fps"], fps))
        if (i["largeur"], i["hauteur"]) != (W, H):
            C.avertir("%s est en %dx%d et sera recadre en %dx%d (rognage centre : verifie les "
                      "visages)." % (os.path.basename(c), i["largeur"], i["hauteur"], W, H))
    filtres, concat, total = [], "", 0
    for k, (c, i) in enumerate(zip(clips, infos)):
        v, au, n = _segment(k, i, W, H, fps, fy)
        filtres += [v, au]
        concat += "[v%d][a%d]" % (k, k)
        total += n
    filtres.append(concat + "concat=n=%d:v=1:a=1[v][a]" % len(clips))
    opt, tmpf = C.option_graphe(";".join(filtres))
    cmd = ["ffmpeg", "-v", "error", "-y"]
    for c in clips:
        cmd += ["-i", c]
    cmd += opt + ["-map", "[v]", "-map", "[a]"]
    cmd += C.encodeur_video() + ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
                                 "-frames:v", str(total), "-t", "%.6f" % (total / fps),
                                 "-movflags", "+faststart", sortie]
    try:
        C.sh(cmd)
    finally:
        if tmpf:
            os.unlink(tmpf)
    return total


def cmd_assemble(a):
    W, H = parse_taille(a.taille)
    fps = fps_depuis(a.clips, a.fps)
    n = assembler(a.clips, a.out, W, H, fps, a.cadrage_y)
    print("assemble %d clips -> %s : %d images a %g i/s (%.3f s)" %
          (len(a.clips), a.out, n, fps, n / fps), file=sys.stderr)


# --------------------------------------------------------------------- transition

def cmd_transition(a):
    ia, ib = C.sonde(a.clip_a), C.sonde(a.clip_b)
    W, H = (ia["largeur"], ia["hauteur"]) if not a.taille else parse_taille(a.taille)
    fps = fps_depuis([a.clip_a], a.fps)
    nom = TRANSITIONS.get(a.type, a.type)
    if a.coupe or a.type == "coupe":
        n = assembler([a.clip_a, a.clip_b], a.out, W, H, fps)
        print("coupe franche -> %s (%d images)" % (a.out, n), file=sys.stderr)
        return
    na = C.nb_images(ia["duree_flux"], fps)
    nb = C.nb_images(ib["duree_flux"], fps)
    d_img = a.images
    # plafond : la moitie du plus court des deux plans, et 0,6 s ; quantifie en images
    plafond = min(0.6, na / fps * 0.5, nb / fps * 0.5)
    d_img = min(d_img, int(plafond * fps))
    if d_img < PLANCHER_IMAGES:
        C.avertir("sous %d images une transition ne se lit pas : COUPE FRANCHE a la place." %
                  PLANCHER_IMAGES)
        n = assembler([a.clip_a, a.clip_b], a.out, W, H, fps)
        print("coupe franche -> %s (%d images)" % (a.out, n), file=sys.stderr)
        return
    d = d_img / fps
    if ia["a_audio"]:
        debut = max(0.0, na / fps - d)
        moy, mx = C.niveau_dbfs(a.clip_a, debut, d)
        if mx > -40.0:
            C.avertir("le clip A parle encore dans la zone de la transition (niveau max %.0f dBFS "
                      "sur ses %.2f dernieres secondes) : la transition va rogner la fin du dernier "
                      "mot. Prefere --coupe, ou un clip qui s'arrete de parler plus tot." % (mx, d))
    off = na / fps - d
    ns_a, ns_b = int(round(na / fps * 48000)), int(round(nb / fps * 48000))
    fc = []
    for k, (info, n_, ns) in enumerate(((ia, na, ns_a), (ib, nb, ns_b))):
        fc.append("[%d:v]fps=%g,scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,"
                  "setsar=1,format=yuv420p,trim=end_frame=%d,setpts=PTS-STARTPTS[v%d]" %
                  (k, fps, W, H, W, H, n_, k))
        if info["a_audio"]:
            fc.append("[%d:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,"
                      "apad=whole_len=%d,atrim=end_sample=%d,asetpts=PTS-STARTPTS[a%d]" %
                      (k, ns, ns, k))
        else:
            fc.append("anullsrc=r=48000:cl=stereo,atrim=end_sample=%d,asetpts=PTS-STARTPTS[a%d]" %
                      (ns, k))
    fc.append("[v0][v1]xfade=transition=%s:duration=%.4f:offset=%.4f[v]" % (nom, d, off))
    fc.append("[a0][a1]acrossfade=d=%.4f[a]" % d)
    total = na + nb - d_img
    opt, tmpf = C.option_graphe(";".join(fc))
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.clip_a, "-i", a.clip_b] + opt
    cmd += ["-map", "[v]", "-map", "[a]"]
    # la sortie d'un xfade vaut offset + longueur de la seconde entree : on borne en images
    cmd += C.encodeur_video() + ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
                                 "-frames:v", str(total), "-t", "%.6f" % (total / fps),
                                 "-movflags", "+faststart", a.out]
    try:
        C.sh(cmd)
    finally:
        if tmpf:
            os.unlink(tmpf)
    print("transition %s de %d images (%.3f s) -> %s ; %d images, %.3f s. La transition "
          "CHEVAUCHE les deux clips : le film est plus court de %.3f s que A + B." %
          (a.type, d_img, d, a.out, total, total / fps, d), file=sys.stderr)


# ------------------------------------------------------------------- avant / apres

def cmd_beforeafter(a):
    ib, ia = C.sonde(a.before), C.sonde(a.after)
    W, H = parse_taille(a.taille)
    fps = ib["fps"] or 30.0
    n = min(C.nb_images(ib["duree_flux"], fps), C.nb_images(ia["duree_flux"], fps))
    if a.layout == "lr":
        fc = ("[0:v]fps=%g,scale=-2:%d,crop=%d:%d[l];[1:v]fps=%g,scale=-2:%d,crop=%d:%d[r];"
              "[l][r]hstack=2,setsar=1[v]" % (fps, H, W // 2, H, fps, H, W // 2, H))
    else:
        fc = ("[0:v]fps=%g,scale=%d:-2,crop=%d:%d[t];[1:v]fps=%g,scale=%d:-2,crop=%d:%d[b];"
              "[t][b]vstack=2,setsar=1[v]" % (fps, W, W, H // 2, fps, W, W, H // 2))
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", a.before, "-i", a.after, "-filter_complex", fc,
           "-map", "[v]"]
    cmd += ["-map", "0:a?", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"] \
        if ib["a_audio"] else []
    cmd += C.encodeur_video() + ["-frames:v", str(n), "-t", "%.6f" % (n / fps),
                                 "-movflags", "+faststart", a.out]
    C.sh(cmd)
    print("avant/apres (%s) -> %s, %d images" % (a.layout, a.out, n), file=sys.stderr)


# ----------------------------------------------------------------------- carte de fin

def verifier_gabarit(texte):
    """Un gabarit non rempli peut partir en production (un texte du type « Commandez vite
    sur !!! »). On refuse ce qui ressemble a un champ vide."""
    for motif in GABARITS:
        m = re.search(motif, texte)
        if m:
            C.erreur("le texte contient un gabarit non rempli (« %s »). Remplis-le avec la vraie "
                     "valeur : jamais de prix, de marque ni d'avis invente." % m.group(0))


def cmd_endcard(a):
    from PIL import Image, ImageDraw
    W, H = parse_taille(a.taille)
    if not a.logo and not a.page_produit:
        C.erreur("une carte de fin demande le VRAI logo (--logo fichier.png) ou une capture reelle "
                 "de la page produit (--page-produit capture.png). Jamais la marque retapee dans "
                 "une police, jamais un prix invente.")
    if a.cta:
        verifier_gabarit(a.cta)
    fond = C.hexrgb(a.couleur)
    img = Image.new("RGB", (W, H), fond)
    d = ImageDraw.Draw(img)
    y_bouton = 0.60
    if a.page_produit:
        p = Image.open(a.page_produit).convert("RGB")
        lw = int(W * 0.92)
        p = p.resize((lw, int(lw * p.height / p.width)))
        if p.height > int(H * 0.74):
            p = p.crop((0, 0, p.width, int(H * 0.74)))
        img.paste(p, ((W - lw) // 2, int(H * 0.06)))
        y_bouton = 0.86
    if a.logo:
        if not os.path.isfile(a.logo):
            C.erreur("logo introuvable : " + a.logo)
        lg = Image.open(a.logo).convert("RGBA")
        lw = int(W * 0.5)
        lg = lg.resize((lw, int(lw * lg.height / lg.width)))
        img.paste(lg, ((W - lw) // 2, int(H * 0.32)), lg)
    if a.cta:
        chemin, _ = C.trouver_police(a.police)
        taille = int(H * 0.042)
        while taille > 20:
            f = C.charger_police(chemin, taille)
            tw = d.textlength(a.cta, font=f)
            if tw <= W * 0.80:
                break
            taille -= 2
        pad = int(taille * 0.55)
        x0, x1 = int((W - tw) / 2 - pad), int((W + tw) / 2 + pad)
        y0 = int(H * y_bouton)
        y1 = int(y0 + taille * 1.25 + pad)
        d.rounded_rectangle([x0, y0, x1, y1], radius=int(taille * 0.4), fill=C.hexrgb(a.bouton))
        d.text(((W - tw) / 2, y0 + pad * 0.55), a.cta, font=f, fill=(255, 255, 255))
    tmp = tempfile.mkdtemp(prefix="carte_")
    png = os.path.join(tmp, "fin.png")
    img.save(png)
    n = C.nb_images(a.dur, a.fps)
    cmd = ["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", "%g" % a.fps, "-i", png,
           "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a",
           "-vf", "fps=%g,setsar=1" % a.fps]
    cmd += C.encodeur_video() + ["-c:a", "aac", "-ar", "48000", "-ac", "2",
                                 "-frames:v", str(n), "-t", "%.6f" % (n / a.fps),
                                 "-movflags", "+faststart", a.out]
    C.sh(cmd)
    print("carte de fin %d images (%.2f s) -> %s" % (n, n / a.fps, a.out), file=sys.stderr)


# --------------------------------------------------------------------------- main

def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("info", help="carte d'identite mesuree d'un film")
    s.add_argument("films", nargs="+")
    s.add_argument("--fps-attendu", type=float, help="cadence voulue (24, 25, 30) a comparer")
    s.set_defaults(fn=cmd_info)

    s = sub.add_parser("master", help="sonie -14 LUFS + musique au rapport mesure")
    s.add_argument("input")
    s.add_argument("-o", "--out", required=True)
    s.add_argument("--bed", help="musique de fond (mp3, wav...)")
    s.add_argument("--rapport-db", type=float, default=12.0,
                   help="ecart voix/musique voulu en LUFS (12 valide ; 15 est inaudible sur telephone)")
    s.add_argument("--gain-db", type=float, default=0.0, help="gain pose APRES la normalisation")
    s.add_argument("--fondu-entree", type=float, default=0.0)
    s.add_argument("--fondu-sortie", type=float, default=0.0)
    s.set_defaults(fn=cmd_master)

    s = sub.add_parser("punch", help="zoom punch-in en rampe")
    s.add_argument("input")
    s.add_argument("-o", "--out", required=True)
    s.add_argument("--at", type=float, required=True, help="debut du punch (s)")
    s.add_argument("--dur", type=float, default=0.6, help="duree tenue (s)")
    s.add_argument("--zoom", type=float, default=1.08, help="1.05 a 1.10")
    s.add_argument("--rampe", type=int, default=6, help="images de montee et de descente")
    s.set_defaults(fn=cmd_punch)

    s = sub.add_parser("transition", help="raccorde deux clips")
    s.add_argument("clip_a")
    s.add_argument("clip_b")
    s.add_argument("-o", "--out", required=True)
    s.add_argument("--type", default="fondu",
                   help="un de : coupe, " + ", ".join(sorted(TRANSITIONS)) + " (ou un nom xfade brut)")
    s.add_argument("--images", type=int, default=IMAGES_DEFAUT,
                   help="duree EN IMAGES (8 a 9 pour qu'on la voie ; sous 3 : coupe franche)")
    s.add_argument("--coupe", action="store_true", help="coupe franche, sans transition")
    s.add_argument("--taille", help="WxH (defaut : celle du clip A)")
    s.add_argument("--fps", default="auto")
    s.set_defaults(fn=cmd_transition)

    s = sub.add_parser("beforeafter", help="avant/apres")
    s.add_argument("--before", required=True)
    s.add_argument("--after", required=True)
    s.add_argument("-o", "--out", required=True)
    s.add_argument("--layout", default="lr", choices=["lr", "tb"])
    s.add_argument("--taille", default="1080x1920")
    s.set_defaults(fn=cmd_beforeafter)

    s = sub.add_parser("endcard", help="carte de fin (vrai logo ou page produit reelle)")
    s.add_argument("-o", "--out", required=True)
    s.add_argument("--logo", help="le VRAI fichier logo (png avec transparence)")
    s.add_argument("--page-produit", help="capture REELLE de la page produit")
    s.add_argument("--cta", help="appel a l'action, texte reel (les gabarits non remplis sont refuses)")
    s.add_argument("--couleur", default="#111111", help="couleur de fond")
    s.add_argument("--bouton", default="#E61E2D", help="couleur du bouton")
    s.add_argument("--police", help="fichier .ttf (sinon Verdana Bold, repli annonce)")
    s.add_argument("--dur", type=float, default=2.0, help="1 a 3 s")
    s.add_argument("--taille", default="1080x1920")
    s.add_argument("--fps", type=float, default=30.0)
    s.set_defaults(fn=cmd_endcard)

    s = sub.add_parser("assemble", help="colle des clips en UNE passe")
    s.add_argument("clips", nargs="+")
    s.add_argument("-o", "--out", required=True)
    s.add_argument("--taille", default="1080x1920")
    s.add_argument("--fps", default="auto", help="auto = cadence du premier clip (jamais de conversion cachee)")
    s.add_argument("--cadrage-y", type=float, default=0.5,
                   help="0 a 1 ; un rognage centre coupe les tetes, descends vers 0.3 pour un visage")
    s.set_defaults(fn=cmd_assemble)

    a = p.parse_args()
    C.exiger_binaires()
    a.fn(a)


if __name__ == "__main__":
    C.lancer(main)
