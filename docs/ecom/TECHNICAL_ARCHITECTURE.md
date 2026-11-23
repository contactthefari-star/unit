# TECHNICAL ARCHITECTURE

## Vue d'ensemble
```
Navigateur (ecom/)                         Vercel
┌───────────────────────────┐             ┌──────────────────────────┐
│ app.js  (vues + actions)  │  fetch      │ api/copilot.js           │
│   │                       │ ──────────► │  Anthropic SDK           │
│ planner.js  scoring.js    │             │  clé = env ANTHROPIC_... │
│   │                       │             └──────────────────────────┘
│ store.js  (interface data)│──► localStorage   (V2 : Supabase Postgres + RLS)
│ files.js                  │──► IndexedDB      (V2 : Supabase Storage)
│ content/ (phases, academy,│
│           experts)        │
└───────────────────────────┘
```

## Choix V1 (voir DECISIONS_LOG.md)
- **ES modules sans build**, servis tels quels par Vercel, comme les autres apps du dépôt (`/`, `/cuisine`). Zéro étape de build = zéro risque de casser le déploiement existant.
- **Local-first** : toutes les écritures passent par `store.js`. Remplacer localStorage par Supabase = réécrire un seul adaptateur, pas les écrans.
- **IA côté serveur uniquement** : `api/copilot.js` (fonction serverless Node). Le modèle est défini à un seul endroit (`MODEL`) → changement de modèle ou de fournisseur sans toucher au front.

## Modules
| Fichier | Rôle |
|---|---|
| `ecom/js/store.js` | Collections, isolation par projet, XP, sauvegarde, migration de schéma |
| `ecom/js/planner.js` | Daily OS : génération du plan, validation (preuve / données), phases, bilan |
| `ecom/js/scoring.js` | Économie unitaire (TVA BE 21 %, frais de paiement), score produit transparent |
| `ecom/js/files.js` | Binaires en IndexedDB, métadonnées dans le store |
| `ecom/js/content/*.js` | Parcours 15 phases, Academy 26 modules, 20 experts |
| `ecom/js/app.js` | Routage par hash, rendu, délégation d'événements |
| `api/copilot.js` | Orchestrateur IA, validation des entrées, gestion d'erreurs |

## Copilot
- Modèle : `claude-opus-5-5`, effort `medium`, `max_tokens` 4000, fallback serveur en cas de refus.
- Entrées validées : 12 messages max, 4000 caractères par message, rôles alternés, expert connu, contexte ≤ 20 Ko.
- Le contexte envoyé = données réelles du projet actif (phase, tâches ouvertes, produits et leurs scores).
- **Activation** : Vercel → Project → Settings → Environment Variables → `ANTHROPIC_API_KEY` → Redeploy.

## Préparé pour la suite (sans tout reconstruire)
- Collections `stores`, `brands` déjà déclarées et scopées par projet.
- `PROJECT_SCOPED` : ajouter `competitors`, `suppliers`, `campaigns`, `creatives`, `audits`… = une ligne + l'isolation est automatique.
- Experts IA déjà déclarés (`experts.js`) : outils par expert ajoutables dans `api/`.
- Audits de sites (V5) : nouvelle fonction `api/audit.js` avec Playwright côté serveur, dans le respect des CGU des sites.

## Risques techniques
| Risque | Mitigation |
|---|---|
| Perte de données locales (cache vidé, autre appareil) | Export JSON ; Supabase en V2 (priorité) |
| Limite localStorage (~5 Mo) | Binaires en IndexedDB ; migration Supabase en V2 |
| Coût IA | Historique borné, max_tokens, effort medium ; quotas par utilisateur en V2 |
| Intégrations sans API publique (Minea, Trendtrack…) | Import CSV / saisie assistée ; jamais de simulation |
| Scraping de sites concurrents | Respect robots.txt / CGU, sur demande explicite |

## Tests
- `npm test` : 15 tests unitaires (isolation, cascade, persistance, export/import, TVA, scoring, Daily OS, preuves, phases, XP, contenu).
- `node ecom/tests/e2e.mjs` : parcours complet dans Chromium (onboarding → plan du jour → preuve → quiz → 2ᵉ projet → produit → isolation → fichier → finance → Command Center → Copilot non configuré → bilan → thème clair → mobile → persistance).
