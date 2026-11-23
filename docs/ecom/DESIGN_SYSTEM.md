# DESIGN SYSTEM

Direction : SaaS premium sombre (référence visuelle 1 : sidebar fine, cartes épurées, accents violet/bleu), mode clair disponible. **Pas** les maquettes chargées.

## Couleurs (tokens CSS dans `ecom/index.html`)
| Token | Sombre | Clair | Usage |
|---|---|---|---|
| `--bg` | #0b0f19 | #f5f6fa | Fond |
| `--side` | #0e1320 | #ffffff | Sidebar |
| `--card` / `--card2` | #121827 / #161d2e | #fff / #f8f9fc | Cartes / champs |
| `--line` | #1f2738 | #e6e8f0 | Bordures |
| `--ink` / `--ink2` / `--ink3` | #e8ebf3 / #9aa3b8 / #6b7489 | #141827 / #5b6378 / #8b93a7 | Texte |
| `--violet` | #8b5cf6 | #7c3aed | Action principale, priorité |
| `--blue` | #3b82f6 | #2563eb | Info, phase en cours |
| `--ok` / `--warn` / `--bad` | vert / ambre / rouge | | Statuts |

## Typographie
Inter 400/500/600/700. H1 24 px, H2 18 px, texte 14 px, labels 12,5 px.

## Composants
Carte (`.card`, rayon 14 px), bouton (`.btn`, `.primary`, `.ghost`, `.danger`, `.sm`, `.big`), pastille (`.pill` + `v/b/ok/warn/bad`), barre de progression (`.bar`), score produit (`.score hi/mid/lo`), étapes numérotées (`.steps`), sections repliables (`details`), liste (`.li`), toast.

## Règles UX TDAH
1. Une seule priorité par écran. La carte « hero » violette = la chose à faire maintenant.
2. 3 tâches visibles maximum sur Aujourd'hui.
3. Tout le secondaire est replié (`details`).
4. Textes courts, verbes d'action, français simple.
5. Aucune notification non demandée. Toasts uniquement en réponse à une action.
6. Mode Focus : masque la navigation et les tâches secondaires.
7. Animations ≤ 250 ms, seulement au changement de page ; désactivées si « réduire les animations ».
8. Jamais de message culpabilisant.
9. Mobile : navigation en haut, une colonne, pas de scroll horizontal (testé à 390 px).
