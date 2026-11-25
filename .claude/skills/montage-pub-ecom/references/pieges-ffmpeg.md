# Pièges ffmpeg et rendu : tous vérifiés

Chaque piège a été rencontré en vrai, avec sa mesure. Ils partagent une signature : **rien ne
rougit**. Le fichier sort, le contrôle dit « écart nul », et le film est faux. La parade est presque
toujours la même : compter en images et en échantillons, mesurer le fichier livré, pas l'intention.

Principe de rendu : **chaque plan est rendu SEUL** (coupe, cadrage, sous-titre), puis on colle. Cela
coûte plus de disque qu'un seul graphe de filtres, mais chaque plan est vérifiable isolément : quand
un montage sort faux, on sait quel plan a menti.

## 1. Durées et nombre d'images

| Piège | Symptôme et mesure | Parade |
|---|---|---|
| **`floor(t x fps)`** : ffmpeg garde les images dont l'horodate est STRICTEMENT inférieure à `-t` | `-t 1.0333` à 30 i/s donne 30 images, pas 31 (`1.0333 x 30 = 30,999`). Perte d'une image par plan : presque une seconde sur une trentaine de plans, sans message | viser le milieu de l'image suivante : `n = max(1, round(durée x fps))`, `durée_demandée = (n + 0.5) / fps`. Écart mesuré sur un petit lot de plans : 0,13 s avant, 0,01 s après |
| **La durée du conteneur n'est pas celle de l'image** | `format=duration` dit 6,40 s, le flux vidéo s'arrête à 6,30 s (189 images) : l'audio dure plus longtemps. Un analyseur donne au dernier plan des images qui n'existent pas, le rendu sort plus court et on accuse le rendu. Autre cas : 4,010 s contre 4,000 s, dix millisecondes qui suffisent à tronquer un plan | lire `stream=duration` du flux **vidéo** (`ffprobe -select_streams v`), jamais `format=duration` |
| **Un segment qui ne dure pas un nombre ENTIER d'images** | un plan de 1,114 s à 30 i/s porte 33 images (1,100 s) mais sortait long de 1,114 s : le collage sans réencodage empile ces 14 ms par plan, ffmpeg DÉDUIT une cadence. Le fichier annonçait **9,088 s pour 9,000 s et 60 i/s pour 30**, avec 270 images exactes et un contrôle qui disait « écart +0 image » | couper sur `n_images / fps`, jamais sur la durée demandée ; borner en `-frames:v` dans toutes les branches, avec et sans son ; caler le master avec un `-t` sur la même valeur. (`-fps_mode cfr` essayé : aucun effet, ligne retirée) |
| **Compter par la durée annoncée** | un film de 1 200 images à 30 i/s (= 40,00 s) peut être annoncé 40,16 s : une dérive de 0,16 s qui n'existe pas | compter les images (`-count_frames`) |
| **Un `-t` en secondes sur un flux copié** est une borne floue | elle rend le total juste tout en laissant la dérive s'installer à l'intérieur ; elle CACHAIT le défaut | mesurer la position de chaque coupe, pas seulement la longueur du film |

## 2. Fondus, transitions, collage

- **`xfade` ne consomme rien** : sa sortie vaut `offset + longueur de la seconde entrée`. Ni la durée
  de la transition ni l'offset ne changent le compte d'images comme on l'attend (quatre transitions peuvent
  faire sortir UNE image de trop). **Borne la sortie avec `-frames:v` au compte
  exact** (`sum(round(durée x fps))`).
- **`offset` = somme des durées UTILES précédentes** : le fondu k démarre là, il mord donc uniquement
  sur le rab, jamais sur la matière du film. La sortie fait exactement `somme(durées)`.
- **Fondu sans perte de longueur** : rends chaque segment avec un **rab** (les images suivantes dans la
  source, comme un monteur tire sur ses amorces) égal à la durée de la transition qui le quitte.
  Sans rab, il faudrait la prendre sur la durée utile et le film raccourcirait de `(n-1) x durée`.
- **Soude d'abord les coupes franches** par un `concat` sans réencodage, et n'utilise `xfade` qu'entre
  ces groupes : une coupe franche doit rester franche à l'image près.
- **`concat -c copy` rend une cadence DÉDUITE, pas copiée** : un groupe de plans courts ressortait
  annoncé à 60 i/s alors qu'il était à 30, et `xfade` refuse deux entrées de cadences différentes : le
  film entier ne sortait pas. **Renormalise chaque entrée** par `fps=<n>,setsar=1` avant le `xfade`
  (le filtre lit les vraies horodates et ne touche à rien quand la cadence est déjà juste).
- **Un fondu entre deux morceaux contigus de la même prise est invisible** (même matière avec elle-
  même) : teste sur des plans discontinus.
- **Quantifie la durée d'une transition en images**, sinon `round(u + d)` et `round(u) + round(d)`
  diffèrent d'une image. Plancher de 3 images : en dessous, coupe franche.
