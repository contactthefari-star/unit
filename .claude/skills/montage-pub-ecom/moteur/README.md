# Le moteur de montage

Un monteur vidéo que tu pilotes en parlant français, sur ta propre machine. Il est fait pour les pubs verticales (9:16) des boutiques en ligne : tu dis « raccourcis le hook à 1,3 s », « mets un fondu de 0,3 s », « sous-titres en jaune », et le film se refait.

## À quoi ça sert, en clair

Un montage n'est pas une commande ffmpeg qu'on rejoue : c'est un **fichier**, le `blueprint.json`. Il décrit les plans (début, durée), les mots dits à chaque instant, les transitions, les mouvements, l'étalonnage, le style des sous-titres. Le moteur fonctionne en trois temps :

1. **Analyser** : tu donnes une vidéo, le moteur la découpe en plans, mesure le son, transcrit la voix mot à mot (avec Whisper) et écrit le blueprint.
2. **Dire une phrase** : des règles écrites à la main traduisent ta phrase française en changements dans le blueprint. Rien n'est deviné : ce qui n'est pas compris est renvoyé tel quel, et les phrases à l'envers (« n'accélère pas ») sont refusées.
3. **Rendre** : ffmpeg lit le blueprint et fabrique le mp4. Chaque plan est rendu seul puis collé, ce qui permet de voir quel plan a menti quand un film sort faux.

Comme tout passe par le fichier, tu peux annuler, comparer deux versions, et lire exactement ce que l'outil a compris. Une page web locale (sur `127.0.0.1`) affiche le film, la frise des plans et la conversation.

## Ce qu'il te faut

| Quoi | Pour quoi faire | Obligatoire |
|---|---|---|
| **ffmpeg** et **ffprobe** | tout le travail vidéo | oui |
| **Python 3.11 ou plus récent** | faire tourner le moteur | oui |
| **numpy** et **Pillow** (paquets Python) | mesure du son, planche contact, dessin des sous-titres | oui |
| **openai-whisper** | transcrire la voix en mots horodatés (les sous-titres), dicter à la voix | non, mais sans lui pas de sous-titres automatiques. Lourd : il installe `torch`, environ 2,5 Go |
| **demucs** | séparer la voix de la musique (« enlève la musique ») | non, lourd lui aussi |
| **Claude Code** (programme `claude`) | comprendre les phrases que les règles ne connaissent pas, et « regarder » les images | non, et payant : voir plus bas |

Testé sur un seul système. Ailleurs, le moteur garde un repli (encodeur `libx264`, polices système équivalentes), mais ce repli n'a été essayé qu'avec l'encodeur forcé : voir les replis dans `CONFIGURATION.md`.

## Installation pas à pas

Dans un terminal.

1. **Installe ffmpeg** si ce n'est pas fait, puis vérifie :
   - macOS : `brew install ffmpeg`
   - Debian ou Ubuntu : `sudo apt install ffmpeg`
   - puis `ffmpeg -version` et `ffprobe -version` doivent répondre.
2. **Copie le dossier `moteur`** hors du dossier du skill, pour que tes vidéos et tes montages ne soient jamais écrasés par une mise à jour du skill :
   `cp -R ~/.claude/skills/montage-pub-ecom/moteur ~/monteur-pub`
