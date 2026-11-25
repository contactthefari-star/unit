# Transitions, mouvement, effets, formats, étalonnage

Mesuré sur des montages livrés et sur une pub gagnante. La coupe franche fait environ 95 % des
transitions d'un corpus de pubs gagnantes : les gagnantes ne sont PAS chargées de transitions. Quelques
effets ont chacun un travail.

## 1. Une transition est une ponctuation

### La doctrine, dans l'ordre où elle prime

1. **La coupe franche est la règle.** 80 à 90 % des raccords d'une pub qui convertit sont des
   coupes franches. Une transition marque un changement d'idée, pas un changement de plan.
   **Une transition sur chaque coupe est la signature du montage amateur** (un fondu global, le
   même partout).
2. **Quota : 22 % des coupes, 5 au maximum** dans un montage normal (16 % mesuré sur un vrai
   montage).
3. **Le mouvement combat le fixe**, et c'est le poste qui rapporte le plus : un plan de 3 s sur un
   visage immobile perd le spectateur. On met beaucoup plus de mouvements que de transitions : le
   mouvement est invisible, la transition se voit.
4. **On ne zoome pas dans un paysage**, on le dérive : le zoom mange ce qu'on est allé chercher
   (l'ampleur).
5. **Le hook coupe sec** : rien dans les 3 premières secondes.
6. **Un flash marque une révélation** (le produit qui apparaît, le résultat), une ou deux fois par
   film ; trois, c'est un clip. **Plafond PAR TYPE** : 2 flashs, pas 5 ; quand un type est épuisé,
   le motif retombe sur sa variante douce (flash vers zoom), et quand tout est épuisé la coupe
   reste franche, ce qui est très bien.
7. **Jamais deux transitions côte à côte** (diaporama). **Jamais sur un plan de moins de 0,9 s** :
   elle mange le plan au lieu de le relier.

### Qui reçoit quoi

| Motif de la coupe | Rôle du plan qui entre | Transition | Max par film |
|---|---|---|---|
| Conclusion (note 4) | cta, fin | fondu au noir | 1 |
| Révélation (note 3) | produit, résultat, preuve, comparaison, preuve sociale | flash, puis zoom | 2 de chaque |
| Rupture (note 2) | contexte, vie réelle, mécanisme, démonstration | whip, puis glissement vers la gauche | 2 et 1 |
| Série (note 2) | deux plans muets sur le même sujet | fondu | 2 |

Une conclusion note plus haut qu'une révélation : des révélations il y en a dix dans un film, une
fermeture une seule ; à égalité, le quota est mangé par les premières et le film s'arrête sans se
fermer. Pénalités : un des deux plans sous 0,9 s : moins 10 ; dans les 3 premières secondes :
moins 4 ; on ne garde que les notes d'au moins 2.

- **Le type suit ce que le raccord raconte**, pas une rotation : un fondu entre deux plans calmes
  dont l'humeur change ; un whip entre deux cadres presque identiques (sinon ils se lisent comme un
  faux raccord) ; un fondu au pivot quand 4 images ne portent rien d'autre. Sans nom de type
  donné, le raccord décide : dernière coupe (elle FERME) : fondu au noir ; première coupe (elle
  OUVRE, après les 3 premières secondes) : fondu enchaîné ; ailleurs, plan sortant de moins de 1,2 s : whip, sinon fondu.
- **Varier le TYPE, pas le NOMBRE.** Un défaut constant se lit comme une incapacité : si l'outil
  répond toujours « fondu », on conclut qu'il ne sait faire que ça.
- Le placement lit le rôle du plan (cadre, sujet, rôle) ; chaque décision sort avec sa raison.
  Un montage dont les plans n'ont pas été REGARDÉS reçoit ses transitions à l'aveugle.
