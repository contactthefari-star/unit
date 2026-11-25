"""Tests HORS LIGNE des scripts de recherche-avatar. Aucune requête réseau : chaque appel externe est remplacé
par une réponse simulée lue dans scripts/tests/donnees/. Aucune vraie clé : les clés de test sont des mots factices.

Lancer :  python3 scripts/tests/test_hors_ligne.py      (ou : python3 -m unittest scripts/tests/test_hors_ligne.py)
"""
import contextlib
import io
import base64
import json
import os
import struct
import zlib
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
import urllib.error
from unittest import mock

ICI = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.dirname(ICI)
DONNEES = os.path.join(ICI, "donnees")
sys.path.insert(0, SCRIPTS)

import charge_cles  # noqa: E402
import adlib_cartes  # noqa: E402
import cherche_web  # noqa: E402
import cherche_corpus  # noqa: E402
import commentaires_sociaux  # noqa: E402
import compte_verbatims  # noqa: E402
import corpus  # noqa: E402
import decompte_autorite  # noqa: E402
import genere_image  # noqa: E402
import pages  # noqa: E402
import rendre_dossier  # noqa: E402
import verifie_citations  # noqa: E402
import youtube  # noqa: E402

CLE_TEST = "CLE_FACTICE_POUR_TEST"


def charge(nom):
    with open(os.path.join(DONNEES, nom), encoding="utf-8") as f:
        return f.read()


def capte(fonction, *a, **kw):
    sortie = io.StringIO()
    with contextlib.redirect_stdout(sortie):
        res = fonction(*a, **kw)
    return res, sortie.getvalue()


class AvecDossier(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="avatar_test_")
        self.ancien = os.getcwd()
        os.chdir(self.tmp)
        self.env = mock.patch.dict(os.environ, {"BRAVE_API_KEY": CLE_TEST, "YOUTUBE_API_KEY": CLE_TEST,
                                                "SCRAPECREATORS_API_KEY": CLE_TEST, "GEMINI_API_KEY": CLE_TEST,
                                                "PUBS_SKILLS_CLES": ""})
        self.env.start()

    def tearDown(self):
        self.env.stop()
        os.chdir(self.ancien)
        shutil.rmtree(self.tmp, ignore_errors=True)


class TestCles(unittest.TestCase):
    def test_masque_et_absence(self):
        self.assertEqual(charge_cles.masque("erreur avec %s dedans" % CLE_TEST, CLE_TEST), "erreur avec *** dedans")
        with mock.patch.dict(os.environ, {}, clear=True), mock.patch.object(charge_cles, "FICHIER_PAR_DEFAUT", "/nulle/part.env"):
            self.assertIsNone(charge_cles.cle("BRAVE_API_KEY", obligatoire=False))
            with self.assertRaises(SystemExit) as e:
                charge_cles.cle("BRAVE_API_KEY")
            self.assertIn("CLES.md", str(e.exception))
            self.assertNotIn(CLE_TEST, str(e.exception))


