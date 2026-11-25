---
name: skills-avatar-et-video
description: Point d'entrée du parcours complet « recherche d'avatar + pubs concurrentes + avis clients + créas vidéo ». À charger IMMÉDIATEMENT dès que la personne écrit « Skills Avatar et vidéo » (ou « skill avatar et vidéo », « skills avatar & vidéo »), dans n'importe quelle conversation et pour n'importe quelle niche. Demande d'abord le produit, lit sa page, puis pose les questions de cadrage sous forme INTERACTIVE (choix à cliquer, rédigés avec le vocabulaire du produit), trouve soi-même les concurrents, puis enchaîne les skills recherche-avatar et montage-pub-ecom.
---

# Skills Avatar et vidéo : les 10 questions de départ

La personne veut, pour un produit de n'importe quelle niche : la recherche d'avatar complète (psychologie, voix des clients comptée, avis clients), l'analyse des pubs et des meilleurs concurrents, puis les meilleures créas vidéo possibles pour **dépasser les meilleurs concurrents**.

Réponds en français, en tutoyant ou vouvoyant comme la personne le fait.

## 1. Les questions sont INTERACTIVES (cases à cocher), pour gagner du temps

La personne veut cliquer, pas rédiger. Utilise l'outil **AskUserQuestion** (choix à cliquer ; la personne peut toujours répondre « Autre » en texte libre). Il accepte 4 questions maximum par appel et 2 à 4 options par question.

**Déroulé :**

1. **Tour 1, le produit (texte libre, une seule question en clair) :** « Quel est le produit ou le service que tu veux rechercher ? Colle le lien de sa page (ou son nom). » Si la conversation le donne déjà, saute ce tour.
2. **Lis immédiatement la page du produit** (`scripts/pages.py` du skill recherche-avatar) et fais une recherche rapide de la niche. But : rédiger les options suivantes **avec le vocabulaire réel du produit et de sa niche** (noms de métiers, problèmes, bénéfices, prix trouvés sur la page), pour que la personne n'ait qu'à valider. Propose toujours ce que tu as trouvé comme première option, marquée « (trouvé sur ta page) » ou « (Recommandé) ».
3. **Tour 2, AskUserQuestion (4 questions) :** marché de lancement (Q2), offre (Q3), preuves (Q4), acheteur pressenti (Q6).
4. **Tour 3, AskUserQuestion (4 questions) :** avatar voulu (Q7), plateformes et format des créas (Q8, choix multiples autorisés), matière existante (Q9, choix multiples), budget et étapes payantes (Q10).
5. Les concurrents (Q5) ne se demandent PAS : tu les trouves toi-même (section 2). Ajoute seulement, dans le tour 2 ou 3, une option « J'ai un concurrent précis à battre » si une place reste.
6. Puis récapitule l'ordre de mission en quelques lignes et attends « ok ».

Exemples d'options (à réécrire avec les mots du produit) : marché « Belgique + France (français) / France seule / Belgique seule » ; preuves « Aucune pour l'instant / Quelques avis clients / Ventes + avis + vidéos clients » ; avatar « Les deux (Recommandé) / Profil marketing seul / Visage seul » ; budget « Gratuit seulement / Jusqu'à 10 € / Jusqu'à 30 € ».

Les 10 sujets à couvrir (référence pour rédiger les questions interactives) :

1. **Quel est le produit que tu veux rechercher ?** Son nom, le lien de sa page (boutique, fiche produit ou site), et ce qu'il fait en une phrase.
2. **Où vas-tu le vendre ?** Pays et langue du marché de lancement. Et le marché « source » à étudier (où ce produit cartonne déjà) : États-Unis par défaut ?
3. **Ton offre :** prix, offres groupées ou promos, garantie, délai de livraison (ou de mise en route pour un service).
4. **Tes preuves réelles :** nombre de ventes ou de clients, avis, photos et vidéos de clients, chiffres, presse. (Ce qui manque sera noté « preuve à fournir », jamais inventé.)
5. **Tes concurrents (facultatif) :** je les trouve moi-même à partir de ton produit. Si tu en connais déjà un ou deux que tu veux absolument battre, donne leurs liens ; sinon, rien à faire.
6. **À qui penses-tu vendre ?** Ton intuition sur l'acheteur (âge, sexe, situation, pour lui-même ou pour un proche). Je la vérifierai avec la recherche.
7. **Quel avatar veux-tu ?** Le profil marketing (à qui on parle), le visage à mettre à l'écran (avatar visuel pour les vidéos), ou les deux ?
8. **Quelles créas vidéo veux-tu au final ?** Plateformes (Facebook/Instagram, TikTok…), format (UGC face caméra, démonstration, avant/après, voix off…), durée visée, nombre de variantes ou de hooks à tester.
9. **Qu'as-tu déjà comme matière ?** Vidéos et photos du produit, rushes, anciennes pubs (et leurs résultats), une pub concurrente gagnante à adapter en français.
10. **Budget et étapes payantes :** acceptes-tu les étapes payantes optionnelles (commentaires TikTok/Instagram, images, clips, voix et musique générés par IA), et jusqu'à quel montant ? Y a-t-il une date de lancement ?

Si l'outil AskUserQuestion n'est pas disponible dans la session, pose les questions en un seul message numéroté, avec tes propositions pré-remplies, et termine par : « Réponds juste par les numéros à corriger ; je prends le reste tel quel. »

## 2. Après ses réponses

1. Vérifie les outils et clés réellement disponibles : `python3 <dossier des skills>/recherche-avatar/scripts/charge_cles.py BRAVE_API_KEY YOUTUBE_API_KEY SCRAPECREATORS_API_KEY GEMINI_API_KEY OPENROUTER_API_KEY` (le dossier des skills est `~/.claude/skills` sur le Mac, `.claude/skills` dans le repo) (présente/absente, jamais la valeur) et la présence de l'outil MCP `search_ad_library`. Rappel : depuis la Belgique, l'Ad Library s'affiche en néerlandais ; le serveur local force `locale=en_US`, sinon passer par `scrape_ad_library_url` avec `&locale=en_US` dans l'URL.
2. **Trouve toi-même les concurrents, sans attendre que la personne les donne** : dès que le produit est connu, déduis la niche et 3 à 6 mots-clés (langue du lancement + anglais), cherche les vendeurs de ce produit ou service (recherche web + Ad Library dans le marché source et le marché de lancement), regroupe-les par domaine et classe-les par pubs actives qui survivent. Propose les mots-clés et les meilleurs concurrents trouvés dans l'ordre de mission, à confirmer ; ajoute ceux que la personne a donnés.
3. Charge le skill **recherche-avatar** et suis TOUT son parcours avec ses portes (ordre de mission → dossier de recherche → verdict GO/NO GO → avatar marketing → avatar visuel → dossier final), en t'appuyant sur les réponses aux questions 1 à 7 et 10 pour l'ordre de mission (ne repose pas les questions déjà répondues).
4. Puis charge le skill **montage-pub-ecom** pour les créas (hooks, scripts, storyboard, rushes, montage, sous-titres, variantes), en t'appuyant sur les questions 8 à 10 et sur le dossier d'avatar (lexique FRÉQUENT, verdict d'autorité, fiche visuelle).
5. Objectif affiché à chaque étape : faire mieux que les meilleurs concurrents identifiés (reprendre ce qui est prouvé chez eux, combler ce qu'ils ne font pas, parler avec les mots fréquents de la cible).
6. Toutes les règles des deux skills s'appliquent : rien d'inventé, garde-fou de coût (annonce + « oui ») avant toute étape payante, une étape à la fois avec « suite » entre deux.
