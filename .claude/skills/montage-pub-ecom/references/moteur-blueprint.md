# Le montage est un fichier : le blueprint, le moteur, et les leçons d'ingénierie

Pour installer et lancer le moteur livré avec ce skill : `moteur/README.md` (et
`moteur/CONFIGURATION.md` pour les binaires, Python et ce qui est propre à macOS). Ce fichier-ci
explique la logique, le format du blueprint et les leçons d'ingénierie utiles à celui qui
l'UTILISE ou le modifie. Quand le code et ce texte divergent, **le code gagne**.

## 1. La loi fondatrice

Un montage vit dans un **fichier** (`blueprint.json`), jamais dans une commande ffmpeg. Si le film
n'existe que sous forme de commande, « raccourcis le hook » oblige à tout refaire.

- Le fichier **décrit le film plan par plan**.
- Un **moteur** le rend en vidéo.
- Une **interface** l'affiche.

Trois choses distinctes qui lisent **le même fichier**. Le blueprint est la seule vérité : « raccourcis
le hook » change un nombre, on rejoue, sans rien perdre d'autre. Le moteur lit un fichier et en fait un
film ; l'analyse (`analyser_winner.py`) lit un film et en fait un fichier : extraire la RECETTE d'un
montage (« plan 3, de 6,2 s à 8,0 s, gros plan produit, on entend 'et regarde bien', coupe sèche »),
pas ses statistiques (« 14 coupes, plan moyen 2,8 s » ne se reproduit pas).

## 2. Le schéma du blueprint

```json
{ "version_format": 1,
  "chemin": "rushes/rush.mp4",
  "conteneur": {"duree": 33.46, "fps": 24.0, "largeur": 1080, "hauteur": 1920, "a_du_son": true},
  "plans": [
    { "n": 1, "source": "rushes/clip_1.mp4", "src_debut": 0.0, "duree": 1.13,
      "mots": [{"m": "Tu", "d": 0.0, "f": 0.26}],
      "vision": {"cadre": "gros plan", "sujet": "visage qui parle", "role": "hook"},
      "animations": {"zoom": [{"t": 0.0, "v": 1.0}, {"t": 1.1, "v": 1.15, "i": "doux"}]},
      "mouvement": {"type": "punch", "force": 0.06},
      "sortie": {"type": "fondu", "duree": 0.375},
      "cadrage": {"x": 0.5, "y": 0.35},
      "masque": {"haut": 0.79, "hauteur": 0.07, "mode": "boite"} } ],
  "style_sous_titres": {"police": "verdana bold", "taille_pct": 2.70, "hauteur_pct": 74,
                        "largeur_pct": 85, "contour": 3, "mots_max": 5},
  "image": {"contraste": 1.25, "saturation": 1.25, "nettete": 0.35},
  "effets": {"genre": "whoosh", "volume": 0.25},
  "son": {"gain_db": 0, "fondu_entree": 0.0, "fondu_sortie": 0.4},
  "carte_finale": true }
```