class TestRechercheWeb(AvecDossier):
    def test_lot_ecrit_json_et_journal(self):
        rep = json.loads(charge("brave_reponse.json"))
        vu = []

        def faux_http(url, entetes, delai=30):
            vu.append((url, entetes))
            return rep

        res, sortie = capte(cherche_web.principal, ["--pays", "fr", "--langue", "fr", "--etiquette", "t", "avis oreiller forum", "nuque raide"],
                            http=faux_http, pause_reelle=False)
        self.assertEqual(len(vu), 2)
        self.assertIn("country=fr", vu[0][0])
        self.assertIn("search_lang=fr", vu[0][0])
        self.assertNotIn(CLE_TEST, sortie)
        d = json.loads(Path(os.path.join("brut", "web_t.json")).read_text(encoding="utf-8"))
        self.assertEqual(len(d["avis oreiller forum"]), 2)
        self.assertIn("2 requêtes", Path(os.path.join("brut", "_requetes_brave.log")).read_text(encoding="utf-8"))

    def test_garde_fou_de_lot(self):
        with self.assertRaises(SystemExit) as e:
            cherche_web.principal(["--max", "1", "a", "b"], http=lambda *a, **k: {}, pause_reelle=False)
        self.assertIn("--oui", str(e.exception))

    def test_429_puis_succes(self):
        essais = {"n": 0}

        def http(url, entetes, delai=30):
            essais["n"] += 1
            if essais["n"] == 1:
                raise urllib.error.HTTPError(url, 429, "trop", {}, None)
            return json.loads(charge("brave_reponse.json"))

        with mock.patch("time.sleep"):
            res = cherche_web.recherche("q", CLE_TEST, http=http)
        self.assertEqual(len(res), 2)

        def http_casse(url, entetes, delai=30):
            raise RuntimeError("échec avec %s dans le message" % CLE_TEST)

        with mock.patch("time.sleep"):
            res, sortie = capte(cherche_web.recherche, "q", CLE_TEST, http=http_casse)
        self.assertEqual(res, [])
        self.assertNotIn(CLE_TEST, sortie)
        self.assertIn("***", sortie)


class TestPages(AvecDossier):
    def test_extraction_mur_signalement(self):
        self.assertNotIn("ne pas lire", pages.texte(charge("page_forum.html")))
        tp = pages.trustpilot(charge("page_trustpilot.html"))
        self.assertIn("Boutique Test", tp)
        self.assertIn("5 étoiles 2025-04-01 FR", tp)
        r = pages.reddit_rss("https://www.reddit.com/r/test/comments/abc/titre/", get=lambda u: charge("reddit.rss"))
        self.assertIn("[2025-05-02]", r)
        self.assertIn("oreiller etait trop haut", r)
        self.assertIsNotNone(pages.detecte_mur(charge("page_mur.html")))
        self.assertIsNone(pages.detecte_mur("mot " * 200))
        self.assertIsNone(pages.detecte_mur("Page courte mais vraie."))  # courte n'est pas un mur
        self.assertTrue(pages.est_courte("Page courte mais vraie."))
        rem = pages.signale(charge("texte_invisible.txt"))
        self.assertTrue(all(len(c) == 1 and c.isascii() is False for c in pages.INVISIBLES))
        self.assertTrue(any("invisible" in x for x in rem))
        self.assertTrue(any("consigne" in x for x in rem))
        self.assertEqual(pages.signale("Un avis tout à fait normal sur un oreiller."), [])

    def test_schema_refuse(self):
        with self.assertRaises(ValueError):
            pages.http_get("file:///etc/hosts")

    def test_principal_ecrit_fichiers(self):
        with open("urls.txt", "w", encoding="utf-8") as f:
            f.write("# commentaire\nhttps://forum-exemple.test/fil/1\nhttps://mur-exemple.test/x\nhttps://www.reddit.com/r/test/comments/abc/t/\n")

        def get(url, *a, **k):
            if "mur-exemple" in url:
                return charge("page_mur.html")
            if "reddit.com" in url:
                return charge("reddit.rss")
            return charge("page_forum.html")

        bilan, sortie = capte(pages.principal, ["urls.txt", "--sortie", "brut/pages"], get=get, pause_reelle=False)
        self.assertEqual(bilan["ok"], 2)
        self.assertEqual(bilan["mur"], 1)
        self.assertEqual(bilan["courtes"], 2)  # les deux pages de test sont courtes : signalées, pas rejetées
        self.assertGreaterEqual(bilan["signale"], 1)  # la consigne cachée dans le flux Reddit
        txt = [f for f in os.listdir("brut/pages") if f.endswith(".txt")]
        self.assertEqual(len(txt), 3)
        premiere = Path(os.path.join("brut/pages", txt[0])).read_text(encoding="utf-8").split("\n")[0]
        self.assertTrue(premiere.startswith("http"))


