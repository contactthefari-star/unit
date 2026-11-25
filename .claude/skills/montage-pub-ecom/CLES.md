# CLES.md : les clés, les services et l'argent, pour le skill montage-pub-ecom

Ce guide s'adresse à toi qui utilises le skill (ici, « tu » = la personne). Claude te renvoie ici chaque fois qu'une étape coûte de l'argent.

**Les prix ci-dessous sont des prix de liste relevés en 2026 (dates indiquées). Ce sont des repères : revérifie-les sur la page de tarifs du service avant de payer.** Les totaux en euros sont des ESTIMATIONS calculées sur ces prix (environ 1 € = 1,1 $).

## 0. Les principes

- Le skill ne contient AUCUNE clé. Chaque clé est la tienne, créée par toi.
- **Rien de payant ne part sans que Claude t'ait annoncé le coût et attendu ton « oui »** (section 7).
- Tout ce qui est gratuit marche sans clé : le montage, les sous-titres, le mastering, le moteur, les contrôles. Seule la **fabrication de rushes par IA** (images, clips, voix, musique) est payante, et elle a une voie sans clé : ton propre abonnement Google, utilisé à la main dans le navigateur.
- Une clé ne se colle jamais dans la conversation, ne se partage jamais, ne s'écrit jamais dans un dossier de travail ni dans un ZIP.
- Pour chaque étape payante, la règle est la même : tu prends la clé du service indiqué, tu **mets 10 € de crédit** (c'est ce qu'il faut pour commencer, et ça suffit largement : voir les calculs), et tu laisses Claude annoncer chaque lot avant de le lancer.

## 1. Où ranger tes clés

Crée le dossier et le fichier (une seule fois). Le script `installer.sh` le fait pour toi ; sinon :

```
mkdir -p ~/.config/pubs-skills
```

Puis, avec n'importe quel éditeur de texte, crée `~/.config/pubs-skills/cles.env` avec une ligne par clé, uniquement pour les services que tu utilises :

```
GEMINI_API_KEY=VOTRE_CLE_ICI
OPENROUTER_API_KEY=VOTRE_CLE_ICI
CARTESIA_API_KEY=VOTRE_CLE_ICI
```

Réserve le fichier à toi (`chmod 600 ~/.config/pubs-skills/cles.env`). Les scripts lisent d'abord une variable d'environnement du même nom, puis les fichiers listés dans `PUBS_SKILLS_CLES` (séparés par `:`), puis ce fichier. Pour vérifier SANS rien afficher d'une valeur : `python3 outils/verifier_installation.py` (« présente » ou « absente »).

## 2. Vue d'ensemble

| Service | Sert à | Catégorie | Variable | Coût |
|---|---|---|---|---|
| ffmpeg, Pillow, numpy, Whisper local, le moteur, les outils du skill | tout le montage, les sous-titres, le mastering, les contrôles | GRATUIT sans clé | aucune | 0 |
| Pinterest dans ton navigateur | sourcer de vraies photos et des plans de référence | GRATUIT sans clé | aucune | 0 |
| Mixkit, Freesound (musiques et bruitages libres) | fond musical et bruitages | GRATUIT sans clé (licence à noter) | aucune | 0 |
| Abonnement Google (Flow, Gemini, AI Studio) | images, vidéos, voix et musique, À LA MAIN dans le navigateur | ABONNEMENT (route A) | aucune | AI Pro environ 19,99 $/mois, AI Ultra environ 249,99 $/mois (relevé août 2026) |
| Google AI Studio (API Gemini) | images (Nano Banana Pro), clips Omni, voix, musique | PAYANT à l'usage (route B) | `GEMINI_API_KEY` | voir section 3 |
| OpenRouter | clips B-roll (Seedance, Kling) | PAYANT à l'usage (route B) | `OPENROUTER_API_KEY` | voir section 4 |
| Cartesia | voix off de repli | PAYANT à l'usage | `CARTESIA_API_KEY` | environ 0,026 $/minute |
| Claude Code (voies du moteur) | réécrire une phrase de montage non comprise, décrire les plans | PAYANT, COUPÉ par défaut | aucune (ton `claude`) | environ 0,02 $/phrase |