| Champ | Rôle | Remarque validée |
|---|---|---|
| `version_format` | numéro du schéma | posé par la fonction qui ÉCRIT (section 6) |
| `chemin` / `plans[].source` | rush global ou rush du plan | un plan sans `source` prend `chemin` ; un remontage à plusieurs rushes met `source` par plan |
| `plans[].src_debut` (ou `debut`) | où entrer dans le rush | `src_debut` gagne sur `debut` ; un seul accès : la fonction `entree(plan)` |
| `plans[].duree` | combien de temps on y reste | en secondes, rendue sur un nombre ENTIER d'images |
| `plans[].mots` | mots horodatés `{m, d, f}` | horodates **ABSOLUES** dans le rush : ne les rebase pas |
| `plans[].vision` | `cadre`, `sujet`, `role` | remplie en REGARDANT la planche ; sans elle les règles de preuve et de rafale sont « non mesurées » |
| `plans[].animations` | canaux d'images-clés | section 5 |
| `plans[].mouvement` | `punch`, `recul`, `zoom`, `derive`, `secousse` + `force` | si le plan porte aussi des images-clés de zoom ou de cadrage, les images-clés gagnent et le moteur le dit |
| `plans[].sortie` | transition qui QUITTE ce plan | rien d'écrit = coupe franche (le bon défaut) |
| `plans[].cadrage` | `{x, y}` de 0 à 1 (0,5 centre) | yeux dans le tiers haut |
| `plans[].masque` / `masque` | couvre un bandeau cuit : `haut`, `hauteur`, `mode` (`boite` ou `flou`), `couleur`, `marge` | un masque PAR source (section 7 de `sous-titres.md`) |
| `style_sous_titres` | police, `taille_pct`, `couleur`, `hauteur_pct`, `largeur_pct`, `majuscules`, `contour`, `ombre`, `boite`, `boite_texte`, `mots_max` | **ne poser que les champs changés** (le moteur fusionne avec les défauts) |
| `image` | `contraste`, `luminosite`, `saturation`, `chaleur`, `nettete`, `vignette` | neutres par défaut, un filtre neutre est omis |
| `transition` | réglage global hérité par un plan sans `sortie` | compatibilité des anciens montages |
| `effets` | `genre` (`whoosh`, `clic`, `riser`), `volume` (0,25) | sons synthétisés sur chaque coupe |
| `son` | `muet`, `gain_db`, `fondu_entree`, `fondu_sortie` | posés APRÈS la normalisation |
| `voix` | `{source, debut}` | pose UNE voix continue et COUPE le son des sources |
| `audio_separe` | `{chemin, source, quoi}` | `quoi` = `voix` ou `sans_voix`, piste séparée calée à 0 échantillon |
| `audio` | mesures : niveau, `silences[{debut, duree}]` | écrit APRÈS le rendu ; sans lui, deux règles sont « non mesurées » |
| `carte_finale`, `defauts`, `rendu` | verdict de la fin, défauts du texte cuit, fichier rendu | utilisés par les règles `fin`, `texte` |

Les mots, les cartes de sous-titres et la vision sont dérivés ou mesurés ; les **cartes de sous-titres
ne sont PAS dans le blueprint** (fabriquées au rendu depuis `mots`).

**Vocabulaire de `vision`** (le rôle dit ce que la coupe qui ENTRE doit marquer) : `cadre` parmi gros
plan, plan taille, selfie, selfie nuit, plan serré, macro, plan produit, plan large, plan subjectif,
carte, carton, split, noir ; `role` parmi hook, contexte, vie réelle, mécanisme, démonstration, produit,
résultat, preuve, comparaison, preuve sociale, cta, fin.

## 3. La chaîne de rendu

