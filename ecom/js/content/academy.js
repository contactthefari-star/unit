// Ecom Academy (cahier des charges §6).
// 26 modules. `lesson` présent = contenu disponible. Sinon : « en préparation » (jamais de faux contenu).

const L = {
  fondamentaux: {
    summary: 'Une boutique est rentable quand chaque vente rapporte plus qu’elle ne coûte à obtenir.',
    sections: [
      { h: 'L’équation de base', p: 'Profit par vente = prix de vente − coût produit − livraison − frais de paiement − TVA − coût d’acquisition (CPA). Si ce chiffre est négatif, vendre plus = perdre plus.' },
      { h: 'Les 3 leviers', p: 'Tu ne peux agir que sur trois choses : le trafic (combien de personnes voient l’offre), la conversion (combien achètent) et la valeur par client (panier moyen + réachat). Tout le reste en découle.' },
      { h: 'Dropshipping, stock ou marque', p: 'Dropshipping : peu de cash, marges faibles, délais longs. Stock : plus de cash immobilisé, meilleur contrôle. Marque : plus long à construire, seul modèle qui crée un actif revendable.' },
    ],
    example: 'Produit vendu 39 €. Coût 9 €, livraison 5 €, paiement 1,4 €, TVA (21 % incluse) 6,8 €. Il reste 16,8 €. Si la pub coûte 20 € par vente, tu perds 3,2 € par commande.',
    tools: ['Calculateur de marge (Product Research)'],
    exercise: 'Prends un produit vu en pub cette semaine et calcule son profit par vente avec un CPA de 15 €.',
    quiz: [
      { q: 'Un produit à 30 € laisse 12 € avant pub. Le CPA est de 15 €. Que se passe-t-il ?', a: ['Tu gagnes 3 €', 'Tu perds 3 € par vente', 'Tu es à l’équilibre'], c: 1 },
      { q: 'Lequel n’est PAS un des 3 leviers de croissance ?', a: ['Trafic', 'Conversion', 'Nombre de produits en boutique'], c: 2 },
      { q: 'Quel modèle crée un actif revendable ?', a: ['La marque', 'Le dropshipping généraliste', 'La revente ponctuelle'], c: 0 },
    ],
  },
  'etude-marche': {
    summary: 'Le marché te dit quoi vendre. Ton rôle : écouter avant de produire.',
    sections: [
      { h: 'Demande', p: 'Vérifie que des gens cherchent et achètent déjà : volume de recherche (Google Trends), publicités actives depuis longtemps (Meta Ads Library), avis clients nombreux.' },
      { h: 'Client', p: 'Décris une personne précise : situation, problème, ce qu’elle a déjà essayé, ce qui la ferait acheter maintenant. Plus c’est précis, plus le marketing est simple.' },
      { h: 'Verbatims', p: 'Les avis 1★ et 3★ des leaders révèlent les frustrations. Copie les phrases exactes : ce sont tes futurs titres et arguments.' },
    ],
    example: 'Niche « sommeil bébé » : avis récurrents « la veilleuse est trop forte », « s’éteint trop tôt ». Opportunité : veilleuse à intensité réglable avec minuterie longue.',
    tools: ['Google Trends', 'Meta Ads Library', 'Amazon (avis)', 'Reddit'],
    exercise: 'Trouve 5 avis négatifs sur le produit leader de ta niche et reformule le problème principal en une phrase.',
    quiz: [
      { q: 'Où trouver les frustrations réelles des clients ?', a: ['Avis 1★ et 3★', 'Page d’accueil du concurrent', 'Ton intuition'], c: 0 },
      { q: 'Une publicité active depuis 3 mois indique plutôt…', a: ['Qu’elle est probablement rentable', 'Que le produit est saturé', 'Rien du tout'], c: 0 },
      { q: 'Un bon avatar client est…', a: ['Large pour toucher tout le monde', 'Précis : situation, problème, déclencheur', 'Basé sur toi-même'], c: 1 },
    ],
  },
  'recherche-produits': {
    summary: 'Un bon produit résout un problème visible, se démontre en 3 secondes et laisse assez de marge pour payer la pub.',
    sections: [
      { h: 'Les critères qui comptent', p: 'Demande réelle, effet « waouh » démontrable en vidéo, marge suffisante (viser ×3 entre coût total et prix de vente), peu de retours, possibilité de se différencier.' },
      { h: 'Les pièges', p: 'Produits fragiles, tailles (retours), produits réglementés (cosmétiques, électronique sans CE, alimentaire), produits vendus 5 € moins cher partout.' },
      { h: 'Score ≠ garantie', p: 'Le score t’aide à comparer et à ne pas oublier un critère. Seul un test réel avec un budget limité valide un produit.' },
    ],
    example: 'Brosse anti-poils animaux : problème visible, démonstration avant/après en vidéo, coût 4 €, prix 24,90 €. Point de vigilance : très copiée → se différencier par l’offre (lot de 2 + garantie).',
    tools: ['Minea', 'Meta Ads Library', 'TikTok Creative Center', 'PiPiADS', 'Google Trends'],
    exercise: 'Ajoute un produit dans Product Research et remplis tous les critères avec une justification.',
    quiz: [
      { q: 'Ratio de prix visé entre coût total et prix de vente ?', a: ['×1,5', '×3 environ', '×10 minimum'], c: 1 },
      { q: 'Quel produit est le plus risqué pour débuter ?', a: ['Un vêtement avec tailles', 'Un accessoire de cuisine', 'Un organiseur'], c: 0 },
      { q: 'Un score produit de 85/100 signifie…', a: ['Le produit va marcher', 'Il mérite un test prioritaire', 'Pas besoin de tester'], c: 1 },
    ],
  },
  'psychologie-consommateur': {
    summary: 'On achète pour soulager une douleur ou atteindre un état désiré, puis on justifie avec la logique.',
    sections: [
      { h: 'Émotion puis logique', p: 'La publicité déclenche l’émotion (problème, désir). La page produit rassure la logique (caractéristiques, garantie, avis).' },
      { h: 'Les freins', p: 'Peur de se tromper, peur de l’arnaque, délai de livraison, frais cachés. Chaque frein non traité fait chuter la conversion.' },
      { h: 'La preuve', p: 'Avis avec photos, vidéos d’utilisation réelle, chiffres concrets. Montrer vaut mieux que dire.' },
    ],
    example: 'Afficher « Livraison en Belgique 3–5 jours · Retour gratuit 30 jours » sous le bouton d’achat réduit la peur de se tromper.',
    tools: ['Microsoft Clarity', 'Avis clients'],
    exercise: 'Liste 3 freins à l’achat de ton produit et une réponse visible pour chacun.',
    quiz: [
      { q: 'Quel est le rôle de la page produit ?', a: ['Créer l’émotion', 'Rassurer la logique', 'Afficher le maximum d’infos'], c: 1 },
      { q: 'Lequel est un frein majeur ?', a: ['Frais découverts au checkout', 'Une belle photo', 'Un titre clair'], c: 0 },
      { q: 'La preuve la plus forte ?', a: ['« Meilleur produit du marché »', 'Avis client avec photo', 'Logo de la marque'], c: 1 },
    ],
  },
  finance: {
    summary: 'Le chiffre d’affaires flatte, la marge nette paie. Connais ton CPA maximum avant de lancer une pub.',
    sections: [
      { h: 'Marge brute', p: 'Prix HT − coût produit − livraison. C’est ce qui reste pour payer la pub, les outils et toi.' },
      { h: 'CPA de rentabilité', p: 'Marge par vente après frais de paiement = CPA maximum. Au-dessus, chaque vente fait perdre de l’argent.' },
      { h: 'TVA belge', p: 'Le taux standard est 21 %. Un prix TTC de 39 € contient 6,77 € de TVA. Elle ne t’appartient pas : ne la compte jamais comme marge. Vente à distance UE : guichet unique OSS au-delà de 10 000 € de ventes intra-UE.' },
    ],
    example: '39 € TTC → 32,23 € HT. Coût 9 € + livraison 5 € + paiement 1,4 € = 15,4 €. CPA max ≈ 16,8 €. ROAS minimum ≈ 39 / 16,8 = 2,3.',
    tools: ['Calculateur de marge'],
    exercise: 'Calcule le CPA max et le ROAS minimum de ton produit en tête de shortlist.',
    quiz: [
      { q: 'La TVA collectée est…', a: ['De la marge', 'De l’argent dû à l’État', 'Un coût publicitaire'], c: 1 },
      { q: 'Si le CPA réel dépasse le CPA max…', a: ['Tu perds de l’argent par vente', 'Tu es rentable', 'Ça n’a pas d’importance'], c: 0 },
      { q: 'Taux de TVA standard en Belgique ?', a: ['20 %', '21 %', '19 %'], c: 1 },
    ],
  },
};

