# 02. Le dossier de recherche (étape 1) : où chercher, dans quel ordre, avec quelles étiquettes

Lis ce fichier au moment de lancer la première recherche, après la porte 0. Il décrit la voix des clientes, le marché de lancement dans sa langue, les quantités visées, l'ordre des passes et ce que tu fais quand un outil échoue. Les concurrents et les pubs prouvées sont dans `06`, le décompte d'autorité dans `05`, le comptage des expressions dans `04`.

## 1. La règle de vérité (elle passe avant toutes les autres)

1. Tu fais toi-même la recherche et tu en tires le DOSSIER. Tu ne SIMULES aucune recherche. Un outil qui échoue donne « NON MESURÉ », jamais une valeur supposée.
2. Chaque affirmation porte une étiquette :
   - **[DOSSIER]** : appuyée sur une source lue, avec son URL ;
   - **[PAGE LUE + URL]** : une page que tu as réellement ouverte ;
   - **[DÉDUIT]** : ton raisonnement à partir du dossier ;
   - **[PRESSE]** : propos rapporté par un journaliste ou un site éditorial ;
   - **[SITE VENDEUR]** : texte publié par un site qui vend (jamais une preuve) ;
   - **[BLOG]** : texte d'un blogueur ou d'une blogueuse (jamais une voix de cliente) ;
   - **[TES VENTES]** : ce qui vient des commandes réelles de la personne ;
   - **[NON MESURÉ]** et sa raison ; **[ESTIMATION]** avec sa fourchette ; **[IGNORÉE, non accessible dans ce mode]**.
3. Une citation client sans URL est interdite. Si le dossier en contient moins que demandé, tu en donnes moins et tu le dis.
4. Tu n'inventes AUCUN chiffre, avis, témoignage, nombre de clientes ou résultat. Quand une preuve manque, tu écris « preuve à fournir ».
5. Un chiffre marqué ESTIMATION reste une estimation, avec sa fourchette.
6. S'il te manque une information pour conclure, tu la demandes à la personne.
7. Les avis des CONCURRENTS (grandes marques, Amazon) servent au LANGAGE client, jamais de preuve pour le produit de la personne.
8. Les citations sont recopiées mot pour mot, fautes comprises. Une coupe s'écrit `[…]`. Les émojis sont remplacés par « (émoji) ». Avec `scripts/verifie_citations.py`, chaque citation du dossier doit être retrouvée dans la source brute : une citation recopiée de mémoire est une faute.
9. Les faux témoignages publiés par les boutiques sont écartés (et cités à part, pour mémoire : c'est ainsi que les concurrents font parler l'avatar). Les propos d'un journaliste sont marqués [PRESSE]. Ce que dit un vendeur sur son propre site est [SITE VENDEUR].

## 2. Ce que tu produis : les volets de l'étape 1

| Volet | Contenu | Dossier de travail | Référence |
|---|---|---|---|
| A. Voix du marché de lancement | citations FR (ou dans la langue du lancement) par thème, avec URL | `voix_lancement/` | ce fichier + `04` |
| B. Voix du marché source (hors marché) | même chose en anglais, pour comparer, jamais comptée | `voix_source/` | ce fichier |
| C. Créateurs (contenu organique) | vidéos TikTok, YouTube, Instagram qui dépassent la médiane de leur créateur, avec les commentaires | `createurs/` | `05` |
| D. Concurrents et pubs prouvées | deux pays, pubs regroupées par domaine, preuve par durée, déclinaisons, couverture | `adlib/` | `06` |
| E. Autorité qui convertit | décompte des porte-parole sur les pubs prouvées | `adlib/` | `05` |

Tu peux lancer A, B, C et D en parallèle, avec des sous-tâches déléguées, si la personne a accepté le budget de requêtes ; chaque volet écrit dans SON dossier et ne touche pas aux autres. Évite de lancer deux tâches lourdes en même temps.