def faux_http_youtube(url):
    for nom, fichier in [("/search?", "yt_search.json"), ("/commentThreads?", "yt_comm_reponse.json"),
                         ("/channels?", "yt_chaine.json"), ("/playlistItems?", "yt_playlist.json")]:
        if nom in url:
            return json.loads(charge(fichier))
    if "/videos?" in url:
        return json.loads(charge("yt_video_chaine.json" if "part=snippet&id=" in url else "yt_videos_reponse.json"))
    raise AssertionError("appel inattendu " + url)


class TestYoutube(AvecDossier):
    faux_http = staticmethod(faux_http_youtube)

    def test_cherche_comm_mediane(self):
        c = youtube.Client(CLE_TEST, self.faux_http)
        liste, sortie = capte(youtube.cherche, c, ["oreiller nuque"], "FR", "fr", "brut")
        self.assertEqual(len(liste), 2)
        self.assertEqual(liste[0]["vues"], 120000)
        self.assertEqual(liste[1]["duree_s"], 45)
        self.assertEqual(c.unites, 201)  # 2 recherches x 100 + 1 lot de fiches x 1
        capte(youtube.comm, c, 1, ["VID00000001"], "brut")
        d = json.loads(Path("brut/yt_comm_VID00000001.json").read_text(encoding="utf-8"))
        self.assertEqual(len(d["commentaires"]), 2)
        self.assertEqual(d["commentaires"][0]["rep"][0]["texte"], "Merci pour la réponse !")
        m, _ = capte(youtube.mediane, c, "VID00000001", "brut")
        self.assertEqual(m["n_courts"], 1)
        self.assertEqual(m["mediane_longs"], 120000)

    def test_garde_fou_et_quota(self):
        with self.assertRaises(SystemExit) as e:
            youtube.principal(["cherche", "|".join("r%d" % i for i in range(12))], http=self.faux_http)
        self.assertIn("--oui", str(e.exception))

        def http_quota(url):
            raise urllib.error.HTTPError(url, 403, "x", {}, io.BytesIO(("quotaExceeded " + CLE_TEST).encode()))

        c = youtube.Client(CLE_TEST, http_quota)
        r, sortie = capte(c.appel, "search", part="snippet")
        self.assertEqual(r, {})
        self.assertIn("quota", sortie)
        self.assertNotIn(CLE_TEST, sortie)


class TestServiceAcredits(AvecDossier):
    def faux_http_factory(self, appels):
        def http(url, entetes, delai=90):
            appels.append(url)
            if "credit-balance" in url:
                return json.loads(charge("sc_solde.json"))
            return json.loads(charge("sc_tiktok.json"))
        return http

    def test_sans_oui_rien_ne_part(self):
        appels = []
        code, sortie = capte(commentaires_sociaux.principal,
                             ["comm-tiktok", "https://www.tiktok.com/@x/video/7000000000000000001", "--pages", "2"],
                             http=self.faux_http_factory(appels))
        self.assertEqual(code, 2)
        self.assertEqual(appels, [])
        self.assertIn("ÉTAPE PAYANTE", sortie)
        self.assertIn("--oui", sortie)

    def test_oui_solde_plafond(self):
        appels = []
        code, sortie = capte(commentaires_sociaux.principal,
                             ["comm-tiktok", "https://www.tiktok.com/@x/video/7000000000000000001", "--pages", "2", "--plafond", "5", "--oui"],
                             http=self.faux_http_factory(appels))
        self.assertEqual(code, 0)
        self.assertIn("Solde avant", sortie)
        self.assertIn("Solde après", sortie)
        self.assertNotIn(CLE_TEST, sortie)
        j = Path(os.path.join("brut", "_credits.log")).read_text(encoding="utf-8")
        self.assertIn("/v1/tiktok/video/comments", j)
        d = json.loads(Path(os.path.join("brut", "sc_tt_comm_7000000000000000001.json")).read_text(encoding="utf-8"))
        self.assertEqual(len(d["comments"]), 2)
        # plafond atteint : plus aucune requête
        s = commentaires_sociaux.Service(CLE_TEST, "brut", plafond=1, http=self.faux_http_factory([]))
        self.assertIsNotNone(s.appel("/v1/tiktok/video/comments", url="u", cursor=0))
        r, sortie = capte(s.appel, "/v1/tiktok/video/comments", url="u", cursor=0)
        self.assertIsNone(r)
        self.assertIn("PLAFOND ATTEINT", sortie)

    def test_cle_masquee_erreurs(self):
        def http(url, entetes, delai=90):
            raise RuntimeError("panne %s" % CLE_TEST)
        s = commentaires_sociaux.Service(CLE_TEST, "brut", http=http)
        r, sortie = capte(s.appel, "/v1/credit-balance")
        self.assertIsNone(r)
        self.assertNotIn(CLE_TEST, sortie)