3. **Crée un environnement Python** et installe le socle :
   ```
   cd ~/monteur-pub
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   (Sous Windows : `venv\Scripts\activate` à la place de la deuxième ligne. Non essayé.)
4. **Vérifie** : `python3 --version` (3.11 ou plus) et `python3 -c "import numpy, PIL; print('ok')"`.
5. **Facultatif, lourd** : `pip install openai-whisper` pour les sous-titres et la dictée. Au tout premier usage, Whisper télécharge son modèle (« small », de l'ordre de 0,5 Go) une seule fois. `pip install demucs` pour séparer voix et musique, qui télécharge aussi ses poids une fois.

À chaque nouvelle session de terminal, refais `cd ~/monteur-pub` puis `source venv/bin/activate`.

## Lancer

```
python3 outils/serveur.py
```

Puis ouvre **http://127.0.0.1:8765** dans ton navigateur (Chrome conseillé). Le serveur écoute sur la boucle locale et sur rien d'autre : ta machine n'est pas joignable depuis le réseau. Pour l'arrêter, `Ctrl+C` dans le terminal. Pour un autre port : `python3 outils/serveur.py --port 8800`.

Au démarrage, le serveur écrit une ligne qui dit si les voies Claude Code (payantes) sont actives. Elles sont COUPÉES par défaut : seules les règles gratuites travaillent. Pour les activer (voir « ÉTAPE PAYANTE » plus bas) : `MONTEUR_AVEC_CLAUDE=1 python3 outils/serveur.py`.

## Première utilisation avec un rush de test

Sans rien filmer, tu fabriques un rush de 6 secondes (trois plans, un son de 440 Hz) :

```
mkdir -p rushes
ffmpeg -v error -y -f lavfi -i "testsrc2=s=540x960:r=30:d=2" -f lavfi -i "smptebars=s=540x960:r=30:d=2" -f lavfi -i "testsrc2=s=540x960:r=30:d=2,hue=h=120" -f lavfi -i "sine=frequency=440:sample_rate=48000:duration=6" -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]" -map "[v]" -map 3:a -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -shortest rushes/rush_test.mp4
python3 outils/analyser_winner.py rushes/rush_test.mp4 --sans-transcript
python3 outils/serveur.py
```

La deuxième commande lit le rush, trouve 3 plans et écrit `recettes/projets/rush_test.blueprint.json`. Dans la page, choisis `rush_test` dans la liste en haut. Tu vois les 3 plans sur la frise. Dans le champ de la conversation, essaie dans cet ordre :

1. `raccourcis le plan 2 à 1,2 s` : la réponse dit « le plan 2 passe de 2.00 s a 1.20 s ».
2. `mets un fondu de 0,3 s` : un fondu entre toutes les coupes (visible seulement au rendu).
3. `annule` : le montage revient à l'état d'avant la dernière phrase.
4. Clique **Rendre la vidéo**. Le film sort dans `sorties/rush_test.montage.mp4`.

Contrôle sans ouvrir de lecteur : `ffprobe -v error -show_entries format=duration -of default=nw=1 sorties/rush_test.montage.mp4` doit donner 5,2 s environ si tu as gardé le raccourcissement du plan 2 (6 s moins 0,8 s).

Avec une vraie vidéo et Whisper installé : glisse-la n'importe où sur la page. Le moteur la range dans `rushes/`, la découpe, transcrit la voix (compte environ une minute par minute de vidéo) et les sous-titres apparaissent. Sans Whisper, l'analyse lancée depuis la page s'arrête avec un message qui dit quoi installer.

## De la phrase au film rendu

Une phrase suit toujours le même chemin :

1. **Voie 1, les règles** (`outils/interprete.py`) : gratuites, instantanées, hors ligne. Elles écrivent dans le blueprint, toujours. Chaque réponse dit ce qui a été écrit, avec le chiffre réel.
2. **Voie 2, Claude Code** : seulement pour ce que les règles n'ont pas compris. Claude Code réécrit la phrase dans le vocabulaire des règles ; il n'écrit jamais dans le fichier, ce sont toujours les règles qui écrivent. Payante, facultative.
3. **Voie 3, regarder** : le bouton **regarder** donne à Claude Code une planche contact du montage pour qu'il décrive chaque plan (cadre, sujet, rôle). Payante, facultative, annoncée avant de partir.
4. Ce qui n'a été fait par personne est noté dans `a_faire.jsonl`, jamais jeté.

Chaque écriture dépose une sauvegarde dans `recettes/projets/historique/` : le bouton **Annuler** (ou la phrase « annule ») reprend la dernière.

### Phrases essayées pour ce moteur

Elles ont été passées sur un montage de 8 plans. Accents et majuscules n'ont pas d'importance.

| Tu veux | Tu dis | Le moteur répond (exemple) |
|---|---|---|
| Un hook plus court | `raccourcis le hook à 1,3 s` | le hook passe de 1.40 s à 1.30 s |
| Fixer un plan | `mets le plan 3 à 2 s` | le plan 3 passe de 3.00 s à 2.00 s |
| Enlever un plan | `supprime le plan 3` | plans renumérotés, il en reste 7 |
| Couper un morceau | `coupe de 3 s à 5 s`, `garde de 2 s à 9 s` | 2,00 s retirées, ou il reste 7,00 s |
| Serrer le blanc | `enlève les silences` | les plans sont rognés de leur blanc |
| Accélérer | `coupe plus vite`, `plus lent` | tous les plans x0,85 ou x1,15 |
| Viser une durée | `fais-moi ça en 20 secondes` | rogne les plans sans parole, jamais la parole |
| Sous-titres | `sous-titres plus gros`, `monte les sous-titres`, `sous-titres en jaune`, `majuscules`, `3 mots par sous-titre` | un réglage à la fois, avec sa valeur |
| Fond du texte | `fond noir derrière les sous-titres`, `enlève le fond` | fond noir, blanc, ou aucun |
| Couvrir des sous-titres déjà incrustés dans le rush | `masque les sous-titres` | cherche la bande et la couvre (vérifie sur l'aperçu) |
| Étalonner | `plus de contraste`, `image plus chaude`, `noir et blanc`, `mets une vignette`, `punchy`, `cinéma`, `doux`, `image neutre` | une valeur, qu'on peut viser plan par plan |
| Viser un plan | `le plan 3 est trop sombre`, `plus de contraste sur le plan 3` | s'applique à ce plan seulement |
| Transitions | `mets un fondu de 0,3 s`, `mets un flash entre le plan 3 et le 4`, `fondu au noir à la fin`, `enlève les transitions` | posées sur la coupe visée |
| Laisser le moteur décider | `dynamise le montage`, `mets du mouvement` | mouvements et quelques transitions là où elles servent |
| Mouvement de caméra | `punch sur le plan 5`, `dérive vers la droite sur le plan 3` | zoom avant progressif, ou panoramique lent |
| Son | `coupe le son`, `monte le son`, `baisse le volume de 6 dB`, `fondu audio à la fin` | niveau en dB, fondu de 0,6 s |
| Bruits de coupe | `mets des bruits de coupe`, `un clic sur les coupes` | whoosh, clic ou riser synthétisés (rien à licencier) |
| Séparer voix et musique | `enlève la musique`, `garde la voix` | demande d'abord la séparation (demucs, une fois par rush) |
| Savoir où on en est | `ça dure combien ?`, `combien de plans ?` | état du montage |
| Rendre | `rends la vidéo`, `annule` | lance le rendu, ou revient en arrière |
| Apprendre | `comment faire des transitions ?` | la phrase exacte à redire |

Les transitions, les mouvements, les bruits et les fondus ne se voient et ne s'entendent qu'**après un rendu**, pas dans l'aperçu de la page. Le moteur le dit à chaque fois.

## Sans la page : piloter le moteur en ligne de commande

Tout ce que fait la page est faisable dans un terminal, ce qui permet à Claude Code de conduire le moteur lui-même.

```
python3 outils/analyser_winner.py rushes/mon-rush.mp4            # analyse (ajoute --sans-transcript si pas de Whisper)
python3 outils/controler.py mon-rush                             # les règles de contrôle sur le montage
python3 outils/planche_vision.py mon-rush                        # pages de vignettes numérotées à regarder
python3 outils/rendre.py recettes/projets/mon-rush.blueprint.json --brouillon --fps 30      # rendu rapide
python3 outils/rendre.py recettes/projets/mon-rush.blueprint.json --sortie sorties/mon-rush.montage.mp4 --fps 30
```

Passe toujours `--fps` avec la cadence de ta source (24 ou 30) : le moteur ne lit pas celle qui est écrite dans le blueprint (voir `moteur-blueprint.md`, dans le dossier `references/` du skill `montage-pub-ecom`).

Appliquer une phrase de modification à un projet (même moteur que la page ; la page y ajoute l'historique pour « annuler » et le journal `demandes.jsonl`) :

```
python3 - <<'EOF'
import sys
sys.path.insert(0, "outils")
import format_bp, interprete
chemin = format_bp.DOSSIER_PROJETS / "mon-rush.blueprint.json"
bp = format_bp.charger(chemin)
changements, restant, _ = interprete.comprendre("raccourcis le plan 2 à 1,2 s", bp)
print(changements, "| non compris :", restant)
format_bp.enregistrer(bp, chemin, sauvegarde=True)
EOF
```

`format_bp.charger` lit et met à niveau un blueprint, `format_bp.enregistrer` l'écrit avec son numéro de version, `format_bp.entree(plan)` donne l'endroit où le plan entre dans le rush. C'est le point d'entrée unique : ne lis ni n'écris un blueprint autrement.

### Ce que contient un blueprint

| Champ | Sens |
|---|---|
| `chemin`, `conteneur` | le rush, sa durée, sa cadence, sa taille |
| `plans[i].debut` ou `src_debut`, `duree` | où le plan entre dans le rush, combien de temps il dure |
| `plans[i].mots`, `paroles` | les mots horodatés dits pendant le plan |
| `plans[i].sortie` | la transition qui quitte ce plan : `{"type": "fondu", "duree": 0.3}` |
| `plans[i].mouvement` | `{"type": "punch", "force": 0.06}` (punch, recul, zoom, derive, secousse) |
| `plans[i].image`, `cadrage`, `masque`, `animations` | étalonnage, rognage 9:16, cache de sous-titres incrustés, images-clés |
| `transition`, `image`, `effets`, `son`, `voix`, `masque` | les mêmes réglages pour tout le film (`son` : `muet`, `gain_db`, `fondu_entree`, `fondu_sortie`) |
| `style_sous_titres` | `police`, `taille_pct`, `couleur`, `hauteur_pct`, `largeur_pct`, `contour`, `majuscules`, `mots_max`, `boite` |

Les valeurs par défaut du style (police, taille, hauteur 57 %, contour de 4 px) sont dans `STYLE_DEFAUT` de `outils/rendre.py` ; un réglage mesuré pour des sous-titres plus bas et plus petits est dans `recettes/sous_titres_fr.py`.

## Où sont les choses

```
README.md                 ce fichier
CONFIGURATION.md          installation détaillée, ce qui est propre à macOS, variables d'environnement
AVIS_DE_LICENCE.md, LICENSE, NOTICE-MOTEUR.md    licences
TESTS.md                  ce qui a été essayé, avec les commandes et les résultats réels
requirements.txt          numpy et Pillow (obligatoires), Whisper et demucs (en commentaire)
outils/                   le moteur (Python) : analyser_winner, interprete, rendre, serveur, controler...
interface/                la page (monteur.html) et ses polices avec leurs licences
recettes/                 scripts génériques (sous_titres_fr.py, controler_sous_titres.py, mesurer_le_rendu.py)
recettes/projets/         TES montages : un blueprint.json par projet, son historique, ses planches
rushes/                   TES vidéos sources
sorties/                  les films rendus
```

## Ce qui est écrit dans le projet et ce qui reste chez toi

**Livré avec le moteur** : le code (`outils/`, `interface/`, `recettes/*.py`), les polices et les textes de licence.

**Créé chez toi par l'usage, à ne pas partager** :

| Fichier ou dossier | Ce qu'il contient |
|---|---|
| `rushes/` | tes vidéos sources |
| `recettes/projets/` | tes blueprints, leur historique (`historique/`), les planches contact et les images de plans |
| `sorties/` | les films rendus |
| `demandes.jsonl` | le journal de **toutes les phrases que tu as dites** et de ce qu'elles ont changé |
| `a_faire.jsonl`, `A_AMELIORER.md` | ce que l'outil n'a pas su faire, et son bilan |
| `voix/`, `sons_separes/` | tes voix off enregistrées, les pistes séparées par demucs |
| `tls/` | un certificat, seulement si tu utilises le mode `--telephone` |

Le fichier `.gitignore` livré garde tout cela hors d'un dépôt git. En dehors du dossier, Whisper range ses modèles dans `~/.cache/whisper`.

## Rien ne part sur Internet

Le moteur tourne chez toi. Tes vidéos, tes rendus, tes montages et tes phrases ne partent pas sur Internet, et la page n'appelle aucun site extérieur (même ses polices sont servies par le serveur local). Il y a **trois exceptions**, toutes sous ton contrôle :

1. **Les installations** : `pip install` télécharge des paquets, et Whisper puis demucs téléchargent leurs modèles une seule fois, au premier usage.
2. **Les voies 2 et 3 (Claude Code)**, seulement si tu les as activées avec `MONTEUR_AVEC_CLAUDE=1` : la phrase que les règles n'ont pas comprise, avec un résumé du montage (durée des plans, début des paroles de chaque plan, réglages en cours) pour la voie 2, et en plus des pages de vignettes de tes plans pour la voie 3, partent vers Anthropic par ton propre Claude Code. Aucun fichier vidéo ne part, et aucun chemin de ta machine hors du dossier du moteur. Pour qu'elles ne partent jamais : `MONTEUR_SANS_CLAUDE=1`.
3. **Le mode `--telephone`** ouvre le moteur sur ton wifi, protégé par un code. Ne l'utilise pas si tu n'en as pas besoin.

## ÉTAPE PAYANTE (facultative) : Claude Code, voies 2 et 3

**À quoi ça sert.** Les règles gratuites couvrent le vocabulaire de montage courant. Quand une phrase sort de ce vocabulaire (« donne-moi un rythme plus nerveux sur la fin »), Claude Code la réécrit dans le vocabulaire des règles. Le bouton « regarder » lui fait décrire chaque plan, ce qui permet ensuite des phrases comme « supprime le plan où on voit la boîte ».

**Quelle clé.** Aucune à saisir dans le moteur : il appelle le programme `claude` que tu as déjà, avec ton abonnement Claude ou ta clé API Anthropic (console.anthropic.com). Sans programme `claude`, ces voies répondent « Claude Code n'a pas répondu » et le reste fonctionne.

**Combien.** Ordre de grandeur avec le modèle `sonnet` : environ 0,02 $ par phrase non comprise, et environ 0,2 $ pour que « regarder » décrive une soixantaine de plans (ESTIMATION). Si tu paies à la clé API, mets 10 € de crédit : ça suffit largement pour environ 500 phrases ou une cinquantaine de lectures (ESTIMATION, calculée sur ces ordres de grandeur). Vérifie le prix affiché sur ta page de facturation. Avec un abonnement, il n'y a pas de facture en plus, mais ces appels consomment ton quota.

**Garde-fou.** « regarder » annonce le coût et la durée dans une fenêtre et attend ton « oui ». Une fois les voies activées (`MONTEUR_AVEC_CLAUDE=1`), la voie 2 part toute seule sur chaque phrase non comprise, et la réponse affiche un badge « Claude Code » avec le coût. Par défaut elles sont coupées et rien ne part ; `MONTEUR_SANS_CLAUDE=1` les coupe aussi quoi qu'il arrive.

**Alternative gratuite.** Les règles seules. Si tu travailles déjà dans Claude Code, il peut aussi ouvrir lui-même les images de `planche_vision.py` et te dire quelle phrase utiliser, sans passer par ces voies.

## Ce que le moteur ne sait pas faire

La liste de départ :

- pas de générique animé ;
- pas de rotation d'un élément graphique ;
- pas d'incrustation d'un logo ;
- pas de suppression d'un plan désigné par ce qu'on y voit, sans passer par son numéro (il faut d'abord « regarder », qui est payant) ;
- une phrase à la forme négative est refusée au lieu d'être devinée (« n'accélère pas » ne s'exécute pas).

Limites relevées dans le code et confirmées par les essais :

- ajouter une musique de fond : refusé (« mets une chanson par-dessus ») ; le moteur sait seulement couper le son, séparer voix et musique, et poser des bruits de coupe synthétisés ;
- accélérer ou ralentir la voix seule : refusé, seul le montage entier se serre ;
- deux ordres opposés dans une même phrase : refusés (« plus de contraste et moins de contraste ») ;
- recadrer un rush qui est déjà au format 9:16 : refusé, déplacer le cadrage ne changerait pas un pixel ;
- une durée visée n'est tenue qu'entre 5 secondes et 10 minutes, un plan ne descend pas sous 0,12 s, et un plan ne dépasse jamais ce que son rush contient ;
- les vidéos HDR (HLG, filmées par beaucoup de smartphones) : le moteur prévient mais ne convertit pas, la pub partirait délavée ; filme en SDR ;
- la transcription est réglée sur le français ;
- le rendu sort en 1080x1920 à 30 images par seconde, et le contour des sous-titres est calibré pour cette taille.

## Dépannage

| Message | Que faire |
|---|---|
| `il manque numpy et Pillow` | active ton environnement (`source venv/bin/activate`) puis `pip install -r requirements.txt` |
| `Whisper n'est pas installé` | `pip install openai-whisper`, ou analyse avec `--sans-transcript` (pas de sous-titres) |
| `ffmpeg a echoue` | lis les dernières lignes du message ; vérifie `ffmpeg -version` ; essaie `MONTEUR_ENCODEUR=libx264` |
| `Address already in use` | un autre serveur tourne déjà : arrête-le ou prends `--port 8800` |
| Sous-titres en police toute simple (Linux, Windows) | installe une police grasse standard (DejaVu, Liberation, Arial), voir `CONFIGURATION.md` |
| `Claude Code n'a pas répondu` | normal sans programme `claude` ; les voies Claude Code sont coupées par défaut (active-les avec `MONTEUR_AVEC_CLAUDE=1`) |
| `recul sur le plan 5 à 8 %` change la durée du plan au lieu de poser un recul | le chiffre suivi d'un `%` est lu comme une durée dans cette forme : dis `recul de 8 % sur le plan 5` |
| `enlève les bruits` ne fait rien | dis `enlève les bruits de coupe` ou `sans bruits de coupe` |

## Licence

Le moteur est publié sous la licence **GNU AGPL version 3** (texte dans `LICENSE`). En clair : tu peux l'utiliser, le modifier, le partager ; si tu mets à disposition d'autres personnes, par le réseau, une version modifiée, tu dois publier tes sources. Les composants tiers (ffmpeg, numpy, Pillow, Whisper, demucs, polices) gardent leurs propres licences : voir `NOTICE-MOTEUR.md`.
