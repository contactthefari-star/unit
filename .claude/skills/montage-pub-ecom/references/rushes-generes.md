# Fabriquer les rushes par IA : avatar, images, clips parlés

Place dans la chaîne : script validé, storyboard validé (`storyboard.md`), PUIS ce fichier, puis le montage. Ne génère rien avant la validation du storyboard.
Temps sur une pub parlée : 50 % sur l'image de référence de l'avatar, 25 % sur la mise au point du prompt vidéo, 25 % pour dérouler le script. Pourquoi : une bonne image de départ évite la plupart des clips ratés, et coûte bien moins qu'une vidéo qui déraille.

## 1. Deux routes, et l'argent

| | Route A : abonnement Google | Route B : clé API payante |
|---|---|---|
| Comment | Google Flow (flow.google.com) dans TON navigateur : Claude Code écrit les prompts numérotés dans un fichier, tu les colles | Claude Code appelle l'API : Google AI Studio (images, voix, Omni), OpenRouter (Seedance, Kling). Omni vidéo passe par l'API « Interactions » (relevé 2026 : POST /v1beta/interactions, tâche image_to_video) : fais lire la page Omni de la documentation Gemini avant l'appel |
| Coût | ton abonnement : AI Pro environ 19,99 $/mois (1 000 crédits Flow), AI Ultra environ 249,99 $/mois (10 000), relevé en août 2026 | paiement à l'usage |
| Limite | manuel ; les crédits Flow ne se dépensent pas par l'API (abonnement et API ne se cumulent pas) | une clé à créer, un budget à surveiller |

> **ÉTAPE PAYANTE (route B) : génération d'images et de vidéos par IA.**
> **À quoi ça sert** : fabriquer l'avatar, les images de départ, les clips parlés et le B-roll.
> **Quelle clé** : Google AI Studio (aistudio.google.com) pour Nano Banana Pro et Omni ; OpenRouter (openrouter.ai) pour Seedance et Kling. Crée-la en suivant `CLES.md`. Les scripts la lisent via `outils/charge_cles.py`, jamais en dur.
> **Combien** : « Mets 10 € de crédit : ça suffit largement pour deux à trois lots d'essai (4 images + 3 clips de 8 s, environ 3 $ chacun), ou pour une pub parlée complète avec quelques reprises (environ 6 $ sans reprise). » ESTIMATION faite sur les prix de liste en fin de fichier ; vérifie le prix affiché sur la page de facturation avant de payer.
> **Garde-fou** : avant TOUT lot, Claude Code annonce le nombre de générations et le coût total sur une ligne dédiée, puis ATTEND ton « oui » dans un message séparé. Il ne lance jamais un lot payant tout seul.
> **Alternative gratuite** : la route A.

Règles d'argent :
1. Palier le MOINS cher qui fait le job à qualité acceptable, choisi du premier coup (tester trois paliers coûte plus). Couper un script local n'annule pas la facturation côté serveur : vérifie le compte.
2. Coût vérifié AVANT ; un lot = confirmation sur le chiffre total, dans un message à part.
3. Réutilise avant de régénérer ; un plan statique animé en zoom lent avec ffmpeg est gratuit.
4. Brouillon pas cher pour chercher, qualité finale pour livrer ; si le plan est assez cadré pour sortir du premier coup, lance directement la qualité finale (brouillon puis final coûte plus cher).

