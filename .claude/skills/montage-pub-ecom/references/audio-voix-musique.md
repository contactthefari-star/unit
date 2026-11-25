# Audio : voix, musique, bruitages, mastering

Le son fait la moitié du montage, et c'est la moitié que les contrôles d'image ne voient pas.
Mesuré sur des pubs gagnantes avec `astats` et `silencedetect` ; règles validées à l'usage.

## 1. La hiérarchie sonore

1. **La voix domine, toujours.** Voix off : égalisation +2 dB vers 2 à 4 kHz (clarté), compresseur
   3:1, crête normalisée à -3 dB. Elle ne doit jamais être enterrée sous la musique (l'erreur
   d'amateur la plus fréquente).
2. **Un fond sonore continu** : l'énergie ne retombe jamais. Il y a toujours quelque chose sous la
   voix (musique, ou musique plus ambiance de pièce). Pas de musique du tout sonne brutal et
   amateur, sauf intention. L'ambiance de pièce évite aussi que les coupes « claquent » dans le
   silence.
   Selon le format : cadeau ou émotionnel = musique de bout en bout, voix absente ou rare, la musique
   FAIT le rythme ; démo silencieuse = son du produit (type ASMR) plus fond, sans voix ; parlant = voix
   plus un lit musical léger plus l'ambiance de la pièce.
3. **Master chaud et compressé** : niveau RMS de -16 à -22 dB sur les pubs gagnantes, faible
   dynamique, pas de « calme puis fort ». Pas de dynamique de cinéma.
4. **Cohérence acoustique** (comme la cohérence visuelle) : la MÊME voix sur tous les clips d'une
   créa, la MÊME musique d'un bout à l'autre, pas de coupe qui change brutalement l'ambiance
   (clip 1 calme, clip 2 bruyant, clip 3 calme = brisure), fondu enchaîné audio de 0,5 s entre
   clips.
5. **Les bruitages se sentent sans s'entendre** (section 6).

Ordre pratique : (1) voix, puis retrait des mots de remplissage ; (2) poser l'image sur la voix ;
(3) ajouter le fond et le baisser sous la voix ; (4) ajouter les bruitages avec parcimonie
(whoosh sur un flash, clic à la révélation du produit) ; (5) normaliser le mix final.

## 2. La voix off générée

### 2.1 Une prise par SCÈNE, jamais phrase par phrase

- **Jamais phrase par phrase** posée dans des créneaux : des trous, et l'intonation repart à
  zéro à chaque phrase, et le résultat sonne haché.
- **Un appel par SCÈNE** (bloc continu), puis **resserrer les silences**. Un générateur de voix
  met 0,5 à 0,9 s à chaque point, alors que l'original ne dépasse jamais 0,25 s. Valeurs validées :
  **0,24 s après un point, 0,18 s après une virgule**, coupe au **milieu du silence**, fondus de
  **10 ms** pour éviter le clic. (`outils/remove_fillers.py --resserrer` le fait.)
- Le tout est ensuite mesuré : durée réelle de la voix, et densité de mots par seconde.

### 2.2 Casting à l'oreille

- Le casting se fait **à l'oreille** : 6 à 8 voix sur le **MÊME passage**, plus l'original s'il
  existe. La personne choisit. Ne présume rien, ne pioche pas dans des voix déjà utilisées sans
  confirmation.
- **Liste d'abord les TYPES de voix** nécessaires à la production : genre, âge approximatif
  (25-35, 30-40...), origine ou accent, ton (intime, autoritaire, fun, podcast), pour quelle créa.
  La personne les cherche dans la bibliothèque du service et te donne le nom, l'identifiant et les
  réglages.
- **Une voix qui ressemble à celle de l'avatar de la pub**, pas à un narrateur de studio.

### 2.3 La voix suit l'appareil

La voix ne doit **jamais être trop parfaite** : elle colle à l'appareil de l'image. Podcast :
son de micro. Téléphone en main : son de téléphone (ou écouteurs visibles). Critique surtout pour
les avatars jeunes. Pourquoi : les pubs générées se trahissent par un visage parfait et une voix de
studio qui sort d'un téléphone ; la crédibilité fait la conversion.

### 2.4 Éthique et droits

- **Ne jamais cloner la voix du narrateur d'une pub concurrente.**
- Ne clone que les voix que tu utilises vraiment, et vérifie le droit d'usage de toute voix avant
  de la cloner.
- Un modèle de voix est toujours payant : annonce avant de lancer (section 2.6).

### 2.5 Tenir 30 à 50 s : débit, pauses, balises

Le budget de mots est dans `grammaire-montage.md` (75, 100, 125 mots pour 30, 40, 50 s ; plafond
absolu 125). Pour tenir ce budget sans que la voix traîne :

| Élément du texte | Pause ajoutée | Usage |
|---|---|---|
| `...` (trois points) | environ 0,6 à 1,0 s | 2 par script au maximum, moments dramatiques |
| balise `[pause]` | environ 1,0 à 1,5 s | n'en mets plus (sauf une bascule unique) |
| `.` fin de phrase | environ 0,3 à 0,4 s | normal |
| `,` virgule | environ 0,15 à 0,2 s | abondant, pour le rythme |
| phrases de 5 à 8 mots | rythme rapide | à privilégier |

Pour une voix qui exprime l'émotion sans ralentir : balises `[emphasized]` (emphase sans pause),
`[warm]`, `[confident]`, `[excited]` (modulent le ton, pas la vitesse). **À éviter** : `[sigh]`
(environ 1 s ajoutée), `[laughs]` (environ 1,5 s), `[hesitant]` (ralentit), `[whispers]` (ralentit
un peu, avec parcimonie). Préfère des adjectifs et de la ponctuation aux balises qui ajoutent du
silence.

Réglages d'un service de voix de type ElevenLabs pour **accélérer** tout en gardant l'émotion :
stabilité 0,50 à 0,60, style 0,40 à 0,55 (un style élevé ralentit), similarité 0,85, renfort de
locuteur activé. Évite un style de 0,7 ou plus (ralentit et exagère). Débit par défaut du modèle
`eleven_v3` à stabilité 0,50 à 0,65 : environ 150 mots par minute.

### 2.6 Les deux voies pour générer la voix

**ÉTAPE PAYANTE (voix IA).** À quoi ça sert : fabriquer la voix off ou le dialogue d'un clip, en
français, à partir de ton script validé.

- **Voie A, sans clé, avec abonnement Google** : si ton abonnement Google donne accès à Google AI
  Studio (`aistudio.google.com`, page de génération vocale), tu génères la voix dans le navigateur.
  Le modèle de voix de Gemini s'y règle : une voix intégrée parmi une liste (par exemple des voix
  « Mature », « Warm », « Gentle »), plus un style libre décrit en texte (« Describe the voice
  style », par exemple une voix posée en français, texte dit mot pour mot). Deux voix
  peuvent parler en une seule génération. Noms de modèles relevés dans la documentation Google en
  septembre 2026 : `gemini-3.8-flash-tts` (le plus expressif, voix décrite en texte) et
  `gemini-3.8-flash-lite-tts` (rapide, gros volume). **Revérifie les noms**, ils changent. La
  fonction « Voice Design » (voix décrite de zéro) exige une clé payante. En français, **écoute une
  prise avant un lot**.
