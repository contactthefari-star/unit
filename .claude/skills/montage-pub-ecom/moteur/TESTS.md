# Tests du moteur

Ce qui a été essayé, avec la commande et le résultat réel, échecs attendus compris. Conditions : sans réseau, une commande lourde à la fois, des vidéos de test de 6 secondes au plus, aucun modèle d'IA (ni Whisper, ni demucs, ni Claude Code), aucun paquet installé pour ces essais. Testé sur un seul système. Les chemins sont relatifs à la racine du moteur.

Matériel des essais : un Python sans numpy ni Pillow, un Python 3.11 avec numpy et Pillow, ffmpeg et ffprobe (encodeur `libx264` disponible), node (syntaxe JavaScript seulement). Sur ta machine, le chemin normal est un venv neuf puis `pip install -r requirements.txt` (voir `README.md`).

## Commandes et résultats

| Essai | Commande | Résultat |
|---|---|---|
| Compilation | `python3 -m py_compile outils/*.py recettes/*.py`, `bash -n outils/analyser_lot.sh`, `node --check` sur le JavaScript de `interface/monteur.html` | OK sur 21 fichiers Python, syntaxe bash et JavaScript OK |
| Import | chaque fichier de `outils/` importé seul, puis `recettes/sous_titres_fr.py` | 18 modules OK, 0 échec, sous les deux Python |
| Rush de test | la commande `ffmpeg ... lavfi` du `README.md` | 3 plans de 2 s, 540x960, 30 i/s, son sinus de 440 Hz |
| Analyse | `python3 outils/analyser_winner.py rushes/rush_test.mp4 --sans-transcript` | sans numpy ni Pillow : échec attendu avec un message qui dit quoi installer (code 1) ; avec les deux : blueprint écrit, 3 plans, coupes trouvées à 2 s et 4 s |
| Rendu simple | `python3 outils/rendre.py recettes/projets/rush_test.blueprint.json --sortie sorties/test_python3.mp4` | OK : 6,00 s, 180 images, 1080x1920, 30/1, écart +0 image ; marche sans numpy ni Pillow |
| Rendu complet | blueprint avec sous-titres, fondu, flash, punch, étalonnage et bruits de coupe, puis `outils/rendre.py` | OK : 6,00 s, 180 images à 30/1, audio 48 kHz stéréo |
| Repli d'encodeur | `MONTEUR_ENCODEUR=libx264` ; ffmpeg simulé sans encodeur matériel | OK : 180 images, `libx264` choisi |
| Sans Pillow | rendu avec sous-titres sous le Python sans Pillow | échec attendu avec un message clair (rends sans sous-titres avec `--sans-sous-titres`) |
| Police inconnue | blueprint dont la police n'est pas dans la table `POLICES` | le rendu aboutit et l'ANNONCE (« ATTENTION : la police ... n'est pas dans la table POLICES ») ; n'ignore jamais ce message |
| Serveur | `python3 -u outils/serveur.py` puis `curl` locaux | voir la section suivante |
| Dix phrases | `interprete.comprendre(phrase, bp)` sur le blueprint de test | 8 appliquées, 1 refusée (négation), 1 non comprise (voulu) |
| Corpus | 138 phrases françaises passées dans `interprete.comprendre` sur un blueprint de 8 plans | 138 réponses, aucune exception |
| Autres outils | `outils/controler.py`, `outils/format_bp.py`, `outils/bandeau.py`, `outils/planche_vision.py`, `recettes/controler_sous_titres.py`, `recettes/mesurer_le_rendu.py`, `outils/script.py` | OK (voir « Ce qui a été relevé ») |
| Remontage | `outils/remonter.py` puis `outils/variantes.py` sur le rush de test | OK ; le dernier plan est le carton « CARTE FINALE MANQUANTE » : le moteur n'invente jamais une carte finale |
| Voies Claude Code | faux programme `claude` en tête du `PATH`, même phrase non comprise envoyée au serveur | voir la section « Voies Claude Code » |
| Sans Whisper | `transcrire()` avec l'import simulé en échec | message clair qui dit quoi installer ou comment analyser avec `--sans-transcript` |

## Le serveur

Port 8765 libre avant l'essai. Au démarrage :

```
Monteur sur http://127.0.0.1:8765   (127.0.0.1 seulement, rien d'expose)
voies Claude Code (2 et 3) : COUPEES (par defaut ; pour les activer : MONTEUR_AVEC_CLAUDE=1, payant, voir README)
```

```
GET /                          -> HTTP 200, text/html
GET /police/Inter-latin.woff2  -> HTTP 200, font/woff2
GET /api/etat, /api/projet/rush_test, /api/controle/rush_test, /api/cartes/rush_test, /api/onde/rush_test  -> HTTP 200
GET /api/projet/..%2F..%2Fetc%2Fpasswd  -> HTTP 404   (refus attendu)
GET / avec un en-tête Host étranger     -> HTTP 403   (refus attendu)
GET /route-inconnue                     -> HTTP 404
POST /api/demande {"texte": "raccourcis le plan 2 à 1,2 s", "agent": false}  -> le plan 2 passe de 2.00 s a 1.20 s
POST /api/rendre  -> tâche de fond, « attendu 5.20s (156 images) | obtenu 5.20s (156 images) »
POST /api/annuler -> le blueprint redevient celui d'avant la phrase
```

La seule adresse `http://` trouvée dans le texte de la page est un identifiant d'espace de noms SVG, pas une requête : la page n'appelle aucun site extérieur. Le serveur est ensuite arrêté et plus aucun processus n'écoute sur 8765.

## Voies Claude Code

```
sans variable                                -> voies COUPEES   -> aucun appel à claude
MONTEUR_AVEC_CLAUDE=1                        -> voies ACTIVES   -> le programme claude est appelé
MONTEUR_AVEC_CLAUDE=1 MONTEUR_SANS_CLAUDE=1  -> voies COUPEES   -> aucun appel à claude
```

Les voies sont donc coupées par défaut, `MONTEUR_AVEC_CLAUDE=1` les active (étape payante du `README.md`), `MONTEUR_SANS_CLAUDE=1` les recoupe quoi qu'il arrive. Aucun appel réel à Claude Code n'a été fait. Dans le troisième cas, la ligne de démarrage dit « par defaut » alors que la coupure vient de `MONTEUR_SANS_CLAUDE` : le comportement est juste, le texte du message est imprécis.

## Ce qui a été relevé (non corrigé)

- `recul sur le plan 5 à 8 %` est lu comme « mets le plan 5 à 8 secondes ». La forme qui marche : `recul de 8 % sur le plan 5`.
- `enlève les bruits` ne fait rien par les règles ; `enlève les bruits de coupe` marche.
- `un peu de peps` n'est pas compris par les règles (la voie 2 le traduit, si elle est activée).
- `mets du punch sur le plan 1` déclenche « dynamise » sur tout le montage ; la forme ciblée est `punch sur le plan 1`.
- `outils/controler.py rush_test` annonce « 0.00 mots par seconde » : normal, il n'y a pas de transcription.
- `python3 outils/agent.py <projet> "<phrase>"` affiche ce qui serait fait mais n'enregistre pas.

## Non essayé

- Whisper et la dictée (`outils/dicter.py`, transcription dans `analyser_winner.py`), demucs (`outils/separer.py`) : modèles d'IA lourds, exclus de ces essais.
- Les voies Claude Code réelles (voie 2 et voie 3 « regarder ») : payantes et en ligne.
- La page dans un navigateur : seules la syntaxe du JavaScript et les réponses HTTP ont été vérifiées. Le glisser-déposer, la voix off, le micro, les raccourcis clavier et l'affichage de la frise n'ont pas été vus.
- Les routes `/api/deposer`, `/api/voixoff`, `/api/script`, `/api/separer`, `/api/dicter` et `/api/variantes` appelées par HTTP.
- Les autres systèmes : le repli d'encodeur a été forcé et simulé, le repli de polices a été simulé, rien n'a tourné ailleurs que sur le système d'essai.
- Le mode `--telephone` (il demande un certificat que le moteur ne fournit pas), l'entrée HDR (vidéo en HLG) et `outils/appliquer_vision.py`.