**Route A en pratique (Flow)** :
1. UN projet Flow par produit, nommé d'après lui ; jamais deux produits dans le même. Note son adresse dans `FLOW_PROJET.txt`.
2. Images : mode Image, Nano Banana Pro, 9:16. Vidéos : mode Vidéo, **Omni 1.1 Flash**, 9:16, une génération à la fois. Lis le libellé du modèle AVANT de cliquer « Générer ».
3. Références : avatar d'abord, puis produit, puis photo de style, numérotées dans le prompt (« Reference image 1, 2, 3 ») dans l'ordre où tu les attaches. Flow les vide après chaque envoi : rattache-les. « Ajouter au prompt » joint l'élément SURLIGNÉ, pas forcément celui que tu as cliqué.
4. **L'image de départ d'un clip est la version GÉNÉRÉE par Nano Banana Pro, pas la photo importée** : les deux se ressemblent, c'est le but ; compare leurs identifiants, jamais à l'œil. Partir de la photo, c'est publier celle d'un tiers et perdre une génération.
5. Prompt de 3 000 caractères au plus (au-delà, l'envoi échoue sans message clair).
6. Télécharge chaque rush dans le dossier du produit, nommé plan-version. Annonce le nombre de générations avant de lancer, même en illimité.

## 2. Les modèles retenus, leurs défauts

**Images : Nano Banana Pro d'origine**, pas Nano Banana 2 ni GPT Image 2 : un modèle plus ancien garde plus d'imperfections, GPT Image 2 est « trop parfait » pour un avatar.

**Vidéo : Omni 1.1 Flash, jamais Veo** (même pour un essai), parce qu'Omni garde le personnage d'une retouche à l'autre.

| Paramètre | Valeur |
|---|---|
| Durée par appel | 3 à 10 s, entière ; sans durée écrite : 3 s générées et facturées |
| Prolongation | tranches de 10 s jusqu'à 40 s (relit les 10 dernières secondes). Édition et prolongation d'une vidéo téléversée : indisponibles dans certains pays selon la région du compte (vérifie pour ton pays de lancement) |
| Définition, cadence | 720p natif (1080p et 4K = agrandissements), 24 images par seconde. Brouillon 360p : un tiers du prix, 60 % plus rapide |
| Références | 3 clips de 3 s au plus ; images par balises `<IMAGE_REF_N>` ; `<FIRST_FRAME>` et `<LAST_FRAME>` pour une transition contrôlée |
| Audio | natif, synchronisé, piste dans le MP4 |
| Négatif, instruction système, température | n'existent pas |
| Dialogue | moins de 20 mots pour une synchro labiale propre |

Balises relevées à la documentation du 3 septembre 2026 : vérifie-les.

**Trois défauts d'usine qui ruinent une créa si on ne les écrit pas dans le prompt** :
1. Il fabrique un mini-récit en PLUSIEURS plans même pour une action continue : écris « single continuous shot, no scene cuts ».
2. Si tu ne dis rien du son, il invente une MUSIQUE : demande le silence explicitement (« music: NONE »).
3. Le 720p natif tue toute interface dans le cadre (écran de téléphone illisible, déformé) et **le texte généré est toujours faux**. Méthode : génère un APLAT vert uni sur l'écran, puis incruste la vraie capture au montage (détails : `storyboard.md`, section 5). **Le modèle fabrique les PLANS, le montage fabrique le TEXTE.**
Faiblesses ouvertes : cohérence complète, mouvement complexe, texte exact. Tous les avatars Omni ont la même dentition : pas de gros plans de sourire sur plusieurs avatars d'une même série.

**B-rolls sans avatar** (Seedance, Kling, par OpenRouter en route B) : **toujours une image de départ validée** (un clip tiré d'un texte seul sort de bien moins bonne qualité). Seedance 2.0 : 480p pour chercher, 720p pour livrer ; la 1.5 Pro est écartée (qualité insuffisante à l'essai). Kling dézoome mal (génère le zoom avant, inverse avec ffmpeg), ajoute une vapeur factice toujours identique (jette le plan) et morphe dès qu'il y a trop de mouvement : « EXTREMELY SUBTLE motion, the person stays very still, only breathing and a slight handheld shake », un seul micro-mouvement en plus, jamais trois. Avant de changer de modèle en cours de série, compare deux clips côte à côte : cohérence avant qualité de mouvement. Sur OpenRouter, aucune référence audio n'est documentée (une synchro labiale sur voix jointe est à essayer, payante, avant de la promettre) et une image de départ ou de fin annule les images de référence ; durées de 4 à 15 s.

## 3. L'avatar visuel

**Deux sens à ne jamais confondre** : l'avatar VISUEL (le visage à l'écran, une image canonical, pour le prompt) et l'avatar MARKETING (le prospect à qui on parle, pour le script).

**Si tu as fait la recherche d'avatar, utilise sa fiche visuelle telle quelle** ; sinon fige une fiche minimale dans un registre :

| Avatar | Fichier canonical | Projet | Descripteurs à recopier mot pour mot |
|---|---|---|---|
| Avatar A (exemple) | `avatars/avatar-a-canonical.png` | gourde isotherme | French man who looks 41, oval face with light stubble, short dark-brown hair slightly receding at the temples, hazel eyes, a small scar through the left eyebrow, navy crew-neck sweater, grey sofa, daylight from a window on the left |