- **Voie B, clé API payante** : crée une clé dans Google AI Studio (même site), ou chez un service
  de voix spécialisé : Cartesia (`cartesia.ai`) ou ElevenLabs (`elevenlabs.io`). Range la clé
  dans le fichier prévu par `CLES.md` du skill, jamais dans la conversation. **Ordre de grandeur de
  la grille de liste (2026, à revérifier) : Cartesia, environ 0,026 $ la minute de voix générée.**
  Aucun prix relevé pour Gemini TTS ni pour ElevenLabs : vérifie
  le prix affiché sur la page de facturation. **Si ton service vend du crédit à l'usage, mets 10 € :
  à ce tarif de liste, ça suffit largement pour plus de 300 minutes de voix, donc des centaines de voix
  off de 40 s (ESTIMATION).** S'il ne vend que des forfaits, le minimum du forfait prime : vérifie
  avant de payer.
- **Garde-fou** : avant tout lot, annonce le nombre de générations et le coût estimé, puis
  attends un « oui ». Un casting de 8 voix sur un même passage est un lot.
- **Alternative gratuite** : Kokoro (modèle de voix local, qualité moindre) ou ta propre voix
  enregistrée.
- **Replis, avec la raison** : Cartesia (voix souvent moins naturelles à l'écoute,
  à ré-écouter) ; ElevenLabs (payant, vérifie les conditions de ton compte) ; Kokoro local ; Suno (aucune API, geste
  manuel) ; sons et musiques SOURCÉS quand rien d'utilisable ne sort.
