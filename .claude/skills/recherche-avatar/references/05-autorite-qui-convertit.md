# 05. Quelle AUTORITÉ convertit dans ta niche : la méthode du décompte

Lis ce fichier quand tu as les pubs et les créateurs du dossier (volets C et D de l'étape 1) et que tu dois répondre à la question : QUI doit parler dans la pub (la personne elle-même, un spécialiste, un proche, un enfant, un homme, une marque sans visage) ?

Règle de fond : le genre de porte-parole ne se suppose JAMAIS. Il se choisit par la recherche de niche, prouvée par des pubs qui ont gagné. Et ce que tu livres est un verdict CHIFFRÉ avec ses limites, jamais une opinion.

## 1. Les candidats à tester

Tu testes TOUS ces candidats, même ceux que la personne juge improbables (ce sont ceux qu'elle voudra savoir). Adapte les libellés à ta niche.

| Code | Porte-parole | Qui parle dans la pub |
|---|---|---|
| pair | la personne concernée, qui raconte elle-même | le « je » du texte ou le visage d'une cliente (réelle ou mise en scène) |
| specialiste | médecin ou spécialiste de la santé du sujet | blouse, titre, « depuis quinze ans je soigne... » |
| chirurgien | expert technique ou chirurgien | idem, pour le problème qui relève de l'acte lourd |
| soignant_proximite | pharmacien, coach, diététicien, vendeur-conseil | visage face caméra ou page personnage |
| enfant_adulte | la fille ou le fils qui parle de sa mère ou de son père | « ma mère dort mal depuis des mois... » |
| jeune_proche | un jeune de la famille (neveu, nièce, filleul, jeune adulte) qui parle | un jeune proche à l'écran ou au « je » |
| conjoint | un homme (ou une femme) qui parle pour sa compagne (ou son compagnon) | « ma femme... » |
| autre_proche | sœur, amie, voisine, parent | « ma sœur dort enfin toute la nuit depuis qu'elle a changé d'oreiller » |
| communaute | faux groupe d'entraide, communauté | page « groupe de soutien » (à observer, pas à imiter) |
| createur | un créateur de contenu | vidéo d'un créateur |
| marque_texte | aucune personne : produit, phrase, offre | texte seul, image du produit |

Les proches (enfants, parents, jeunes de la famille) sont souvent l'ENJEU de la pub (« je n'ai pas pu conduire ma fille à son match, j'avais la nuque bloquée ») sans en être le porte-parole : note-le dans la colonne `enjeu_famille`, sans le compter comme voix.

## 2. Étape A : bâtir la base de concepts

1. **Un CONCEPT = un texte distinct**, quel que soit le nombre d'identifiants Ad Library qui le portent (plusieurs identifiants portent souvent le même média). Compte les déclinaisons dans « variantes » et « cartes_meme_texte ».
2. **Trois niches, pas une** : la tienne, une niche voisine et des marques qui visent le même profil. Un échantillon de la seule niche est trop mince pour conclure sur les candidats rares. Vise une centaine de concepts ; si tu en as moins, écris combien.
3. **Sources** : tes recherches d'Ad Library (`06`) et, si la personne en a une, sa bibliothèque de pubs gagnantes. Lis chaque pub (image, vidéo ou au moins son texte intégral) pour savoir QUI PARLE.
4. **Une ligne par concept** dans un fichier CSV (modèle : `python3 scripts/decompte_autorite.py --modele`) : code, groupe, marché, domaine (la marque), id, jours en ligne, variantes, cartes au même texte, portée (si publiée), porte-parole, enjeu_famille, methode (`vu` si tu as regardé la pub, `texte` si tu l'as classée d'après sa page ou son texte), accroche.

## 3. La preuve : ce qui fait un WINNER PROUVÉ

Seules les pubs prouvées comptent comme modèle. Une pub non prouvée peut donner une idée, jamais servir de modèle ni compter dans un pattern.

- Diffusée en Europe (UE ou Royaume-Uni) : **couverture totale de 900 000 personnes ou plus** (la portée se lit dans « transparence par lieu » de l'Ad Library, ou avec l'outil de détail du serveur MCP). Vers 1 million, c'est un concept « banger ».
- Diffusée aux États-Unis seulement (Meta ne publie aucun chiffre hors Europe) : **en ligne depuis 90 jours ou plus ET déclinée** : 3 variantes ou plus = forme FORTE ; le même texte sur 2 cartes ou plus = forme FAIBLE (souvent le texte générique d'une marque).
- Ne prouvent RIEN : l'ordre d'affichage « trié par impressions » de l'Ad Library hors connexion (même ordre dans les deux sens), une pub récente, le classement d'un outil tiers ou d'un swipe file trouvé sur les réseaux, un titre qui sonne bien.
- Meta publie la portée par GROUPE de pubs : des identifiants différents rendent la même portée. Dédoublonne avant d'additionner.
- Les pubs du « top 20 actif » d'une très grosse marque (au moins 1 000 pubs actives ET 100 000 visites par mois) disent ce que la marque pousse, pas ce qui est prouvé : si tu les gardes, mets-les à part, étiquetées « top de marque ».

## 4. Étape B : classer QUI PARLE

- Le porte-parole est **QUI PARLE** dans la pub (le « je » du texte, ou le visage à l'écran), **pas qui est cité**. « Conçu avec un spécialiste du sommeil » est une CAUTION citée : compte-la à part (colonne ou note), pas comme un soignant qui parle.
- Un titre ne se classe pas sur sa page seule : regarde la pub. Un classement fait d'après le texte ou la page doit porter `methode = texte`, et le dossier le dit. Un titre qui a l'air d'une preuve n'en est pas une : ne prends jamais le titre d'une page pour un porte-parole sans l'avoir ouverte.
- Relis un échantillon de tes classements (au moins le quart, en priorité les cas ambigus : épouse qui parle de l'oreiller de son mari, enfant adulte qui parle de sa mère, sœur, récit à la première personne présenté comme une simple confidence) : une seconde lecture peut faire reclasser des cas ; compte-les.

## 5. Étape C : le décompte

```
python3 scripts/decompte_autorite.py concepts.csv --json decompte.json
```

Le script applique la règle de preuve (seuils modifiables), puis imprime :

1. le tableau par porte-parole : concepts vus, prouvés, part des prouvés, dont portée UE, dont forme forte, dont forme faible ;
2. **contrôle 1** : le même tableau SANS la marque dominante (une seule marque peut peser près de la moitié des prouvés d'un porte-parole) ;
3. **contrôle 2** : en forme forte seule plus portée UE (les formes faibles pèsent souvent plus de la moitié des prouvés) ;
4. les concepts où la famille est l'ENJEU, et la liste des prouvés.

Tu écris à la main le verdict qui suit. La question à chaque contrôle : le classement de tête change-t-il ? Si non, dis « le classement ne change pas » ; si oui, la conclusion devient « fragile » et tu le dis.

## 6. Étape D : le côté organique (qui fait les vues, qui fait parler, qui fait acheter)

Trois mesures différentes, à ne JAMAIS confondre : la **portée** (vues), la **conversation** (commentaires), le **désir** (intentions d'achat). Le type de porte-parole qui a le plus de vues n'est pas forcément celui qui fait acheter : mesure les trois, compare-les.

- **Base** : des vidéos TikTok, YouTube (et Instagram si tu le peux) retenues dans les deux marchés, filtrées sur le sujet puis choisies à la main.
- **Médiane du créateur** : TikTok, ses 20 dernières vidéos (hors épinglées) ; YouTube, ses 50 dernières mises en ligne, en séparant les Shorts (180 secondes ou moins) des formats longs (`youtube.py mediane`, `commentaires_sociaux.py mediane-tiktok`). Un média qui publie plusieurs vidéos par jour a une médiane qui ne couvre que quelques jours : dis-le.
- **Preuve d'une vidéo** : vues au moins 3 fois la médiane de SON créateur, OU 1 million de vues. Ajoute une colonne « dont récentes » : une vieille vidéo comparée à la forme actuelle du compte trompe le ratio.
- **Classe chaque vidéo** par porte-parole (mêmes codes qu'en section 1, plus « média ou spectacle » pour ne pas gonfler un type avec des professionnels tiers). Mode `vu` : vignette réellement regardée ; `texte` : déduit du titre ou du compte ; transcription lue si besoin.
- **Commentaires** : 15 à 40 par vidéo TikTok, jusqu'à 200 fils pour YouTube. Repère l'intention d'achat avec un filtre (où acheter, prix, nom du produit, lien, « j'en veux », « commandé »), puis RELIS-LES UN À UN : retire les réponses du créateur et les faux positifs. Relève aussi les objections et les croyances, et la façon dont la cible parle d'elle (âge, usage).
- **Tableau par type** : vidéos, prouvées, vues médianes, commentaires pour 1 000 vues, intentions d'achat lues sur les commentaires lus, exemple le plus fort avec son lien.
- **Biais d'échantillon** : les moteurs remontent d'abord les vidéos les plus vues. Le nombre de « prouvées » par type ne mesure donc pas la réussite du type : compare les types sur les vues médianes et le taux de commentaires.
- **Qui fait acheter** (comptage des recommandeurs, marché de lancement d'abord, source ensuite) : un événement = une personne qui dit, à la première personne, QUI lui a recommandé, donné, prescrit ou fait découvrir l'aide qu'elle a eue. Exclus : conseils donnés à autrui, doublons d'un même message, site vendeur, articles de presse. Relis les candidats un par un. Catégories : médecin, soignant de proximité, chirurgien, entourage (qui offre quoi), vidéaste, achat seule sans recommandeur, autres personnes de la communauté, publicité, classement d'une boutique. Note les détails qui changent l'action : ce que l'entourage offre, les canaux jamais cités (les groupes fermés ne se lisent pas), le délai entre la vidéo et l'achat.
- **La case vide** : si aucune vidéo ne réunit deux éléments de ta cible (par exemple la personne concernée ET la scène du problème, comme le réveil avec la nuque raide), écris « [DOSSIER pour le constat, DÉDUIT pour case vide] ». Absence de preuve n'est pas preuve d'absence : c'est peut-être une place libre, peut-être un échec que personne n'a montré.

## 7. Le verdict

Écris-le en points numérotés, du plus au moins prouvé, avec les chiffres du décompte et des contrôles.

1. **L'autorité qui convertit dans la niche, c'est X** (le porte-parole en tête du décompte), avec sa part de prouvés, le nombre de marques différentes qui la portent, et la réserve de la marque dominante.
2. **La deuxième famille prouvée** (souvent : l'absence de personne, produit/phrase/offre), avec ses meilleurs exemples. Compare à ce qui vend déjà chez la personne si elle a des ventes.
3. **La blouse (spécialiste, chirurgien)** : sa part, et dans quel rôle elle gagne (second rôle, caution, appareil à expliquer). Question à trancher par ton propre décompte : la blouse sert-elle surtout les problèmes qu'on ne voit pas ?
4. **Les proches (enfants, parents, jeunes de la famille)** : ils parlent ou ils sont l'enjeu ? Donne les deux comptes.
5. **L'homme (ou la femme) qui parle pour l'autre** : prouvé seulement quand il est lui-même la cible ? Donne le compte. Un simple acheteur de cadeau n'est pas une voix prouvée.

Puis :

- **Le trafic confirme** (ou non) : pour les 4 à 6 marques dominantes, la trajectoire de leur trafic (`06`) rapprochée de leur porte-parole dominant. C'est un signal de VOLUME, jamais un taux de conversion. Si l'outil ne couvre pas le pays, écris NON MESURÉ.
- **Ce que ça donne pour ton produit [DÉDUIT]** : le format à tester en premier, en une ou deux phrases, ET ce qui ne doit pas être le premier test.
- **À surveiller** : si un concurrent teste une autre autorité depuis peu, note la date et revérifie quand elle atteindra 90 jours et se sera déclinée.

## 8. Les limites à écrire AVANT que la personne agisse

- Les preuves sont-elles surtout de DURÉE (survie plus déclinaisons) et non de portée ? Combien de winners sont prouvés par la couverture UE ? Dis-le.
- L'échantillon : environ 30 cartes par recherche, N concepts. Combien de formes faibles ? Le classement résiste-t-il en forme forte seule ?
- Deux classements (le tien, celui d'une autre source) : lesquels as-tu relus, combien reclassés ?
- Les porte-parole des concurrents sont des PERSONNAGES fabriqués. Ils prouvent qu'un FORMAT marche, pas qu'un vrai médecin ou une vraie cliente convertit. En France, un faux médecin ou un faux témoignage présenté comme réel est une pratique commerciale trompeuse, et Meta a désactivé des pages « personnage » sur des sujets de santé. Les récits à la première personne partent des mots RÉELS des clientes (`04`) et d'une mise en scène assumée, jamais d'un faux titre de soignant, d'un faux média, d'un faux groupe ou d'un « achat vérifié » sur un personnage.
- Absence de preuve n'est pas preuve d'absence.
- Le côté organique : échantillon fait de pics, médianes sur 20 ou 50 vidéos, peu de vidéos avec commentaires lus par type.
- Aucun taux de conversion n'est visible : « ça convertit » est DÉDUIT.

## 9. Exemple fictif de verdict (pour fixer le format, chiffres inventés)

| Porte-parole | Concepts vus | Prouvés | Part |
|---|---|---|---|
| pair | 40 | 18 | 55 % |
| marque_texte | 22 | 9 | 27 % |
| specialiste | 6 | 3 | 9 % |
| enfant_adulte | 5 | 0 | 0 % |
| autres (créateur, conjoint, proche...) | 8 | 3 | 9 % |
| **Total** | 81 | 33 | 100 % |

« L'autorité qui convertit ici, c'est la personne concernée qui raconte (18 prouvés sur 33, 6 marques ; sans la marque dominante, 11 sur 22, le classement ne change pas). La deuxième famille est l'absence de personne (9 sur 33). Le spécialiste ne gagne qu'en second rôle (3 sur 33, une seule marque). Les enfants adultes : 0 sur 5. Limite principale : 31 des 33 preuves sont de durée, 2 de portée. [DÉDUIT] »

## 10. Porte : le verdict est prêt quand

1. Le CSV de concepts existe, chaque ligne a son porte-parole, sa méthode (`vu` ou `texte`) et son lien.
2. `decompte_autorite.py` a tourné et ses deux contrôles sont lus (le classement de tête change-t-il ?).
3. L'échantillon relu est compté (combien reclassés).
4. Les limites de la section 8 sont toutes écrites (ou « sans objet » avec raison).
5. Le verdict sépare DOSSIER (les chiffres) et DÉDUIT (ce que ça donne pour le produit).
