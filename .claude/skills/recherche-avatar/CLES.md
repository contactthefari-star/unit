# CLES.md : les clés, les services et l'argent, pour le skill recherche-avatar

Ce guide s'adresse à toi qui utilises le skill (ici, « tu » = la personne). Claude te renvoie ici chaque fois qu'une clé manque ou qu'une étape coûte de l'argent.

**Les prix et quotas ci-dessous ont été vérifiés le 05/10/2026 par recherche web. Ce sont des repères : revérifie-les sur la page de tarifs du service avant de payer.**

## 0. Principes

- Le skill ne contient AUCUNE clé. Chaque clé est la tienne.
- Rien de payant ne part sans que Claude t'ait annoncé le coût et attendu ton « oui » (voir la section 8).
- Tout marche au minimum sans aucune clé (mode B : recherche web seule). Plus tu branches de services, plus le dossier est complet.
- Une clé ne se colle jamais dans la conversation, ne se partage jamais, ne s'écrit jamais dans un dossier de travail.

## 1. Où ranger tes clés

Crée le dossier et le fichier (une seule fois) :

```
mkdir -p ~/.config/pubs-skills
```

Puis, avec n'importe quel éditeur de texte, crée `~/.config/pubs-skills/cles.env` avec une ligne par clé :

```
BRAVE_API_KEY=VOTRE_CLE_ICI
YOUTUBE_API_KEY=VOTRE_CLE_ICI
SCRAPECREATORS_API_KEY=VOTRE_CLE_ICI
GEMINI_API_KEY=VOTRE_CLE_ICI
```

Remplace `VOTRE_CLE_ICI` par la vraie clé, uniquement pour les services que tu utilises. Réserve le fichier à toi : `chmod 600 ~/.config/pubs-skills/cles.env`. Les scripts lisent d'abord une variable d'environnement du même nom, puis les fichiers listés dans la variable `PUBS_SKILLS_CLES` (séparés par `:`), puis ce fichier.

Pour vérifier SANS rien afficher d'une valeur :

```
python3 scripts/charge_cles.py BRAVE_API_KEY YOUTUBE_API_KEY SCRAPECREATORS_API_KEY GEMINI_API_KEY
```

Il répond « présente » ou « absente » pour chacune.

## 2. Vue d'ensemble

| Service | Sert à | Catégorie | Variable | Coût |
|---|---|---|---|---|
| Pages web ouvertes sans compte (forums, blogs, presse, Trustpilot, flux Reddit) | lire les voix des clientes | GRATUIT sans clé | aucune | 0 |
| Pinterest dans ton navigateur | sourcer de vraies photos pour l'avatar visuel | GRATUIT sans clé | aucune | 0 |
| Serveur MCP d'Ad Library | pubs et concurrents | GRATUIT sans clé (outil open source) | aucune | 0 (environ 400 Mo à installer) |
| Brave Search API | recherche web par script | GRATUIT avec clé personnelle dans la limite des crédits offerts, puis PAYANT | `BRAVE_API_KEY` | crédits offerts chaque mois, puis environ 5 $ les 1 000 requêtes |
| YouTube Data API (Google Cloud) | vidéos et commentaires YouTube | GRATUIT avec clé personnelle | `YOUTUBE_API_KEY` | quota gratuit quotidien |
| ScrapeCreators | commentaires TikTok et Instagram | PAYANT (optionnel) | `SCRAPECREATORS_API_KEY` | 100 crédits d'essai, puis environ 1 $ les 1 000 requêtes |
| Google AI Studio (Nano Banana Pro) | images candidates de l'avatar visuel | PAYANT (route B, optionnelle) | `GEMINI_API_KEY` | 0,134 $ l'image en 2K |

## 3. Brave Search API (la recherche web par script)