## 3. ÉTAPE PAYANTE : images, clips, voix et musique par Google (route A ou B)

- **ÉTAPE PAYANTE.** À quoi ça sert : fabriquer l'avatar, les images de départ, les clips parlés, la voix off et la musique (`references/rushes-generes.md`, `references/audio-voix-musique.md`).
- **Route A, sans clé** : ton abonnement Google. Google Flow (`flow.google.com`) pour les images et les vidéos, Google AI Studio (`aistudio.google.com`) pour la voix, l'application Gemini ou Flow Music (`flowmusic.app`) pour la musique. Claude écrit les prompts numérotés dans un fichier, tu les colles, tu lui rends les fichiers. Aucun coût à l'image, mais c'est manuel. **Les crédits d'un abonnement ne se dépensent pas par l'API : abonnement et API ne se cumulent pas, choisis une route.**
- **Route B, avec clé** : Google AI Studio, `aistudio.google.com` > « Get API key », **avec la facturation activée sur le projet** (c'est elle qui permet les modèles payants). Variable `GEMINI_API_KEY`.
- **Combien (prix de liste)** :

| Quoi | Prix | Relevé |
|---|---|---|
| Nano Banana Pro (images) | 0,134 $ l'image en 1K ou 2K, 0,24 $ en 4K | 26/08/2026 |
| Nano Banana 2 (images, plus léger) | 0,067 $ en 1K, 0,101 $ en 2K | 26/08/2026 |
| Omni 1.1 Flash (clips), par l'API | 0,10 $ la seconde en 720p (1080p et 4K sont des agrandissements) | 17/09/2026 |
| Lyria 3.5 (musique) | 0,08 $ le morceau, 0,04 $ le clip de 30 s | 27/09/2026 |
| Gemini TTS (voix) | aucun prix relevé | à vérifier sur la page de tarifs |

- **« Mets 10 € »** : un lot d'essai (4 images + 3 clips de 8 s) coûte environ 3 $ ; une pub parlée de 40 s (environ 6 clips parlants, 4 B-rolls, 12 images) environ 6 $ sans reprise. Compte le double avec les reprises (environ 1 référence sur 10 ne s'anime jamais, et un clip demande plusieurs essais). **Donc 10 € couvrent une pub complète avec ses reprises, ou deux à trois lots d'essai** (ESTIMATION).
- **Garde-fou** : avant TOUT lot, Claude annonce le nombre de générations et le coût total, puis attend ton « oui ».
- **Alternative gratuite** : la route A (abonnement que tu as peut-être déjà), ou des images de départ prises sur tes propres photos.

## 4. ÉTAPE PAYANTE : clips B-roll par OpenRouter (route B)

- **ÉTAPE PAYANTE.** À quoi ça sert : les plans sans avatar (gestes, produit, ambiance) avec Seedance ou Kling, à partir d'une image de départ validée.
- **Quelle clé** : OpenRouter, `openrouter.ai` : crée un compte, « Keys » > créer une clé, variable `OPENROUTER_API_KEY`. **Achat minimum de crédit : 5 $** (carte bancaire).
- **Combien (simulation de coût du 28/09/2026, format 9:16, 480p)** : Seedance 2.0 Mini 0,13 $ (4 s) ou 0,27 $ (8 s) ; 2.0 Fast 0,16 $ ou 0,32 $ ; 2.0 0,27 $ ou 0,54 $ ; 2.5 0,41 $ ou 0,82 $. Seedance 2.5 en 720p, 4 s : 0,92 $. Durée minimale acceptée : 4 s.
- **Palier conseillé** : Seedance 2.0 en 480p pour chercher, 720p pour livrer. **Mets 10 € de crédit** (après l'achat minimum de 5 $ : prends 10 $ d'un coup) : c'est environ 18 clips de 8 s en Seedance 2.0 à 480p (0,54 $ pièce), 31 en 2.0 Fast, 37 en Mini (ESTIMATION, calculée sur les prix ci-dessus).
- **Garde-fou** : `--dry-run` ou calcul à la main du lot avant envoi ; ton « oui » sur le TOTAL, dans un message séparé. Couper un script en cours n'annule pas la facturation côté serveur : vérifie ton solde.
- **Alternative gratuite** : animer une image fixe en zoom lent avec ffmpeg (gratuit), ou reprendre un plan déjà généré.