- **Quand chaque clip est une prise distincte** (un clip, une réplique), pose les transitions aux
  CHANGEMENTS DE CLIP seulement et des coupes franches à l'intérieur d'un clip, avec un léger
  décalage de cadre (un zoom de 1,05 à 1,06) pour que le saut se lise comme un montage. Cas validé :
  une transition à chaque changement de clip (par exemple whip, flash, zoom, whip, flash), puis
  corrigée selon la matière disponible (section 3). Une transition sur CHAQUE coupe reste
  la signature amateur ; si la personne la demande « après chaque vidéo », c'est ce qu'on pose, et on
  dit ce que ça coûte.
- Un montage face caméra sans aucune transition fait « brut » : mets-y des transitions sobres
  (punch-in de 105 à 110 % aux changements d'idée, whoosh discret, flash court, carte de fin en
  fondu).

### Vocabulaire (filtre `xfade` de ffmpeg) et durées par défaut en secondes

| Nom | `xfade` | Durée | Nom | `xfade` | Durée |
|---|---|---|---|---|---|
| fondu | fade | 0,25 | glisse (4 sens) | slideleft ... | 0,28 |
| fondu_noir | fadeblack | 0,35 | balayage | wipeleft | 0,26 |
| flash | fadewhite | 0,14 | zoom | zoomin | 0,30 |
| whip | hblur | 0,18 | pixel | pixelize | 0,22 |
| cercle | circleopen | 0,34 | dissous | dissolve | 0,28 |
| radial | radial | 0,30 | gris | fadegrays | 0,34 |
| écrase / étire | squeezeh / squeezev | 0,26 | fondu rapide / lent | fadefast / fadeslow | 0,16 / 0,50 |

ffmpeg connaît 58 transitions (`ffmpeg -h filter=xfade`) : balayages doux, rideaux, vent, tranches,
diagonales, coins. Elles se DEMANDENT une par une, aucun passage automatique ne les pose. **Ce
sont des secondes** : la section 2 explique pourquoi c'est un piège.

## 2. Une transition se pense en IMAGES

Mesure image par image du film livré à 24 i/s (netteté = gradient horizontal moyen, lum = luminance
moyenne). Les durées par défaut en secondes ont été choisies sans cadence :

| Transition | Durée | Ce que l'image fait vraiment |
|---|---|---|
| flash | 0,14 s | UNE image à 253/255, puis deux de retour : un stroboscope |
| whip | 0,18 s | TROIS images de flou plat, sans rampe : un glitch |
| zoom | 0,30 s | SEPT images en dégradé : la seule qui se lisait |

À 24 i/s, 0,14 s fait 3,4 images. **Il en faut 8 à 9** pour qu'un mouvement monte et redescende.
Après correction : fondu de 9 images (luminance 137,8 vers 158,1 en un dégradé continu), whip de 8
images (netteté 11,88 vers 0,75 puis retour, vraie rampe des deux côtés).

