# Grammaire du montage d'une pub verticale e-commerce

Règles validées à l'usage sur de nombreuses créas, et mesurées sur des pubs gagnantes
françaises. Chaque règle porte son
pourquoi et sa mesure. Quand une autre mesure donne une valeur différente, ce skill garde la règle
écrite ici et note l'autre valeur en une ligne (section 11).

Tu es monteur, pas assembleur de plans. La barre est une créa qui **vend** : chaque plan gagne
son temps d'écran. Un montage régulier, des sous-titres posés par défaut et une fin qui ne
demande rien sont des **échecs**, pas des livrables.

Les autres sujets ont leur fichier : sous-titres (`sous-titres.md`), voix, musique et bruitages
(`audio-voix-musique.md`), transitions, mouvement, formats, étalonnage
(`transitions-effets-formats.md`), contrôles (`controles-et-verification.md`), pièges ffmpeg
(`pieges-ffmpeg.md`).

## 1. Les mesures

### La mesure de départ (une pub gagnante verticale, mesurée plan par plan)

| Mesure | Valeur |
|---|---|
| Plan moyen | 1,87 s |
| Plan le plus court / le plus long | 0,53 s / 4,00 s |
| Plan d'ouverture | 1,33 s |
| Densité de parole | 3,98 mots par seconde |
| Parole continue | 99,8 % de la durée |
| Silence de plus de 300 ms | 0 |
| Coupe tombant dans un silence | 0 |
| Niveau moyen (RMS) | environ -20,5 dBFS |

### Les pubs françaises gagnantes mesurées en nombre (Meta, TikTok, Reels)

| Mesure | Valeur |
|---|---|
| Format | 9:16 dans 96 % des cas (les autres sont des carrés anciens) |
| Résolution | 720x1280 dans 91 % des cas (les réseaux ré-encodent, 1080x1920 en master est bon, 720 est le plancher) |
| Cadence | 30 i/s dans 79 % des cas, quelques 24 et 25 |
| Durée | moins de 15 s : 7 % ; 15 à 30 s : 14 % ; 30 à 60 s : 51 % ; 60 à 120 s : 25 % ; plus de 120 s : 4 % |
| Durée médiane / moyenne / étendue | 45 s / 54 s / 10 s à 195 s |
| Durée moyenne des plans | médiane 3,0 s, moyenne 5,8 s (tirée vers le haut par les prises uniques) |
| Seaux de rythme (plan moyen) | moins de 1,6 s ; 1,6 à 3 s (le plus fréquent) ; 3 à 6 s ; plus de 6 s |
| Pubs longues | elles ne ralentissent pas : un film de vente long coupe plus vite (médiane 1,9 s) |
| Coupes sur une pause de parole | 0 % |
| Silences de 0,3 s et plus | 0, mesurés à -30 dB et à -45 dB |
| Niveau sonore | RMS de -16 à -22 dB, master fort et compressé, fond sonore continu |
| Coupe franche | environ 95 % de toutes les transitions |

Défaut de durée : 30 à 50 s (50 s au plus), sauf démonstration muette (15 à 25 s) ou film de vente long
(90 à 195 s). La durée suit le format, jamais une règle fixe.

### Les seuils du contrôle (une règle de contrôle, un seuil, une raison)

