# Sous-titres : placement, typographie, ponctuation, fautes, texte incrusté

Mesuré sur plusieurs films verticaux livrés.
Les sous-titres sont obligatoires : chaque pub gagnante se regarde sans le son. Le réglage et les corrections de texte vivent dans **un seul fichier
importé** par la recette et par toute retouche : deux copies du même réglage finissent toujours
par diverger en silence.

## 1. Où les poser : 74 % de la hauteur

- **Un sous-titre trop haut ne gêne pas le lecteur, il CACHE le produit.** Le réglage hérité
  des pubs gagnantes (57 % de la hauteur) pose le bloc au milieu de l'image. Mesuré sur un
  rendu : le bloc vivait entre 54,9 % et 63,8 % de la hauteur, donc sur le geste qui montre le produit
  et sur le produit lui-même.
- **À 74 %**, le bas du bloc tient entre 78,8 % et 80,1 % selon les films : sous le geste, et au-dessus des 20
  derniers pour cent de l'image où TikTok et Reels posent leur interface. Au-dessus de 80 %, remonte la
  hauteur ou réduis les cartes à une ligne.
- **Un sous-titre jugé trop haut se vérifie en PHOTO** sur les images où le produit apparaît.
- **`hauteur_pct` est le HAUT de la première ligne.** Le moteur remonte un bloc de plusieurs
  lignes de `(n-1) x interligne / 2` (interligne = 1,22 x la taille du texte). L'ancre ne bouge
  donc pas quand une carte passe de une à deux lignes, mais le BAS descend. C'est le bas qu'on
  mesure contre l'interface, jamais l'ancre.
- Garde-fou hérité des pubs gagnantes : texte dans les 86 % centraux de la largeur, bas libre sur 12 %, haut
  libre sur 10 %.

## 2. Typographie : Verdana Bold à 2,70 %

| Choix | Valeur validée | Pourquoi |
|---|---|---|
| Police | Verdana Bold | dessinée pour l'écran aux petites tailles : hauteur d'x bien plus haute qu'Arial, contrepoinçons ouverts, chasse large |
| Taille | **2,70 % de la hauteur** (51 px sur 1920) | à 51 px elle se lit PLUS GROSSE qu'Arial Bold à 3,6 % (69 px) en occupant 26 % de hauteur en moins : on réduit sans perdre en lisibilité |
| Couleur | blanc `#FFFFFF`, majuscules désactivées | lisibilité ; les majuscules sont réservées au style karaoké |
| Contour | **3 px** à 51 px (4 px à 69 px) | voir ci-dessous |
| Ombre | trois décalages noirs à 150/255 (0,3), (2,2), (-2,2) | ajoute de la profondeur sous le contour |
| Largeur du bloc | 85 % | fenêtre étroite mesurée, voir section 4 |
| Cartes | 5 mots au plus | voir section 4 |

Le moteur livré garde ses valeurs par défaut (Arial Bold 3,6 %, 57 %, contour 4, largeur 84 %, 6 mots) :
elles ne sont PAS le réglage validé. Pose ces six champs dans le blueprint (modèle : le fichier
`sous_titres_fr.py` du dossier `recettes/` du moteur).

- **Plus petit peut se lire plus GROS.** Choisis la police en COMPOSANT les candidates sur une
  vraie image du film et en regardant, pas par affirmation.
- Candidates écartées : **Arial Black** (elle crie, ses contrepoinçons se ferment aux petites
  tailles) ; **Helvetica Neue et SF** (des `.ttc` ou variables : PIL prend l'index 0, un Regular,
  sans prévenir).
- **Le contour est en PIXELS, calibré pour un texte de 69 px.** Baisser la taille sans le baisser
  étouffe les contrepoinçons : 4 x 51 / 69 = 2,96, donc 3. Si tu changes la taille, recalcule :
  `contour = round(4 x taille_px / 69)`.