- **Plancher : 3 images.** Sous 3 images la transition devient une coupe franche qu'on assume et
  qu'on IMPRIME à l'écran (« mieux vaut une coupe assumée qu'un clignotement »).
- **Plafond : la moitié du plus court des deux plans, et 0,6 s.** Quantifie la durée en IMAGES :
  `dd = round(min(d, plafond) x fps) / fps` ; sans cela, `round(u + d)` et `round(u) + round(d)`
  diffèrent d'une image et le film sort une image trop long à chaque transition.
- Un fondu de 9 images (0,37 s à 24 i/s) est validé entre deux plans calmes dont l'humeur change.
  Dans une section rapide, les longs fondus (plus de 0,3 s) ne sont pas ceux des gagnantes ; seul le
  format émotionnel (cadeau) tolère un dissous doux.

## 3. Une transition mange de la matière APRÈS le plan qu'elle quitte

Le plan qui PORTE la transition est rendu **plus long de la durée de la transition** (le « rab »),
parce que le `xfade` doit mordre dans la matière des deux côtés. Un plan qui finit sur la dernière
image de sa source n'a rien à donner, et le collage s'effondre.

- **Un plan qui dépasse sa source fait sortir un film beaucoup trop court** : par exemple un plan
  qui finit à 4,01 s sur un clip de 4,00 s. Le nombre d'images obtenu n'est qu'une fraction de
  l'attendu, et le conteneur, le flux vidéo et le calcul annoncent trois durées différentes : trois
  chiffres, trois mensonges. **Règle : un plan qui porte une transition garde, après sa fin, au
  moins la durée de cette transition dans sa source.**
- **La réserve se paie avec le DERNIER MOT** quand le clip parle jusqu'à sa dernière image. Niveau
  mesuré à l'image de jonction dans le mp4 livré (exemple de valeurs mesurées) :

| Raccord | Avant la coupe | Après |
|---|---|---|
| clip 1 vers clip 2 | -21 dBFS | **-84 dBFS en UNE image**, un mot guillotiné |
| clip 3 vers clip 1 | -23 dBFS | -48, un mot amputé |
| clip 2 vers clip 4 | -35 dBFS | -71 |

  Aucun contrôle ne le voyait : compte d'images juste, zéro silence de plus de 0,30 s, sous-titres
  couvrants. Un mot coupé à plein niveau ne ressemble à rien de ce qu'on mesurait.
- **La réserve se calcule sur ce que la matière donne APRÈS le dernier son, jamais sur un voeu** :
  `dispo = plafond - (fin_de_parole + 0,05 s)`, quantifiée à l'image. Si `dispo` tombe sous le
  plancher (3 images), la transition n'existe pas : coupe franche assumée et imprimée.
- Exemple de matière restante après le dernier son de chaque clip sortant : 0,488 s, 1,868 s,
  0,168 s, **0,068 s**, **0,068 s**. Un raccord qui n'a que 1,6 image de matière est physiquement
  impayable autrement qu'avec la voix.

| Raccord | Matière | Avant | Après |
|---|---|---|---|
| clip 5 vers 6 | 0,488 s | whip de 3 images | **fondu de 9 images** |
| clip 6 vers 3 | 1,868 s | flash d'1 image | **whip de 8 images** |
| clip 3 vers 1 | 0,168 s | zoom de 7 images | **fondu de 4 images** |
| clip 1 vers 2 | 0,068 s | whip de 3 images | **coupe franche** |
| clip 2 vers 4 | 0,068 s | flash d'1 image | **coupe franche** |

- Un **garde avant rendu** vérifie que chaque source porte `début + durée + durée_transition`.
- **Rejeté, avec la mesure** : allonger les transitions (sur trois raccords ça coûte 0,18 à 0,30 s
  du dernier mot, à plein niveau : on ne paie pas une transition avec la voix) ; tout passer en
  fondu (monotone) ; descendre la marge gardée après le dernier mot de 0,05 s à 0,03 ou 0 s
  (2,1 et 2,8 images sur les deux raccords serrés, toujours sous le plancher, testé aux trois valeurs).
- Si le whip du raccord le plus appuyé paraît encore trop voyant, `doux_gauche` à 0,375 s est le repli
  mesuré.
- Si la personne veut une transition partout, il faut des clips qui s'arrêtent de parler 0,3 s avant
  la fin : c'est un choix de tournage ou de génération, pas de montage.
- Quand la matière manque pour une transition demandée, elle devient une coupe franche et on le dit ;
  un whip qui a la matière obtient ses 9 images.

## 4. Le fondu sans perte de longueur

Rends chaque segment avec un **rab pris sur la suite du plan** (les amorces), puis enchaîne au
`xfade` avec `offset = somme des durées utiles précédentes`. Le film garde sa longueur exacte.
Le détail technique (offset, comptage d'images, cadence) est dans `pieges-ffmpeg.md`.

- Le **son ne se fond pas** : recolle-le à la durée juste, séparément, en PCM, sinon il dérive du
  fondu à chaque coupe.
- Un fondu entre deux morceaux **contigus de la même prise** est invisible (la même matière avec elle-
  même) : teste-le sur des plans discontinus, sinon l'essai ne peut pas échouer et ne prouve rien.
- Une carte de sous-titre de fin de plan se prolonge de la durée du rab, pour ne pas s'éteindre pendant
  le fondu.
- **Pendant un fondu, le texte qui se superpose est le texte CUIT dans les rushes**, pas le tien (voir
  `sous-titres.md`).

## 5. Le mouvement : un plan qui dure ne reste pas fixe

- **Punch-in de 105 à 110 %** (zoom de 1,00 vers 1,08 sur environ 6 images, tenu, relâché) sur un mot
  d'emphase ou un changement d'idée ; dans une prise unique, tous les 5 à 8 s. Il imite une coupe sans
  quitter le plan. 5 à 10 % ne se remarquent pas et tiennent le regard.
- Types : `punch` (zoom avant progressif), `recul` (zoom arrière), `zoom` (fixe), `derive`
  (panoramique lent, sens gauche, droite, haut, bas), `secousse` (tremblement, avec deux fréquences
  premières entre elles, sinon il part en diagonale et se lit comme un défaut d'encodage).
- **Force** : 4 % à 2 s, 9 % à 6 s : `force = min(0,10, 0,030 + 0,011 x durée)`, bornée entre 0,025 et
  0,16 (un mouvement qui se remarque est un mouvement raté). Par défaut 6 %, plafond 40 % (au-delà le
  grain de la source se voit), sous 0,4 % rien ne se voit et le plan reste fixe.
- **Plan de moins de 1,2 s** : laissé fixe (un mouvement ne s'y verrait pas et coûterait du rendu).
  **Cartes, splits, noirs, cartons** : fixes, ils sont déjà composés.
- **Alterne** avant et arrière (deux zooms avant de suite se lisent comme un défaut). Plan large :
  `derive`, en alternant gauche et droite. Premier plan : `punch` à 1,35 fois la force (plafond
  0,16) : le hook doit bouger tout de suite.
- **Ordre dans la chaîne** : cadrage, masque, étalonnage, cadence, mouvement, **puis** les sous-titres.
  Le mouvement passe APRÈS le masque et l'étalonnage (le cache des sous-titres cuits doit bouger avec
  l'image) et AVANT nos sous-titres : un sous-titre qui zoome avec l'image est illisible.
- Un saut d'image causé par une coupe interne se déguise par un zoom de 1,05 à 1,06 sur le second
  morceau.
- Le filtre qui rend ce mouvement est `zoompan` avec `d=1` : une image de sortie par image d'entrée,
  le compte est préservé. Un `crop` de taille variable suivi d'un `scale` a été essayé et REFUSÉ
  (« Invalid argument » dès que la taille change d'une image à l'autre).

## 6. Les autres effets et ce que les gagnantes ne font pas

| Effet | Quand | Comment |
|---|---|---|
| Flash / éclat (light leak) | format « montage rapide de produits », entre SECTIONS, pas à chaque coupe | blanc ou doré, 2 à 4 images ; `xfade=transition=fadewhite` ou un blanc à 80 % sur 3 images (mais voir la section 2 : à 24 i/s une durée de 0,14 s ne fait qu'une image) |
| Incrustation « problème » (PiP) | hook parlant | petite image du problème ou de l'avant en coin, environ 38 % de la largeur, arrondie, à x = 4 % de la largeur et y = 6 % de la hauteur, uniquement pendant le hook |
| Avant/après scindé | beat de preuve, toute niche à résultat visible | côte à côte, ou balayage vertical (`wiperight`) qui révèle l'« après » ; il meurt avec le hook quand il y en a un |
| Accéléré / jump cut | resserrer un parlant | pauses retirées à image identique, accéléré de 1,5 à 2 x sur un connecteur ennuyeux |
| Carte de fin | 1 à 3 dernières secondes, obligatoire | logo (le vrai fichier) ou page produit ou offre, plus un appel à l'action dur ; jamais un fondu vers rien |

**Ce que les gagnantes ne font pas** (ça se lit bon marché) : transitions en glissement, en poussée, en cube ou
en rotation entre chaque plan ; glitch, séparation RVB, « stingers épiques » ; machine à écrire ou
lettres volantes dans les sous-titres ; bandes de cinéma, LUT à grain de pellicule, reflets
anamorphiques ; longs fondus de plus de 0,3 s dans les sections rapides (seul le format émotionnel
tolère un dissous doux).

## 7. Formats

- **Master 9:16, 1080x1920 ; 720x1280 est le plancher** (les réseaux ré-encodent). H.264 et AAC en MP4,
  `+faststart`. Une version allégée pour l'envoi par messagerie est utile : beaucoup de services limitent la
  taille d'une pièce jointe.
- **Le format et la cadence de la SOURCE décident.** 24 i/s reste 24 i/s. Rendre du 24 en 30 duplique
  une image sur cinq et fabrique de la saccade. Le moteur de rendu prend 30 par défaut et ne lit pas le
  champ de cadence du blueprint : toute commande de rendu porte le drapeau de cadence explicite
  (voir `moteur-blueprint.md`). Vérifie par une DIVISION (images / durée) sur le fichier livré.
- **Le carré est une fenêtre fixe du vertical** (corrélation 0,996 mesurée sur des pubs Meta carrées et
  verticales) : monte UNE fois en vertical, découpe le carré.
- **Format = celui du concurrent** (adaptation d'une pub). `ffprobe` sur la source AVANT de monter.
  Source en 9:16 : on livre du 9:16, à partir de la source verticale NATIVE (par exemple 720x1280), jamais
  du carré recadré (un carré recadré en vertical coupe l'image et rend la scène illisible). Source carrée SEULE : on livre du CARRÉ
  seulement, pas de version verticale faite d'un carré posé entre deux bandes floues. Tout ce qu'on
  régénère (plan, image, carte) est dans le format de la source.
- **Rognage centré = têtes coupées.** Le `crop` centré est le défaut de tous les outils et il est
  presque toujours faux sur un visage : les yeux vont dans le tiers haut, donc le rognage vertical
  doit mordre en bas. Le blueprint porte `cadrage: {x, y}` (0,5 = centre).
- **Un réglage posé sur un axe sans mou ne change rien.** Le rognage remplit le cadre en agrandissant
  puis en coupant ; quand la source est déjà au format cible, `iw-ow` et `ih-oh` valent zéro et le
  décalage est multiplié par zéro (rush 1080x1920, y = 0,65 : 0,0 % des pixels changent ; rush
  1920x1080, x = 0,15 : 99,9 %). Mesure la marge avant d'écrire : source plus large que la cible, seule
  la largeur mord ; plus haute, seule la hauteur ; au même format, rien. Sur l'axe sans mou, refuse en
  le disant.
- **Bandes noires cuites dans une source** (29 px en haut et 22 en bas sur 1280) : invisibles sur une
  planche contact, évidentes au montage (l'image saute à la coupe). `cropdetect` n'a rien rendu
  d'exploitable ; ce qui les voit est la **luminance moyenne par ligne**, première et dernière ligne
  au-dessus de 8. Correctif : une image-clé unique de zoom, `1280 / (1280 - 29 - 22) = 1,0415`, on
  prend 1,05 pour la marge ; vérifie 0 px de bande en haut et en bas à quatre instants.
- **HDR (HLG) d'un smartphone** : un rush filmé en HLG sort étiqueté `arib-std-b67` / `bt2020` ; les
  réseaux honorent l'étiquette au ré-encodage et la créa part délavée et sursaturée, un défaut qui ne
  se voit qu'APRÈS publication. Sonde : `ffprobe -show_entries stream=color_transfer` (`smpte2084` = PQ,
  `arib-std-b67` = HLG). Deux conversions ont été mesurées : `tonemap=hable` donne 87/255 d'écart moyen
  et l'étiquette reste `arib-std-b67` (abîme sans réparer) ; `colorspace=all=bt709:iall=bt2020` corrige
  l'étiquette (1,1/255 d'écart) mais ne connaît aucun transfert HDR : seule la matrice est convertie,
  la courbe reste fausse. Une conversion juste demande `zscale` (libzimg) ou `libplacebo`. Sans eux :
  PRÉVIENS, ne touche pas à l'image (poser la moins fausse des deux serait maquiller le problème), et
  re-tourne en SDR. Quand un correctif touche un format, mesure l'étiquette de la SORTIE, pas seulement
  les pixels.

## 8. Étalonnage

Ordre d'un étalonneur : **exposition et contraste, puis couleur, puis netteté, puis vignette.**
Omets tout filtre neutre (chaîne plus courte, moins de passes). Le texte blanc ne doit pas être
assombri par la vignette ni désaturé avec l'image : l'étalonnage passe AVANT les sous-titres.

| Réglage | Filtre ffmpeg | Remarque |
|---|---|---|
| Contraste, luminosité, saturation | `eq=contrast=...:brightness=...:saturation=...` | avec une valeur animée : `eval=frame` |
| Chaleur (-1 froid à +1 chaud) | `colorbalance` : rouge `+0,10 x chaleur`, bleu `-0,10 x chaleur` sur ombres, tons moyens, hautes lumières | |
| Netteté (0 à 1) | `unsharp=5:5:(netteté x 1,5):5:5:0` | |
| Vignette (0 à 1) | `vignette=angle=PI/max(2.2, 6 - vignette x 3.5)` | PI/5 est un cercle large ; au-delà le coin devient noir franc |

Rendus : **punchy** (contraste 1,25 / saturation 1,25 / netteté 0,35), **cinéma** (1,15 / 0,90 /
chaleur 0,18 / vignette 0,40), **doux** (0,92 / 0,95). Point de départ prudent :
lumière naturelle, légèrement punchy ; `eq=contrast=1.06:saturation=1.12` suffit ;
peau naturelle ; **pas de dégradé teal-orange** ; chaud et doré pour un format cadeau.

Une plainte désigne un défaut, pas une cible chiffrée : « l'image est trop sombre » veut dire éclaircir (le mot « trop »
nomme le défaut).

## 9. Le look de la matière : ce que le montage accepte et refuse

Partagé avec `rushes-generes.md` (qui dit comment les fabriquer). Au montage, refuse ou signale :

- **Un look cinéma** : profondeur de champ de photo pro, lumière froide bleu-gris, larme unique,
  vaisselle de studio. Une pub qui gagne est un **téléphone brut** : décor réel (salon, cuisine),
  vêtements du quotidien, lumière de la maison ou du jour par la fenêtre, visages normaux (âge réel de l'avatar,
  peau réelle, fatigue permise), léger grain de compression, selfie caméra frontale à la main,
  micro-tremblé, objets du décor visibles.
- **Le selfie dans un miroir avec le téléphone reflété** : format daté, jamais utilisé. Formats
  permis : caméra frontale à bout de bras (le téléphone n'est pas dans le plan), tiers qui filme,
  photo composée.
- **Étudier les gagnants avant de générer ou de monter** : extraire des images clés
  (`ffmpeg -i pub.mp4 -vf fps=0.5 images/f_%03d.jpg`), lire palette, composition, typographie,
  rendu, mouvement, transitions, puis reproduire le style sur son propre produit.
- **Exemple de relevé** sur une pub gagnante : palette (trois à cinq couleurs avec leurs codes
  hexadécimaux), composition (combien d'éléments, où est le héros), typographie (famille, taille en
  pixels, casse, position), mouvement (vitesse, caméra verrouillée ou non). À remplir pour chaque pub
  étudiée. Avant de générer un visuel, pose-toi : quel temps du récit (douleur, éducation, révélation, preuve, appel) ? Quelle pub
  gagnante fait la même chose ? Extrais, analyse, reproduis.
- Étudier une vidéo gagnante, c'est **apprendre à la refaire**, pas tout noter. Ne garde que
  le savoir-faire reproductible : structure et ordre des plans, durée et rythme, transitions,
  typographie animée et sous-titres, son, outils et réglages, étapes de fabrication dans l'ordre.
  Écarte l'histoire de l'auteur, ses offres, les chiffres de ventes. Test d'une règle : « est-ce
  que ça change ce que je fais au montage ? » Non : dehors.