- **À quoi ça sert** : `scripts/cherche_web.py` envoie tes requêtes par thème dans la langue du marché et renvoie titres, adresses, extraits, âges. C'est le moteur de la voix des clientes.
- **Quelle clé** : « Brave Search API » (cherche ce nom ; le site officiel est sur brave.com). Crée un compte, choisis l'offre de recherche web, génère une clé. Une carte bancaire est probablement demandée à l'inscription (à vérifier).
- **Combien** : il n'y a plus de palier gratuit de 2 000 requêtes par mois depuis février 2026 ; la page officielle de tarifs indique 5 $ de crédits offerts chaque mois, soit environ 1 000 requêtes à 5 $ les 1 000. **Une recherche d'avatar complète en consomme environ 150 à 300 requêtes (ESTIMATION), soit 0,75 à 1,50 $.** Tu restes donc dans les crédits offerts pour trois ou quatre recherches par mois. **Si tu dépasses, mets 5 € de crédit : ça couvre environ 1 000 requêtes, soit trois à six recherches complètes.**
- **Garde-fou** : `cherche_web.py` refuse un lot de plus de 40 requêtes sans `--oui` ; Claude t'annonce le nombre avant. Le fichier `brut/_requetes_brave.log` compte tes requêtes.
- **Sans clé** : l'outil de recherche web intégré à Claude Code. Gratuit, moins précis, et Claude le signale dans le dossier.

## 4. YouTube Data API (clé Google Cloud personnelle)

- **À quoi ça sert** : `scripts/youtube.py` cherche des vidéos, lit leurs commentaires, mesure la médiane de vues d'une chaîne. Les commentaires YouTube sont une source majeure de voix.
- **Créer la clé (gratuit, environ 3 minutes)** : va sur `console.cloud.google.com`, connecte-toi avec ton compte Google, crée un projet, active « YouTube Data API v3 » dans la bibliothèque d'API, puis « Identifiants » > « Créer des identifiants » > « Clé API ». Restreins la clé à cette API.
- **Quota** : 10 000 unités par jour par défaut, gratuites ; une recherche coûte 100 unités, la lecture d'un lot de commentaires 1 unité (à revérifier). Une recherche d'avatar complète tient en une ou deux journées. Quand le quota est épuisé, le script le dit et tu reprends le lendemain.
- **Pas de carte bancaire** nécessaire pour le quota gratuit. Si tu la demandes plus tard, ne dépasse pas le quota : c'est inutile ici.

## 5. Le serveur MCP d'Ad Library (pubs et concurrents)

