# Les outils de montage : mode d'emploi

Quatre scripts autonomes (plus `commun.py`, leur socle partagé) pour fabriquer et contrôler une pub
verticale en ligne de commande. Ils appliquent les règles validées des fichiers de `references/`.
**Aucune clé, aucun compte, aucun service payant** : tout tourne en local, gratuitement.

| Script | Rôle |
|---|---|
| `edit_toolkit.py` | `info` (contrôle du fichier livré), `master`, `punch`, `transition`, `beforeafter`, `endcard`, `assemble` |
| `analyze_ref.py` | étudier le montage d'une pub gagnante : mesures, écarts aux seuils, planche contact |
| `remove_fillers.py` | retirer euh et blancs d'une prise ; resserrer les silences d'une voix générée |
| `captions.py` | sous-titres au réglage validé (Verdana Bold 2,70 %, haut du bloc à 74 %, contour en pixels) |
| `commun.py` | police, sonde ffprobe, enveloppe du son, transcription, planche contact |

## Ce qu'il faut sur la machine

| Besoin | Pour quoi | Installation |
|---|---|---|
| `ffmpeg` et `ffprobe` | tout | macOS : `brew install ffmpeg` ; Debian ou Ubuntu : `sudo apt install ffmpeg` ; Windows : `winget install ffmpeg` |
| Python 3.11 ou plus récent | tout | python.org ou le gestionnaire de paquets |
| `Pillow` et `numpy` | texte des sous-titres, planches, enveloppe du son | `pip install pillow numpy` |
| `openai-whisper` (commande `whisper`) **ou** `faster-whisper` | transcription (mots horodatés) | `pip install openai-whisper` (tire `torch`, environ 2,5 Go) ou `pip install faster-whisper` (plus léger). **Optionnel** : voir « Sans transcription » |

**Le Python qui lance les scripts doit avoir Pillow et numpy.** Un environnement virtuel sans Pillow fait
mourir le rendu des sous-titres : lance `python3 -c "import PIL, numpy"` pour vérifier.

Réglages par variable d'environnement :
- `MONTAGE_POLICE=/chemin/vers/Verdana_Bold.ttf` : la police des sous-titres et de la carte de fin.
  Sans elle, les scripts cherchent Verdana Bold dans les dossiers système, puis ANNONCENT un repli
  (DejaVu Sans Bold, Arial Bold, Liberation Sans Bold). Ils ne retombent jamais en silence sur une police
  par défaut, et refusent les fichiers `.ttc` (Pillow prendrait l'index 0, souvent un Regular).
- `MONTAGE_ENCODEUR=h264_videotoolbox` : l'encodeur matériel de macOS. Par défaut `libx264` (portable,
  `-crf 18`).

## Sans transcription : tout se teste avec des mots déjà horodatés

`remove_fillers.py` et `captions.py` acceptent `--mots mots.json` : une liste de mots horodatés
`[{"m": "Bonjour", "d": 0.10, "f": 0.52}, ...]` en secondes ABSOLUES de la vidéo. Tu peux la produire avec
n'importe quelle transcription. **Aucun modèle n'est lancé** dans ce cas. Sans `--mots`, la vidéo est
transcrite : le modèle se télécharge à la première utilisation, c'est une tâche **lourde** : évite d'en lancer deux en même temps.

## Les gestes

### Contrôler un film livré : `info`

```
python3 edit_toolkit.py info pub.mp4 --fps-attendu 24
```

Affiche, MESURÉS : dimensions, cadence annoncée, images comptées et **cadence par division**
(images / durée du flux), durée du flux contre celle du conteneur, étiquette HDR, sonie (LUFS) et crête
vraie, silences de plus de 0,30 s sur l'enveloppe à -45 dBFS, part active. À lancer sur le fichier
**livré**, jamais sur l'intention.

### Finaliser le son et poser la musique : `master`