- **Transcription** : la lecture d'une voix (horodatage des mots) n'est pas de la génération.
  Utilise Whisper en local, gratuit.
- Contrôle d'une voix générée : transcris avec un modèle **medium** (le modèle small peut
  prendre un mot pour un autre et faire un faux rouge ; medium entend juste), puis compare au
  script.

### 2.7 Un clip parlé généré : la réplique tient dans la durée, avec marge

- Débit mesuré d'un modèle vidéo parlé en ton vif : environ **3,2 mots par seconde**.
  **Durée du clip = mots / 3,2 + 1,5 s de marge**, arrondie au palier au-dessus (4, 6, 8, 10 s).
  **10 s au maximum par clip** : au-delà, coupe la réplique en plusieurs clips, chacun sur une phrase
  entière. Exemple inventé : 24 mots demandent 24 / 3,2 + 1,5 = 9 s, donc le palier de 10 s ; dans
  un clip de 8 s, la phrase finit tout contre la fin, puis l'avatar rouvre la bouche comme pour
  continuer, et la réplique est coupée en pleine parole.
- **Après chaque génération** : transcription mot à mot ; la réplique doit être COMPLÈTE et son
  dernier mot finir au moins **0,5 s avant la fin** du clip ; regarde les images de la dernière
  seconde à 8 i/s (la bouche qui repart).
- **Au montage, coupe 0,1 s après la fin du dernier mot**, jamais à la fin brute du clip.

## 3. Assembler des clips qui portent chacun leur voix

- Les clips générés portent chacun leur réplique (4 à 10 s). Un montage qui suppose « une voix
  continue + des images muettes » ne convient pas : assemble en recollant les recettes par clip.
- **Sans clé « voix » dans le moteur** : dans le moteur de rendu de ce skill, la seule présence
  de cette clé coupe le son des sources et pose la voix désignée par-dessus. Un montage où chaque
  plan apporte son propre son ne doit pas la porter (rien ne le dit à l'écran : le film sort avec
  une voix unique sur tous les plans).
- **L'ordre du film vient de ce qui est DIT et de ce qu'on VOIT, pas du nom des fichiers.** Les noms
  ne diffèrent parfois que par l'horodate de téléchargement. Marqueurs de langue : « et en plus » ne
  peut pas ouvrir une série de bénéfices ; « Mais regardez ça » est un pivot qui suit
  l'échec ; « J'ai POURTANT tout testé » suit un problème déjà posé ; un clip qui répond mot pour
  mot à l'objection d'un autre le suit. La planche contact confirme. Ordre type : hook, problème,
  objection, découverte, preuve, appel. Vérifie que l'appel à l'achat ne tombe pas au milieu.
