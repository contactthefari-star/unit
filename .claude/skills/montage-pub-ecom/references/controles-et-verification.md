# Contrôles et vérification : mesurer, regarder, ÉCOUTER

Un film qui « a l'air fini » passe le contrôle de l'oeil sans rien prouver. Ce fichier dit quoi
mesurer, quoi regarder, quoi écouter, et dans quel ordre, avant de montrer ou de publier. Chaque
règle vient d'un défaut constaté qui était passé entre les contrôles.

## 1. Le principe : deux passes, jamais une

1. **MESURER** : durées, silences, coupes en silence, mots par seconde, densité, rythme (outils :
   `outils/analyze_ref.py`, le contrôle de `moteur/`).
2. **REGARDER la planche contact**, plan par plan, et décrire chaque plan (cadre, sujet, rôle).
3. **ÉCOUTER** (section 5) avant de montrer.

Les chiffres ne voient pas ce qui **manque** : un film peut passer toutes les mesures de rythme et ne
jamais demander l'achat, et seule la planche contact le montre. Même règle pour une interface : après chaque
changement, capture d'écran puis REGARDE l'image (un défaut de mise en page renvoie quand même 200).

## 2. Les 12 règles du contrôle, en trois états

Chaque règle (voir les seuils dans `grammaire-montage.md`) rend l'un de **trois états, jamais deux** :

| État | Sens |
|---|---|
| tenue | la règle a été évaluée et le montage la tient |
| écart | la règle a été évaluée et le montage s'en écarte (rien n'est bloquant : ce sont des écarts, pas des notes) |
| non mesuré | la donnée nécessaire n'est pas dans le blueprint |

- **Une liste qui ne rend que les ÉCHECS ne peut pas alimenter un tableau de bord** : « tenue » et
  « non mesuré » se taisent exactement pareil, et un panneau bâti sur elle affiche du vert sans avoir
  rien mesuré, ce qui est pire que n'afficher rien. Un blueprint sans bloc de mesure du son faisait
  lever le contrôle ENTIER : un champ absent doit donner « non mesuré » pour sa règle, pas casser les
  onze autres.
- **Mesure le montage COURANT, jamais des valeurs figées à l'analyse.** Après un raccourcissement du
  hook, un contrôle peut annoncer encore l'ancienne durée parce qu'il lit celle du fichier d'origine :
  l'écart ne se referme jamais. Les durées, les silences et le compte de mots se recalculent sur les plans
  actuels.
- **Les silences et le son sont mesurés UNE fois**, par l'analyse du son, puis rangés dans le
  blueprint : les recalculer ailleurs donne un deuxième chiffre pour la même chose.
- **Chaque verdict porte sa référence** : un contrôle qui ne dit pas d'où vient son seuil ne se
  discute pas.
- **Compte la CARDINALITÉ et la POSITION, pas la présence.** Un test de présence
  (`cible in poses`) répond « oui » partout, même quand la demande posait la transition sur toutes les
  coupes. Écris `len(ok) == 1 and ok[0] ==
  index_attendu`, vérifie aussi le cas opposé (« partout » doit donner N), et fais tourner le banc
  contre un état DÉJÀ PEUPLÉ (c'est ce qui révèle qu'un « enlève » ajoute au lieu de retirer).
- **Une impossibilité qui n'a coûté aucune commande n'a pas été vérifiée.** Et **ne rebaptise pas un
  rôle de plan** pour faire passer une règle.
- **Dis les écarts qui restent et pourquoi** plutôt que de plier la mesure. Exemple honnête (valeurs
  inventées) : « densité 3,4 mots/s contre 3,58 exigés : le compteur est biaisé à la baisse, ça se joue
  à l'écriture du script » et « 1 plan de preuve à 1,1 s : le clip porte trois zones de parole séparées
  par de vraies pauses de 0,4 s, les recoller réintroduirait un silence au-dessus de 0,30 s ».

## 3. Mesurer le SON, pas les horodates d'un mot

**Une horodate de MOT n'est pas une mesure du SON.** La transcription date la fin du MOT, pas la fin du
SON, et annonce parfois la parole jusqu'à 0,74 s avant qu'elle attaque.

- Elle **rabat à 0,00 le premier mot** d'un rush qui ouvre sur un silence. Mesure au seuil -45 dBFS, pas
  de 0,02 s (exemple de valeurs mesurées sur des rushes générés) :