| Règle | Seuil | Pourquoi |
|---|---|---|
| Ouverture | premier plan de 2,00 s au plus | la pub mesurée ouvre à 1,33 s ; un hook long laisse le temps de glisser |
| Silences | aucun de plus de 0,30 s (mesuré à -45 dBFS) | la pub mesurée en a 0 |
| Coupes | aucune dans un silence | une coupe se pose sur la parole, pas dans le trou |
| Densité de parole | au moins 3,58 mots par seconde (90 % de 3,98) | moins de mots par seconde, moins d'arguments par seconde |
| Longueur | 65 s au plus, garde-fou sur le film fini et non cible : vise 30 à 50 s (le moteur compare à 1,3 fois la durée de la pub mesurée, soit 65,65 s, affichés « 66 s ») | chaque seconde en trop est une occasion de partir |
| Plan de preuve | 2,50 s au moins | sous 2,5 s une preuve ne se croit pas |
| Rafale | moins de 4 plans de suite sous 0,5 s sur le même cadre | ce n'est pas un rythme, c'est un bégaiement |
| Fin | le dernier plan montre la page produit | seul plan qui demande l'achat |
| Texte incrusté | aucun défaut relevé dans le texte cuit | voir la section 8 |
| Rythme | dispersion des durées d'au moins 18 % (6 plans ou plus) | en dessous, le film suit un minuteur |
| Les mots suivent les plans | des paroles réparties sur les plans | sinon les sous-titres sont absents presque partout |
| Mots écrasés | le texte d'un plan occupe plus du quart de sa durée | sinon des horodates relatives ont été prises pour absolues |

## 2. La durée du plan dit ce qu'on veut faire croire

Mesure sur la pub gagnante de départ : les plans **les plus courts** (0,53 s à 0,83 s)
tombent sur la répétition du nom du produit et sur les relances de l'intervenant. Les plans **les
plus longs** (3,30 s à 4,00 s) tombent sur la macro du produit en usage, c'est-à-dire
sur la démonstration du mécanisme.

- Le plan **raccourcit sur la marque** (0,53 à 0,83 s) et **s'allonge sur la preuve** (3,30 à
  4,00 s). On accélère sur ce qu'il faut **retenir**, on ralentit sur ce qu'il faut **croire**.
- **Un plan de preuve sous 2,5 s est presque toujours une faute** : l'oeil n'a pas le temps de
  vérifier ce qu'on lui montre, donc il ne le croit pas. Une coupe rapide sur une démonstration
  détruit la démonstration.
- Avant de fixer la durée d'un plan, demande ce qu'il doit obtenir : retenir veut dire court,
  croire veut dire long.
- La durée moyenne d'un montage n'est pas un objectif, c'est un résidu.
- Les formats d'ouverture muette (démo silencieuse, montage rapide de produits) ouvrent chargés
  (3 à 5 coupes en 3 s) : sans phrase à tenir, c'est le mouvement qui fait le hook.

## 3. L'ouverture (le hook)

- **Ouverture à environ 1,3 s.** Jamais un plan fixe de parlant : le hook se construit.
  Seuil d'alerte : 2,00 s.
- **Le hook ne porte aucune transition** (3 premières secondes en coupe franche) : il doit
  frapper, pas glisser. Cinq flashs dans un film sont un tic.
- **Règle retenue pour l'ouverture.** Une autre mesure, sur un corpus de pubs gagnantes, donne
  60 % de films sans aucune coupe dans les 3 premières secondes (premier plan médian de
  3,48 s), donc « un plan unique tenu de 3 à 4 s » : ce skill n'applique pas cette valeur. Il vise
  un premier plan de 1,3 s avec un seuil à 2,00 s, mesuré plan par plan sur une pub gagnante.
  Ce que les deux approches partagent : **ne jamais mitrailler le début** et ne mettre aucune
  transition dans le hook.
- **Un hook trop long est souvent une contrainte de la matière, pas du montage.** Exemple :
  si la phrase parlée du clip d'ouverture dure 3,7 s, le hook dure 3,7 s ; il ne redescend vers 1,4 s
  qu'avec un clip d'ouverture plus court. Le couper après sa première
  phrase est un choix qui change le montage : dis-le à la personne, elle tranche. La vraie
  réparation est un clip d'ouverture plus court.
- **Hook, puis corps** : le style de sous-titre du hook peut être volontairement différent du
  corps (par exemple un encadré blanc arrondi au texte noir avec un pictogramme en haut, contre le
  blanc fin du corps). Le changement de style signale « témoignage », pas « publicité ».