**Un prompt vidéo avec un visage humain qui ne cite pas un canonical du registre n'est pas livrable** : deux générations sans canonical donnent deux acteurs, et le spectateur le voit. Le genre de porte-parole (pair qui a réglé le problème, professionnel du domaine, proche, homme, elle-même…) est un choix MARKETING tranché avant, par la recherche d'avatar et les winners du format, jamais supposé ici.

**Créer le canonical, dans l'ordre** :
1. Cherche sur Pinterest (dans ton navigateur) une photo de téléphone d'un VRAI humain : visages TRÈS détaillés, lumière, pores, imperfections, jamais des humains parfaits. **Jamais une image ni une vidéo faite par IA** (Pinterest en est plein : peau trop lisse, symétrie parfaite, mains ou oreilles qui déraillent). Pourquoi : le modèle anime ce que contient l'image ; bruit de capteur, grain et pores ne s'inventent pas, sinon peau cireuse et bouche floue. Autres sources : TikTok, Instagram, Facebook (choisis la plateforme où vit l'âge de ton avatar).
2. Trois critères : un cadrage choisi avec intention (corps penché, table ou non, hauteur du téléphone) ; **aucune haute lumière brûlée** (zoome fort sur le nez : il doit rester de la matière, une zone blanche devient une surface morte et luisante) ; un fond avec de la profondeur (« un mur vide ET un cadre photo »). Extrais le PNG quand les deux mains sont naturelles et qu'aucun sous-titre ne couvre le visage.
3. Fais l'avatar en UN SEUL prompt Nano Banana Pro avec les quatre changements, jamais en retouches successives (chaque retouche superpose un calque aux bords adoucis, invisible fixe, visible animé) : a) **une différence GÉNÉTIQUE avec la personne de la photo** (yeux, nez, pigmentation : cheveux et vêtements ne suffisent pas, et on ne fait pas le double d'une vraie personne) ; b) un point de fond ajouté (une plante, un cadre photo) ; c) des **accessoires hors norme** (l'IA produit la moyenne : un seul écouteur filaire, des bijoux, un portable précis) ; d) une **source visible pour le son propre** (micro-cravate, micro au fil des écouteurs, micro tendu, avatar près du téléphone). Cadrage, lumière et structure du fond restent ceux de la photo.
   Gabarit (jamais éprouvé tel quel : ajuste après un premier essai) : « Using the attached phone photo, create a different person in the exact same framing, camera angle, lighting and room. Keep the same body position and hand placement. New person: [eye colour], [nose shape], [skin tone], [hair], [age], clearly a different individual. Background: same room, add [a plant] behind. Accessories: [single wired earphone, small necklace]. Audio: [a clip-on microphone at the collar]. Keep the look of a real smartphone photo: sensor noise, grain, visible skin pores. » Régénère jusqu'à l'image juste ; environ 1 référence sur 10 ne s'anime jamais bien : change-la.
4. **La personne valide l'avatar**, il entre au registre ; on ne le régénère plus sans nouvelle validation. Jamais de faux professionnel de santé fabriqué par IA.

**Les plans suivants (poses, décors, cadrages)** : cherche aussi sur Pinterest le cadrage voulu (contre-plongée, plongée, face caméra, posture assise, pièce autour), y compris des vidéos capturées à l'écran. **Ne publie jamais le fichier Pinterest** : fais-le REGÉNÉRER à l'identique par Nano Banana Pro (photo en référence, « recreate this exact photograph » : cadrage, pose, lieu, lumière) avec le visage du canonical, et utilise la version générée.

**Verrou du visage** : ce qui tient un personnage est l'IMAGE JOINTE, jamais le texte. Le même bloc de descripteurs recopié mot pour mot, sans image jointe, rend une personne différente à chaque génération (jusqu'à un homme là où le bloc décrivait une femme). Le texte DÉCRIT, il ne verrouille pas.
1. Le canonical part en premier dans les références ; un plan de série sans image jointe n'est pas livrable. Le bloc de descripteurs est recopié mot pour mot (il cadre le rendu).
2. Phrase de verrou à coller quand le visage est visible (adapte le genre) : « The woman in the reference is the EXACT SAME PERSON. Reproduce her face IDENTICALLY: same eyes, same freckles, same eyebrows, same face shape, same lips, same complexion, same haircut. She must be immediately recognizable as the exact same person. »
3. Sans canonical (film sans visage, détail d'un objet) : génère le PREMIER plan, valide-le, promeus-le en référence pour tous les suivants.
4. Avant de livrer, compare le rendu au canonical côte à côte ; un visage dérivé se régénère.
5. Tous les clips d'une série : mêmes mots de lumière, d'étalonnage, de décor et de tournage (un « visual bible » collé au début de chaque prompt), dans la même session, sans changement de casting ni de modèle visible. Harmonise en post si besoin.

**Le produit en référence, à CHAQUE génération qui le montre** : packshot canonique joint comme image (sans image, couleur, forme et label dérivent) plus sa description (couleur, forme, étiquette, taille). Taille réaliste : tenu en main, il tient dans la paume, doigts visibles autour, 15 à 20 % du cadre au plus, le visage reste le sujet. Dérive : régénère. Exemple neutre : « the water bottle is exactly the one in the reference image, 7 cm wide at the base, held in her palm with fingers visible around it, about 15 % of the frame ».

## 4. Esthétique UGC brute, jamais cinéma

Les pubs gagnantes sont du smartphone brut. Dans CHAQUE prompt d'image : vrai lieu de vie (canapé, cuisine, table de salle à manger) ; lumière chaude d'intérieur ou de fenêtre, jamais bleu-gris cinéma ; vêtements du quotidien (pas de peignoir de drame) ; cadrage selfie un peu imparfait, tête sur les 60 % hauts ; léger grain et compression de réseau social ; expression naturelle ; cheveux en désordre, fatigue acceptée ; objets du quotidien visibles (le fouillis est bon).
À éviter : ambiance court-métrage, faible profondeur de champ « photo pro », larme sur la joue, marbre et carrelage blanc, étalonnage froid. Visages NORMAUX (âge réel de l'avatar, peau réelle), pas glamour.
**Jamais de selfie miroir** (téléphone reflété) : daté, il ne ressemble pas aux winners. Autorisés : 1) **caméra frontale directe** (préférée) : téléphone à bout de bras, elle regarde l'objectif, le téléphone n'est PAS dans le cadre, léger tremblement, plan tête et épaules ; 2) **tiers qui filme**, plan poitrine ou pied ; 3) photo composée mais casual. Prompt : « POV: iPhone front camera selfie, hand-held by the woman herself, pointed directly at her face, camera at arm's length. She looks directly at the camera. Slight natural hand-held shake. »
**Première image stop-scroll** : RAW UGC ne suffit pas, il faut une rupture. Cinq contrôles : un premier plan choc au centre ; une curiosité (« qu'est-ce qu'elle montre ? ») ; une identification instantanée ; une émotion lisible en 0,3 s ; rien qui ressemble aux dix vidéos précédentes du fil. Moins de 3 sur 5 : régénère. Mauvais : personne passive avec un objet, packshot isolé, sourire glamour. Mieux : gros plan saisissant, objet brandi face caméra, geste bizarre, juxtaposition.
**Style des winners** : avant un style 3D ou premium, extrais des images des winners du format (ffmpeg, une toutes les 2 s) et note palette, composition, typographie, mouvement.
**Images** : un bloc `avoid` sous SA PROPRE clé d'un prompt structuré fonctionne ; une négation noyée dans une phrase descriptive se fait dessiner. Sépare le texte à dessiner de la consigne de style (sinon le style s'imprime : « white SERIF »). Ne cite pas un spécimen indésirable : un contre-exemple détaillé est recopié, décris la classe. Reprends le prompt d'une image déjà validée plutôt qu'en écrire un de zéro : il porte les correctifs payés par des essais ratés (trois fois plus court = régression).