Outil open source sous licence MIT : `https://github.com/RamsesAguirre777/facebook-ads-library-mcp`. Il ouvre la bibliothèque publicitaire PUBLIQUE de Meta avec un navigateur sans fenêtre : **aucun compte, aucun jeton, aucun paiement.** Il offre `search_ad_library` (recherche par mot-clé) et `scrape_ad_library_url` (lire une adresse d'Ad Library). Installation (environ 400 Mo de navigateur Chromium) :

```
git clone https://github.com/RamsesAguirre777/facebook-ads-library-mcp.git
cd facebook-ads-library-mcp
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python -m playwright install chromium
claude mcp add facebook-ads -- /CHEMIN/ABSOLU/venv/bin/python /CHEMIN/ABSOLU/facebook_ads_mcp_complete.py
```

Remplace `/CHEMIN/ABSOLU/` par le chemin complet du dossier cloné (tape `pwd` dedans). Sous Windows, le Python du venv est `venv\Scripts\python.exe`. Redémarre Claude Code, puis vérifie que le serveur apparaît avec la commande `/mcp`.

À savoir :
- Les outils `get_ad_details` (portée, âge et sexe d'une pub diffusée en Europe), `estimate_site_traffic` et `competitor_trajectory` ne sont PAS fournis par ce dépôt public (outils optionnels). Sans eux, le skill prévoit un repli : ouvrir la page de la pub dans le navigateur et lire la couverture et les pays dans « transparence par lieu » ; pour le trafic, écrire NON MESURÉ (`references/06-concurrents-et-pubs-prouvees.md`).
- Chaque recherche ne ramène qu'environ 25 à 30 cartes, et Meta peut répondre par un code 403 tout en servant les cartes. Si la page revient vide, attends et relance plus tard.
- Sans ce serveur, le skill continue en mode B : les rubriques de pubs sont « IGNORÉES, non accessibles dans ce mode », jamais devinées.

## 6. ÉTAPE PAYANTE (optionnelle) : commentaires TikTok et Instagram

- **ÉTAPE PAYANTE.** À quoi ça sert : `scripts/commentaires_sociaux.py` lit les commentaires sous des vidéos TikTok et des publications Instagram, deux types de source qu'on ne peut pas lire avec un simple navigateur sans compte. Ils comptent comme deux types de source dans la règle du verbatim FRÉQUENT, et donnent l'intention d'achat sous les créateurs. La recherche reste faisable sans, avec YouTube, forums, avis et presse.
- **Quelle clé** : ScrapeCreators, `scrapecreators.com`. Crée un compte, génère une clé API.
- **Combien** : le service offre 100 crédits d'essai gratuits ; 1 crédit = 1 requête ; environ 1 $ les 1 000 requêtes selon des sources tierces. **Compte environ 400 requêtes au total (TikTok plus Instagram) pour une recherche complète (ESTIMATION).** Les 100 crédits d'essai ne suffisent donc pas pour une recherche complète. **Prends le plus petit pack ; si le minimum est plus haut, mets 10 € : ça couvre plusieurs recherches** (au prix cité, une recherche complète coûte de l'ordre de 0,40 $, ESTIMATION).
- **Garde-fou** : le script AFFICHE d'abord le plan et le coût estimé, puis s'arrête tant que tu n'as pas dit oui. Il exige `--oui`, accepte `--plafond N` (stop dès que N crédits sont dépensés), affiche ton solde AVANT et APRÈS, et note chaque requête dans `brut/_credits.log`. Claude ne le lance jamais sans ton « oui » dans la conversation.
- **Alternative gratuite** : ouvre toi-même quelques vidéos clés, copie une trentaine de commentaires dans un fichier texte et donne-le à Claude (lent, mais gratuit) ; ou laisse TikTok et Instagram en « IGNORÉE, étape payante non faite ».

## 7. ÉTAPE PAYANTE (optionnelle) : générer les images de l'avatar visuel

- **ÉTAPE PAYANTE.** À quoi ça sert : fabriquer les 4 candidats du visage de l'avatar (puis les retouches) à partir de vraies photos de référence (`references/07-fiche-avatar-visuel.md`).
- **Route A, sans clé** : l'abonnement Google (Flow ou Gemini) dans ton navigateur. Claude fabrique les prompts, tu les colles à la main, tu lui envoies les images. Aucun coût à l'image, mais c'est manuel. Repères relevés le 26/08/2026, à revérifier : Google AI Pro environ 19,99 $ par mois (1 000 crédits Flow), Google AI Ultra environ 249,99 $ par mois (10 000 crédits). Les crédits d'un abonnement ne se dépensent pas par l'API : abonnement et API ne se cumulent pas, choisis une route.
- **Route B, avec clé** : Google AI Studio, `aistudio.google.com` > « Get API key », avec la facturation activée sur le projet. Variable `GEMINI_API_KEY`. Le script est `scripts/genere_image.py`.
- **Combien** : Nano Banana Pro (Gemini 3 Pro Image) coûte 0,134 $ par image en 1K ou 2K, 0,24 $ en 4K. **4 candidats plus 4 retouches font 8 images, environ 1 $. Mets 10 € de crédit : ça suffit largement (environ 70 images en 2K).**
- **Garde-fou** : le script annonce le nombre d'images et le coût estimé, s'arrête sans `--oui`, plafonne le lot (`--max-images`, 8 par défaut), contrôle chaque image écrite (complète, dimensions) et note tout dans `generees/_journal.log`.
- **Autres générateurs** (si tu en utilises pour la vidéo, dans l'autre skill) : OpenRouter, `openrouter.ai`, achat minimum 5 $.

## 8. Le garde-fou de coût (valable pour tout le skill)

Claude respecte toujours ces six points. Si l'un manque, dis-le-lui.

1. **Avant** un lot payant : il te dit le service, le nombre de requêtes ou d'images, le coût estimé (en $ ou en crédits, marqué ESTIMATION) et le plafond.
2. Il **attend ton « oui »** dans la conversation. Un « oui » vaut pour CE lot, pas pour les suivants.
3. Il lance avec `--oui` et un plafond, jamais sans.
4. Il t'affiche le solde avant et après (quand le service le donne) et le total dépensé.
5. Il ne relance jamais un lot payant tout seul après une erreur.
6. Les lots qui font de simples recherches (Brave, YouTube) demandent aussi `--oui` au-delà de 40 requêtes (Brave) ou de 10 requêtes de recherche (YouTube).

## 9. Que faire si je ne veux brancher aucun service

Tu peux lancer la recherche en mode B : Claude utilise sa recherche web intégrée et lit les pages avec `scripts/pages.py` (aucune clé). Le dossier sera plus mince (pas de commentaires YouTube en volume, pas de TikTok ni Instagram, pas de pubs), il portera des « IGNORÉE » à ces endroits, et le verdict sera marqué « VERDICT PARTIEL ». Il reste honnête : jamais une valeur devinée.
