"""Rend le dossier d'avatar (Markdown) en UNE page HTML lisible : sommaire, tableaux, pastilles de fiabilité.

Aucune installation : uniquement la bibliothèque standard de Python. Aucune ressource en ligne (la page
s'ouvre hors connexion, par un double clic). Clair et sombre automatiques, lisible sur téléphone.

Usage :
  python3 rendre_dossier.py AVATAR_mon-produit.md                    -> AVATAR_mon-produit.html
  python3 rendre_dossier.py AVATAR_mon-produit.md page.html --titre "Avatar de mon produit" --surtitre "Dossier du 05/10/2026"

Ce qui est géré : titres #, ##, ###, ####, paragraphes, listes à puces et numérotées (un niveau
d'imbrication), tableaux, citations >, séparateurs ---, blocs de code, **gras**, *italique*, `code`,
[lien](url), adresses nues. Les étiquettes [DOSSIER ...], [DÉDUIT], [PRESSE], [PAGE LUE ...],
[SITE VENDEUR], [BLOG], [TES VENTES], [ESTIMATION], [NON MESURÉ], [IGNORÉE] deviennent des pastilles de couleur.
Le HTML du texte source est neutralisé (jamais exécuté).
Pour un PDF : ouvre la page dans un navigateur et imprime-la en PDF (le style d'impression est prévu).
"""
import argparse
from pathlib import Path
import html
import os
import re
import sys

ETIQUETTES = [
    (r"DOSSIER[^\]]*", "t-dos"), (r"PAGE LUE[^\]]*", "t-dos"), (r"DÉDUIT[^\]]*", "t-ded"),
    (r"ESTIMATION[^\]]*", "t-ded"), (r"NON MESURÉ[^\]]*", "t-non"), (r"IGNORÉE[^\]]*", "t-non"),
    (r"PRESSE[^\]]*", "t-aut"), (r"SITE VENDEUR[^\]]*", "t-aut"), (r"NON VÉRIFIÉ[^\]]*", "t-non"),
    (r"BLOG[^\]]*", "t-aut"), (r"TES VENTES[^\]]*", "t-dos"),
]


def slug(s):
    s = re.sub(r"<[^>]+>", "", s).lower()
    s = re.sub(r"[^a-z0-9àâçéèêëîïôûùüÿœ]+", "-", s).strip("-")
    return s[:60] or "s"