| Rush | La transcription dit | Le son attaque à |
|---|---|---|
| A | 0,00 | 0,10 |
| B | 0,00 | **0,32** |
| C | 0,00 | **0,42** |
| D | 0,00 | **0,46** |

  Pris au mot, le plan s'ouvre sur du vide et la coupe PRÉCÉDENTE tombe dans le trou. L'écart va de
  quelques dixièmes de seconde jusqu'à 2 s sur un rush qui ouvre long : une bonne part des rushes d'un
  lot est fausse si l'on se fie au mot.
- Elle **étire un mot par-dessus une pause** : un « et » daté sur près d'une demi-seconde peut cacher
  0,30 s de silence réel, sans aucun trou entre les mots.
- **Le redressement** (validé) : on ne redresse que le PREMIER mot, et seulement si la transcription l'a
  daté sous 0,05 s (`RABAT_MAXI`) et que le gain dépasse 0,05 s (`REDRESSE_MINI`), jamais au-delà de la
  fin du mot lui-même. Quatre témoins : non-régression (mêmes chiffres au bit près qu'avant),
  positif (0,00 vers 0,32), négatif (un mot daté à 0,46 reste intact bien que l'attaque soit à 0,52 :
  au-dessus de 0,05 s la transcription a entendu), négatif fabriqué (le même rush privé de son silence
  de tête ne déclenche rien).
- **Segmente sur l'ENVELOPPE du son (niveau en dBFS toutes les 20 ms, plancher -45 dBFS) et ne demande à
  la transcription que le TEXTE.** Une coupe faite sur la transcription, même redressée,
  laisse des silences de plus de 0,3 s et des coupes dans un trou ; refaite sur l'enveloppe, elle donne
  0 silence et relève nettement la part active.
- **Deux outils ne mesurent pas le même silence.** `ffmpeg silencedetect` à -45 dB peut manquer la
  plupart des attaques que l'enveloppe voit, au seuil exact que le contrôle utilise ensuite. **La
  bonne mesure est celle du juge**, pas celle qui tombe sous la main. Le seuil de silence est une
  constante unique partagée par l'enveloppe, les silences, l'attaque et le contrôle.

## 4. Vérifier la transcription

### Contre le texte attendu

Après avoir généré ou rendu une créa, **transcris l'audio du fichier rendu et compare ce qui est DIT
à ce qui est MONTRÉ, temps par temps** : une voix off et un montage construits séparément dérivent, un
plan peut tomber sur la mauvaise phrase. `whisper rendu.mp4 --model medium --language French
--word_timestamps True`. Un mot de marque ou rare est parfois entendu autrement (même son : pas une
faute, vérifie au son).

### Les mots faux mais plausibles

Voir `sous-titres.md` (section 6) : relire les jetons un par un, remesurer avec un modèle plus gros sur
la phrase entière, souder, ne jamais se fier à la confiance.

### Le texte inventé

- **Un transcript INSTABLE entre deux passes est une hallucination.** Sur un son inintelligible la
  transcription n'écrit aucun des mots génériques d'une liste : elle invente un texte propre, plausible,
  et DIFFÉRENT à chaque passe (chaque passe donne un texte sans rapport avec le précédent).
- **L'instabilité est le repli de la transcription** : quand son premier décodage tombe sous un seuil
  de confiance, elle redécode plus chaud par paliers jusqu'à 1,0 ; au-dessus de zéro elle ÉCHANTILLONNE,
  donc le texte change. **Une `temperature` non nulle est son propre aveu**, et le signal tient en UNE
  passe (le JSON de Whisper porte `temperature` et `avg_logprob` par segment).
- Deux détecteurs qui se complètent : (a) une **liste** de textes génériques de sous-titrage que la
  transcription sort avec assurance ; (b) la **confiance** : `temperature` > 0 OU `avg_logprob` sous
  -1,0 (le seuil que Whisper s'applique à lui-même). Mesuré sur un banc : les clips inventés ont une
  température de 1,00 et un `avg_logprob` de l'ordre de -5, les bons clips une température de 0,00 et
  un `avg_logprob` de -0,15 à -0,38. Les deux signaux ne sont PAS redondants : entre deux passes, le
  `avg_logprob` du même clip peut passer de -5,2 à -1,3 (près du plancher) pendant que la température
  reste à 1,00. Le OU est ce qui tient.
- **Deux signaux documentés de Whisper sont des PIÈGES ici** : `no_speech_prob` culmine à 0,096 sur un
  clip SAIN contre 0,041 sur les inventés ; `compression_ratio` est INVERSÉ (0,77 sur les inventés
  contre 1,34 sur les bons) parce qu'il vise la boucle de répétition, pas l'invention. Un seuil documenté
  vise le défaut de son auteur, pas le tien. Fais SONNER le garde (affiche motif, nombres et texte
  suspect en fin d'analyse) : un garde qui nomme le coupable dans un journal que personne ne lit n'a
  prévenu personne.
- **Le silence pur ne suffit pas à faire taire le modèle**, même avec la consigne de répondre « aucune
  parole » : il faut lui retirer le fichier. Avant de transcrire, mesure les secondes de parole
  (`silencedetect=noise=-35dB:d=0.8`) et sous 10 s de parole, ne transcris pas ; en plus, laisse au
  transcripteur une porte de sortie explicite (« AUCUNE_PAROLE »). Chaque couche laisse passer ce que
  l'autre arrête : 30 s de silence pur sont bloquées par la mesure mais inventent encore un dialogue
  complet sans la consigne ; 30 s d'un bip à 440 Hz passent la mesure mais la consigne les bloque.

## 5. L'agent VÉRIFICATEUR qui ÉCOUTE

Après CHAQUE montage, lance un agent vérificateur AVANT de le montrer ou de le publier. Pourquoi : les LUFS, le md5 de l'image et la planche d'images ne disent RIEN de ce qu'on
ENTEND : un mot coupé à une coupe en pleine phrase, un clic, un saut de timbre entre deux clips passent
tous au vert.

À vérifier, avec instant, gravité, preuve et correction :

1. **Transcription mot à mot** (modèle medium) contre le texte attendu.
2. **Clic ou mot tronqué à CHAQUE coupe**, l'instant calculé depuis la liste des segments.
   **Transcris l'EXTRAIT autour de chaque coupe** : une transcription du fichier entier fusionne une
   répétition en un mot (un mot doublé par la coupe est pris pour un seul).
3. **Saut de niveau et de timbre** de part et d'autre de chaque coupe (voix de deux clips différents).
   Niveau de jonction : relève le dBFS à l'image juste avant et juste après chaque raccord (-21 puis
   -84 = mot guillotiné).
4. **Planche d'images avant et après chaque coupe**, puis l'**image sur TOUTE la durée** à au moins 4
   images par seconde : défauts de génération (doigts ou téléphone qui se déforment, objet qui
   apparaît ou disparaît, visage qui glisse, image figée ou sautée). Les transitions servent aussi à
   couvrir un raccord visuel.
5. **Le nom de la marque, mot à mot** (un effet visuel peut masquer le nom).
6. **La piste « effets seuls » est-elle vraiment seule ?** Mesure le silence ENTRE deux effets.
7. **Aucune coupe au milieu d'une phrase.**
8. **Musique** : un choix fait sans écoute reste une hypothèse ; propose 2 ou 3 options.
9. **Monter en UNE passe** : recoller des segments encodés en AAC séparément ajoute 22 à 40 ms de silence
   à chaque raccord.

Ne rien publier ni planifier tant qu'un défaut « bloquant » reste. Aucune vidéo n'est publiée sans ce
rapport. Un premier passage de vérificateur trouve typiquement un mot doublé par une coupe, une piste
d'effets qui contient encore l'ancienne musique, un effet qui masque la marque.

### Modèle de consigne pour l'agent (à adapter)

```
Tu es le vérificateur du film <chemin>. Tu NE MODIFIES AUCUN fichier. Pour chaque point ci-dessous,
colle la PREUVE (commande, sortie, instant) et note la gravité (bloquant / à corriger / mineur).
1. Transcription mot à mot (whisper medium, français) contre le script <chemin script>.
2. Pour chaque coupe de la liste <instants>, transcris l'extrait [t-1,5 s ; t+1,5 s] et cherche un mot
   tronqué, répété ou un clic ; relève le niveau dBFS 1 image avant et 1 image après.
3. Saut de timbre ou de niveau entre clips voisins.
4. Image : planche à 4 images par seconde sur toute la durée, défauts de génération, texte repeint.
5. Nom de la marque et prix : mot à mot.
Rends un tableau instant / gravité / preuve / correction proposée.
```

## 6. Compter les images, diviser, comparer

- **Compte les images, ne lis pas la durée du conteneur.** Le conteneur peut annoncer 40,10 s pour un film de
  1 200 images à 30 i/s (= 40,00 s) : il accuse alors à tort le moteur d'une dérive qui n'existe pas.
  `ffprobe -count_frames -select_streams v:0 -show_entries stream=nb_read_frames`.
- **Une DIVISION attrape ce qu'un contrôle ne peut pas voir.** Le contrôle du moteur calcule « attendu »
  et « obtenu » avec le même drapeau de cadence : il peut annoncer « écart +0 image » sur un film rendu à
  30 i/s depuis des sources à 24. 900 images pour 30,000 s ne font pas 24 i/s, mais 30. Divise
  images / durée sur le fichier LIVRÉ (exemples sains : 720 / 30,000 = 24,000 ; 960 / 40,000 = 24,000).
- **Le nombre d'images peut être juste et le fichier faux** : 270 images exactes mais 9,088 s pour 9,000 s
  annoncées et 60 i/s au lieu de 30 (segments qui ne durent pas un nombre entier d'images). Contrôle le
  flux vidéo : durée, cadence (`r_frame_rate`).
- **Prouver qu'un correctif ne touche rien** : `framemd5` avant et après sur toutes les voies (toutes
  les images comparées, toutes identiques). **Un témoin négatif obligatoire** : le même film avec le
  défaut remis doit CHANGER (par exemple un contour mis à 0 doit donner des images différentes). Une
  comparaison qui ne peut pas rougir ne prouve rien.
- **Sources intactes** : relève les empreintes md5 à l'extraction et recontrôle-les après le rendu.
  **Une copie annoncée se vérifie par empreinte** : annoncer une copie du film dans un dossier de
  livraison sans l'avoir comparée à l'original, c'est risquer d'annoncer un fichier qui n'y est pas.

## 7. Texte dans l'image

- **Détecteur de texte sur TOUTES les images** après un effacement ou une traduction (0 texte étranger).
  Un lecteur de texte, pas des pixels, avec un témoin positif : voir `sous-titres.md` (section 7).
- **Relis au grain** tout texte qui a traversé un modèle (recadré, agrandi, ligne par ligne).
- **Cherche les défauts de pubs traduites** (chiffre `1` pour « un », unités anglaises, coupe au milieu
  d'un mot, « Before / After ») et les gabarits non remplis avant de livrer.
- **Pas d'ÉTENDUE comme mesure** : une étendue (minimum sur toutes les images) est le pire cas de la
  pollution ; prends la valeur typique ou la médiane.

## 8. Resynchroniser les sous-titres après tout changement audio

Règle permanente : après TOUT changement audio (accélération `atempo`, voix régénérée, coupes),
re-transcris, re-dérive les sous-titres, vérifie l'alignement. Sous-titres décalés = bug visible et
inacceptable. Jamais de raccourci.

1. Changer l'audio. 2. **Re-transcrire** le nouveau fichier (mots horodatés). 3. Mettre à jour
l'instant d'ancrage (première occurrence du mot d'ouverture du corps, par exemple « Bonjour »).
4. **Re-dériver les sous-titres** depuis la nouvelle transcription. 5. **Valider** : pour chaque carte,
les mots clés du texte apparaissent dans la voix transcrite pendant la fenêtre de la carte. 6. Si la
carte 1 est à plus d'1 s de l'ancre, c'est un bug d'ancre : ajoute des variantes. 7. Re-rendre.
8. **Re-transcrire le rendu final** et re-valider.

Pourquoi : un `atempo` avec un bug de durée (`-t H`) peut dupliquer une phrase (« je suis Nadine »),
puis la carte « Bonjour je suis Nadine » apparaît avec plus d'une seconde de retard parce que le mot
d'ancre n'a pas été reconnu après l'accélération. La transcription entend souvent le mot d'ancre de
plusieurs façons fausses : garde une liste large de variantes du mot d'ancre, sinon l'ancre saute
loin. Validation :

```python
for carte in cartes:
    voix_pendant = mots_transcrits[carte.debut:carte.fin]
    mots_cles = mots_significatifs(carte.texte)
    if not any(m in voix_pendant for m in mots_cles):
        # BUG : corriger l'ancre de cette phrase
```

## 9. Journaliser, sauvegarder, annoncer

- **Journalise le SUCCÈS, pas seulement l'échec.** Un montage peut être modifié par une demande
  envoyée depuis une page ouverte en parallèle : l'outil a parfaitement fonctionné, mais une demande
  réussie qui ne laisse aucune trace oblige à comparer deux sauvegardes pour comprendre. Journal des succès avec la liste de ce qui a changé, affiché à
  l'ouverture du projet ; avant de conclure à un bug, cherche qui d'autre a la main.
- **Une sauvegarde horodatée avant chaque écriture**, et un chemin de retour. **Une annulation ne
  DÉTRUIT jamais : elle renomme.** Une clé de sauvegarde en secondes entières ne garde qu'un pas pour
  trois écritures dans la même seconde.
- **Toute opération qui écrit est idempotente**, ou refuse le second passage (« enlève les silences »
  rejouée ne doit rien retirer au second passage ; une annulation suivie d'une répétition doit rendre
  exactement la même durée que la première fois).
- **Annonce le chiffre MESURÉ, jamais celui demandé.** Couper « 3,00 s » peut n'en retirer que 2,91 si
  un plan bute sur sa durée minimale ; annonce le chiffre écrit.
- **Quand la même demande revient très vite** (moins de vingt minutes), considère qu'elle n'a pas abouti, quoi que le
  journal ait répondu, et dis-le simplement.
- **Une question n'est pas un ordre** : « comment masquer ce bandeau ? » reçoit la marche à suivre,
  pas une modification.

## 10. Faire tester par un agent

Sur tout outil qui ÉCRIT des données, fais tester par un agent avant de dire que c'est bon : un agent
trouve des défauts dans du code déclaré vérifié, chacun avec sa reproduction et sa preuve collée (par
exemple une phrase qui déclenche la mauvaise règle). Celui qui écrit le code teste ce qu'il a eu l'intention d'écrire, un agent teste ce qui
est écrit. Demande des **preuves collées**, pas des
avis ; interdis-lui de modifier les fichiers ; fais-lui tester en priorité les phrases que l'interface
propose elle-même, les nombres à deux chiffres, la même opération deux fois, les négations, les ordres
contradictoires, les bornes hors domaine, les en-têtes mal formés. Un correctif n'est pas vérifié tant
qu'il n'est pas rejoué. Toute table de mots-clés cherche en MOT ENTIER (`\bmot\b`), jamais en sous-chaîne
(« couvre » contient « ouvre », « chanson » contient « son »).

## 11. Liste de contrôle finale avant livraison

Coche chaque ligne sur le fichier LIVRÉ, jamais sur le blueprint ou l'intention.

**Le fichier**
- [ ] Dimensions et format voulus (9:16, ou celui de la source) ; cadence par DIVISION = la bonne (24 ou 30).
- [ ] Images comptées = images attendues, écart 0 ; durée du FLUX vidéo juste, pas celle du conteneur.
- [ ] `color_transfer` n'est ni `arib-std-b67` ni `smpte2084` (sinon prévenir et refilmer en SDR).
- [ ] Audio 48 kHz stéréo ; `loudnorm=I=-14:TP=-1.5:LRA=11` ; 0 silence de 0,30 s et plus ; part active
      relevée.
- [ ] Sources intactes (md5 avant et après).

**Rythme et grammaire**
- [ ] Les 12 règles du contrôle : chaque écart est expliqué, aucune règle « non mesurée » prise pour du vert.
- [ ] Ouverture à 2,00 s au plus (ou l'écart est dit) ; aucun plan de preuve sous 2,5 s ; dispersion
      d'au moins 18 % ; aucune rafale.
- [ ] La fin montre la vraie page produit (prix, note, avis réels) ou son absence est dite ; aucun
      gabarit non rempli (`!!!`, `{...}`, `XXX`) ; aucun prix, marque ni avis inventé.

**Sous-titres**
- [ ] Bas du bloc sous 80 % ; 0 ligne orpheline ; 0 virgule pendante ; « 50 » avec son « % » ; aucun trou
      de plus de 0,30 s ; police réellement ouverte (largeur mesurée) ; chaque carte relue.
- [ ] Mots douteux revérifiés avec un modèle plus gros sur la phrase entière.
- [ ] Détecteur de texte sur toutes les images : aucun texte cuit étranger (et un logo n'est pas une
      incrustation).

**Voix, musique, bruitages**
- [ ] Transcription du rendu contre le texte, mot à mot ; aucun mot tronqué ou répété à une coupe ; niveau
      de jonction sans chute brutale ; pas de saut de timbre.
- [ ] Rapport voix/musique de 12 dB ; musique libre de droits avec licence notée ; pas de chant ;
      bruitages sous la voix ; la voix colle à l'appareil de l'image.

**Image**
- [ ] Planche de 12 à 16 images REGARDÉE ; gros plan de 6 à 8 images sur chaque transition ; défauts de
      génération à 4 images par seconde ; texte repeint relu au grain ; même produit partout.
- [ ] Format de livraison = celui de la source (pas de bandes floues d'habillage).

**Compte rendu**
- [ ] Chiffres mesurés annoncés (pas les chiffres demandés) ; écarts restants et leur raison ; journal
      du succès ; sauvegarde horodatée ; copies livrées vérifiées par empreinte.