- **Pourquoi un contour : un texte se lit par le POURTOUR de la lettre, pas par le fond derrière.**
  Le blanc sans contour casse sur certains fonds (herbe claire, vêtement clair, peau).
- **Mesure du contour sur le fichier ENCODÉ, jamais dans le dessinateur** (c'est l'encodeur H.264
  qui décide si un liseré fin survit). Part du pourtour de la lettre qui ne tient pas le contraste
  3:1 du grand texte, sur le pire sous-titre : **33,5 % sans contour, puis 21,0 / 11,5 / 5,4 / 0,0 %
  à 1, 2, 3 et 4 px**. 5 px n'apporte rien et commence à fermer les contrepoinçons. Résultat :
  médiane des cartes de 6,0 % vers 0,0 %, pire carte de 33,5 % vers 0,8 %, aucune carte n'empire. Sur
  un fond clair uniforme (le pire fond pour du blanc), le pire cas passe de 68,7 % sans contour à
  2,6 % à 4 px.
- **Méthode de cette mesure** (pour la refaire). Pour chaque point du contour EXTÉRIEUR de
  l'empreinte du texte, prends le plus SOMBRE rencontré dans les 4 px suivants vers l'extérieur et
  compare-le au plancher 3:1 (blanc contre une luminance relative de 0,30, règle du grand texte
  WCAG). Trois pièges : (1) mesurer « le fond dans la boîte du texte » ne bouge pas quand on
  répare le défaut, donc ne mesure pas le défaut ; (2) un anneau de 2 px pris autour du masque de
  la lettre attrape l'anticrénelage de la lettre elle-même (du blanc qui appartient au glyphe) :
  exclus toute l'empreinte, glyphe, anticrénelage et ombre, avant de regarder dehors ; (3) **le
  masque de référence est l'objet AVANT le correctif** (contour forcé à 0, le même des deux
  côtés), sinon le contour tombe dans l'empreinte exclue et tu caches ce que tu cherches. Un
  **témoin positif** sur la mesure elle-même : le coeur du glyphe doit être CLAIR dans l'image
  extraite, sinon le masque ne tombe pas sur le texte.
- **Boîte** (option) : fond plein derrière chaque ligne (rayon 0,34 et marge 0,42 fois la taille), par
  exemple une boîte blanche à texte `#111111` pour un hook « capture d'écran ».

### Les styles alternatifs (à utiliser avec discernement)

| Style | Description | Quand |
|---|---|---|
| A | boîte arrondie aux couleurs de la marque, texte blanc, 3 à 7 mots ; vers 62 à 70 % (centré en démo muette) | la marque a une identité de couleur |
| B | boîte noire à 60-70 % d'opacité, texte blanc, mot clé en jaune ou gras ; vers 72 à 80 % | universel, quand tu hésites |
| C | karaoké : MAJUSCULES, blanc à fin contour noir, mot dit encadré de ROUGE, 1 à 4 mots ; vers 74 à 82 % | démo en direct, film long, énergie maximale (horodates mot à mot) |
| D | blanc avec mots clés de couleurs différentes (jaune bénéfice, rose marque, vert prix) ; **décrit, non codé** : `captions.py` propose `valide`, A, B, C et E seulement | film long dense à parcourir |
| E | un seul sous-titre tenu toute la vidéo, un peu plus petit, boîte A ou B, bas-centre | format cadeau ou identité, un seul message |

Animation discrète seulement : pop-in (échelle 0,9 vers 1,0 plus fondu sur environ 5 images) ou
simple changement du mot encadré. Pas de glissement, de rotation ni de machine à écrire : ça lit
« bon marché ». Les tailles de 7 à 9 % de la hauteur parfois vues pour ces styles ne sont pas appliquées ici : la
règle est 2,70 % (« pas de sous-titres trop gros »).

## 3. Le piège du repli silencieux de police