1. **Chaque plan est rendu SEUL**, dans l'ordre : agrandir/rogner au format (cadrage) ; **masque** ;
   **étalonnage** (`eq`, `colorbalance`, `unsharp`, `vignette`, ou la courbe d'images-clés) ; cadence ;
   **mouvement** (`zoompan`, `d=1`) ; `setsar=1` ; **sous-titres** (PNG Pillow cadrés à la boîte du
   texte, `overlay` avec `enable='between(t,d,f)'`).
2. Les coupes franches sont soudées par un `concat` sans réencodage ; `xfade` seulement entre groupes.
3. **La piste son est fabriquée à part** : chaque plan coupé en PCM à l'échantillon près, collé en PCM,
   encodé UNE fois ; effets synthétisés mélangés sous la voix ; `loudnorm`, puis gain et fondus ; borné en
   images (`-frames:v` et `-t`).
4. **Contrôle de fin de rendu** : images attendues contre obtenues, flux vidéo contre attendu, cadence ;
   avertissements d'un plan trop court ou d'une transition ramenée à une coupe franche.

Le détail et les chiffres de chaque étape sont dans `pieges-ffmpeg.md`, `transitions-effets-formats.md`
et `audio-voix-musique.md`.

## 4. Une recette est un script rejouable

- Le montage d'une pub est fabriqué par une **recette** (un script Python) qui écrit le blueprint, rejouable
  en deux minutes : on édite la liste `ORDRE` en tête de la recette, on relance le script de recette (à écrire
  selon ce principe, non fourni), puis le rendu.
- **Le hook est un PARAMÈTRE de la recette, pas une copie de la recette** (par exemple un argument
  `hook1` ou `hook2` passé au script de recette ; ce script est à écrire selon ce principe, il n'est pas
  fourni). Une copie du fichier diverge au premier correctif. Témoin de non-régression : rejouer le même
  hook rend les mêmes plans que la version précédente, **identiques**, avant comme après les correctifs.
- **Les mesures du clip neuf passent par la MÊME fonction de mesure** que les autres clips : deux chemins
  de mesure pour le même film donneraient deux découpages.
- **Le réglage de sous-titres et les corrections de texte vivent dans UN fichier importé** par la recette
  et par toute retouche. Après le rendu, **reverse les mesures du film rendu dans le blueprint** (blocs
  `audio` et `rendu`) : sans elles le contrôle dit « illisible ».
- **Le rendu de contrôle des sous-titres réutilise le moteur** (il appelle les fonctions de cartes et de PNG,
  il ne réimplémente rien) et DIT si la police est absente de la table.

## 5. Les images-clés : un canal, pas un réglage

**Une valeur qui change PENDANT un plan est un canal, jamais un réglage.** Un canal est une suite
d'images-clés `{t, v}` ; la valeur effective à un instant se **résout**, elle ne se stocke pas. Sans cela,
« zoome puis arrête-toi à mi-plan » oblige à couper le plan en deux. `t` compte **depuis le début du
plan**, jamais depuis le début du film.

| Canal | Défaut | Bornes | Où dans la chaîne |
|---|---|---|---|
| `zoom` | 1,0 | 1,0 à 1,60 | `zoompan` |
| `cadrage_x`, `cadrage_y` | 0,5 | 0 à 1 | `zoompan` |
| `luminosite` | 0,0 | -1 à 1 | `eq` (brightness) |
| `contraste` | 1,0 | 0 à 3 | `eq` (contrast) |
| `saturation` | 1,0 | 0 à 3 | `eq` (saturation) |

- Interpolation `i` vers la clé SUIVANTE : `lineaire` (défaut), `maintien` (marche d'escalier), `doux`
  (démarre et finit sans à-coup). **Un contrôle qui ne décrit rien ne s'affiche pas** : la dernière clé n'en
  porte pas. Avant la première clé la valeur tient celle de la première ; après la dernière, celle de la
  dernière : un canal ne retombe jamais tout seul à son défaut. Un nombre seul vaut une clé à `t=0`.
- Un blueprint mal tapé **dit ce qui cloche**, il ne sort pas un traceback au milieu d'un rendu : un canal
  inconnu est refusé et nommé, une clé hors bornes est ramenée et annoncée, des clés dans le désordre
  sont remises dans l'ordre, deux clés au même instant (la dernière gagne, sinon la division par
  `t1 - t0` part à l'infini dans l'expression ffmpeg).
- **Une courbe a deux sorties et un seul auteur** : le même canal donne le nombre en Python (aperçu,
  contrôle) et l'expression pour ffmpeg, dans le même fichier. Un banc les compare à la même seconde :
  écart 2,2e-16 sur 484 points, puis 0,86 % mesuré sur le film rendu (source non écrêtée). Si l'aperçu
  portait sa propre copie de la courbe, il montrerait un film et le fichier en sortirait un autre.
- **`eval=frame`**, sinon l'expression n'est calculée qu'UNE fois (le défaut de `eq` est `init`). Témoin :
  rends le même montage avec et sans images-clés et mesure l'amplitude de luminance (2,9 à plat contre
  192,7).
- **Mesurer une courbe sur une source qui ÉCRÊTE donne un faux écart** (11,3 % sur un rush normal, 0,86 %
  sur une source grise).
- **Un canal animé REMPLACE le réglage global, il ne s'y ajoute pas** (aperçu comme rendu) : si
  `image.luminosite` vaut 0,08 et que le plan 1 porte une courbe partant de -0,4, la page doit afficher 0,6
  et pas 1,08.
- **`doux` et `lineaire` donnent le MÊME nombre à mi-course** : mesurer une interpolation au milieu ne
  distingue rien ; au quart du parcours, les trois courbes se séparent (linéaire 1,08, doux 1,05,
  maintien 1,00 sur un zoom de 1,00 à 1,32).

## 6. Le format porte un numéro, et le numéro se pose sur l'ÉCRITURE

- Constat : des blueprints **sans aucun numéro**, et **deux noms pour le même champ** (`debut` et
  `src_debut`). Un numéro posé à la main dans un fichier est effacé à la première régénération :
  il appartient à la fonction qui ÉCRIT, jamais au fichier corrigé une fois. Chaque écriture appelle
  `estampiller`.