class TestCorpusEtComptes(AvecDossier):
    def prepare(self):
        os.makedirs("brut/pages")
        Path("brut/web_t.json").write_text(json.dumps({"avis oreiller": json.loads(charge("brave_reponse.json"))["web"]["results"]}, ensure_ascii=False), encoding="utf-8")
        with open("brut/pages/forum.txt", "w", encoding="utf-8") as f:
            f.write("https://forum-exemple.test/fil/1\n\n" + pages.texte(charge("page_forum.html")))
        with open("brut/pages/vendeur.txt", "w", encoding="utf-8") as f:
            f.write("https://site-du-concurrent.test/avis\n\nJ'adore ce produit, je dors comme un bébé depuis que je l'utilise, merci.")
        c = youtube.Client(CLE_TEST, faux_http_youtube)
        capte(youtube.comm, c, 1, ["VID00000001"], "brut")
        s = commentaires_sociaux.Service(CLE_TEST, "brut", http=lambda u, e, d=90: json.loads(charge("sc_tiktok.json")))
        capte(commentaires_sociaux.comm_tiktok, s, "https://www.tiktok.com/@x/video/7000000000000000001", 1)
        # un second message de la MÊME autrice sur YouTube, et deux messages sur TikTok de pseudos différents
        return corpus.construit("brut", vendeurs=["site-du-concurrent.test"], marche="fr")

    def test_corpus_types_vendeur(self):
        lignes = self.prepare()
        types = {l[1] for l in lignes}
        self.assertTrue({"youtube", "tiktok", "forum", "blog", "vendeur"} <= types)
        textes = [l[4] for l in lignes]
        self.assertEqual(len(textes), len(set((l[3], l[4]) for l in lignes)))
        self.assertTrue(any(t.startswith("↳ ") for t in textes))
        with open("corpus.tsv", "w", encoding="utf-8") as f:
            corpus.ecrit(lignes, f)
        _, _ = capte(corpus.principal, ["--brut", "brut", "--sources", "sources.json"], flux=io.StringIO())
        src = json.loads(Path("sources.json").read_text(encoding="utf-8"))
        self.assertTrue(any(e["url"] == "https://forum-exemple.test/fil/1" and e["type"] == "forum" for e in src))
        res = cherche_corpus.cherche("corpus.tsv", "nuque", sans_reponses=True)
        self.assertGreaterEqual(len(res), 3)
        self.assertEqual(res[0][0], max(r[0] for r in res))  # trié par likes

    def test_classes_et_exclusions(self):
        self.assertEqual(compte_verbatims.classe(5, 3), "FRÉQUENT")
        self.assertEqual(compte_verbatims.classe(4, 4), "MOYEN")
        self.assertEqual(compte_verbatims.classe(30, 2), "MOYEN")  # beaucoup, mais sur 2 types seulement
        self.assertEqual(compte_verbatims.classe(2, 2), "RARE")
        self.assertEqual(compte_verbatims.classe(0, 0), "ABSENT")
        self.assertEqual(compte_verbatims.classe(5, 3), "FRÉQUENT")
        self.assertEqual(compte_verbatims.classe(100, 1), "MOYEN")

    def test_comptage_auteur(self):
        def L(typ, auteur, texte, marche="fr", url=None):
            return "0\t%s\t2025-01-01\t%s\t%s\t%s\t%s\n" % (typ, url or "https://x.test/%s/%s" % (typ, abs(hash(texte + auteur)) % 1000), texte, auteur, marche)

        lignes = []
        # "ne dors plus" : 3 types, mais 1 autrice répète 4 fois sur le forum
        for i in range(4):
            lignes.append(L("forum", "Anne", "je ne dors plus, c'est %d fois pareil, mal à la nuque" % i))
        lignes.append(L("youtube", "Berthe", "je ne dors plus du tout, la nuque me fait mal"))
        lignes.append(L("tiktok", "Carole", "Je ne dors plus depuis un mois, nuque douloureuse"))
        lignes.append(L("avis", "Dora", "ne dors plus bien, nuque, mal"))
        lignes.append(L("vendeur", "Eva", "ne dors plus, nuque, mal"))          # exclu : site vendeur
        lignes.append(L("forum", "Fred", "ne dors plus, nuque", marche="us"))    # exclu : autre marché
        lignes.append(L("youtube", "Gina", "↳ ne dors plus (réponse du créateur)"))  # exclu : réponse
        lignes.append(L("blog", "Hugo", "j'adore le jardin, rien à voir"))
        Path("c.tsv").write_text("".join(lignes), encoding="utf-8")
        rows = compte_verbatims.lit_corpus("c.tsv", marche="fr")
        res = compte_verbatims.compte(rows, [("ne dors plus", r"ne dors plus"), ("jardin", r"jardin"), ("absent", r"zzz")],
                                      sujet="nuque", probleme="mal|douleur")
        d = {r["expression"]: r for r in res}
        self.assertEqual(d["ne dors plus"]["total"], 4)       # Anne 1 + Berthe + Carole + Dora
        self.assertEqual(d["ne dors plus"]["types"], 4)
        self.assertEqual(d["ne dors plus"]["classe"], "MOYEN")  # 4 occurrences seulement
        self.assertEqual(d["jardin"]["classe"], "RARE")
        self.assertEqual(d["absent"]["classe"], "ABSENT")
        # sans la règle d'auteur : l'unité est le message, Anne compte 4 fois
        res2 = compte_verbatims.compte(rows, [("ne dors plus", r"ne dors plus")], par_message=True)
        self.assertEqual(res2[0]["total"], 7)
        self.assertEqual(res2[0]["classe"], "FRÉQUENT")
        # le tri met FRÉQUENT en tête et la sortie contient les exemples avec URL
        flux = io.StringIO()
        compte_verbatims.principal(["c.tsv", "--exp", "ne dors plus", "--exp", "jardin", "--marche", "fr", "--sujet", "nuque",
                                    "--probleme", "mal", "--exemples", "1", "--md", "lexique.md"], flux=flux)
        sortie = flux.getvalue()
        self.assertIn("Classe (cible)", sortie)
        self.assertIn("https://x.test/", sortie)
        self.assertTrue(os.path.exists("lexique.md"))