- **Tri sur le texte, pas sur les noms.** Sur un lot de clips générés : transcris tout. Il reste
  bien moins de répliques distinctes que de fichiers (plusieurs prises d'une même ligne), et parfois
  DEUX scripts mélangés. Choisis les prises sur mesure : couverture de parole, confiance de la
  transcription, matière restante après le dernier son. Regroupe par le **nom de génération** (il
  porte le prompt) : l'empreinte d'image (elle sépare trop de groupes) et l'empreinte vocale (f0
  médiane : l'écart dans une même famille vaut celui qui sépare deux familles) sont des instruments
  trop grossiers.
- Clips qui montrent un autre produit à l'instant de l'offre : mieux vaut ne pas chiffrer la promo
  que montrer un autre produit quand on demande l'achat.
- **Saut de timbre** entre deux clips : le contrôle d'un montage se fait par l'oreille
  (`controles-et-verification.md`, section 5).

## 4. La musique

### 4.1 Le rapport voix/musique : 12 dB

- **Pose la musique au rapport voix/musique de l'original, MESURÉ SUR TOUT LE FILM**, puis écoute.
  **Sur un haut-parleur de téléphone, 15 dB sous la voix = inaudible. 12 dB est validé.**
- Mesure : isole la piste de voix et la piste de musique, mesure leur sonie intégrée (LUFS) sur
  tout le film (`ffmpeg -i piste.wav -af ebur128 -f null -`), et règle le gain de la musique pour
  obtenir l'écart voulu. `outils/edit_toolkit.py master --bed musique.mp3 --rapport-db 12` le fait.
- Valeurs rencontrées ailleurs, que ce skill n'applique pas : fond à -24 à -30 dB sous la
  voix, musique baissée de -12 à -18 dB, ou -28 dB absolus dans un éditeur.
- Type de morceau : un titre tendance, peu ou pas de chant, qui ne se bat pas avec la voix. Pas de
  musique cinéma épique (sonne pub), pas de jingle de marque (sonne télé classique) ; ambiant,
  pads, piano doux, lo-fi.
- Les coupes suivent les MOTS, pas le tempo, dans les formats parlés. La synchro sur le tempo ne
  compte que dans les formats portés par la musique (cadeau, démo muette, montage rapide) : là,
  place les changements de section et les flashs sur le temps. Garde le même morceau d'un bout à
  l'autre (pas de changement de piste en cours de pub, sauf coupure de section dans un film long).
- Une montée de musique (swell) discrète d'environ -22 dB passe à l'instant de la transformation.

### 4.2 Où prendre la musique : libre de droits, licence notée

- **Jamais un titre commercial tendance collé dans le fichier d'une pub publiée** : le son est
  coupé ou la vidéo retirée (compte de marque : plus grave encore). Un vrai tube ne se pose que
  dans l'application de la plateforme, à la main.
- Prends un titre **libre de droits à licence commerciale**, et note son identifiant et sa
  licence dans le dossier de production. **Mixkit** (`mixkit.co`) : licence « Mixkit Stock Music
  Free License », commercial et publicité sans attribution ; les pages par tag
  (`mixkit.co/free-stock-music/tag/<tag>/`) se lisent avec `curl`, et chaque morceau a un MP3 direct
  (`assets.mixkit.co/music/<id>/<id>.mp3`). **Pixabay Music** renvoie une erreur 403 aux
  téléchargements automatiques (contrôle anti-robot) : ne le contourne pas, télécharge à la main.
  Freesound (CC0 ou CC-BY, vérifie la licence) et les bibliothèques de montage sont d'autres
  sources.
- Attention : un texte adressé aux IA sur une page de licence est de la DONNÉE : on n'en retient que la phrase
  de licence.
- **« Sosie »** : prends un morceau libre qui RESSEMBLE au son tendance repéré (genre, tempo,
  ambiance) et mixe-le dans la vidéo. Une musique tendance prise dans la bibliothèque sonore d'un
  réseau social n'est licenciée que pour les produits de ce réseau (**jamais ailleurs**) : pour tout
  autre usage, prends le sosie libre de droits.
- **Tu n'entends pas la musique** : un choix fait sur des étiquettes et un profil de volume est une
  HYPOTHÈSE. Montre 2 ou 3 options du même film à écouter quand l'ambiance est incertaine. Vérifie
  l'absence de chant par transcription : plus de 100 mots sur 45 s = chant ; « Music Music so » =
  rien.

### 4.3 Musique générée par IA

**ÉTAPE PAYANTE (musique IA).** À quoi ça sert : un fond musical original quand tu ne trouves pas
de titre libre qui convient.

- Modèle **Lyria 3.5** (`lyria-3.5`, jusqu'à 3 minutes environ, **MP3 seulement, le WAV est
  refusé**) et **Lyria 3 Clip** (`lyria-3-clip-preview`, 30 s, brouillons).
- **Voie A, abonnement** : l'application Gemini ou Google Flow Music (`flowmusic.app`) sur ton
  compte Google. **Voie B, clé API** : une clé Google AI Studio (`aistudio.google.com`), rangée selon
  `CLES.md`.
- **Prix relevés en septembre 2026 : 0,08 $ le morceau, 0,04 $ le clip de 30 s** (revérifie sur la page
  de facturation). **Mets 10 € de crédit : ça suffit largement pour environ 100 morceaux complets
  ou 200 clips de 30 s.**
- **Garde-fou** : annonce le nombre de générations et le coût, attends un « oui ».
- Alternative gratuite : les morceaux libres de droits de la section 4.2. Suno n'a pas d'API :
  geste manuel.

## 5. Séparer la voix du reste

Pour une pub à refaire, ou « enlève la musique » / « enlève la voix ».

- **Demucs** (licence MIT) sépare la voix. La piste rendue est **calée sur la source à 0
  échantillon près** (même nombre d'échantillons que la source, décalage 0 ; voix + reste
  reconstruit la source avec une erreur moyenne de 0,0007) : c'est la seule mesure qui autorise à
  substituer la piste à la vidéo, parce que le découpage plan par plan tombe aux mêmes endroits.
  Coût (ordre de grandeur, ESTIMATION, selon la machine) : environ 45 s de calcul par minute de rush
  (une fois par fichier), environ 15 Mo par minute.
  Installe-le avec des roues précompilées (rien ne s'exécute à l'installation) ; PyTorch est requis.
- Sur une adaptation de pub, un modèle de séparation plus fort (BS-RoFormer, voir
  `adapter-une-pub-concurrente.md`) est meilleur. **Lourd : évite de lancer deux tâches lourdes en même temps.**
- Deux sens : « enlève la musique » garde la piste voix ; « enlève la voix » garde la piste sans voix ;
  « coupe le son » ne garde rien ; « remets le son » efface les deux. Si le moteur ne retrouve pas la
  piste séparée, il le dit et reprend le son d'origine (un montage qui perd sa bande son en silence
  serait pire).