- **Une migration se joue par marches** : une marche de plus, jamais une entrée déjà livrée modifiée (un
  blueprint déjà migré ne repasse pas par l'ancienne marche). Un numéro plus récent que le code est lu tel
  quel, avec un avertissement.
- **L'ABSENCE d'un champ peut être porteuse.** Poser `src_debut` partout paraissait la bonne migration.
  Le code qui décale un plan teste `src_debut is not None` pour choisir lequel des deux champs
  décaler : le remplir partout aurait fait entrer le moteur au bon endroit du rush pendant que la frise
  affichait un autre film. **Avant toute migration qui AJOUTE un champ, cherche son nom dans tout le code
  et lis chaque `is None`, `is not None`, `in`, `get(` sans défaut.** S'il en existe un, la migration pose
  le numéro de version et laisse les données tranquilles, et elle écrit POURQUOI la marche est vide.
- **Une primitive sans domicile se recopie et finit par diverger** : la ligne qui arbitrait entre `src_debut`
  et `debut` était recopiée dans de nombreux endroits de plusieurs fichiers. Un type qui se décrit sans parler de plan, de
  piste ni d'effet n'appartient à aucun domaine : il lui faut son propre fichier (`format_bp.py`), et tout le
  monde passe par elle.

## 7. Un réglage écrit n'est pas celui que le moteur applique

- **Une valeur écrite dans un document est une DÉCLARATION.** Seul le chemin de code qui la lit la rend
  vraie. Le blueprint portait `conteneur.fps = 24`, mais le moteur déclare `--fps` à 30 par défaut et ne lit
  jamais ce champ : le rendu est sorti à 30 i/s depuis des sources à 24 (par exemple 900 images pour 30,00 s au lieu de 720 images), et son contrôle a annoncé « écart +0 image » parce qu'il calcule attendu et
  obtenu avec le même drapeau. **Toute commande de rendu porte la cadence explicite.** Avant de croire un
  réglage, cherche qui le lit (`grep` du champ dans le code) : zéro résultat = champ décoratif.
- **Un `dict.get(x, défaut)` sur un réglage venu de l'extérieur est un repli silencieux** : il faut une liste
  blanche qui refuse, ou une preuve postérieure (largeur du texte mesurée dans le fichier livré, voir
  `sous-titres.md`).
- **Un seuil lu par paliers est inerte sur toute une plage** : balaie-le avant de le régler.
- **Une règle ne lance pas un travail d'une minute** : elle répond tout de suite. Si le rush n'est pas
  encore séparé, elle rend un marqueur et l'interface propose le bouton, puis redit la phrase.

## 8. Un système validé se verrouille

- Une chaîne validée de bout en bout est **gelée**. Gestes permis : **ajouter** un maillon, **corriger** une
  panne mesurée, **mettre à jour** ce que la personne a demandé. Jamais réécrire, jamais « nettoyer »,
  jamais remplacer un maillon qui marche par un plus propre. Avant de toucher un fichier de la chaîne :
  est-ce que la personne a déjà vu ce qu'il produit et dit oui ?
- Les corrections se font **en AMONT, dans le blueprint**, jamais dans le moteur validé : recoller les
  élisions, souder le « % », scinder un plan sur une fin de phrase.
- **Ce qui garde une chaîne stable, c'est un contrôle qui regarde la SORTIE RÉELLE**, pas une discipline.
- Le changement minimal : une petite correction demandée = restaurer l'original + ajouter SEULEMENT ce
  qui est demandé. Resserrer au nom d'une règle de la personne (étendre une de ses règles à un autre
  domaine) est une DÉCISION, pas une application : dis-la avant, en une ligne, ou ne la prends pas.

## 9. L'aperçu est calculé par le MOTEUR

- **L'aperçu ne réimplémente rien.** Le découpage des sous-titres obéit à une loi fine (jamais après un mot
  faible, pas d'orphelin) : la refaire en JavaScript garantit qu'un jour l'aperçu montre un découpage et le
  mp4 un autre. L'interface DEMANDE au moteur (route qui appelle la fonction de cartes, temps absolus).
  Prouvé : changer le nombre de mots par carte change le nombre de cartes de la même façon dans l'aperçu et dans le rendu.
- **L'aperçu vidéo joue le temps de MONTAGE**, pas le fichier source : il convertit temps de montage vers
  temps de fichier et saute aux coupes. Sinon raccourcir un plan change le mp4 mais pas l'image.