class TestAutorite(AvecDossier):
    def test_regles_preuve_controles(self):
        concepts = decompte_autorite.lit(os.path.join(DONNEES, "concepts_test.csv"))
        for c in concepts:
            c["preuve"] = decompte_autorite.preuve(c)
        p = {c["code"]: c["preuve"] for c in concepts}
        self.assertEqual(p["C1"], "PROUVE_fort")      # 120 j, 7 variantes
        self.assertEqual(p["C2"], "PROUVE_fort")      # 100 j, 3 variantes
        self.assertEqual(p["C3"], "PROUVE_faible")    # 95 j, 1 variante mais même texte sur 2 cartes
        self.assertEqual(p["C5"], "PROUVE_UE")        # portée 1 200 000
        self.assertTrue(p["C6"].startswith("non"))    # UE, portée sous le seuil : la durée ne suffit pas
        self.assertEqual(p["C7"], "non")              # 40 jours
        t = decompte_autorite.table(concepts)
        self.assertEqual(t["pair"]["prouves"], 4)
        self.assertEqual(decompte_autorite.classement(t)[0], "pair")
        res, sortie = capte(decompte_autorite.principal, [os.path.join(DONNEES, "concepts_test.csv"), "--json", "d.json"])
        self.assertIn("Contrôle 1", sortie)
        self.assertIn("Contrôle 2", sortie)
        self.assertIn("ATTENTION", sortie)  # signale le classement fait au texte seul
        self.assertIn("ENJEU", sortie)
        self.assertTrue(os.path.exists("d.json"))
        _, modele = capte(decompte_autorite.principal, ["--modele"])
        self.assertIn("EXEMPLE FICTIF", modele)

    def test_seuils_modifiables(self):
        c = {"portee_ue_uk": 500000, "marche": "UE", "jours": 10, "variantes": 1, "cartes_meme_texte": 1}
        self.assertTrue(decompte_autorite.preuve(c, seuil_ue=400000).startswith("PROUVE"))
        self.assertFalse(decompte_autorite.preuve(c).startswith("PROUVE"))