def inline(t):
    """Texte brut : on échappe, on protège code et liens, puis gras, italique, adresses nues, étiquettes."""
    garde = []

    def met(h):
        garde.append(h)
        return "\x00%d\x00" % (len(garde) - 1)

    def lien(url, texte):
        return met('<a target="_blank" rel="noopener" href="%s">%s</a>' % (url, texte))

    t = html.escape(t, quote=False)
    t = re.sub(r"`([^`]+)`", lambda m: met("<code>%s</code>" % m.group(1)), t)
    t = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", lambda m: lien(m.group(2), m.group(1)), t)
    t = re.sub(r"(?<![\w\"=>])(https?://[^\s<>)\]]*[^\s<>)\].,;:!?»])", lambda m: lien(m.group(1), m.group(1)), t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", t)
    for motif, cls in ETIQUETTES:
        t = re.sub(r"\[(%s)\]" % motif, lambda m, c=cls: '<span class="tag %s">%s</span>' % (c, m.group(1)), t)
    return re.sub(r"\x00(\d+)\x00", lambda m: garde[int(m.group(1))], t)


def cellules(l):
    l = l.strip()
    if l.startswith("|"):
        l = l[1:]
    if l.endswith("|"):
        l = l[:-1]
    return [c.strip() for c in l.split("|")]


def est_separateur(l):
    return bool(re.match(r"^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$", l))


def convertit(md):
    lignes = md.replace("\r\n", "\n").split("\n")
    out, sommaire, vus = [], [], set()
    i, n = 0, len(lignes)
    liste = None  # 'ul' ou 'ol'

    def ferme_liste():
        nonlocal liste
        if liste:
            out.append("</%s>" % liste)
            liste = None

    def titre(niv, texte):
        base = slug(texte)
        s, k = base, 2
        while s in vus:
            s, k = "%s-%d" % (base, k), k + 1
        vus.add(s)
        if niv <= 2:
            propre = re.sub(r"\s*\[(DOSSIER|DÉDUIT|TES VENTES|BLOG)[^\]]*\]", "", re.sub(r"[*`]", "", texte))
            sommaire.append((niv, s, propre))
        return '<h%d id="%s">%s</h%d>' % (niv, s, inline(texte), niv)

    while i < n:
        l = lignes[i]
        if l.strip().startswith("```"):
            ferme_liste()
            bloc = []
            i += 1
            while i < n and not lignes[i].strip().startswith("```"):
                bloc.append(lignes[i])
                i += 1
            out.append("<pre><code>%s</code></pre>" % html.escape("\n".join(bloc)))
            i += 1
            continue
        if "|" in l and i + 1 < n and est_separateur(lignes[i + 1]) and l.strip().startswith("|"):
            ferme_liste()
            ent = cellules(l)
            i += 2
            corps = []
            while i < n and lignes[i].strip().startswith("|"):
                corps.append(cellules(lignes[i]))
                i += 1
            t = ['<div class="tbl"><table><thead><tr>%s</tr></thead><tbody>' % "".join("<th>%s</th>" % inline(c) for c in ent)]
            for r in corps:
                t.append("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r))
            t.append("</tbody></table></div>")
            out.append("".join(t))
            continue
        m = re.match(r"^(#{1,4})\s+(.*)$", l)
        if m:
            ferme_liste()
            out.append(titre(len(m.group(1)), m.group(2).strip()))
            i += 1
            continue
        if re.match(r"^\s*(-{3,}|\*{3,})\s*$", l):
            ferme_liste()
            out.append("<hr>")
            i += 1
            continue
        if l.startswith(">"):
            ferme_liste()
            bloc = []
            while i < n and lignes[i].startswith(">"):
                bloc.append(lignes[i].lstrip("> ").rstrip())
                i += 1
            out.append("<blockquote><p>%s</p></blockquote>" % inline(" ".join(bloc)))
            continue
        m = re.match(r"^(\s*)([-*]|\d+[.)])\s+(.*)$", l)
        if m:
            genre = "ol" if m.group(2)[0].isdigit() else "ul"
            if liste != genre:
                ferme_liste()
                out.append("<%s>" % genre)
                liste = genre
            niveau = "sous" if len(m.group(1)) >= 2 else ""
            out.append('<li class="%s">%s</li>' % (niveau, inline(m.group(3))) if niveau else "<li>%s</li>" % inline(m.group(3)))
            i += 1
            continue
        if not l.strip():
            ferme_liste()
            i += 1
            continue
        ferme_liste()
        para = [l.strip()]
        i += 1
        while i < n and lignes[i].strip() and not re.match(r"^(#{1,4}\s|\s*[-*]\s|\s*\d+[.)]\s|>|\||```|\s*-{3,}\s*$)", lignes[i]):
            para.append(lignes[i].strip())
            i += 1
        out.append("<p>%s</p>" % inline(" ".join(para)))
    ferme_liste()
    return "\n".join(out), sommaire


CSS = """
:root{--fond:#F6F5F2;--papier:#FFFFFF;--encre:#1F1D1A;--doux:#625D55;--accent:#2F5D8A;--accent-fond:#E6EEF6;
--vert:#2F6B4F;--vert-fond:#E3F0E9;--ocre:#8A5A12;--ocre-fond:#F6EEDD;--rouge:#9B2C2C;--rouge-fond:#F8E5E5;
--trait:#E1DDD5;--citation:#F0EEE9}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--fond:#14161A;--papier:#1C1F25;--encre:#ECE9E3;--doux:#A39E94;
--accent:#8DB8E3;--accent-fond:#1F2D3D;--vert:#8CC9A8;--vert-fond:#1E3128;--ocre:#E3B868;--ocre-fond:#352A16;
--rouge:#E59A9A;--rouge-fond:#3A2020;--trait:#2D3139;--citation:#23272E;color-scheme:dark}}
:root[data-theme="dark"]{--fond:#14161A;--papier:#1C1F25;--encre:#ECE9E3;--doux:#A39E94;--accent:#8DB8E3;--accent-fond:#1F2D3D;
--vert:#8CC9A8;--vert-fond:#1E3128;--ocre:#E3B868;--ocre-fond:#352A16;--rouge:#E59A9A;--rouge-fond:#3A2020;--trait:#2D3139;
--citation:#23272E;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--fond);color:var(--encre);font-family:Georgia,"Times New Roman",serif;font-size:17px;line-height:1.62;padding-inline:16px}
.cadre{max-width:1180px;margin:0 auto;padding-block:40px 80px;display:grid;grid-template-columns:260px minmax(0,1fr);gap:56px}
header.tete{grid-column:1/-1;border-bottom:1px solid var(--trait);padding-bottom:28px}
.surtitre{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
h1.titre{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:600;font-size:clamp(28px,4.2vw,44px);line-height:1.12;margin:.3em 0 .35em;text-wrap:balance}
.legende{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px;font-size:14px;color:var(--doux);align-items:center}
nav.som{position:sticky;top:20px;align-self:start;max-height:calc(100vh - 40px);overflow:auto;font-family:system-ui,sans-serif;font-size:14px}
nav.som summary{font-weight:600;cursor:pointer;margin-bottom:8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--doux)}
nav.som ul{list-style:none;padding:0;margin:0;display:grid;gap:2px}
nav.som a{color:var(--encre);text-decoration:none;display:block;padding:4px 8px;border-radius:6px}
nav.som a:hover,nav.som a:focus-visible{background:var(--accent-fond);outline:none}
nav.som li.n1 a{font-weight:600;color:var(--accent);margin-top:10px}
article{min-width:0;max-width:74ch}
article h1{font-family:system-ui,sans-serif;font-size:29px;line-height:1.15;margin:2.2em 0 .6em;padding-top:1.1em;border-top:2px solid var(--accent);color:var(--accent);text-wrap:balance}
article h2{font-family:system-ui,sans-serif;font-size:22px;line-height:1.25;margin:2em 0 .6em;text-wrap:balance}
article h3{font-family:system-ui,sans-serif;font-size:18px;margin:1.6em 0 .4em}
article h4{font-family:system-ui,sans-serif;font-size:16px;margin:1.3em 0 .3em}
article a{color:var(--accent);text-underline-offset:2px;word-break:break-word}
article blockquote{margin:1em 0;padding:10px 16px;background:var(--citation);border-radius:10px;font-style:italic}
article blockquote p{margin:.3em 0}
article code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.85em;background:var(--citation);padding:1px 5px;border-radius:4px}
article pre{background:var(--citation);padding:12px 14px;border-radius:10px;overflow-x:auto}
article pre code{background:none;padding:0}
article hr{border:0;border-top:1px solid var(--trait);margin:2.4em 0}
.tbl{overflow-x:auto;margin:1.2em 0;border:1px solid var(--trait);border-radius:10px;background:var(--papier)}
table{border-collapse:collapse;width:100%;font-size:15px}
th,td{padding:8px 12px;border-bottom:1px solid var(--trait);text-align:left;vertical-align:top}
th{font-family:system-ui,sans-serif;font-size:13px;color:var(--doux);background:var(--citation)}
tr:last-child td{border-bottom:0}
.tag{display:inline-block;font-family:ui-monospace,Menlo,monospace;font-style:normal;font-size:11px;font-weight:600;letter-spacing:.05em;padding:2px 7px;border-radius:999px;vertical-align:.15em;margin-left:3px;white-space:nowrap}
.t-dos{background:var(--vert-fond);color:var(--vert)}
.t-ded{background:var(--ocre-fond);color:var(--ocre)}
.t-non{background:var(--rouge-fond);color:var(--rouge)}
.t-aut{background:var(--accent-fond);color:var(--accent)}
@media print{body{background:#fff;color:#000;padding:0}.cadre{display:block;max-width:none;padding:0}nav.som{display:none}.tbl{overflow:visible;border:0}article h1{break-before:page}}
@media (max-width:860px){.cadre{grid-template-columns:1fr;gap:24px;padding-block:24px 60px}
nav.som{position:static;max-height:none;border:1px solid var(--trait);border-radius:10px;padding:12px 14px;background:var(--papier)}body{font-size:16px}}
"""


def rend(md, titre=None, surtitre=""):
    corps, sommaire = convertit(md)
    premier = None
    if sommaire and sommaire[0][0] == 1:
        premier = sommaire.pop(0)[2]
        corps = re.sub(r'<h1 id="[^"]+">.*?</h1>', "", corps, count=1, flags=re.S)
    titre = titre or premier or "Dossier d'avatar"
    nav = "\n".join('<li class="%s"><a href="#%s">%s</a></li>' % ("n1" if niv == 1 else "n2", s, html.escape(t)) for niv, s, t in sommaire)
    legende = ('<span class="tag t-dos">DOSSIER</span> appuyé sur une source avec son lien '
               '<span class="tag t-ded">DÉDUIT</span> raisonné à partir du dossier '
               '<span class="tag t-non">NON MESURÉ</span> impossible à vérifier, et pourquoi')
    return """<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>%s</title><style>%s</style></head><body>
<div class="cadre">
<header class="tete"><div class="surtitre">%s</div><h1 class="titre">%s</h1><div class="legende">%s</div></header>
<nav class="som" aria-label="Sommaire"><details open><summary>Sommaire</summary><ul>
%s
</ul></details></nav>
<article>
%s
</article>
</div></body></html>
""" % (html.escape(titre), CSS, html.escape(surtitre), html.escape(titre), legende, nav, corps)


def principal(argv=None):
    ap = argparse.ArgumentParser(description="Rend le dossier Markdown en page HTML")
    ap.add_argument("source")
    ap.add_argument("sortie", nargs="?")
    ap.add_argument("--titre")
    ap.add_argument("--surtitre", default="")
    a = ap.parse_args(argv)
    try:
        md = Path(a.source).read_text(encoding="utf-8")
    except OSError:
        sys.exit("Fichier introuvable : %s" % a.source)
    sortie = a.sortie or os.path.splitext(a.source)[0] + ".html"
    page = rend(md, a.titre, a.surtitre)
    with open(sortie, "w", encoding="utf-8") as f:
        f.write(page)
    print("%s écrit (%d octets)" % (sortie, len(page.encode("utf-8"))))
    return sortie


if __name__ == "__main__":
    principal()