- **L'écran scindé meurt avec le hook** : il attrape puis il lâche.

### Hook × 3 + corps : le raccord

Quand tu montes plusieurs variantes de hook devant un même corps, chaque hook doit se brancher
naturellement sur la première phrase du corps. Trois fautes :

1. **Redondance** : le corps répète ce que le hook vient de dire (le public décroche).
2. **Décrochage** : le hook promet A, le corps parle de B (saut narratif).
3. **Question sans réponse** : le hook pose une question que le corps ne reprend jamais.

Trois raccords valides : le hook est un **teaser** et le corps le **résout** ; le hook est une
**situation** et le corps l'**explique** ; le hook est un **fait chiffré** et le corps
**démarre le « mais pourquoi »**. Réparations quand les hooks varient sur un corps unique : un
mini-pont d'une phrase par hook, ou un corps qui s'ouvre sur un connecteur générique (« Bon,
voilà ce qui se passe... »), ou des hooks qui visent tous le même point de départ.
Test avant livraison, pour chaque variante : le hook tient seul en 6 s ; le corps ne le répète
pas ; il le continue ou y répond ; lu à voix haute, le passage sonne naturel.

## 4. Couper sur la parole, jamais dans un silence

- **Zéro coupe dans un silence.** On coupe sur la parole. Confirmé par une source indépendante :
  poser le B-roll par-dessus l'audio du A-roll, pas dans le silence.
- **Couper sur l'information, pas sur les pauses** : 0 % des coupes d'un corpus de pubs gagnantes
  tombent sur une pause de parole. La voix est un fleuve continu, l'image change quand le
  **sens** change : nouvelle affirmation, nouveau plan ; produit nommé, plan produit ;
  problème nommé, plan du problème ; bénéfice nommé, macro de ce bénéfice. Méthode : transcris,
  marque chaque idée nouvelle, cet instant est une coupe.
- **Jamais de coupe au milieu d'une phrase** (défauts typiques : une coupe en plein milieu d'une phrase, ou un mot doublé par la coupe).
- **Les bornes d'un plan se prennent sur la parole**, pas sur le fichier. Valeurs resserrées et
  validées : du premier mot moins 0,12 s au dernier mot plus 0,18 s, avec une queue de 0,13 s
  pour le hook, qui coupe sur le mot. Des bornes plus larges (moins 0,50 s, plus 0,35 s) laissent
  des trous que le contrôle compte ensuite comme des silences (à matière égale, le montage resserré
  est presque deux fois plus court).
- **Segmente sur l'enveloppe du son, demande à la transcription le texte seul.** Une horodate de
  mot n'est pas une mesure du son (détails et chiffres dans `controles-et-verification.md`).