def png_minimal(l=8, h=14):
    def bloc(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    ligne = b"\x00" + b"\x80\x80\x80" * l
    return (b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", l, h, 8, 2, 0, 0, 0))
            + bloc(b"IDAT", zlib.compress(ligne * h)) + bloc(b"IEND", b""))


def jpeg_minimal(l=640, h=480):
    sof = b"\xff\xc0" + struct.pack(">HBHHB", 11, 8, h, l, 1) + b"\x01\x11\x00"
    return b"\xff\xd8" + sof + b"\xff\xd9"


class TestImages(AvecDossier):
    def test_dimensions_et_integrite(self):
        p = png_minimal(8, 14)
        self.assertEqual(genere_image.dimensions(p), ("png", 8, 14))
        self.assertTrue(genere_image.complet(p))
        self.assertFalse(genere_image.complet(p[:-20]))
        j = jpeg_minimal(640, 480)
        self.assertEqual(genere_image.dimensions(j), ("jpeg", 640, 480))
        self.assertTrue(genere_image.complet(j))
        self.assertFalse(genere_image.complet(j[:-2]))

    def test_sans_oui_mauvaise_ref(self):
        Path("prompt.txt").write_text("a prompt", encoding="utf-8")
        Path("ref.jpg").write_bytes(jpeg_minimal(480, 640))
        appels = []
        code, sortie = capte(genere_image.principal, ["prompt.txt", "--ref", "ref.jpg", "--n", "4"], http=lambda *a, **k: appels.append(a))
        self.assertEqual(code, 2)
        self.assertEqual(appels, [])
        self.assertIn("ÉTAPE PAYANTE", sortie)
        self.assertIn("0.54 $", sortie)  # 4 x 0,134
        self.assertIn("Référence 1 : ref.jpg, jpeg, 480x640", sortie)
        with self.assertRaises(SystemExit) as e, contextlib.redirect_stdout(io.StringIO()):
            genere_image.principal(["prompt.txt", "--ref", "ref.jpg", "--ref-attendue", "640x480"], http=lambda *a, **k: {})
        self.assertIn("mauvaise image jointe", str(e.exception))
        with self.assertRaises(SystemExit):
            genere_image.principal(["prompt.txt", "--n", "20"], http=lambda *a, **k: {})

    def test_generation_simulee(self):
        Path("prompt.txt").write_text("a prompt", encoding="utf-8")
        Path("ref.jpg").write_bytes(jpeg_minimal(640, 480))
        envoyes = []

        def faux(url, entetes, corps, delai=180):
            envoyes.append((url, entetes, corps))
            png = png_minimal()
            if len(envoyes) == 2:
                png = png[:-20]  # un fichier tronqué
            return {"candidates": [{"content": {"parts": [{"text": "ok"}, {"inlineData": {"mimeType": "image/png",
                                                                                           "data": base64.b64encode(png).decode()}}]}}]}

        code, sortie = capte(genere_image.principal, ["prompt.txt", "--ref", "ref.jpg", "--n", "2", "--oui", "--sortie", "g"], http=faux)
        self.assertEqual(code, 0)
        self.assertEqual(len(envoyes), 2)
        premiere = envoyes[0][2]["contents"][0]["parts"]
        self.assertIn("inline_data", premiere[0])  # la référence part AVANT le texte
        self.assertEqual(premiere[-1], {"text": "a prompt"})
        self.assertEqual(envoyes[0][2]["generationConfig"]["imageConfig"]["aspectRatio"], "9:16")
        self.assertNotIn(CLE_TEST, sortie)
        self.assertIn("TRONQUÉ", sortie)
        self.assertIn("1 image(s) complète(s) sur 2", sortie)
        self.assertEqual(len(os.listdir("g")), 3)  # 2 images + le journal

        def casse(url, entetes, corps, delai=180):
            raise RuntimeError("panne %s" % CLE_TEST)
        _, sortie = capte(genere_image.principal, ["prompt.txt", "--oui", "--sortie", "g2"], http=casse)
        self.assertNotIn(CLE_TEST, sortie)


class TestAdlib(AvecDossier):
    def test_dates_fusion_domaines_pubs(self):
        L = adlib_cartes.lit_date
        import datetime as dt
        self.assertEqual(L("2026-05-01"), dt.date(2026, 5, 1))
        self.assertEqual(L("Jun 10, 2026"), dt.date(2026, 6, 10))
        self.assertEqual(L("1 septembre 2026"), dt.date(2026, 9, 1))
        self.assertEqual(L("03/04/2026"), dt.date(2026, 4, 3))
        self.assertIsNone(L("bientot"))
        res = json.loads(charge("adlib_resultat.json"))
        cartes = {}
        self.assertEqual(adlib_cartes.fusionne(cartes, res, "us_test"), 4)
        self.assertEqual(adlib_cartes.fusionne(cartes, res, "us_test"), 4)  # idempotent : pas de doublons
        self.assertEqual(len(cartes), 4)
        auj = dt.date(2026, 10, 5)
        self.assertEqual(adlib_cartes.jours(cartes["9000000000001"], auj), 157)
        self.assertEqual(adlib_cartes.jours(cartes["9000000000003"], auj), 9)   # coupée : fin - début
        self.assertIsNone(adlib_cartes.jours(cartes["9000000000004"], auj))      # date illisible : NON MESURÉ
        self.assertEqual(adlib_cartes.statut(cartes["9000000000003"]), "inactive")
        self.assertEqual(adlib_cartes.statut(cartes["9000000000002"]), "inconnu")
        self.assertEqual(adlib_cartes.domaine(cartes["9000000000001"]), "marque-exemple.test")
        self.assertEqual(adlib_cartes.domaine(cartes["9000000000002"]), "marque-exemple.test")  # déduit de l'URL
        lignes = adlib_cartes.par_domaine(cartes, auj)
        self.assertEqual(lignes[0]["domaine"], "marque-exemple.test")
        self.assertEqual(lignes[0]["survie_30j"], 1)
        self.assertEqual(lignes[0]["cartes"], 2)
        pubs = adlib_cartes.pubs_du_domaine(cartes, "marque-exemple.test", auj)
        self.assertEqual(pubs[0]["id"], "9000000000001")
        self.assertEqual(pubs[0]["verdict"], "prouvée par la durée (forme forte)")  # 157 j, 5 variantes
        self.assertEqual(pubs[0]["cartes_meme_texte"], 2)
        self.assertEqual(adlib_cartes.verdict_duree(100, 1, 2), "prouvée par la durée (forme faible)")
        self.assertEqual(adlib_cartes.verdict_duree(60, 9, 9), "non prouvée")

    def test_commandes(self):
        Path("res.json").write_text(charge("adlib_resultat.json"), encoding="utf-8")
        n, sortie = capte(adlib_cartes.principal, ["ajoute", "res.json", "--etiquette", "t", "--cartes", "c.json"])
        self.assertEqual(n, 4)
        self.assertIn("~1 200 results", sortie)
        t, sortie = capte(adlib_cartes.principal, ["domaines", "--cartes", "c.json", "--aujourdhui", "2026-10-05"])
        self.assertIn("ÉCHANTILLON de 4 cartes", sortie)
        self.assertIn("| autre-marque.test | 2 | 1 | 1 | 0 | 0 | 9 | 1 | 2 | Page Quatre, Page Trois |", sortie)
        self.assertIn("| marque-exemple.test | 2 | 1 | 0 | 1 | 1 | 157 | 5 | 1 | Page Deux, Page Un |", sortie)
        l, sortie = capte(adlib_cartes.principal, ["concepts", "--cartes", "c.json", "--domaine", "marque-exemple.test",
                                                    "--csv", "concepts.csv", "--aujourdhui", "2026-10-05"])
        self.assertEqual(len(l), 1)  # deux cartes, un seul texte distinct = un concept
        lignes = decompte_autorite.lit("concepts.csv")
        self.assertEqual(lignes[0]["domaine"], "marque-exemple.test")
        self.assertEqual(lignes[0]["cartes_meme_texte"], 2)


class TestRenduEtCitations(AvecDossier):
    MD = """# Titre du dossier

## 0. Ce que disent déjà les acheteurs [DOSSIER]

Une phrase avec **gras**, un [lien](https://exemple.test/a) et une adresse https://exemple.test/b.

| Expression | Total | Classe |
|---|---|---|
| « je ne dors plus » | 12 | **FRÉQUENT** |

- point un [DÉDUIT]
- point deux [NON MESURÉ]
- point trois [TES VENTES]
- point quatre [BLOG]

> « Je me réveille chaque nuit avec la nuque raide » · https://forum-exemple.test/fil/1
"""

    def test_rendu_html(self):
        h = rendre_dossier.rend(self.MD, surtitre="Dossier de test")
        self.assertIn("<title>Titre du dossier</title>", h)
        self.assertIn('class="tag t-dos"', h)
        self.assertIn('class="tag t-ded"', h)
        self.assertIn('<span class="tag t-dos">TES VENTES</span>', h)
        self.assertIn('<span class="tag t-aut">BLOG</span>', h)
        self.assertIn("<table>", h)
        self.assertIn('href="#0-ce-que-disent-d', h)
        self.assertNotIn("<script", h)
        self.assertNotIn("http://fonts", h)
        h2 = rendre_dossier.rend("# T\n\n<script>alert(1)</script> texte")
        self.assertNotIn("<script>alert", h2)
        Path("d.md").write_text(self.MD, encoding="utf-8")
        _, sortie = capte(rendre_dossier.principal, ["d.md"])
        self.assertTrue(os.path.exists("d.html"))

    def test_verification_des_citations(self):
        os.makedirs("brut/pages")
        with open("brut/pages/f.txt", "w", encoding="utf-8") as f:
            f.write("https://forum-exemple.test/fil/1\n\nBonjour, je me réveille chaque nuit avec la nuque raide et je ne sais plus quoi essayer.")
        md = ("- « Je me réveille chaque nuit avec la nuque raide » · https://forum-exemple.test/fil/1\n"
              "- « Je me réveille […] et je ne sais plus quoi essayer » · https://forum-exemple.test/fil/1\n"
              "- « Une citation inventée qui n'existe dans aucune source lue » · \n")
        Path("d.md").write_text(md, encoding="utf-8")
        total, manq, sans = verifie_citations.verifie(md, verifie_citations.charge_sources(pages="brut/pages"), exige_url=True)
        self.assertEqual(total, 3)
        self.assertEqual(len(manq), 1)
        self.assertEqual(len(sans), 1)
        code, sortie = capte(verifie_citations.principal, ["d.md", "--pages", "brut/pages"])
        self.assertEqual(code, 1)
        self.assertIn("NON RETROUVÉE", sortie)


if __name__ == "__main__":
    unittest.main(verbosity=2)