- Attention : sur un film où la musique est 20 dB sous la voix, « enlève la voix » donne une piste que le
  mastering remonte d'environ 21 dB : ça marche, mais le plancher de bruit monte avec. Dis-le avant de
  livrer.

## 6. Bruitages et ambiance

### 6.1 Niveaux par type de scène (niveaux indicatifs d'un éditeur, sous la voix)

| Type de scène | Bruitage d'ambiance | Niveau |
|---|---|---|
| Parlant selfie en intérieur | ambiance de pièce naturelle (presque le silence) | -45 dB |
| Salle de bain ou douche | eau qui coule ou douche | -25 à -30 dB |
| Cuisine | ustensile léger, bouilloire | -35 dB |
| Salon | ambiance de pièce très discrète | -45 dB |
| Atelier ou open space | clavier lointain, ventilateur, ou silence | -40 dB |
| Rue | ambiance de rue (voitures, voix lointaines) | -30 dB |
| Nature | oiseaux et vent léger | -32 dB |
| Café | machine à expresso, chuchotements, cuillère | -35 dB |
| Téléphone ou recherche | frappe de clavier discrète, ping de notification | -40 dB |
| Moment de transformation | montée de musique brève | -22 dB momentané |

Pièges : musique qui couvre la voix (erreur d'amateur n°1) ; bruitage trop fort qui rompt l'immersion ;
bruitage qui ne correspond pas à l'image (bruit d'eau sans salle de bain) ; cohérence cassée d'un
clip à l'autre. Whoosh de transition : 0,3 s, à -25 dB ; jamais de coupes sèches et nues
(sonne amateur).

### 6.2 Les bruitages de l'original se gardent