## 5. Le prompt vidéo

**Avant la première ligne, trois réponses** (demande-les, ne les devine pas) : quel produit, quel avatar (son canonical existe-t-il ?), quel format (9:16, verrouillé pour toute la série). **Gabarit** (livré à la personne pour chaque plan, dans cet ordre) :
```
PLAN [n], [rôle : hook / preuve / démo / chute]
Durée : [3 à 10] s · Format : 9:16 · Définition : brouillon
Avatar : [nom du registre] · Canonical : [chemin]
PROMPT (un seul bloc de prose, pas de liste)
[Cinématographie] valeur de plan, angle, mouvement, optique
[Appareil] si l'avatar se filme : modèle de téléphone, caméra avant ou arrière, comment il est tenu
[Sujet] le bloc d'avatar recopié mot pour mot
[Expression] confiance et émotion moment par moment, façon de dire
[Geste] UNE action lisible et les gestes
[Pièce] lieu, heure, lumière, objets qui collent à l'avatar
[Style] étalonnage, grain, référence de tournage
[Audio] dialogue entre guillemets, bruitages, ambiance
RÉFÉRENCES : <IMAGE_REF_1> canonical ; <FIRST_FRAME>, <LAST_FRAME> si besoin
```
Les crochets ne partent pas dans le modèle. **L'appareil est capital** : jamais générique, nomme-le. **L'expression s'écrit moment par moment** (un petit sourire résigné, le sourire qui s'efface), avec les gestes et les objets de la pièce qui collent à l'avatar.

