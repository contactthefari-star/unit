# 04. La voix du marché et la règle du verbatim FRÉQUENT

Lis ce fichier au moment de compter les expressions de la cliente (fin de l'étape 1), puis chaque fois que tu t'apprêtes à mettre une de ses phrases dans le dossier, un hook, un script, un texte de pub ou une page produit.

## 1. La règle (validée à l'usage, sur de nombreuses créas)

Un verbatim n'entre dans une copie que s'il revient PARTOUT. Ce qui compte, c'est le langage que l'avatar a vraiment adopté, pas une belle phrase vue une fois ou deux.

1. Un verbatim est une EXPRESSION que la cliente emploie, pas une citation isolée. On compte combien de fois elle revient (mêmes mots, ou variante proche de même sens) et dans combien de TYPES DE SOURCE : YouTube, TikTok, Instagram, avis (marchands et clients), forums, blogs, pubs concurrentes, presse. Une occurrence = une autrice : la même personne qui répète sa phrase compte une fois.
2. Trois classes :
   - **FRÉQUENT** : au moins 5 occurrences, sur au moins 3 types de source. C'est la SEULE classe qui entre dans une copie (hook, script, texte de pub, page produit).
   - **MOYEN** : 3 à 4 occurrences, ou 2 types de source seulement. Note de recherche : on continue à le chercher, on ne l'écrit pas dans une copie.
   - **RARE** : 1 ou 2 occurrences. Interdit en copie, même si la phrase est belle. Il peut aider à COMPRENDRE l'avatar.
3. La recherche compte les occurrences PAR type de source et note ces comptes à côté de l'expression, par exemple « forums 6, YouTube 4, TikTok 3, avis 2 : 15 occurrences, 4 types, FRÉQUENT ». Un verbatim livré sans ses comptes est traité comme RARE.
4. Seules comptent les sources du MARCHÉ DE LANCEMENT, dans sa langue. Un verbatim dans la langue du marché source ne compte jamais, même s'il revient partout là-bas : il sert à comprendre ce que la pub dit, puis tu cherches l'expression FRÉQUENTE qui dit la même chose dans la langue du lancement.
5. Adapter une pub étrangère : tu gardes le même truc, la même structure, la même pub, le même hook, les mêmes idées, et tu adaptes le bon langage. Chaque expression étrangère est remplacée par l'expression FRÉQUENTE du marché de lancement. On ne traduit pas mot pour mot, et on n'invente pas une autre pub.
6. Le résultat concret et visible, dit simplement, passe avant la formule astucieuse. Étalon (fictif) : « je me réveille sans avoir mal à la nuque » parle mieux que « ma nuque a enfin signé la paix avec mon oreiller ».
7. Ce que la personne a déjà validé ne se retouche pas ; la règle s'applique à tout ce que tu écris ensuite.
8. Sous chaque script ou texte livré, tu affiches les verbatims employés avec leurs comptes. En mode B (recherche web seule), la règle est la même : une occurrence n'existe que sur une page réellement ouverte, avec son URL.

## 2. Comment compter, concrètement

1. **Un corpus par marché.** `python3 scripts/corpus.py --brut brut --marche lancement > corpus_lancement.tsv`. Les pages et avis du site du concurrent étudié se classent avec `--vendeur domaine` (type « vendeur ») : ils sont exclus du comptage.
2. **Écris la liste des expressions candidates** dans `expressions.txt` (une par ligne, `libellé<TABULATION>regex`). Une expression = ses variantes d'orthographe et de forme (« j'arrête », « arrêter », « arrêt de »). Ajoute aussi les mots que TON produit emploie : s'ils sont absents de sa bouche, c'est une information (section 5).
3. **Lance** `python3 scripts/compte_verbatims.py corpus_lancement.tsv --expressions expressions.txt --sujet "<mots de ton sujet>" --probleme "<mots du problème>" --exemples 2 --marche lancement --md lexique.md`.
   - Sans `--sujet`/`--probleme` : une seule classe, calculée sur tout le corpus.
   - Avec les deux : le script ajoute « Dans le sujet », « Sujet ET problème » et une seconde classe calculée sur ta cible. Pourquoi : un corpus large (milliers de messages) fait sortir presque toutes les expressions en FRÉQUENT. La colonne qui compte est « sujet ET problème », celle qui dit si l'expression revient chez les personnes qui vivent TON problème.
   - Si les deux classes divergent, écris-le et retiens la plus prudente pour la copie.