```
python3 edit_toolkit.py master pub.mp4 -o pub_master.mp4 --bed musique.mp3 --rapport-db 12
```

Mesure la sonie de la voix et de la musique, règle le gain de la musique pour un rapport voix/musique de
**12 dB** (15 dB est inaudible sur un téléphone), mélange, normalise à `I=-14, TP=-1.5, LRA=11`, pose le
gain et les fondus APRÈS la normalisation, sort en 48 kHz stéréo, image copiée, borné par la durée du flux
vidéo. Annonce la sonie MESURÉE du fichier produit. Options : `--gain-db`, `--fondu-entree`,
`--fondu-sortie`.

### Un punch-in : `punch`

```
python3 edit_toolkit.py punch pub.mp4 -o punch.mp4 --at 6.2 --dur 0.6 --zoom 1.08 --rampe 6
```

Montée sur 6 images, tenue, descente sur 6 images (`zoompan`, `d=1`, le compte d'images est conservé).
Valide : 1,05 à 1,10.

### Raccorder deux clips : `transition`

```
python3 edit_toolkit.py transition a.mp4 b.mp4 -o ab.mp4 --type fondu --images 9
python3 edit_toolkit.py transition a.mp4 b.mp4 -o ab.mp4 --coupe
```

La durée se donne en **IMAGES** (8 à 9 par défaut pour qu'elle se lise ; sous 3 images : coupe franche
automatique). Types : fondu, fondu_noir, flash, whip, zoom, glisse_gauche... ou un nom `xfade` brut.
La transition **chevauche** les deux clips (le film est plus court de sa durée) et **rogne la fin du clip
A** : si A parle encore dans cette zone, l'outil prévient et conseille la coupe franche.

### Avant/après : `beforeafter`, carte de fin : `endcard`, assemblage : `assemble`

```
python3 edit_toolkit.py beforeafter --before avant.mp4 --after apres.mp4 -o ba.mp4 --layout lr
python3 edit_toolkit.py endcard -o fin.mp4 --logo logo.png --cta "Voir l'offre sur le site" --dur 2
python3 edit_toolkit.py endcard -o fin.mp4 --page-produit capture.png --cta "Commander"
python3 edit_toolkit.py assemble hook.mp4 corps.mp4 fin.mp4 -o pub.mp4 --cadrage-y 0.35
```

- `endcard` **exige le vrai logo ou une capture réelle de la page produit** et refuse un texte qui
  contient un gabarit non rempli (`!!!`, `{...}`, `[...]`, `XXX`, `TODO`). Jamais de prix ni d'avis inventé.
- `assemble` colle en **UNE passe** (concat par filtre, un seul encodage audio) : aucune dérive de 21 ms
  par plan. La cadence prend celle du premier clip (`--fps auto`), un clip d'une autre cadence ou d'un
  autre format est SIGNALÉ. `--cadrage-y 0.35` évite de couper les têtes au recadrage.

### Étudier une pub : `analyze_ref.py`

```
python3 analyze_ref.py pub_concurrente.mp4 --out etude --json
```

Passe 1, les chiffres (plan moyen, médian, ouverture, dispersion, silences, coupes dans un silence) et les
écarts aux seuils ; passe 2, `etude/<nom>_planche.jpg` : **regarde-la**. Les chiffres ne voient pas ce
qui manque (la fin demande-t-elle l'achat ?). `--seuil 0.22` détecte plus de coupes (fondus) ;
`--transcrire` ajoute les mots par seconde (modèle de transcription).

### Resserrer une prise : `remove_fillers.py`

```
python3 remove_fillers.py prise.mp4 -o prise_tight.mp4 --model small
python3 remove_fillers.py voix.wav --resserrer -o voix_serree.wav
```

Mode prise : retire euh, hum, ben, du coup, en fait, tu vois, et coupe les blancs de plus de 0,28 s
(`--pause`). `--agressif` retire aussi voilà, genre, quoi, tu sais. Les bornes sont calées sur l'enveloppe
du son, le premier mot est redressé sur l'attaque, le montage se fait en une passe avec des fondus de
10 ms. `--dry-run` montre les plages gardées sans rendre. Mode `--resserrer` (voix générée) : chaque
silence trop long est coupé au milieu et ramené à 0,24 s après un point, 0,18 s après une virgule
(`--apres-point`, `--apres-virgule`).

### Les sous-titres : `captions.py`

```
python3 captions.py pub.mp4 -o pub_cap.mp4 --mots mots.json --planche planche.jpg --rapport rapport.json
python3 captions.py pub.mp4 --mots mots.json --dry-run          # cartes et rapport, sans rendu
python3 captions.py pub.mp4 -o out.mp4 --mots mots.json --fautes fautes.json --souder "iso therme=isotherme"
```

- Mise en page : haut du bloc à `--hauteur 74`, taille `--taille-pct 2.70`, contour automatique
  (`round(4 x taille / 69)`), largeur 85 %, 5 mots, 1,8 s. Jamais de coupe après un mot faible, jamais de
  carte orpheline, virgule de fin retirée, « 50 » soudé à son « % », ponctuation isolée soudée au mot
  d'avant, élisions recollées.
- `--fautes fautes.json` : `{"faux": "juste"}`, appliquée la **plus longue clef d'abord**, rejouée jusqu'au
  point fixe, sur le texte des cartes. `--souder "mot1 mot2=mot"` (répétable) soude deux jetons en un ; une
  paire introuvable **fait échouer la commande** (une correction qui ne s'applique pas ne doit pas se taire).
- Options : `--style A|B|C|E` (boîte de marque, boîte noire, karaoké, sous-titre unique tenu),
  `--retour equilibre` (choisit où la deuxième ligne casse ; **non validé**, mais il évite de terminer une
  ligne sur un article), `--espace-insecable` (espace avant `? ! : ;`), `--from-json cartes.json`.
- Le rapport donne, MESURÉS sur la mise en page : police réellement ouverte, bas du bloc le plus bas en %,
  carte la plus large, lignes orphelines, virgules pendantes, trous de couverture. **La mesure vaut sur la
  mise en page ; la vérité est le fichier livré** : regarde la planche (`--planche`).
- Les corrections de transcription (mots faux mais plausibles) restent à ta charge : relis les jetons un
  par un, remesure avec un modèle plus gros sur la phrase entière (`references/sous-titres.md`).

## Un enchaînement type

1. `analyze_ref.py` sur une pub gagnante ; regarde la planche.
2. Voix : `remove_fillers.py` (prise) ou `--resserrer` (voix générée).
3. Montage : `assemble`, puis `transition` et `punch` aux changements d'idée.
4. `captions.py --dry-run` pour lire les cartes, puis le rendu avec `--planche`.
5. `endcard` (vrai logo), puis `assemble` de la fin.
6. `master` avec la musique au rapport de 12 dB.
7. `info` sur le fichier livré, puis la liste de contrôle de `references/controles-et-verification.md`,
   avec un agent vérificateur qui ÉCOUTE.

## Limites, dites franchement

- Le premier lancement réel d'une transcription télécharge le modèle (voir « Sans transcription » pour
  tout faire avec des mots déjà horodatés).
- Le moteur de montage complet (blueprint, rendu plan par plan, interface) est dans `moteur/` ; ces quatre
  scripts sont les gestes unitaires, utilisables seuls.
- Ces scripts n'effacent pas le texte cuit d'une pub (voir `references/adapter-une-pub-concurrente.md`) et ne
  mesurent pas le pourtour des lettres (méthode décrite dans `references/sous-titres.md`).
- Évite de lancer deux tâches lourdes en même temps : ces commandes n'en lancent pas en parallèle, ne le fais pas non plus à la main.