- **Un plan qui finit sur la dernière image de sa source** ne peut pas porter de transition (le film
  sort beaucoup plus court que prévu, avec très peu d'images au lieu de l'attendu). Voir `transitions-effets-formats.md`.
- **Le son ne se fond pas** : recolle-le à la durée juste, séparément, sinon il dérive du fondu à chaque
  coupe.

## 3. Le son

(Chiffres et raisons dans `audio-voix-musique.md`, section 7.)

- Trames AAC de 1 024 échantillons : **découpe en PCM, colle en PCM, encode une fois**. Compte en
  échantillons (`n = round(durée x 48000)`).
- **`-shortest` nulle part.** Borne l'image en `-frames:v`.
- **`-ar 48000 -ac 2`** imposés au master. **`loudnorm=I=-14:TP=-1.5:LRA=11`** à la fin.
- Source sans piste audio : silence de la bonne longueur (`anullsrc=r=48000:cl=stereo`), `apad` pour une
  source plus courte ; `loudnorm` échoue sur un silence numérique pur.
- Mixer les effets **sous** la voix (`amix=inputs=2:duration=first:weights=1 0.45:normalize=0`) et AVANT
  la normalisation ; un gain posé après.
- Quand le contrôle de fin de rendu regarde l'écart de durée, compare la **durée du flux vidéo**, pas
  celle du conteneur : le conteneur porte le pavage AAC (une vingtaine de millisecondes) que tout MP4 du
  monde a, et un contrôle qui crie à chaque rendu correct finit par ne plus être lu.

## 4. Texte, polices, cartes

- **Pas de `drawtext` (ni `subtitles`, ni `libass`) sur certains ffmpeg récents** (cas : certaines installations
  récentes de ffmpeg, compilées sans libfreetype ni libass). Vérifie : `ffmpeg -filters | grep drawtext`. **Dessine le texte avec
  Pillow puis `overlay`**, pose chaque carte au moment voulu avec
  `overlay=x:y:format=auto:enable='between(t,début,fin)'`.
- **Rogne le PNG à la boîte du texte** (`getbbox()`, marge de 6 px) et pose-le à sa place. Composer une
  image pleine 1080x1920 en RGBA à chaque image, plusieurs fois par plan, fait s'effondrer le rendu :
  même résultat avec environ 10 fois moins de pixels.
- **Repli silencieux de police** (table avec valeur par défaut, `load_default()` dans un `except`) :
  voir `sous-titres.md` (section 3). Les polices `.ttc` et les variables (Helvetica Neue, SF) : PIL prend
  l'index 0, un Regular, sans prévenir.
- **`range()` refuse un flottant** : « un contour de 2.5 » plantait le rendu. Un `int()` le tient.
- **Le Python qui rend doit avoir Pillow** (et la transcription). Un environnement virtuel sans Pillow
  fait mourir le rendu sur la fabrication du PNG de sous-titre : lance-le dans l'interpréteur qui a
  Pillow, numpy et Whisper.
- **Carte HTML** (carte de commentaire, carte de fin) : rends-la dans un navigateur sans interface à
  **4 fois** la taille, puis réduis en LANCZOS ; recolle l'avatar ou le logo **depuis l'original** au
  lieu de le rendre (il ne traverse alors aucun rééchantillonnage). **Le navigateur mesure, tu ne
  devines pas** : relis la hauteur de la bulle (`getBoundingClientRect().bottom` par `--dump-dom`),
  place le reste sur ce nombre, et lève une erreur si le bloc demande plus de place que disponible.
  Une police CSS qui ne se résout pas tombe en serif (`-apple-system` seul rend du Times) ; une
  largeur qui tombe juste sur une seule grandeur est un faux vert. Prouve que seul le rectangle a changé :
  0 pixel changé hors de la carte, avatar identique pixel pour pixel.
- **Un nom, un nombre de réactions ou une heure posés sur une carte d'accroche sont de l'habillage**, pas
  des preuves. Demande à la personne le nom à afficher (un choix à elle, pas le tien), dis que les chiffres
  d'habillage n'ont rien de mesurable derrière, et ne présente jamais la carte comme un vrai avis. Deux
  versions (avec et sans nom) valent mieux qu'une interprétation d'une consigne ambiguë ; le reste de
  l'image n'est pas touché.
- **La capture d'écran headless ne relit pas toujours la page** : `location.reload()` relit le CACHE ;
  après une modification, recharge en ignorant le cache.

## 5. Image : filtres, mouvement, étalonnage

- **`eval=frame` sur `eq`**, sinon l'expression est calculée UNE fois (le défaut est `init`) : le plan
  sort avec une valeur figée et rien ne le signale. Témoin : rends le même montage avec et sans
  images-clés et mesure l'amplitude de luminance (2,9 à plat contre 192,7 animé).
- **`zoompan` avec `d=1`** : une image de sortie par image d'entrée, le compte est préservé. Dans
  `zoompan`, le temps local s'écrit `on/fps` (compte d'images de sortie). Un `crop` de taille variable
  puis un `scale` : REFUSÉ par l'encodeur (« Invalid argument »). Le point fixe sous l'échelle est le
  point de cadrage : `x = (iw - iw/zoom) x cadrage_x`.
