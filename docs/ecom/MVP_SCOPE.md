# MVP SCOPE — V1

URL : `/ecom` (même déploiement Vercel que le reste du dépôt).

## Dans le MVP (livré)
| # | Module | Ce qui marche réellement |
|---|---|---|
| 1 | Global Command Center | KPIs (projets actifs, prioritaire, dépensé/budget, revenus), cartes projets, prochaine étape, comparateur |
| 2 | Multi-projets | Créer, renommer, mettre en pause, archiver, supprimer (cascade), projet prioritaire, sélecteur permanent |
| 3 | Dashboard projet | Parcours 15 phases, phase courante + critère de validation, 3 prochaines tâches, budget et dépenses réelles |
| 4 | Daily Operating System | Démarrer la journée → 1 priorité + 2 secondaires ; guidage pas à pas ; terminer la journée → bilan + replanification ; mode Focus |
| 5 | Tâches et progression | Missions générées par phase, preuve obligatoire, validation automatique par les données, tâches libres, XP/niveaux |
| 6 | Product Research | Ajout, statut, notation 8 critères + marge calculée, TVA belge, CPA max, ROAS min, simulation de prix |
| 7 | Ecom Academy | 26 modules listés, 5 leçons complètes avec quiz, quiz réussi = mission validée |
| 8 | AI Copilot | Orchestrateur + 20 experts, contexte projet, conversations par projet, analyse produit en 1 clic |
| 9 | Fichiers | Upload, aperçu image, téléchargement, suppression, classement par type, par projet |

## Hors MVP (conservé dans la roadmap, pas supprimé)
Concurrents, fournisseurs, Product Testing, Store/Brand Builder, Marketing, Copywriting, Advertising, CRO/audits, Finance avancée, Legal, intégrations, scaling, SaaS.

## Limites connues (honnêtes)
- **Authentification : bloquée** tant qu'un projet Supabase n'existe pas. V1 = mode local (données dans le navigateur de l'appareil). Export/import JSON disponible.
- **Copilot** : actif seulement après ajout de `ANTHROPIC_API_KEY` dans Vercel. Sans clé, l'app l'indique clairement.
- **Academy** : 21 modules sur 26 marqués « En préparation ».
- **Fichiers** : stockés sur l'appareil (IndexedDB), non inclus dans l'export JSON.