4. **Lis le volume** que le script imprime (unités comptées par type) et son unité (« une autrice » si le corpus donne l'auteur ; « un message » sinon : dis-le dans le dossier).
5. **Cherche exprès** l'expression dans les types de source où elle manque (`cherche_corpus.py corpus.tsv "regex" --type forum`), puis relance les récoltes ciblées si besoin. Cinquante citations ne suffisent pas à classer.
6. **Colle** le tableau dans le dossier (section 2) avec ses deux citations d'exemple par expression FRÉQUENTE, copiées du corpus avec leur URL.

## 3. Comment présenter une expression

Format du tableau du lexique, FRÉQUENT en tête :

| Expression | YouTube | TikTok | Instagram | Avis | Forums | Pubs concurrentes | Presse | Total | Types | Classe |
|---|---|---|---|---|---|---|---|---|---|---|
| « je dors mal » (exemple fictif) | 12 | 9 | 0 | 6 | 18 | 2 | 3 | 50 | 6 | FRÉQUENT |

puis, sous chaque expression FRÉQUENTE, 2 citations d'exemple avec URL (mot pour mot). Le dossier ajoute deux colonnes qui parlent à la personne :

| Expression | Sujet ET problème | Toutes occurrences | Classe | En copie ? [DÉDUIT] |
|---|---|---|---|---|
| « je dors mal » | 41 | 50 (6 types) | FRÉQUENT | oui, c'est SON mot pour le problème |
| « rachis cervical » | 0 | 5 (2 types) | MOYEN | non : mot de site médical |
| mot du produit | 0 | 0 dans sa bouche | absent | à tester avant de l'imposer |

Pour la page « Customer Language Mining » (15 expressions au maximum, FRÉQUENTES d'abord, une citation isolée ne fait plus une ligne) : Expression qui revient | Comptes par type de source | Classe | Citation brute d'exemple | URL | Point de douleur | Résultat souhaité | Stade du funnel | Angle publicitaire possible (FRÉQUENT seulement). S'il y a moins de 15 FRÉQUENTES, tu en donnes moins et tu le dis. Les MOYENNES vont dans une liste « à confirmer », sans angle publicitaire ; les RARES n'y figurent pas.

## 4. Les 25 verbatims à garder sous la main

C'est la sélection que la personne (et le skill d'écriture) ouvrira en premier. Construis-la ainsi :

- 25 citations, TOUTES du marché de lancement, mot pour mot, avec URL, date quand elle existe, type de source et « j'aime » quand on les a.
- Choisies parmi les messages qui contiennent des expressions FRÉQUENTES ou qui les illustrent. Une belle phrase RARE peut y figurer si elle est marquée comme telle et qu'elle sert à comprendre.
- Rangées en six groupes, avec leur nombre cible :

| Groupe | Combien | Ce que tu y mets |
|---|---|---|
| La peur et l'identité | 7 | ce qu'elle craint de perdre, qui elle devient sans la solution, les phrases de 3 h du matin |
| Les proches, l'enjeu | 4 | pour qui elle le fait ou le craint (enfants, parents, conjoint) : l'ENJEU, pas le porte-parole |
| Le quotidien qui lâche | 3 | les actions de tous les jours devenues difficiles ou gênantes |
| Les solutions qui ont échoué | 4 | ce qu'elle a essayé, avec ses mots sur l'échec |
| L'entourage | 3 | une phrase de la belle-famille, du conjoint, des « autres », avec QUI parle |
| La recherche et les victoires | 4 | comment elle a cherché, ce qui a marché pour elle, avec ses mots de fierté |

- Termine par la réserve de datation : si plusieurs citations fortes viennent de blogs ou de forums anciens, dis-le (le vécu ne change pas, les marques et les outils cités vieillissent).

Exemple de ligne (fictif, à ne pas recopier) : `3. « [phrase recopiée de la source] » · [forum, 2024](URL de la page)`.

## 5. Les mots du produit contre les mots de la cliente

Vérifie toujours, avant de nommer le produit dans un texte :

- Le mot que TA marque emploie pour son produit apparaît-il dans la bouche de la cliente ? Compte-le (même tableau). S'il est à zéro, écris « absent de sa bouche : à tester en pub avant de l'imposer ».
- Le mot savant ou médical est-il le sien ? Souvent elle a ENTENDU le terme avant de l'avoir lu, ou elle l'écrit en plusieurs orthographes. Un mot de site médical (MOYEN, quasi absent chez les clientes) est à retirer de tes pubs.
- Un mot FRÉQUENT « de catégorie » (par exemple celui que les acheteuses emploient dans les avis marchands) qui n'est jamais associé au problème dans un message de cliente est une PISTE à tester, pas une preuve.
- Les expressions FRÉQUENTES de la catégorie mais RARES chez ta cible (par exemple des solutions coûteuses qu'elle cite peu) servent de contexte, pas d'accroche.

## 6. Qui elle croit : à mesurer, pas à supposer

Prends les commentaires (hors réponses) sous deux groupes de vidéos que tu as listés à la main : les vidéos de PROFESSIONNELS ou d'experts, et les vidéos de PAIRS (des personnes de la cible). Sur chaque groupe, compte la part de messages qui contiennent : « merci » ; une confiance explicite (« grâce à vous », « ça marche ») ; une défiance envers son conseiller habituel (« mon kiné ne m'a jamais proposé ça ») ; « rien n'y fait » ; un conseil de pair à pair (« moi je », « essaie »). Compte aussi les professionnels nommés dans tout le corpus (médecin, kiné, pharmacien, vendeur-conseil...). Relis les cas limites. Lecture [DÉDUIT] : à qui elle fait confiance pour COMPRENDRE (le professionnel ?) et à qui pour les OUTILS (les pairs ?). Aucun script livré : les listes de vidéos sont propres à chaque niche.

## 7. Les sources du marché source : hors marché, pour comparer

Le volet « marché source » (`02`, volet B) est rangé dans sa propre section « Hors marché, pour comparer », marquée [DÉDUIT] pour toute conclusion, et ne compte pas dans les chiffres de l'avatar. Il sert à :

- savoir ce que dit la pub étrangère que tu adaptes ;
- repérer qui fait acheter là-bas (comptage des recommandeurs, `05`) ;
- formuler des hypothèses de différence à vérifier contre le marché de lancement. Axes habituels (à instancier pour ta niche, marqués [DÉDUIT]) : le nom du problème dans chaque langue ; le conseiller ou prescripteur le plus cité ; le lieu d'achat ; la communauté en ligne ; le registre émotionnel ; ce qui ne change sûrement pas d'un marché à l'autre (l'identité, la peur de perdre une habitude, la preuve par la durée).

## 8. Où la règle s'arrête

Le lexique répond à « quels mots ? ». Il ne dit pas « quel hook » ni « quel script » : l'écriture des pubs vient après, dans le skill de montage et d'écriture. Ce que tu lui livres : le tableau, les 25 verbatims, le swipe file de 10 phrases et la liste « à confirmer ».

## 9. Porte : le lexique est prêt quand

1. `compte_verbatims.py` a tourné sur un corpus du marché de lancement seul, sans le type « vendeur » ; le tableau est dans le dossier avec son volume et son unité de comptage.
2. Chaque expression FRÉQUENTE a ses 2 citations d'exemple avec URL ; les MOYENNES sont dans « à confirmer » ; les RARES n'ont pas d'angle.
3. Les mots du produit sont comptés (même à zéro).
4. Les 25 verbatims sont choisis, datés, avec URL, et passent `verifie_citations.py`.
5. Aucune expression du marché source n'apparaît dans une classe.