Dans une pub à adapter, il y a des bruits (rideau qui s'ouvre, gens qui parlent au fond, gestes) : la
version française les garde, **à leur instant, calés sur les coupes de l'image**. Un mixage « voix +
musique seule » jette tout ce qui n'est ni voix ni musique, y compris les premières secondes de la
source, avant la première note. Le séparateur rend la voix et un « reste » ; le reste contient la musique ET les
bruitages. Méthode à valider sur chaque pub : la personne écoute l'original et la version française
côte à côte.

### 6.3 Les fabriquer : synthèse, banque, IA

- **Synthèse (repli fiable)** : whoosh = bruit filtré à enveloppe (passe-bas qui s'ouvre puis se
  referme, enveloppe en sinus au carré, 0,30 s) ; clic = sinus de 2 100 Hz amorti (0,05 s) ; riser =
  balayage montant de 220 à 1 400 Hz (0,55 s). Rien à licencier, **graine fixe** (donc rendus
  reproductibles). Le moteur de ce skill le fait (`effets: {genre, volume}`).
- **Placement** : le whoosh et le clic arrivent 0,06 s avant la coupe ; le riser arrive 0,55 s avant
  (il ANNONCE la coupe, les autres la ponctuent).
- **Mixage** : sous la voix (`amix ... weights=1 0.45`) et **avant** la normalisation, volume par défaut
  0,25 : un bruit de coupe se sent, il ne s'entend pas. Sur un film SANS voix, à poids égal la
  normalisation remonte les effets seuls à -14 LUFS (mesuré : -10,5 dB de moyenne, des whooshs
  assourdissants) : normalise une piste d'effets seuls à `I=-28:TP=-6:LRA=7`.
- **Banques** : Mixkit (sans attribution), Pixabay (usage commercial sans attribution, téléchargement à
  la main), Pexels Audio, Freesound (CC0 ou CC-BY), la bibliothèque de ton éditeur.
- **Par IA** : aucun modèle Google dédié aux effets sonores n'a été trouvé (à vérifier). Un essai
  possible : un modèle de musique en mode clip, en demandant 2 ou 3 sons dans les 10 premières
  secondes (au-delà de 10 s il repart en musique), puis découpe et garde ce qui passe (peu de sons
  générés sont utilisables : un souffle, un impact) ; prends le repli (synthèse ou banque) pour
  les autres bruitages du film.
- Vérifie **le silence ENTRE deux effets avant d'appeler une piste « effets seuls »** : une piste
  d'« effets seuls » peut contenir encore l'ancienne musique à -26 dB. Et vérifie que l'effet ne masque
  pas un mot (par exemple le nom du produit).

## 7. Technique audio : ce qui est validé

- **Master** : `loudnorm=I=-14:TP=-1.5:LRA=11`, la cible des réseaux. `-ar 48000 -ac 2` imposés : une source 96 kHz traverse sinon le
  master telle quelle.
- **Gain et fondus du son se posent APRÈS la normalisation**, sinon elle les rattrape et le réglage
  n'a aucun effet. Gain borné de -30 à +20 dB, fondu d'entrée ou de sortie borné à la moitié du film.
- **Découper l'audio en PCM, jamais en AAC.** L'AAC travaille par trames de 1 024 échantillons : à
  48 kHz, un plan de 1,000 s en occupe 48 trames, soit 1,024 s réels, et le collage sans réencodage
  jette la liste d'édition qui disait de rogner. Résultat mesuré sur un banc témoin (un bip de 30 ms
  chaque seconde pile, 12 plans) : **22 bips doublés au lieu de 12, 0,30 s de retard à la 8e coupe,
  21 à 45 ms de dérive par plan, cumulatif**. Parade : couper en PCM (`pcm_s16le`), coller en PCM, ne
  coder en AAC qu'**UNE** fois à la fin ; **compter en échantillons** (`n = round(durée x 48000)`,
  `-t n/48000`). Autre mesure : le collage de 12 plans donnait 12,021333 s pour 12,000 s attendues. Après : 12 bips, écart
  maximum 15 ms (une demi-image).
- **Recoller des segments encodés en AAC séparément ajoute 22 à 40 ms de silence à chaque raccord** :
  monte en une passe.
- **`-shortest` n'a sa place nulle part** dans une chaîne de montage : il donne au flux le plus court
  un droit de veto sur les autres (une bande de 3,77 s a raboté 7 images sur 120 sans alerte). Sans
  piste audio, `-shortest` ne borne rien (un film muet gagnait une image par plan). Borne l'image en
  `-frames:v`, l'image est la vérité.
- Une source sans piste audio ne doit pas faire échouer le rendu : pose du silence de la BONNE
  longueur (compte d'échantillons juste), et ajoute `apad` pour qu'une source plus courte ne
  raccourcisse pas toute la bande. Le filtre `loudnorm` échoue sur un silence numérique pur : remplace-le
  par un filtre neutre quand aucune source ne porte de son.
- **Mesure du niveau à la jonction** de chaque coupe (voir `controles-et-verification.md`) : -21 puis
  -84 dBFS en une image veut dire un mot guillotiné.

## 8. Retirer les mots de remplissage et les blancs

Une prise brute contient 20 à 35 % de pauses et de remplissage. `outils/remove_fillers.py` : transcrit
(mots horodatés), retire les remplissages sûrs (euh, heu, hum, mmh, bah, ben, beh, du coup, en fait,
tu vois) et colle ; l'option `--agressif` ajoute les risqués (voilà, genre, quoi, tu sais) qui peuvent
changer le sens et le rythme. Les silences de plus de 0,28 s sont coupés (amorce de 0,06 s, queue de
0,12 s). **Les bornes se calent sur
l'enveloppe du son, pas sur la date de fin d'un mot** (la transcription date la fin du MOT, pas la fin du
SON, et annonce parfois la parole jusqu'à 0,74 s avant qu'elle attaque) : l'outil les recale sur
l'enveloppe à -45 dBFS.