Niveau visé (ordre de grandeur d'une recherche complète, ESTIMATION) : plusieurs centaines de sources lues, plus de 250 citations mot pour mot dans la langue du lancement, une centaine de pages distinctes, une centaine de vidéos de créateurs, une centaine de concepts de pub classés. Si tu en as moins, écris combien et pourquoi.

## 3. Où chercher, type de source par type de source

Dans TOUS les cas, les sources viennent du marché de lancement, dans sa langue. Exemple pour un lancement en France : Reddit francophone (r/france, r/AskFrance, fils en français), forums français, Amazon.fr, Trustpilot FR, YouTube FR. Jamais les fils anglophones pour un lancement français. Pour un autre pays, cherche l'équivalent local : les cinq forums et sites d'avis que les premières recherches citent le plus.

| Type de source | Où | Comment | Piège connu |
|---|---|---|---|
| Forums et communautés | forums thématiques du pays (en France : forums généralistes et forums de passionnés), Reddit local | `cherche_web.py` pour trouver les fils, `pages.py` pour les lire en entier | un forum qui répond 429 (trop de requêtes) ou exige une connexion : note-le, ne le contourne pas ; les groupes Facebook sont fermés : seuls leurs titres sont visibles |
| Avis marchands | Amazon local, Trustpilot, sites d'enseignes, pharmacies en ligne, sites d'avis certifiés | extraits de recherche (`cherche_web.py`) avec leur URL ; Trustpilot se lit avec `pages.py` | Amazon bloque la lecture directe (règle : extraits de recherche seulement) ; les avis chargés par JavaScript ne se lisent pas ; très peu d'avis parlent de l'usage précis |
| Presse | presse généraliste et presse spécialisée, régionale, radio | `pages.py` | marque tout [PRESSE] ; un journaliste n'est pas une cliente |
| Blogs et leurs commentaires | blogs de passionnés et de personnes concernées | `cherche_web.py` puis `pages.py` | l'auteur du blog n'est pas un lecteur (marque [BLOG]) ; datation (voir plus bas) |
| YouTube | vidéos du sujet (créateurs de la communauté, professionnels du sujet, tests de produits) | `youtube.py cherche` puis `youtube.py comm` | biais : les vidéos de professionnels et de médias attirent des commentateurs qui ne sont pas ta cible ; garde ensuite les messages qui parlent de TON sujet |
| TikTok, Instagram | commentaires sous les vidéos et publications du sujet | ÉTAPE PAYANTE : `commentaires_sociaux.py` (`CLES.md` section 6) | le filtre de pays ne filtre pas vraiment : beaucoup de vidéos sont dans une autre langue ; le public TikTok penche jeune |
| Reddit | fils du marché de lancement | `pages.py` lit le flux RSS du fil | le JSON de l'ancien site renvoie souvent une page de blocage ; la limite de débit est stricte (un fil toutes les deux à trois minutes pour un gros lot) |
| Pubs concurrentes | texte des pubs prouvées du marché de lancement | `06` | le texte d'une pub est un signal de langage, pas une voix de cliente |
| Site vendeur du concurrent | ses avis, ses « commentaires » | isolés en [SITE VENDEUR] | ne sert jamais de preuve |

Moteur de recherche : l'API Brave, par `cherche_web.py`, quand la clé est branchée. Piège mesuré : même avec la langue du lancement demandée, le moteur renvoie souvent de l'anglais ; mets des mots de la langue du lancement DANS la requête (« avis », « forum », « témoignage », « ça m'a changé »). Sans clé : l'outil de recherche web intégré à Claude Code, plus approximatif ; dis-le dans le dossier. Pour LIRE une page précise, utilise `pages.py` (ou curl) : tu gardes ainsi la page sur disque, et `verifie_citations.py` y retrouvera tes citations. Un outil de lecture qui ne garde rien sur disque (comme WebFetch) ne permet pas ce contrôle.

Requêtes à lancer, par thème : une requête par famille de thèmes (section 4) et par type de source, avec les mots de la cliente (pas ceux de la marque ni ceux d'un site médical). Exemple fictif pour un oreiller cervical : « mal de nuque réveil forum », « j'ai essayé trois oreillers avis », « je dors mal depuis nuque témoignage ».

## 4. Les deux volets de la voix, et les familles de thèmes

Au moins **50 citations mot pour mot avec URL**, toutes dans la langue du marché de lancement.

**Volet A, le PRODUIT.** Avis sur les produits concurrents ou de la même catégorie (Amazon, grandes marques, Trustpilot, forums) : ce qui déçoit, ce qui plaît. Jamais pris sur le site du concurrent étudié.

**Volet B, l'AVATAR dans sa langue et dans toute sa vie autour du problème**, pas seulement le produit : le problème tel qu'elle le vit, son usage du produit ou de la catégorie, les phrases de l'entourage, les solutions essayées qui ont échoué, ce qu'elle refuse de faire, qui elle accuse, ce qu'elle désire, ses peurs, son vocabulaire exact.

**L'avatar doit être compris du bout des doigts.** Le volet B couvre OBLIGATOIREMENT les familles de thèmes ci-dessous, avec au moins 5 citations de sources distinctes par thème quand elles existent ; sinon écris combien, et pourquoi. La liste vaut pour n'importe quel produit : instancie chaque famille pour le tien.

1. le problème exact (où, quand, comment il se manifeste, avec ses mots) ;
2. l'usage du produit ou de la catégorie (les moments et les objets du quotidien liés au problème) ;
3. les moments de gêne ou de honte du quotidien (au travail, en voyage, chez des amis, en public, devant un proche) ;
4. les relations proches (couple, famille, amis, collègues) et ce que le problème y change ;
5. les phrases exactes de l'entourage, avec QUI les dit ;
6. le regard des autres et l'image qu'elle a d'elle-même (identité) ;
7. les peurs de 3 h du matin (la dégradation, perdre le contrôle, dépendre des autres, finir seule) ;
8. les émotions ;
9. les solutions essayées qui ont échoué, dans l'ordre où elle les essaie ;
10. ce qu'elle refuse de faire ;
11. qui elle accuse ;
12. ce qu'elle gagne à garder le problème (excuse, résignation, colère) ;
13. ses désirs et le fantasme ;
14. ses victoires (celles qui s'en sont sorties, leurs mots, ce qu'on leur a dit) ;
15. le DÉCLENCHEUR d'achat (l'événement, la remarque, la date qui fait acheter) ;
16. ses objections contre la CATÉGORIE de produit (prix, efficacité, confort, apparence, confiance dans la marque) ;
17. l'expérience réelle des produits de la catégorie, chez des personnes de son âge (avis) ;
18. son quotidien concret (travail, famille, sommeil, fatigue) ;
19. ce qu'elle lit et regarde, où elle achète, son budget ;
20. la transformation attendue (à quoi ressemble « c'est réglé », dit avec ses mots) et les mots du marché pour ce résultat.

Exemple fictif pour un oreiller cervical : famille 1, « je me réveille à quatre heures avec la nuque bloquée » ; famille 9, « j'ai essayé trois oreillers, aucun ne tient ma tête » ; famille 15, « c'est après le week-end chez ma sœur, où j'ai bien dormi, que j'ai cherché ».

Ces familles sont une grille de couverture, pas un carcan : adapte les mots à ton produit (un avatar masculin, un problème de maison, un usage professionnel...), regroupe les citations comme ta niche le demande, ajoute les thèmes propres à ton produit, mais garde l'esprit : toute la vie autour du problème.

Datation : DATE chaque citation quand la page le permet, et préfère les messages récents (2020 et après). Un forum ancien dit le vécu, pas les marques d'aujourd'hui : signale-le (« réserve de datation »).

Qui est crue : mesure-le (voir `04`, section 6) au lieu de le supposer. Compare les commentaires sous des vidéos de professionnels et sous des vidéos de pairs (« merci », défiance envers le conseil d'un professionnel, conseil de pair à pair) : la différence dit à qui elle fait confiance.

## 5. L'âge : trois mesures qui convergent

Ne donne jamais un âge sans ses mesures. Retiens et croise :

1. **Les âges déclarés en ligne.** Extrais les « j'ai 61 ans » avec un script ou une recherche, puis trie à la main : garde seulement les âges dits à la première personne (ou d'une proche désignée), écarte les durées (« je fais ça depuis 50 ans ») et les âges sans rapport. Donne le nombre, la médiane, la répartition par tranche, et sépare les groupes (par exemple utilisatrices régulières d'un produit de la catégorie et personnes qui n'en ont jamais utilisé). Précise l'âge du début du problème quand elles le disent.
2. **L'audience RÉELLE des pubs du marché de lancement** (portée par âge et par sexe de l'Ad Library, pour les pubs diffusées en Europe) : `06`.
3. **L'audience réelle du concurrent** sur son marché (même source).
4. En complément, l'épidémiologie [PRESSE] ou [SITE VENDEUR] : à marquer comme telle.

Verdict d'âge [DÉDUIT] : un cœur (une tranche de quelques années autour d'un pivot), une frange utile de chaque côté, et la réserve : les acheteurs réels n'ont pas toujours l'âge de ceux qui écrivent en ligne (une tranche d'âge qui écrit peu peut peser beaucoup dans l'audience de la pub). Le prénom de l'avatar est choisi parce qu'il est de sa génération et, idéalement, parce qu'il sort de sa propre bouche dans une source (cite-la).

## 6. L'ordre des passes

1. Écris la liste des requêtes (par thème et par type de source), annonce le nombre à la personne si elle dépasse la quarantaine.
2. `cherche_web.py` par lots de 6 à 10 requêtes : lis les résultats et note les URL utiles.
3. `pages.py` sur les URL choisies (forums, blogs, presse, Trustpilot, Reddit). Ouvre les `.txt` qui sortent « COURTE » ou « MUR POSSIBLE » avant de conclure.
4. `youtube.py cherche` (dix à quinze requêtes) puis `youtube.py comm` sur 40 à 60 vidéos : mélange des vidéos de la communauté, de professionnels, de tests de produits.
5. Si la personne a dit oui à l'étape payante : `commentaires_sociaux.py` (annonce le coût, attends le « oui »).
6. `corpus.py` (un corpus PAR marché) puis `cherche_corpus.py` pour retrouver les phrases par thème et choisir les citations.
7. `compte_verbatims.py` (voir `04`) : les expressions qui reviennent, comptées par type de source.
8. Les âges (section 5). Si ton produit a plusieurs usages (par exemple un coussin pour le canapé et pour le lit), compte aussi les messages qui nomment chaque usage, et ceux qui en nomment plusieurs : une pub qui ne montre qu'un usage laisse de côté une part réelle de la cible.
9. Bilan des trous, questions à poser aux vraies clientes, puis `verifie_citations.py`.

Pour chaque expression candidate, va la chercher EXPRÈS dans les types de source où elle manque, avant de lui donner sa classe : cinquante citations ne suffisent pas à classer.

## 7. Quand un outil échoue

| Symptôme | Ce que tu fais | Ce que tu écris dans le dossier |
|---|---|---|
| Clé absente (message de `charge_cles.py`) | tu t'arrêtes sur ce volet, tu renvoies la personne à `CLES.md`, tu continues les volets sans clé | « [IGNORÉE, clé X non branchée] » |
| Erreur 429 (trop de requêtes) | tu espaces, tu réessaies plus tard, tu ne multiplies pas les tentatives | la source, et « refus de débit » |
| Page vide, défi anti-robot, connexion exigée | tu ne contournes jamais ; tu gardes l'extrait de recherche s'il existe | « [NON MESURÉ], mur anti-robot » + ce qui a été tenté |
| Page très courte | tu l'ouvres avant de conclure : une page courte n'est pas un mur | « page courte, lue » ou « contenu non chargé » |
| Page très lourde mais sans contenu (page hors ligne du navigateur, bandeau de cookies) | tu vérifies par un témoin positif : ce que tu cherches est-il vraiment dans le texte ? | rien tant que tu n'as pas vu le contenu |
| Zéro résultat pour une requête | tu essaies une variante dans la langue du lancement | le nombre de variantes tentées |
| Quota épuisé | tu t'arrêtes, tu annonces la reprise (demain) | « quota épuisé le [jour], volet repris le [jour] » |
| Citation introuvable par `verifie_citations.py` | tu corriges le dossier (retire ou recopie depuis la source) | rien : la citation n'existe pas encore |

Un « zéro » n'est une réponse que si le témoin positif a rougi : avant d'écrire « personne ne dit X », vérifie que ta recherche trouve bien un cas où quelqu'un le dit (une expression voisine, un cas connu). Un grep négatif ne prouve pas une absence.

## 8. Le bilan des trous et les questions aux vraies clientes

Termine le volet B par un tableau :

| Thème | Citations (tous rattachements) | URL distinctes | Solidité | Ce qui manque |
|---|---|---|---|---|

Solidité : « forte » à partir de 5 sources distinctes, « moyenne » pour 2 à 4, « faible » pour 1, « trou » pour 0. Ajoute les trous par marché (autres pays de lancement envisagés), par source (celles qui ont refusé la lecture), et les QUESTIONS EXACTES à poser aux vraies clientes (commentaires sous les pubs, sondage aux acheteuses) pour combler ce que le web ne donne pas. Modèle de questions (à adapter à ton produit) :

1. Depuis quand as-tu ce problème, et à quel moment de la journée est-il le pire ?
2. Qu'as-tu déjà essayé avant notre produit ? Qu'est-ce qui ne t'a pas convenu ?
3. Qui t'a parlé de nous, ou qui a vu la publicité en premier ?
4. Pour qui as-tu pris ce produit : pour toi, pour un proche, pour les deux ?
5. Comment appelles-tu notre produit quand tu en parles à un proche (donne-nous le mot exact) ?
6. Qu'est-ce que ton entourage te dit de ton problème ?
7. Quel âge as-tu, et où utilises-tu le produit d'habitude ?
8. Après une semaine d'usage : qu'est-ce qui a changé, avec tes mots ?

Si un trou touche un point de l'avatar (étape 3), lance une passe de recherche ciblée AVANT d'écrire l'avatar.

## 9. Porte 1 : ce qui doit être vrai pour passer à l'étape 2

Fais un CONTRÔLE DE COMPLÉTUDE : pour chaque volet et chaque rubrique, ce qui a été fait, ce qui manque, pourquoi. Puis vérifie, en ouvrant les fichiers :

1. Chaque volet a son dossier de travail non vide (ou une ligne « IGNORÉE » avec sa raison).
2. Les citations du dossier passent `verifie_citations.py` sans « NON RETROUVÉE » (lance-le, ne le suppose pas).
3. Le nombre de citations, de pages distinctes, de thèmes couverts est écrit (pas « beaucoup »).
4. Les étiquettes sont posées partout ; aucun chiffre sans outil ni source ; chaque trou porte sa raison.
5. Les sources hors marché sont dans leur section « hors marché, pour info » et absentes des comptes.
6. La personne a vu le dossier avec ce contrôle de complétude et a écrit « suite ».