## 5. ÉTAPE PAYANTE (repli) : voix off par Cartesia

- **ÉTAPE PAYANTE.** À quoi ça sert : une voix off de repli quand la voix de Google ne convient pas (`references/audio-voix-musique.md`).
- **Quelle clé** : Cartesia, `cartesia.ai` > compte > clé API, variable `CARTESIA_API_KEY`.
- **Combien** : environ 0,026 $ la minute de voix générée (ordre de grandeur issu de la grille de liste, à revérifier sur la page de tarifs). **Mets 10 € si le service te laisse payer à l'usage : plus de 300 minutes** (ESTIMATION).
- **Autres voix** : ElevenLabs (`elevenlabs.io`) : aucun prix relevé, vérifie la page de tarifs. Kokoro, un modèle de voix local et gratuit, sert d'alternative gratuite (qualité moindre).
- **Garde-fou** : Claude annonce le nombre de minutes ou de caractères avant de lancer.

## 6. ÉTAPE PAYANTE (facultative, coupée par défaut) : les voies Claude Code du moteur

- **ÉTAPE PAYANTE.** À quoi ça sert : quand tu pilotes le moteur de montage par la page locale, une phrase que les règles gratuites ne comprennent pas peut être réécrite par Claude Code, et le bouton « regarder » peut décrire chaque plan.
- **Quelle clé** : aucune à saisir dans le moteur : il appelle le programme `claude` que tu as déjà (ton abonnement Claude ou ta clé API Anthropic). Ces voies sont **coupées tant que tu ne lances pas le serveur avec `MONTEUR_AVEC_CLAUDE=1`**.
- **Combien** : ordre de grandeur (ESTIMATION, avec le modèle `sonnet`) : environ 0,02 $ par phrase non comprise et environ 0,2 $ pour décrire une soixantaine de plans. **Si tu paies à la clé API, mets 10 € : environ 500 phrases ou une cinquantaine de lectures** (ESTIMATION).
- **Alternative gratuite** : les règles seules. Et si tu travailles déjà dans Claude Code, il peut modifier le montage lui-même, sans passer par ces voies.

## 7. Le garde-fou de coût (valable pour tout le skill)

Claude respecte toujours ces points. Si l'un manque, dis-le-lui.

1. **Avant** un lot payant : il te dit le service, le nombre de générations, le coût estimé (marqué ESTIMATION) et le plafond.
2. Il **attend ton « oui »** dans un message séparé. Un « oui » vaut pour CE lot, pas pour les suivants.
3. Il choisit le **palier le moins cher** qui fait le travail à une qualité acceptable, du premier coup (tester trois paliers coûte plus).
4. **Brouillon pas cher pour chercher, qualité finale pour livrer.**
5. Il **réutilise avant de régénérer**.
6. Il ne relance jamais un lot payant tout seul après une erreur, et il te redonne le total dépensé à la fin.

## 8. Si je ne veux brancher aucun service

Tu peux tout faire avec tes propres rushes (tournés au téléphone) et les outils gratuits : découpe, sous-titres, mastering, musique libre. Tu perds seulement la fabrication de plans par IA. Le skill ne t'oblige à rien.