export const MODULES = [
  ['fondamentaux', 'Fondamentaux du e-commerce'],
  ['etude-marche', 'Étude de marché'],
  ['recherche-produits', 'Recherche de produits'],
  ['tendances', 'Analyse des tendances'],
  ['psychologie-consommateur', 'Psychologie du consommateur'],
  ['comportement-achat', 'Comportement d’achat'],
  ['marketing-digital', 'Marketing digital'],
  ['copywriting', 'Copywriting'],
  ['offres', 'Création d’offres'],
  ['branding', 'Branding'],
  ['identite-visuelle', 'Identité visuelle'],
  ['sourcing', 'Sourcing et fournisseurs'],
  ['shopify', 'Shopify'],
  ['creation-boutique', 'Création de boutiques'],
  ['ux-ui', 'UX/UI'],
  ['cro', 'CRO et conversion'],
  ['creation-publicitaire', 'Création publicitaire'],
  ['meta-ads', 'Meta Ads'],
  ['tiktok-ads', 'TikTok Ads'],
  ['seo', 'SEO'],
  ['analyse-donnees', 'Analyse des données'],
  ['email-marketing', 'Email marketing'],
  ['fidelisation', 'Fidélisation'],
  ['operations', 'Gestion opérationnelle'],
  ['finance', 'Finance et rentabilité'],
  ['scaling', 'Développement et scaling'],
].map(([id, title], i) => ({ id, title, n: i + 1, lesson: L[id] || null }));

export function getModule(id) {
  return MODULES.find((m) => m.id === id) || null;
}