- **L'aperçu des images-clés ne recalcule aucune courbe** : il résout chaque image avec la fonction que le
  rendu appelle, un échantillon par image sur la grille du rendu (30 i/s) ; la page lit l'échantillon, elle
  n'interpole pas (une interpolation en JavaScript lisserait un canal `maintien`). Le zoom animé se pose en
  CSS par `transform-origin:(cadrage_x, cadrage_y)` et `scale(zoom)` : c'est exactement le découpage de
  `zoompan` (le point fixe sous l'échelle est le point de cadrage). Vérifié sur un grand nombre de couples (image, valeur), écart nul,
  et sur une mire contre le vrai filtre : traits à 1 à 2 px sur 1080x1920.
- **Rien ne se pose en CSS sur un montage RENDU** : le mp4 porte déjà le zoom et l'étalonnage dans ses
  pixels (les remettre les doublerait).
- **Le panneau ne connaît aucun canal** : il les reçoit du serveur, qui les lit dans la table des canaux.
  Une liste recopiée dans le JavaScript est un second auteur.
- **Le TRAIT et les POINTS ne viennent pas du même endroit** : le trait est la suite d'échantillons
  résolus par le serveur, les points sont les clés écrites dans le blueprint. Pendant qu'on tire un point,
  seul le point bouge ; le trait se refait après l'enregistrement. **Une courbe se ferme jusqu'au bout du
  plan** (un point de fermeture à la fin) sinon le plan a l'air de finir plus tôt.

## 10. Si tu modifies ou construis l'interface

- **Vérifier un éditeur, c'est CLIQUER dedans** avec de vrais événements souris et clavier (protocole
  DevTools : `Input.dispatchMouseEvent`, `Input.insertText`). Un `.click()` JavaScript ne reproduit pas la
  perte de focus. Après une modification, recharge en ignorant le cache.
- **Un champ qui se rafraîchit tout seul écrase la saisie** : le panneau suit la tête de lecture et
  réécrit ses champs. Tester le focus ne suffit pas, car cliquer sur « poser » enlève d'abord le focus.
  Marque le champ **touché**, pas seulement focalisé.
- **`<input type="number">` rend une chaîne VIDE dès qu'on tape « 1,25 »**, et `Number('')` vaut `0` : un champ
  vide posait un contraste à zéro, soit une image noire, en silence. Lis la saisie telle quelle, accepte les
  deux séparateurs, refuse en le disant.
- **Un enfant de grille a `min-width: auto`** : une frise très large a élargi la page entière et la colonne
  de droite est sortie de l'écran, toutes les routes répondaient 200. `minmax(0,1fr)` + `min-width: 0` et
  `overflow: hidden`. Seule la capture d'écran l'a montré.
- **Une liste écrite DEUX fois diverge toujours** : génère, ne recopie pas (la page lisait sa propre table de
  transitions).
- **Un outil qu'on dicte doit proposer le geste suivant**, et ne proposer que ce qu'il sait faire. **Un mot
  répété n'est pas un ordre répété** (« zoome zoome zoome » vaut un seul ordre de
  zoom, pas trois).
- **Le micro d'un navigateur meurt hors de `localhost`** (`http://192.168.x.x` n'est pas un contexte
  sécurisé).
- **Un outil qui ÉCRIT doit se surveiller lui-même** : verdict par demande (`panne`, `répétée`, `rien`,
  `partiel`, `refus`, `ok`), rejeu des phrases ratées contre les règles du jour, résultat visible dans
  l'interface ; le verdict qui compte est celui de la personne qui REDIT la phrase. Une règle qui comprend
  doit toujours agir ou refuser à voix haute (jamais « comprise puis jetée faute de cible »). Une demande
  ambiguë ne DÉTRUIT jamais : « plus de transitions » veut dire davantage neuf fois sur dix, elle demande
  laquelle des deux.

## 11. Auditer avant d'installer le skill ou l'éditeur de quelqu'un d'autre

Avant de copier un skill ou un dépôt de montage trouvé en ligne : (1) aucun crochet `postinstall` ou
`preinstall` ; (2) aucun appel de shell avec un nom de fichier interpolé (`subprocess.run(f'... "{f}"',
shell=True)` : un fichier nommé avec un guillemet exécute ce qu'il veut) ; (3) aucune clé lue en dehors du
dossier de secrets prévu, aucune sortie réseau vers des clouds tiers qui reçoivent tes vidéos ; (4) ouvre le
fichier avant de croire le README. Un dépôt vitrine peut être une **coquille** (un éditeur de quelques lignes, un
serveur seulement annoncé) alors que la matière vit ailleurs, par exemple dans une branche ou un dépôt
archivé nommé « classic ». **Prends le MODÈLE, jamais la pile.**