- **Une table de polices avec un repli par défaut est un repli SILENCIEUX.** Un nom absent de la
  table ne lève rien : le film sort en Arial pendant que le blueprint annonce Verdana. Toute police
  écrite quelque part s'ajoute d'abord à la table. Le même piège existe si le chargement de la
  police est entouré d'un `try ... except: load_default()` : un fichier introuvable donne une
  police par défaut minuscule, sans message. L'outil `captions.py` de ce skill refuse de continuer
  si la police n'existe pas.
- **Le témoin doit SÉPARER les deux hypothèses.** Mesure la largeur du texte blanc de la carte dans
  le fichier LIVRÉ (853 px) contre les deux prédictions (855 px pour Verdana, 728 px pour Arial :
  127 px d'écart, aucune ambiguïté), jamais contre la seule qu'on espère. Un contrôle qui
  confirme ce qu'on espère ne prouve rien.
- La même famille de piège en HTML/CSS : un nom de police CSS qui ne se résout pas tombe en
  serif, et une largeur qui tombe juste (155 px contre 154 visés) peut être un FAUX VERT. Croise
  la largeur ET la hauteur sur plusieurs chaînes de polices, et REGARDE.

## 4. Découper en cartes : mots faibles, orphelins, longueur

Un sous-titre n'est PAS un plan. La piste texte est découpée sur les mots horodatés :
**5 mots ou 1,8 s au plus** par carte, 3 mots au moins, avec ces garde-fous.

- **Ne jamais couper après un mot faible** : article, préposition, pronom, élision, conjonction
  (le la les un une des du de et ou a à au aux en dans sur sous pour par avec que qui quoi ce
  cette ces mon ma mes ton ta tes son sa ses je tu il elle on nous vous ils elles ne pas plus
  très est mais car donc), tout jeton de **deux caractères ou moins**, et tout jeton qui se termine
  par une apostrophe. Si la carte se ferme sur un mot faible, recule d'un mot.
- **Jamais de carte orpheline de un ou deux mots** : si moins de 3 mots restent en fin de plan,
  ils rejoignent la carte précédente.
- On coupe après un mot qui finit par `. ! ? ; :` dès que la carte a 3 mots.
- Une carte plus courte que 0,12 s disparaît ; la dernière carte d'un plan tient jusqu'à la fin du
  plan, et pendant une transition elle se prolonge de la durée du rab pour ne pas s'éteindre en
  plein fondu.
- **`mots_max` est le vrai levier contre les orphelins, pas la largeur.** Mesuré sur un texte :
  **11 orphelines à 6 mots, 4 à 5 mots, 1 à 4 mots**. Mais à 4 mots, un autre texte fabrique des
  coupes après « à », « pas » et « vu » (le mot faible interdit) et sépare « Vous avez 50 » de
  « % de réduction » : mauvais échange. On a retenu **5**.
- **Le retour à la ligne est GLOUTON** : il remplit la première ligne puis déverse le reste.
  Resserrer `largeur_pct` pour chasser un mot orphelin fait donc l'INVERSE de ce qu'on croit.
  Mesuré sur un texte : 68 % donne 7 orphelins, 84 % en donne 1, 85 % zéro, 86 % en refabrique un
  autre. Sur un deuxième texte : 80 à 83 % donnent 3 orphelines, 84 % en donne 2, **85 % une
  seule**, 86 % et plus en donnent 3. 85 % reste le meilleur réglage.
- **Un seuil comparé à des largeurs de MOTS est une marche d'escalier, pas un curseur.** Sur un
  troisième texte, de 82 à 92 % le résultat est identique au pixel près (4 orphelines, carte la plus
  large 872 px). **Balaie un réglage sur les données réelles avant de le régler** : une colonne
  constante veut dire que le levier est ailleurs. Mesure aussi **ce qu'il faudrait** : pour tenir
  sur une seule ligne, les quatre cartes les plus longues demandaient 92,7 %, 93,0 %, 99,4 % et
  **104,5 %** de la largeur de l'image ; même à 2,40 %, une carte reste au-dessus de 95 %. **Aucune
  valeur n'existe** : la deuxième ligne est obligatoire, et la question devient « où la deuxième
  ligne casse ».
- Balaie avec la fonction même du moteur (même police, même taille, même mesure de largeur) : une
  mesure faite à part règle un film que le mp4 ne contient pas. Et le compteur de défauts porte le bon critère : « dernière ligne de 1 ou 2 mots » comptait 4 fautes dont 2 après
  une virgule (un BON endroit) ; avec le critère « jamais après un mot faible », il n'en restait
  qu'une.
- **Le vrai correctif du retour à la ligne est un retour ÉQUILIBRÉ** (choisir où la deuxième
  ligne casse) : un cas restant casse après un article (« Elle garde l'eau glacée pendant / douze heures »).
  Le moteur validé ne le fait pas ; `captions.py` l'offre en option non validée (`--retour
  equilibre`) pour les films nouveaux.
- **Un mot orphelin en fin de PLAN n'est pas réparable par un réglage de sous-titre.** Le repli
  sur mot faible porte un garde qui ne se déclenche pas à la dernière carte d'un plan : un plan qui
  finit sur « et » garde son « et ». Cela se répare en ne coupant plus là, donc en changeant le
  MONTAGE. Dis-le et laisse le choix (ne plus couper après une vraie pause coûte la durée de cette pause et supprime une coupe sèche).
- **Une carte ne doit pas ouvrir sur la fin de la phrase précédente** (« site. Vous avez ») :
  scinde le plan sur une fin de phrase suivie d'un vrai blanc.
- **Les horodates de mots restent ABSOLUES.** Le calcul des cartes soustrait déjà le point
  d'entrée du plan : rebaser les mots dans le blueprint avance chaque sous-titre de cette valeur
  (jusqu'à 3 s sur un plan tardif).
- **Ne poser QUE les champs de style qu'on change.** Le moteur fusionne les défauts avec le bloc
  du montage : écrire les onze champs fige les défauts du jour dans ce montage, et un futur
  correctif du défaut ne l'atteindra jamais.
- **Les cartes ne sont pas dans le blueprint** : elles sont fabriquées au rendu depuis les mots.
  Chercher une clé « cartes » dans le fichier rend 0 partout, et ce 0 ressemble à « pas de
  sous-titres ». Une sonde neuve se valide sur un cas dont on connaît déjà la réponse.

## 5. Ponctuation

- **Une carte qui se ferme sur une virgule est une faute.** La coupure de carte EST déjà la pause :
  la virgule fait doublon et reste suspendue dans le vide. Retire-la ; garde le point, le point
  d'exclamation, le point d'interrogation et la suspension, qui portent du sens. Faute
  fréquente : plusieurs virgules pendantes sur une vingtaine de cartes.
- **Un nombre se sépare de son signe parce que les deux sont COURTS.** « 50 » et « % » sont tous
  deux jugés faibles (deux caractères ou moins) : la carte se fermait sur « Vous avez 50 » et la
  suivante ouvrait sur « % de réduction ». **Soude le jeton EN AMONT**, dans la liste de mots, sans
  toucher au moteur validé.
- **La transcription rend parfois la ponctuation en JETON SÉPARÉ, et ce jeton DISPARAÎT du film
  sans un mot.** Mesuré sur un clip d'ouverture : « là » puis « ? », ce dernier portant 1,06 s
  d'horodatage à lui seul. Il est jugé faible (zéro caractère une fois dépouillé), le repli le pousse
  sur la carte suivante, qui le retire avec son nettoyage de tête. Effet de bord : la carte d'après
  se retrouvait orpheline à deux mots. **Soude le signe au mot d'avant, en amont**, comme le nombre
  et son « % ».
- Attention : le nettoyage du texte retire l'espace avant le signe (`\s+([,.!?;:])`), donc le film montre
  « là? » et pas « là ? ». C'est le seul écart à la typographie française de ce montage ; le
  corriger veut dire ouvrir le moteur. `captions.py` offre `--espace-insecable` (espace
  insécable avant `? ! : ;`, l'espace fine U+202F manquant à Verdana Bold) pour la typographie française.
- **Les élisions** : la transcription rend « L » puis « 'eau », « jusqu » puis « 'à ». Le nettoyage
  les recolle à l'AFFICHAGE, mais le découpage compte et coupe sur les JETONS : une carte se
  fermait sur « jusqu » et la suivante s'ouvrait sur « 'à ce soir. ». Le test de mot faible ne
  rattrape pas (l'apostrophe ouvre le jeton SUIVANT). **Recolle les élisions en un seul mot, en
  amont.**
- Le mot « là? » et les cartes recollées changent le compte de mots : voir la densité biaisée dans
  `grammaire-montage.md`.

## 6. Table de fautes : la plus longue clef d'abord

La transcription fait des fautes plausibles, et un sous-titre est cuit dans les pixels : le mot
faux est définitif.

- **Une table de fautes s'applique EN CHAÎNE, et une règle courte peut détruire l'ancre d'une
  règle longue.** Exemple type : règle 1 `cafe -> café`, règle 2 `lecafe -> le café`. La
  règle 1 passe d'abord sur « lecafe », donne « lecafé », et la règle 2 ne trouve plus rien.
  Aucune erreur levée, un mot faux cuit dans l'image. **Applique la plus longue clef d'abord** (tri par longueur
  décroissante), puis relis le mot dans les CARTES, pas dans la table.
- **Ces corrections se posent APRÈS le regroupement des plans, jamais dedans** : une carte peut
  traverser plusieurs plans regroupés. Elles se rejouent jusqu'au point fixe et lèvent une erreur
  si le découpage bouge. Pour retrouver les cartes, relis la fonction de découpage du moteur par
  les horodates qu'elle rend déjà : ne recopie pas sa boucle, deux copies divergent.
- **Whisper rend des mots FAUX mais plausibles, sans baisser sa confiance.** Cas typiques (un
  mot technique rendu par un mot inexistant, « non ? » rendu « nom ? », « isotherme » rendu « iso
  therme »). La note de confiance mesure la fluidité, pas la vérité : le score allait de -0,15 à
  -0,31, donc bon partout, et aucune alarme ne se lève.
  1. Avant d'incruster, **relis les jetons UN PAR UN** et liste ceux qui ne sont pas des mots
     français ou qui ne tiennent pas dans la phrase. C'est une lecture, pas une métrique.
  2. Remesure avec un modèle PLUS GROS (medium) sur **la phrase entière**, jamais sur le mot :
     une fenêtre de 1,20 s serrée sur le mot donne la pire réponse (« cette jolie gourde dont j'ai »
     au lieu de « cette jolie gourde, non ? »), 2,40 s et 2,80 s sur la phrase entière donnent la bonne. Le modèle tranche un mot par sa phrase,
     couper la phrase retire ce qui décide. Deux fenêtres larges qui disent la même chose sont une
     preuve, une seule fenêtre est une opinion.
  3. **Deux jetons pour UN mot ne se réparent pas par une table mot à mot** : « iso » + « therme »
     devient « isotherme » par un SOUDAGE de la paire en amont. Un soudage qui ne trouve pas sa paire
     doit LEVER une erreur (`if set(soudes) != attendues: raise`) : une correction annoncée qui ne
     s'applique pas est le silence le plus cher du montage.
  4. Corrige le MOT dans la liste de mots, jamais le son, et jamais dans le moteur.

## 7. Couvrir ou effacer des sous-titres déjà incrustés

Une pub finie a ses sous-titres **cuits dans les pixels** : sans traitement, tout remontage porte
deux couches de texte. Trois façons de s'en débarrasser : les **couvrir** (rapide, ci-dessous), les
**effacer** par IA (`adapter-une-pub-concurrente.md`, validé : jamais de fond blanc sur le texte, on
supprime le texte lui-même), ou tourner la pub toi-même.

### Trouver la bande : cherche le TEXTE, pas la boîte

Trois erreurs avant la bonne méthode :

1. **Chercher une boîte SOMBRE** désigne un sac bleu ou une zone rose : tous les sous-titres n'ont
   pas de boîte, ou une boîte translucide.
2. **Exiger la stabilité entre images** rejette tout : une boîte de sous-titre se tait entre deux
   phrases.
3. **Plafonner les pixels clairs à 45 %** rejette le sous-titre PARCE QU'IL EST BLANC : la bande
   monte à 72,8 % de pixels clairs.

Ce qui marche, avec ses seuils mesurés (images au quart de taille) :

- Densité de fronts verticaux nets (`|diff| > 38`) sur les **60 % centraux** de la largeur.
  Mesure : **0,60 sur la bande, 0,04 à 0,06 ailleurs**. Les fronts séparent seuls.
- Part de pixels clairs (> 205) entre **1 % et 92 %** (un ciel blanc remplit la ligne).
- **Recoller les lignes séparées de moins de 3,5 % de la hauteur** : un sous-titre fait deux lignes
  avec un trou (mesuré : texte de 54,2 à 56,2 %, trou, texte de 57,9 à 60,0 %).
- Cherche dans **14 images prises à égale distance**, **chaque image séparément**, puis fais voter
  à **30 %** : un décor ne tombe jamais deux fois au même endroit, un sous-titre si. Ignore le tiers
  haut (c'est le hook) et la bande minimale de 2,5 % de la hauteur.
- **Reconnaître et MESURER sont deux questions.** Le vote strict reconnaît la bande ; pour la mesurer,
  étends-la sur les lignes **SOMBRES ET STABLES** d'une image à l'autre (luminance moyenne sous 60,
  écart-type sous 14, pas plus de 8 % de l'image), puis ajoute 1,2 % de marge : le texte d'une ligne
  et celui de deux lignes n'ont pas la même hauteur (boîte réelle 69,3 à 84,1 %, bande retenue
  74,5 à 81,6 % : sur une seule ligne le texte passait au-dessus du masque). **Sombre ne suffit pas** :
  l'extension descendait jusqu'à 99,4 % de l'image en suivant un décor sombre.
- **Une étendue n'est pas une mesure** : le minimum sur toutes les images est le pire cas de la
  pollution. Prends la médiane.
- **Dessine la bande trouvée sur une image et REGARDE.** Les chiffres disent « bande à 40 % » avec
  l'air convaincu, l'image montre un sac bleu. Mesure la valeur typique, pas le maximum. Cette
  méthode n'est pas infaillible : regarde toujours l'image.

### Couvrir

- `drawbox` (franc, assumé) ou `delogo` (discret, reconstitue depuis les bords, mais il bave si la
  bande est large ; il refuse de toucher le bord : x au moins 1, largeur au plus L moins x moins 1).
- Pose le masque **avant** l'étalonnage et avant les nouveaux sous-titres (on couvre leur texte,
  on traite l'image, on écrit le nôtre par-dessus), et **avant** le mouvement (le cache doit bouger
  avec l'image, puisque leur texte est dans l'image).
- **Un masque par SOURCE, posé sur ses plans.** Des sources différentes portent leur bande à des hauteurs
  différentes (par exemple 86 %, 68 %, 80 % de la hauteur) : une seule valeur ne peut pas être juste partout. Avant de ranger un
  réglage mesuré à la racine, demande combien de fichiers différents il servira. Poser la version
  fine retire la globale, et les curseurs de réglage doivent lire et écrire au même endroit.
- **Ne pose rien tout seul** : la bande est présente sur ~50 % des images seulement ; le détecteur
  dit où il a trouvé et propose, la personne ou toi vérifiez à l'image. Un détecteur faillible se
  livre avec des réglages pour le corriger.
- **Exclus par PROVENANCE ce que ta propre chaîne fabrique** (cartons, cartes, exports) : un carton
  sombre, plat et stable est le cas parfait pour le détecteur (bande de 24,6 à 55,8 %, présente sur
  100 % des images). Aucun seuil ne règle cela.
- **Pendant un fondu, c'est le texte CUIT qui se superpose, pas le tien.** Sur un remontage
  de rushes déjà sous-titrés, presque aucun plan ne porte de mot à nous : les deux textes qui se
  mélangent sont dans les rushes. Compte les cartes avant de diagnostiquer
  (`sum(len(cartes(p)) for p in plans)`). Deux seuls remèdes : masquer le bandeau de CHAQUE plan avant
  le montage, ou une coupe franche. Mais **compte avant de trancher** : si tous les fondus mélangent
  deux textes cuits et que tous les plans en portent un, la coupe franche supprimerait toutes les
  transitions : il n'y a jamais eu deux options.

### Vérifier qu'il reste du texte cuit : un LECTEUR de texte, pas des pixels

- Compter les pixels clairs en bas de l'image ne distingue pas une créa sous-titrée d'un rush propre :
  témoins sous-titrés 0,02 à 0,65 %, candidats 0,00 à 4,96 % (un ciel blanc) : les étendues se
  recouvrent entièrement. **Une mesure dont le témoin positif tombe dans le bruit des candidats ne
  prouve rien.**
- Utilise un moteur de lecture de texte (OCR) : `tesseract` ou `easyocr`. Sortie utile
  par bloc : confiance, hauteur, texte. Selon le moteur, le `y` compte depuis le BAS (0,10 = bas de
  l'image, 0,89 = haut) : vérifie le sens avant de comparer.
- **Passe d'abord le lot CONNU** (témoin positif) : sur les images de créas connues pour être sous-titrées, la grande majorité porte du
  texte lu (par exemple 35 sur 40). S'il ne rougit pas, l'instrument est mauvais, pas le lot.
- **Un lecteur de texte lit aussi le PRODUIT** : le logo imprimé sur un sac est lu sous trois ou quatre
  orthographes inventées selon l'image. Distingue : un logo sur un objet = confiance 0,30 à 1,00, un mot court sans espace, `y`
  au milieu du cadre (0,39 à 0,48), il SUIT l'objet ; une incrustation = confiance 1,00, plusieurs
  mots, ponctuation, `y` fixe en haut ou en bas, stable d'image en image. Contre-contrôle : liste
  tout ce qui est lu à confiance 0,80 ou plus hors la phrase trouvée. Un logo, une plaque, un écran
  de téléphone dans le cadre sont du texte.
- Échantillonne toutes les 0,5 s : sur des clips où un logo reste dans le cadre, presque toutes les
  lignes lues sont ce logo.

## 8. Resynchroniser après tout changement audio

Après TOUT changement audio (`atempo`, voix régénérée, coupes) : re-transcris, re-dérive les cartes,
revalide l'alignement (procédure en 8 étapes dans `controles-et-verification.md`, section 8).

## 9. Contrôles de fin sur les sous-titres (sur le fichier LIVRÉ, pas sur le blueprint)

- Bas du bloc le plus bas, en pour cent de la hauteur (cible : sous 80 %).
- Largeur réelle de la carte la plus longue (visée : moins de 85 % ; mesurée 84,2 %, 81,0 %, 81,7 %).
- **0 ligne orpheline** (dernière ligne de 1 mot après un mot faible), **0 virgule pendante**.
- **Couverture continue** : aucun trou de sous-titre au-dessus de 0,30 s.
- Police réellement ouverte (section 3). Aucun « 50 » séparé de son « % ».
- Chaque carte relue une par une : aucune n'ouvre sur la phrase précédente, aucun mot coupé, aucune
  élision orpheline.
- Puis une planche contact, et on REGARDE.