**Pour un avatar qui parle, un clip par morceau de réplique**, avec un préfixe et un suffixe FIXES : seule la ligne entre guillemets change d'un clip à l'autre (le diff de deux prompts = une seule ligne). Préfixe : caméra, appareil, scène, avatar, action, énergie. Suffixe : règles fixes empilées à chaque défaut (« One take, no jump cuts. Same avatar, same location, same camera framing. Do not recompose the shot. »). Verrouille d'abord le prompt sur UNE ligne d'essai (« Franchement, au début, j'y croyais pas du tout. ») : régénère jusqu'au bon ressenti, puis déroule le script. Coupe chaque case du storyboard en morceaux qui tiennent dans une durée de clip.
- **Le mouvement de caméra est TOUJOURS écrit, même nul** (« static locked-off shot ») : sinon dérive et hallucinations. **L'énergie est écrite** (sans elle l'avatar parle plat) ; en français elle suit la voix d'un ami qui raconte un secret, pas un youtubeur américain.
- Hors réplique, le personnage bouge peu : tourner la tête fait scintiller la peau ; écris qu'il ne regarde pas la caméra. Accent tonique par MAJUSCULES : vu en anglais seulement, teste-le en français.
- Prolonger (jusqu'à 40 s) sert aux plans continus sans réplique. Pour une réplique : un clip par morceau de 10 s au plus, sur des phrases ENTIÈRES.
- Vocabulaire attendu : plans (extreme wide à extreme close-up) ; angles (eye-level, low-angle, high-angle, bird's-eye, dutch angle) ; mouvements (static, pan, tilt, dolly, truck, crane, handheld, arc, whip-pan, dolly-zoom) ; optique (shallow depth of field, rack focus, wide-angle). « Cinématique » ne produit rien.
- Audio en phrases séparées : `She says (tone): "..."`, `SFX: ...`, `Ambient: ...`.

**Durée d'un clip parlé** : débit d'Omni en ton vif environ 3,2 mots par seconde (mesuré une fois ; vérifie-le en français sur ta ligne d'essai). Durée = mots / 3,2 + 1,5 s de marge, arrondie au palier au-dessus (4, 6, 8 ou 10 s). Au-delà de 10 s, coupe la réplique en plusieurs clips. Pourquoi : un clip dont la phrase finit tout contre la fin voit l'avatar rouvrir la bouche comme pour continuer, et la réplique est coupée en pleine parole (24 mots demandent 9 s, donc le palier de 10 s, pas celui de 8 s).

**Les négatifs : le piège qui produit l'inverse.** Omni n'a pas de champ négatif ; la liste classique « subtitles, watermark, logo, text overlays, blurry, distorted hands » collée dans le prompt n'interdit rien, elle DÉCRIT : on demande des sous-titres, un filigrane et un logo, sans erreur ni avertissement. Écris AU POSITIF ce que tu veux voir : « hands resting out of frame » ou cadre plus serré ; « sharp focus on the subject, crisp detail » ; « locked-off tripod shot » ; pour éviter le texte, un cadre plein de matière sans écran, panneau ni affiche. Bijoux : « une seule petite boucle d'oreille », jamais « pas de collier » qui le dessine. Règle : ne nomme jamais une chose que tu ne veux pas voir. Exceptions de la documentation, qui portent sur la prise et non sur un objet : « no jump cuts », « no scene cuts », « no camera movement », « music: NONE ».

**Exemple complet (neutre)** : hook de 6 s pour une gourde isotherme.
```
Handheld medium close-up, slightly above eye level, shallow depth of field.
Filmed on an iPhone 14, front camera, held at arm's length in his own hand, slight natural sway.
A 41-year-old French man, [bloc d'avatar recopié]. [phrase de verrou]
His expression shifts: a small resigned smile as he shakes the bottle, the smile fading as he sets the bottle down, then he goes still, looking into the lens.
Kitchen of a French flat in the evening, a plant and a window slightly out of focus behind him.
Intimate documentary realism, sharp focus on his face.
He says, quietly, voice slightly roomy and phone-mic quality, not studio-clean: "Deux heures dans le sac, et mon eau est déjà tiède." Ambient: quiet flat. Music: NONE.
RÉFÉRENCES : <IMAGE_REF_1> avatar-a-canonical.png
```

## 6. Voix, appareil, personnages

**La voix colle à l'APPAREIL qui la capte, jamais la voix IA « parfaite » par défaut.** Écris-le dans le prompt : téléphone = son de téléphone, un peu de pièce ; micro proche ou contexte podcast = belle voix acceptée ; sinon des écouteurs ou un micro visibles à l'image pour justifier une bonne voix. Plus la cible est jeune, plus l'écart se voit. Pourquoi : les pubs IA se trahissent par un visage parfait et une voix de studio qui sort d'un téléphone.
Le second personnage a aussi sa source de son (interview de rue : une main tend un micro-cravate dans le champ). Le produit entre dans le récit (téléphone tendu qui affiche la page, paquet en incrustation), jamais en plan de pub. Le décor suit la phrase (même avatar, autre lieu ou tenue). Chaque phrase rapportée a SA voix ; réglages dans `audio-voix-musique.md`. La voix reste-t-elle identique d'un clip à l'autre ? Le point n'est pas tranché : écoute les deux premiers clips bout à bout avant de continuer.

## 7. Contrôler chaque clip, et le budget

Plans hors avatar (statique ou animé, B-roll) : décidés carte par carte dans `storyboard.md`, section 5 ; image d'abord, toujours.

**Après CHAQUE génération, avant de monter** :
1. Écoute : la ligne est dite en entier, pas accélérée, rien d'ajouté après (charabia, mots en plus, musique inventée), synchro labiale propre, dentition non répétée en gros plan.
2. Transcris mot à mot (Whisper local, gratuit) et compare au script. Un petit modèle se trompe parfois (un mot entendu pour un autre de même son) : réécoute avant de conclure ; un résultat instable entre deux passes est une hallucination.
3. **La FIN du clip** : le dernier mot finit au moins 0,5 s avant la fin ; regarde les images de la dernière seconde (8 images par seconde) pour la bouche qui repart. Au montage, coupe 0,1 s après la fin du dernier mot, jamais à la fin brute du clip.
4. Visage : compare au canonical. Produit : compare au packshot. Mains, texte lisible, filigrane ou logo apparus : refais.

Prix de liste relevés en 2026 : Nano Banana Pro 0,134 $ l'image en 1K ou 2K (Nano Banana 2 : 0,067 $) ; Omni 1.1 Flash 0,10 $ la seconde en 720p ; Seedance sur OpenRouter, 8 s en 480p : Mini 0,27 $, Fast 0,32 $, 2.0 0,54 $, 2.5 0,82 $ ; voix Cartesia environ 0,026 $ la minute ; Whisper, ffmpeg, Pillow gratuits.

Un **lot** (réglage validé) : 4 versions image et 3 versions vidéo. C'est un choix, pas la loi du modèle : adapte-le à ton budget et dis-le. Une pub de 40 s coûte environ 6 $ sans reprise (ESTIMATION). Étiquetage des contenus IA réalistes par les plateformes : non vérifié ici, vérifie avant de publier.

## Contrôle avant de passer à la suite

- [ ] Le storyboard est validé par la personne ; la route (A ou B) est choisie et, en route B, le coût du lot est annoncé puis accepté.
- [ ] L'avatar a un canonical validé, des descripteurs figés, et chaque prompt le joint en image.
- [ ] Chaque prompt vidéo a Appareil, Expression, Geste, Pièce, mouvement de caméra écrit, aucune liste de négatifs ; seule la ligne entre guillemets change d'un clip à l'autre.
- [ ] Chaque clip parlé a été écouté, transcrit et vérifié à la FIN (dernier mot 0,5 s avant la fin).
- [ ] Le visage et le produit sont comparés à leur référence sur chaque rendu ; aucune sortie « moyenne » n'est acceptée.
- [ ] Rien d'inventé : ni avatar, ni chemin de fichier, ni chiffre de spécification, ni nom de balise.
- [ ] La voix colle à l'appareil ; aucun texte ni interface demandé au modèle (aplat vert pour les écrans).
