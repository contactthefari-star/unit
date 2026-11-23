// Les 20 experts IA (cahier des charges §16). Partagé entre le front et /api/copilot.
export const EXPERTS = [
  { id: 'strategy', name: 'Business Strategy Expert', focus: 'choix de niche, priorisation, modèle économique, go/no-go' },
  { id: 'product-research', name: 'Product Research Expert', focus: 'évaluation de produits, critères de sélection, potentiel de test' },
  { id: 'market-research', name: 'Market Research Expert', focus: 'demande, tendances, avatar client, verbatims' },
  { id: 'competitor', name: 'Competitor Expert', focus: 'analyse concurrentielle, positionnement, prix, offres' },
  { id: 'sourcing', name: 'Sourcing Expert', focus: 'fournisseurs, MOQ, délais, échantillons, qualité' },
  { id: 'testing', name: 'Product Testing Expert', focus: 'protocole de test, budget, critère d’arrêt, lecture des résultats' },
  { id: 'marketing', name: 'Marketing Expert', focus: 'acquisition, positionnement, lancement, calendrier' },
  { id: 'copywriting', name: 'Copywriting Expert', focus: 'titres, hooks, pages produit, emails, scripts UGC' },
  { id: 'branding', name: 'Branding Expert', focus: 'nom, identité, ton, univers et différenciation de marque' },
  { id: 'shopify', name: 'Shopify Expert', focus: 'structure de boutique, thèmes, apps, checkout' },
  { id: 'ux-ui', name: 'UX/UI Expert', focus: 'hiérarchie visuelle, navigation, mobile, lisibilité' },
  { id: 'cro', name: 'CRO Expert', focus: 'frictions, réassurance, preuves sociales, parcours d’achat' },
  { id: 'advertising', name: 'Advertising Expert', focus: 'Meta Ads, TikTok Ads, structure de campagne, budgets, KPIs' },
  { id: 'creative', name: 'Creative Expert', focus: 'angles, formats vidéo, hooks visuels, itérations créatives' },
  { id: 'seo', name: 'SEO Expert', focus: 'mots-clés, contenu, référencement des fiches produit' },
  { id: 'finance', name: 'Finance Expert', focus: 'marge, CPA max, ROAS, trésorerie, TVA belge' },
  { id: 'legal', name: 'Legal Expert', focus: 'conformité Belgique/UE : RGPD, CGV, rétractation, sécurité produit (modèles, pas un avis juridique)' },
  { id: 'analytics', name: 'Analytics Expert', focus: 'lecture des données, tracking, décisions basées sur les chiffres' },
  { id: 'retention', name: 'Retention Expert', focus: 'emails post-achat, réachat, fidélisation, LTV' },
  { id: 'operations', name: 'Operations Expert', focus: 'logistique, SAV, retours, process' },
];

export const EXPERT_IDS = new Set(EXPERTS.map((e) => e.id));