- **Rognage centré = têtes coupées** : `scale=L:H:force_original_aspect_ratio=increase` puis
  `crop=L:H:(iw-ow)*x:(ih-oh)*y` avec x, y dans [0 ; 1] (0,5 centre). Sur l'axe sans mou, le décalage est
  multiplié par zéro : mesurer la marge avant d'écrire.
- **Pose le masque (`drawbox` / `delogo`) avant l'étalonnage**, l'étalonnage avant le mouvement, le
  mouvement avant les sous-titres. `delogo` refuse de toucher le bord de l'image (x au moins 1, x + largeur
  au plus L - 1).
- **Cadence : une cadence fausse ne se voit pas dans le contrôle du moteur.** Le moteur de ce skill prend
  30 i/s par défaut et ne lit jamais le champ `conteneur.fps` : un rendu relancé sans le drapeau sort à
  30 i/s depuis des sources à 24 (une image dupliquée sur cinq), et son propre contrôle annonce « écart +0
  image ». Seule une division l'attrape.
- **Mesurer une courbe sur une source qui ÉCRÊTE donne un faux écart** (11,3 % sur un rush normal, 0,86 %
  sur une source grise) : le défaut est dans la mesure.
- **Encodeur** : sur macOS, `h264_videotoolbox` (matériel, rapide, débit imposé : 9 Mb/s en final, 3 Mb/s en
  brouillon) ; ailleurs, `libx264 -crf 18 -preset medium -pix_fmt yuv420p`. Ajoute `-movflags +faststart`.
  Le moteur de ce skill choisit tout seul et se règle par variable d'environnement : voir
  `moteur/CONFIGURATION.md`.
- **HDR** : un smartphone récent peut filmer en HDR (HLG) ; la conversion juste demande `zscale` ou `libplacebo`. Voir
  `transitions-effets-formats.md`.
- **Bandes noires cuites** : la luminance moyenne par ligne les voit, `cropdetect` non.
- Un `xfade` en chaîne sur plus de 2 entrées : l'`offset` est cumulatif (somme des durées utiles).

## 6. Fichiers et système

- **Une archive ZIP dont les noms contiennent un octet non UTF-8** (cas : un nom de fichier avec un accent mal encodé) :
  `unzip` refuse de les écrire (« Illegal byte sequence »). Passe par `zipfile` en Python, qui décode en
  cp437 puis latin-1 ; renomme les rushes (`clip_1` à `clip_6`) et garde un `provenance.json` (nom
  d'origine, taille, md5).
- **Un export de bibliothèque n'est pas une scène** : un ZIP exporté contient souvent bien plus de
  fichiers que de scènes (vidéos, images, doublons). Trie sur le TEXTE (transcription), pas sur les
  noms.
- **Une primitive recopiée en plusieurs endroits diverge** : une ligne qui arbitrait entre deux noms de
  champ était recopiée dans de nombreux endroits de plusieurs fichiers. Donne-lui un domicile (voir `moteur-blueprint.md`).
- **Lance une tâche lourde à la fois** (transcription medium, séparation de voix, effacement par IA) :
  évite d'en lancer deux en même temps, et attends la fin de la première avant de lancer la suivante.
- **Ne pousse pas un fichier dans une messagerie sans vérifier son poids** : beaucoup de services
  limitent la taille d'une pièce jointe ; prépare une version allégée.

## 7. Le calepin des commandes sûres

```bash
# Compter les images, lire cadence et durée du FLUX vidéo
ffprobe -v error -select_streams v:0 -count_frames \
  -show_entries stream=nb_read_frames,r_frame_rate,duration,width,height,color_transfer -of default=nw=1 film.mp4
# Durée de l'audio
ffprobe -v error -select_streams a:0 -show_entries stream=duration,sample_rate,channels -of default=nw=1 film.mp4
# Couper une image sur un nombre entier d'images (30 i/s, 33 images)
ffmpeg -ss 12.0 -t 1.116667 -i rush.mp4 -frames:v 33 -vf fps=30 seg.mp4
# Couper l'audio en PCM, au compte d'échantillons (1,5 s = 72000 échantillons à 48 kHz)
ffmpeg -ss 12.0 -i rush.mp4 -vn -af aresample=48000:first_pts=0,apad -c:a pcm_s16le -ar 48000 -ac 2 -t 1.5 a.wav
# Master final : image copiée, son normalisé, borné en images
ffmpeg -i colle.mp4 -i son.wav -map 0:v:0 -map 1:a:0 -c:v copy \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -frames:v N -t N/FPS -movflags +faststart sortie.mp4
# Prouver qu'un correctif ne change rien : empreinte image par image
ffmpeg -i avant.mp4 -f framemd5 - > a.txt ; ffmpeg -i apres.mp4 -f framemd5 - > b.txt ; diff a.txt b.txt
```
