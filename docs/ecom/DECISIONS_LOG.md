# DECISIONS LOG

| Date | Décision | Pourquoi | Alternative écartée |
|---|---|---|---|
| 23/11/2026 | App servie sous `/ecom` dans le dépôt `unit` | Même déploiement Vercel que les apps existantes ; zéro infra nouvelle | Nouveau dépôt (plus de setup, aucun gain pour le MVP) |
| 23/11/2026 | ES modules sans build au lieu de React + Vite + TS | Pas de pipeline de build à ajouter sur un déploiement statique existant ; livraison immédiate. La couche data est isolée pour migrer vers React/TS si la complexité l'exige (V3+) | React/Vite : impose un build Vercel qui toucherait aussi `/` et `/cuisine` |
| 23/11/2026 | Local-first (localStorage + IndexedDB) derrière `store.js` | Auth Supabase impossible sans projet Supabase ; l'app doit être utilisable aujourd'hui | Attendre Supabase (MVP inutilisable en attendant) |
| 23/11/2026 | Authentification marquée **bloquée** plutôt que simulée | Règle : pas de fausse fonctionnalité | Écran de login décoratif |
| 23/11/2026 | IA via fonction serverless Vercel, modèle Claude Opus 5.5 | Clé jamais dans le front ; modèle centralisé, remplaçable | Appel direct depuis le navigateur (clé exposée) |
| 23/11/2026 | Missions à preuve + missions validées par les données | Le système ne valide jamais une mission sans preuve réelle | Case à cocher libre |
| 23/11/2026 | Score produit : critères non renseignés exclus et signalés | Ne jamais inventer une valeur ; « Incomplet » si < 60 % renseigné | Valeur par défaut à 3/5 |
| 23/11/2026 | Marge calculée (jamais saisie), TVA belge 21 % incluse | La marge saisie à la main est la première source d'erreur | Champ « marge » libre |
| 23/11/2026 | 21 modules Academy affichés « En préparation » | Pas de faux contenu ; chaque module sera écrit avec son module fonctionnel | Remplir avec du contenu générique |
| 23/11/2026 | Toast découplé du rendu ; sections ouvertes conservées | Bug trouvé en E2E : un message d'erreur refermait la tâche et effaçait la saisie | — |