- **Un trou interne se coupe en scindant le plan** (même source, deux points d'entrée). Le saut
  d'image s'habille d'un zoom de 1,05 à 1,06 sur le second morceau : le geste change de part et
  d'autre, la coupe se lit comme un montage et pas comme une erreur.
- **Ne recolle pas des zones de parole pour allonger un plan de preuve** si cela réintroduit un
  silence de plus de 0,30 s : des pauses de 0,36 s à 0,46 s sont la respiration du
  clip. Le recollage donne un écart pire sur une règle plus dure. On coupe la pause, le fragment
  reste court, et on le dit.
- **Une pause de 0,28 s ou 0,38 s qui tombe sur une virgule est du débit, pas du vide** : ne la
  coupe pas.
- **Une transition rogne la fin du plan qu'elle quitte** : si le clip parle jusqu'à sa dernière
  image, la transition mange le dernier mot. Voir `transitions-effets-formats.md` (rab et réserve).

## 5. Zéro silence de plus de 300 ms, environ 4 mots par seconde

- **Zéro silence de plus de 300 ms.** Couverture de parole d'environ 99,8 % sur la pub mesurée.
  Un montage UGC resserré ne laisse aucun silence de 0,25 s et plus, avec une part active qui
  approche ces 99,8 %.
- **Une prise brute contient 20 à 35 % de pauses et de mots de remplissage.** Les retirer est la
  plus grosse amélioration de rythme. Si un
  montage semble lent, resserre d'abord la voix, n'ajoute pas de transitions.
- **Environ 4 mots par seconde** (3,98 sur la pub mesurée ; 3,4 à 4,1 sur un montage resserré).
  Au-dessous de 3,58, le contrôle lève un écart.
- **Le compteur de densité est biaisé à la baisse** : recoller des élisions (« l' » + « eau »)
  ou souder des jetons retire des jetons sans retirer un mot dit. Exemple : 3,06 puis 2,81 mots
  par seconde sans qu'une seule image change. Un chiffre qui bouge quand seule la
  tokenisation change ne mesure pas le film. La vraie densité se joue à l'écriture du script.
- **Le débit de voix et le budget de mots** (pour 30 à 50 s) sont dans `audio-voix-musique.md`.

## 6. Le montage métronomique est un défaut

- Un montage dont tous les plans font la même longueur n'obéit à aucun texte, il obéit à un
  minuteur. Des coupes uniformes d'une seconde sont un échec, pas un livrable.
- **Seuil mesuré** : si l'écart-type des durées rapporté à leur moyenne tombe sous **18 %** (sur
  6 plans ou plus), le film est plat. Coupes jusqu'à 0,2 s quand l'énergie du texte l'exige,
  jamais imposées.
- **Rafale** : 4 plans de suite sous 0,5 s sur le même cadre est un bégaiement.
- **Ne rebaptise jamais le rôle d'un plan pour faire passer une règle.** Scinder un plan de
  preuve donnait un morceau de 1,5 s sous le minimum : la sortie honnête est de couper le
  fragment, pas de l'appeler autrement.

## 7. Durée du film et budget de mots

- Une vidéo UGC pour Meta vise **30 à 50 s, 50 s maximum**. Au-delà, le taux de clic et le coût
  par clic s'effondrent (attention perdue au défilement). Le point d'équilibre est 30 à 45 s.
- Budget de mots d'une voix off : **75 mots pour 30 s, 100 mots pour 40 s, 125 mots pour 50 s**.
  Plafond absolu : 125 mots par script. Voix humaine française : 140 à 160 mots par minute en
  lecture posée, 170 à 200 en UGC dynamique.
- Valider : écrire à 100 mots cible, générer la voix, **mesurer la durée réelle**
  (`ffprobe -i voix.mp3 -show_entries format=duration -v quiet -of csv="p=0"`). Plus de 50 s :
  couper 10 à 15 mots (les phrases adverbiales d'abord). Entre 35 et 50 s : valider. Moins de
  30 s : ajouter 10 à 15 mots (un raccord narratif).
- Gabarit d'un script de 40 s (100 mots, six beats, une à deux phrases courtes chacun) : 0-3 s hook qui interrompt ; 3-8 s identité et crédibilité ; 8-15 s problème viscéral ; 15-25 s
  mécanisme unique ; 25-35 s bénéfice tangible chiffré ; 35-40 s appel urgent et lien.
- Le français sans les blancs est plus court que l'original : une narration traduite tient en
  environ un sixième de temps en moins une fois les pauses resserrées.
- Une version courte se prend dans la mise en confiance du début : propose-la, ne l'impose pas.

## 8. La fin demande l'achat

- **La fin demande l'achat.** Une pub gagnante finit sur une **capture réelle de la page
  produit** : « lien en description », prix barré puis prix remisé, offre limitée, note, nombre
  d'avis. C'est le seul plan du film qui demande quelque chose.
- **Ce qui prouve la règle** : un film peut passer toutes les mesures de rythme et ne jamais demander
  l'achat. Seule la planche contact le montre : un noir, un plan d'ambiance, un paysage ou un geste
  sans lien avec l'offre n'appellent rien. Aucune métrique de rythme ne peut le détecter.
- **Ne jamais inventer un prix, une marque ou un avis.** Une capture réelle de la page produit
  est demandée à la personne ; sans elle, la fin ne montre ni prix ni avis et on le dit.
- **Un gabarit non rempli peut partir en production** (un texte du type « Commandez vite
  sur **!!!** » parce que le nom de marque n'a jamais été renseigné). Avant de
  livrer, cherche `!!!`, les accolades `{...}`, les crochets, les « XXX » dans le texte incrusté.
- **Carte de fin** : logo ou page produit ou offre, plus un appel à l'action dur, sur les 1 à 3
  dernières secondes. Jamais un fondu vers rien. Le logo est le **vrai fichier** de la marque :
  jamais le nom retapé dans une police (le nom retapé ne ressemble jamais au vrai logo).
- **Un modèle d'image ou de vidéo ne colle pas un asset, il le repeint.** Une carte composée en
  HTML puis donnée à un générateur vidéo peut ressortir avec une lettre changée (un « e » devenu
  « o » dans un mot) en grand pendant tout le plan. Tout texte, prix, note ou nombre d'avis qui traverse un modèle se relit au grain
  (recadré, agrandi, ligne par ligne). Si la zone est fixe (la même boîte sur de nombreuses images
  réparties), elle se remplace par un calque fixe au même endroit, sans toucher le son.
- **Texte d'une pub traduite** : cherche avant de livrer le chiffre `1` là où l'on attend « un »
  ou « une » (« c'est 1 gourde pratique »), les unités anglaises non converties (des « inches » à la
  place de centimètres), une coupe au milieu d'un mot (« les gour / des »), « Before / After » en
  anglais à côté d'un « AVANT / APRÈS ». Si la transcription de la voix écrit bien « une », le défaut
  est dans la chaîne de sous-titrage, pas dans la voix.
- **Un montage qui n'a pas de capture de page produit** (la voix demande l'achat, la règle est
  tenue, mais la fin ne montre ni prix ni avis) : rien n'est inventé et rien ne le sera sans une
  vraie capture. Dis-le dans le compte rendu.

## 9. Un sous-titre n'est pas un plan

La piste texte a sa propre granularité : environ 5 mots ou 1,8 s, découpée sur les mots
horodatés. Ne jamais couper après un mot faible ni laisser une carte orpheline de un ou deux
mots. Où le poser, avec quelle police et à quelle taille : `sous-titres.md`, qui est mesuré.
Un plan de 3 s porte souvent 3 cartes.

## 10. Structure canonique et formats de montage

Une pub UGC moyenne (le cas des 51 % entre 30 et 60 s) :

```
0:00-0:03  HOOK. Visage et affirmation, ou visuel du problème. Sous-titre dès la première image.
0:03-0:12  Douleur et contexte. Parlant, éventuellement un insert du problème ou une incrustation.
0:12-0:22  Solutions qui ont échoué. Réaction, produit "méchant" montré (l'ancien produit).
0:22-0:35  Révélation et mécanisme. Produit en main, macro, démo. Le rythme se resserre vers 2 s.
0:35-0:48  Preuve. Avant/après, preuve sociale, plusieurs usages.
0:48-fin   Appel à l'achat. Carte de fin : logo ou page produit ou offre, 1 à 3 s.
```

Un film de vente long étire le milieu (mécanisme et preuve). Une démo muette ne garde que la
liste des bénéfices.

### Les 9 archétypes de montage (choisis-en un, puis exécute-le)

| # | Archétype | Plan moyen | Sous-titre | Quand |
|---|---|---|---|---|
| 1 | Parlant selfie, avec démo (le défaut) | 2 à 3 s | boîte couleur de marque ou karaoké | produit à angle personnel : beauté, bien-être, vêtement |
| 2 | Prise unique UGC | la prise | persistant en bas | créatrice charismatique, budget bas : l'édition est invisible (pauses retirées, punch-ins, sous-titres) |
| 3 | Parlant alterné avec B-roll | 1,3 à 2 s | blanc sur noir | produit au détail tactile : on dit la ligne, on montre la macro, on revient |
| 4 | Démo silencieuse en macro | 1 à 1,5 s | boîte de marque centrée | usage évident et satisfaisant : 15 à 25 s, ouvre chargé |
| 5 | Montage rapide de produits avec flashs | 0,8 à 1,3 s | minimal + capture du catalogue | variété : preuve sociale d'abord, essais, écrans de catalogue et prix |
| 6 | Explication avec accessoires ou tableau blanc | 3 à 4 s | blanc sur noir | produit à mécanisme à expliquer (métaphore bricolée, puis parlant, B-roll, avant/après) |
| 7 | Démo en direct (« test au marqueur ») | prises longues | karaoké rouge | une promesse que l'on prouve physiquement en direct |
| 8 | Cadeau émotionnel, sous-titre persistant | environ 2 s | un seul sous-titre tenu | produits cadeau ou identité : émotion pure, pas de mécanisme |
| 9 | Film de vente long | 1,4 à 2,4 s | karaoké ou multicolore | panier moyen élevé, 90 à 195 s : (a) empilement de témoignages, (b) porte-parole avec pile de preuves |

Structure de chaque archétype (ce qui change d'un montage à l'autre) :

1. **Parlant selfie** : hook tenu (visage et « comme moi vous avez X ») ; douleur ; le produit « méchant »
   montré (l'ancien produit, celui qui a échoué) ; le héros révélé ; démo en usage (geste,
   ajustement) ; sous-titre d'appel. Selfie à la main ou téléphone calé, hauteur des yeux, moyen-serré,
   intérieur à la lumière de fenêtre. Couper à chaque nouvelle affirmation, insérer 1 à 2 macros produit.
2. **Prise unique** : une prise continue où la créatrice parle et démontre (ajuste, montre, lève le produit
   au moment de la preuve), presque aucune coupe dure ; téléphone calé, hauteur des yeux, moyen, un seul
   décor ; sous-titre persistant plus petit en bas. Elle paraît rapide parce que la voix est serrée et qu'un
   punch-in relance l'oeil toutes les 5 à 8 s.
3. **Parlant et B-roll** : la ligne sur le visage, la preuve en macro (matière, détail, usage), retour au
   visage : A/B/A/B serré. Le parlant peut être en extérieur (promenade) ; la macro est au plus près.
4. **Démo muette** : pas de visage ; problème, produit, chaque usage en plan rapide, carte logo. Vue de
   dessus ou par-dessus l'épaule sur les gestes, clair et net, son d'ambiance du produit. Sous-titres
   déclaratifs courts (« En 2 secondes c'est fait »), ouverture chargée.
5. **Montage rapide** : preuve sociale (des gens réagissent) ; essais enchaînés, une variante par plan ;
   écrans de catalogue avec les prix ; appel. Éclat blanc ou doré entre les temps forts (signature du
   format), plans moyens fixes, fin sur une capture d'écran du catalogue.
6. **Explication** : une métaphore bricolée d'abord (gobelets d'eau colorée, schéma dessiné
   à la main), puis le parlant, la démo en B-roll, l'avant/après scindé, l'appel. Décor volontairement
   bricolé ; la voix reste serrée même si l'image respire.
7. **Démo en direct** : prises longues où la personne fait la preuve devant la caméra (montre le produit en usage, avant
   puis après), fixe, plan large, un seul décor ; ton anti-marketing « regarde
   pour de vrai » ; l'action physique tient l'attention.
8. **Cadeau émotionnel** : un large d'ouverture (silhouette à l'heure dorée) tenu plus longtemps, puis des
   plans de manipulation du produit (emballage qui s'ouvre, doigt posé sur le produit) ; caméra à la
   main, intime, étalonnage chaud ; une seule phrase tenue à l'écran.
9. **Film de vente long** : (a) empilement de témoignages, un créateur par plan (environ 2,3 s) sous un
   sous-titre unique, fin sur une grille d'avant/après ; (b) porte-parole entrecoupé d'une pile de preuves
   (science, fabrication, démo, avant/après) et de cartes graphiques (calcul d'économie, schéma de fabrication),
   sous-titres multicolores, coupes à 1,4 s pour tenir trois minutes.

### Grammaire de prise de vue et de séquence

La caméra est volontairement « amateur » : un luxe visuel se lit comme une pub et tue la
confiance.

- Caméra : trépied improvisé ou téléphone calé, ou selfie à la main. Hauteur des yeux, de face.
  **Pas** de drone, de gimbal, de pull focus ni de travelling. Le seul « mouvement »
  permis est un punch-in ajouté en post. Lumière disponible (fenêtre, jour). Décors réels :
  chambre, salle de bain, cuisine, voiture, promenade, un ou deux lieux au plus.
- Vocabulaire de plans : selfie moyen-serré (hook, affirmations, émotion) ; miroir moyen
  (essayage) ; macro (preuve, mécanisme) ; vue de dessus sur les gestes (démo) ; démo sur le corps ;
  avant/après scindé ; accessoires ou tableau blanc ; large émotionnel (cadeau) ; capture d'écran
  (catalogue, site, avis, prix) ; carton graphique (calcul de prix, logo, carte de fin).
- Séquence : (1) le hook est tenu, pas mitraillé ; (2) **chaque nouvelle phrase ou affirmation
  change le plan**, au rythme d'un plan de 2 à 3 s dans le corps ; (3) alterner parlant et B-roll quand
  le produit a du détail ; (4) **montrer le méchant avant le héros** (l'ancien produit, l'objet qui échoue, le problème), deux plans
  d'affilée ; (5) un plan de réaction de 1 à 2 s (soulagement, yeux fermés) vend le résultat ;
  (6) la preuve se regroupe vers la fin, avec des coupes plus serrées ; (7) la carte de fin est
  dans les 1 à 3 dernières secondes.
- **B-roll posé sur la voix** : la voix est enregistrée en continu et resserrée, puis les images
  sont posées dessus, coupées sur le sens des mots, sans jamais suspendre la voix pour une coupe.
- **Éditer une prise unique** : pauses retirées (jump cuts à image identique, 20 % plus court),
  punch-in de 1,00 à 1,08 sur environ 6 images aux mots d'emphase (tous les 5 à 8 s), sous-titres.
- **Incrustation « problème »** (hook parlant) : une petite image du problème ou de l'avant dans
  un coin pendant que la personne nomme le problème (voir `transitions-effets-formats.md`).

## 11. Valeurs rencontrées ailleurs, que ce skill n'applique pas

| Sujet | Valeur rencontrée ailleurs | Règle retenue ici |
|---|---|---|
| Ouverture | plan unique tenu 3 à 4 s | environ 1,3 s, seuil 2,00 s ; pas de mitraillage |
| Taille et hauteur des sous-titres | 7 à 9 % de la hauteur, vers 62 à 82 % | 2,70 % en Verdana Bold, haut du bloc à 74 % |
| Niveau de la musique | -24 à -30 dB, ou -28 dB absolus dans un éditeur | rapport voix/musique mesuré, 12 dB validé |
| Format de livraison | 9:16, 720x1280, 30 i/s toujours | le format et la cadence de la source |
| Durée d'une transition | flash de 0,12 s, fondu de 0,25 s | se compte en images : 8 à 9 images |

Les détails de chaque ligne sont dans le fichier du sujet.
