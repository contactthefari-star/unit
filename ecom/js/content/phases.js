// Parcours complet : de débutant à marque e-commerce (cahier des charges §20).
// Chaque mission = une tâche guidée : quoi, pourquoi, comment, outils, livrable.
// `proof: true` => la mission ne peut pas être validée sans preuve (lien, note, chiffre).

export const PHASES = [
  {
    n: 1, title: 'Comprendre les fondamentaux', skill: 'fondamentaux',
    goal: 'Savoir comment une boutique gagne (ou perd) de l’argent.',
    validation: 'Tu sais expliquer marge, CPA et seuil de rentabilité avec tes mots.',
    missions: [
      { id: 'p1m1', title: 'Suivre la leçon « Fondamentaux du e-commerce »', why: 'Sans les bases, tu choisis des produits au hasard.', how: ['Ouvre l’Academy > Fondamentaux', 'Lis la leçon en entier', 'Réussis le quiz (2/3 minimum)'], tools: ['Academy'], deliverable: 'Quiz réussi', estimate: 25, lesson: 'fondamentaux' },
      { id: 'p1m2', title: 'Écrire ton modèle économique en 5 lignes', why: 'Clarifier comment tu vas gagner de l’argent avant de dépenser.', how: ['Qui achète ?', 'Quel prix moyen visé ?', 'Quelle marge minimum (en %) ?', 'Quel budget de test maximum ?', 'Quel délai pour un premier test ?'], tools: ['Bloc-notes'], deliverable: 'Les 5 lignes collées en preuve', estimate: 20, proof: true },
    ],
  },
  {
    n: 2, title: 'Choisir une niche', skill: 'etude-marche',
    goal: 'Une niche précise avec une vraie demande et un client identifiable.',
    validation: 'Une niche choisie avec 3 raisons chiffrées ou observées.',
    missions: [
      { id: 'p2m1', title: 'Lister 5 niches possibles', why: 'Comparer évite de tomber amoureux de la première idée.', how: ['Note 5 niches liées à des passions, problèmes ou achats récurrents', 'Pour chacune : qui est le client ?', 'Élimine celles où tu ne peux pas décrire le client'], tools: ['Google Trends', 'TikTok Creative Center'], deliverable: 'Liste des 5 niches', estimate: 30, proof: true },
      { id: 'p2m2', title: 'Vérifier la tendance de tes 3 meilleures niches', why: 'Une niche en déclin coûte cher à tester.', how: ['Google Trends, 5 ans, pays : Belgique + France', 'Note : stable, en hausse, en baisse, saisonnière', 'Garde une capture d’écran dans Fichiers'], tools: ['Google Trends'], deliverable: 'Tendance notée pour 3 niches', estimate: 25, proof: true },
      { id: 'p2m3', title: 'Choisir ta niche', why: 'Un seul focus. Les autres attendent.', how: ['Compare demande, concurrence, panier moyen', 'Choisis une niche', 'Écris pourquoi en 3 points'], tools: [], deliverable: 'Niche + 3 raisons', estimate: 15, proof: true },
    ],
  },
  {
    n: 3, title: 'Étudier le marché', skill: 'etude-marche',
    goal: 'Comprendre le client, ses problèmes et ce qu’il achète déjà.',
    validation: 'Un avatar client écrit + 10 verbatims clients réels.',
    missions: [
      { id: 'p3m1', title: 'Collecter 10 verbatims clients', why: 'Les mots des clients deviennent ton copywriting.', how: ['Lis les avis 1★ et 3★ des produits leaders (Amazon, Trustpilot)', 'Copie les phrases exactes : frustrations, désirs', 'Classe-les : problème / désir / objection'], tools: ['Amazon', 'Trustpilot', 'Reddit'], deliverable: '10 verbatims classés', estimate: 40, proof: true },
      { id: 'p3m2', title: 'Écrire l’avatar client', why: 'On ne vend pas à « tout le monde ».', how: ['Âge, situation, budget', 'Problème principal', 'Ce qu’il a déjà essayé', 'Ce qui le ferait acheter maintenant'], tools: [], deliverable: 'Fiche avatar', estimate: 25, proof: true },
    ],
  },
  {
    n: 4, title: 'Identifier des produits', skill: 'recherche-produits',
    goal: 'Une shortlist de produits notés objectivement.',
    validation: 'Au moins 5 produits ajoutés et notés dans Product Research.',
    missions: [
      { id: 'p4m1', title: 'Ajouter 5 produits dans Product Research', why: 'Comparer sur des critères fixes, pas au feeling.', how: ['Cherche dans Meta Ads Library / TikTok Creative Center / Minea', 'Ajoute chaque produit avec son URL et ses prix', 'Remplis les critères de score'], tools: ['Meta Ads Library', 'TikTok Creative Center', 'Minea'], deliverable: '5 produits notés', estimate: 60, check: 'products>=5' },
      { id: 'p4m2', title: 'Mettre 2 produits en shortlist', why: 'Concentrer l’énergie sur les meilleurs.', how: ['Trie par score', 'Vérifie la marge réelle', 'Passe les 2 meilleurs en « Shortlist »'], tools: [], deliverable: '2 produits en shortlist', estimate: 15, check: 'shortlist>=2' },
    ],
  },
  {
    n: 5, title: 'Analyser les concurrents', skill: 'recherche-produits',
    goal: 'Savoir qui vend déjà, à quel prix, avec quels arguments.',
    validation: '3 concurrents analysés par produit shortlisté.',
    missions: [
      { id: 'p5m1', title: 'Analyser 3 concurrents directs', why: 'Tu dois faire mieux sur au moins un point clair.', how: ['Trouve 3 boutiques qui vendent le produit', 'Note prix, offre, garantie, délai de livraison', 'Note leur point faible principal'], tools: ['Google', 'Meta Ads Library', 'Similarweb'], deliverable: 'Tableau 3 concurrents', estimate: 45, proof: true },
    ],
  },
  {
    n: 6, title: 'Sélectionner et tester un produit', skill: 'recherche-produits',
    goal: 'Un produit choisi avec un budget de test défini.',
    validation: 'Produit passé en « Test » + budget et critère d’arrêt écrits.',
    missions: [
      { id: 'p6m1', title: 'Définir le test : budget et critère d’arrêt', why: 'Sans critère d’arrêt, on brûle du cash par espoir.', how: ['Budget maximum du test', 'CPA maximum acceptable (depuis ta marge)', 'Date de décision'], tools: ['Calculateur de marge'], deliverable: 'Budget + CPA max + date', estimate: 20, proof: true },
    ],
  },
  {
    n: 7, title: 'Trouver les fournisseurs', skill: 'sourcing',
    goal: 'Au moins 2 fournisseurs comparés et un échantillon commandé.',
    validation: 'Échantillon reçu et qualité notée.',
    missions: [
      { id: 'p7m1', title: 'Contacter 3 fournisseurs', why: 'Un seul fournisseur = aucun pouvoir de négociation.', how: ['Alibaba / CJdropshipping', 'Demande prix, MOQ, délais, frais de port vers la Belgique', 'Note les réponses'], tools: ['Alibaba', 'CJdropshipping'], deliverable: '3 devis notés', estimate: 45, proof: true },
      { id: 'p7m2', title: 'Commander un échantillon', why: 'Ne jamais vendre un produit jamais touché.', how: ['Choisis le meilleur rapport qualité/délai', 'Commande 1 à 3 unités', 'Validation humaine obligatoire : c’est une dépense'], tools: [], deliverable: 'Numéro de commande', estimate: 15, proof: true },
    ],
  },
  {
    n: 8, title: 'Construire la boutique et la marque', skill: 'shopify',
    goal: 'Une boutique propre avec une page produit qui convertit.',
    validation: 'Boutique en ligne, page produit complète, pages légales présentes.',
    missions: [
      { id: 'p8m1', title: 'Nom de marque + positionnement en 1 phrase', why: 'Une marque se retient, un produit se copie.', how: ['3 noms possibles', 'Vérifie domaine + Instagram', 'Phrase : « Pour [qui] qui [problème], [marque] [bénéfice] »'], tools: ['Namecheap', 'Instagram'], deliverable: 'Nom + phrase', estimate: 30, proof: true },
      { id: 'p8m2', title: 'Créer la page produit', why: 'C’est là que se joue la vente.', how: ['Titre = bénéfice', '5 images dont 1 en situation', 'Bénéfices avant caractéristiques', 'FAQ + garantie + délais'], tools: ['Shopify', 'Canva'], deliverable: 'URL de la page', estimate: 90, proof: true },
    ],
  },
  {
    n: 9, title: 'Préparer le marketing et les créatives', skill: 'creation-publicitaire',
    goal: '3 angles et 3 créatives prêtes à tester.',
    validation: '3 créatives prêtes avec un hook différent chacune.',
    missions: [
      { id: 'p9m1', title: 'Écrire 3 angles marketing', why: 'On teste des angles, pas des produits.', how: ['Angle problème', 'Angle désir / transformation', 'Angle preuve / démonstration'], tools: ['Copilot'], deliverable: '3 angles', estimate: 30, proof: true },
      { id: 'p9m2', title: 'Produire 3 créatives', why: 'La créative fait 70 % du résultat publicitaire.', how: ['1 vidéo démonstration', '1 vidéo UGC', '1 image statique'], tools: ['CapCut', 'Canva'], deliverable: 'Fichiers dans le projet', estimate: 120, proof: true },
    ],
  },
  {
    n: 10, title: 'Vérifier conformité et rentabilité', skill: 'finance',
    goal: 'Être en règle (Belgique / UE) et connaître ton seuil de rentabilité.',
    validation: 'CGV, rétractation, confidentialité en ligne + CPA max calculé.',
    missions: [
      { id: 'p10m1', title: 'Calculer ton CPA maximum', why: 'Au-delà de ce chiffre, chaque vente te coûte de l’argent.', how: ['Prix de vente − coût produit − livraison − frais de paiement − TVA', 'Le résultat = ton CPA de rentabilité'], tools: ['Calculateur de marge'], deliverable: 'CPA max', estimate: 15, proof: true },
      { id: 'p10m2', title: 'Checklist légale minimale', why: 'Droit de rétractation 14 jours, RGPD, mentions obligatoires.', how: ['Mentions légales (n° BCE)', 'CGV avec rétractation 14 jours', 'Politique de confidentialité + cookies', 'Modèles à faire vérifier : ce n’est pas un avis juridique'], tools: ['SPF Économie'], deliverable: 'Liens des pages', estimate: 45, proof: true },
    ],
  },
  {
    n: 11, title: 'Pré-lancement et lancement', skill: 'meta-ads',
    goal: 'Première campagne lancée avec un budget validé.',
    validation: 'Campagne lancée (validation humaine) et tracking vérifié.',
    missions: [
      { id: 'p11m1', title: 'Vérifier le tracking', why: 'Sans données fiables, impossible de décider.', how: ['Pixel Meta installé', 'Achat test effectué', 'Événement Purchase visible'], tools: ['Meta Events Manager'], deliverable: 'Capture événement', estimate: 30, proof: true },
      { id: 'p11m2', title: 'Lancer la campagne test', why: 'Le marché décide, pas toi.', how: ['1 campagne, 3 créatives', 'Budget journalier validé', 'Ne touche à rien pendant 72 h'], tools: ['Meta Ads'], deliverable: 'ID de campagne + budget', estimate: 45, proof: true },
    ],
  },
  {
    n: 12, title: 'Analyser les résultats', skill: 'analyse-donnees',
    goal: 'Décider : couper, itérer ou scaler.',
    validation: 'Décision écrite basée sur CPA réel vs CPA max.',
    missions: [
      { id: 'p12m1', title: 'Lire les chiffres du test', why: 'Décider sur des chiffres, pas sur l’émotion.', how: ['CTR, CPC, CPA, ROAS', 'Compare CPA réel et CPA max', 'Décision : couper / itérer / scaler'], tools: ['Meta Ads'], deliverable: 'Chiffres + décision', estimate: 30, proof: true },
    ],
  },
  {
    n: 13, title: 'Optimiser la conversion', skill: 'cro',
    goal: 'Supprimer les frictions qui bloquent l’achat.',
    validation: '3 améliorations CRO mises en ligne.',
    missions: [
      { id: 'p13m1', title: 'Audit rapide de la page produit', why: 'Doubler la conversion = diviser le CPA par deux.', how: ['Vue mobile d’abord', 'Le bénéfice est-il clair en 3 secondes ?', 'Preuves sociales visibles ?', 'Frais cachés au checkout ?'], tools: ['Microsoft Clarity'], deliverable: '3 problèmes + correctifs', estimate: 45, proof: true },
    ],
  },
  {
    n: 14, title: 'Fidéliser les clients', skill: 'fidelisation',
    goal: 'Faire revenir les clients sans repayer la pub.',
    validation: 'Flow email post-achat actif.',
    missions: [
      { id: 'p14m1', title: 'Mettre en place 3 emails post-achat', why: 'Un client qui rachète coûte 0 € d’acquisition.', how: ['Merci + suivi', 'Conseils d’utilisation', 'Offre de réachat / avis'], tools: ['Klaviyo'], deliverable: 'Flow actif', estimate: 60, proof: true },
    ],
  },
  {
    n: 15, title: 'Développer la marque et scaler', skill: 'scaling',
    goal: 'Augmenter le volume sans détruire la rentabilité.',
    validation: 'Plan de scaling écrit avec limites de budget.',
    missions: [
      { id: 'p15m1', title: 'Écrire le plan de scaling', why: 'Scaler sans plan = brûler la marge.', how: ['Augmentation de budget par paliers (+20 %)', 'Nouveaux angles / créatives', 'Extension de gamme'], tools: [], deliverable: 'Plan écrit', estimate: 45, proof: true },
    ],
  },
];

export function getPhase(n) {
  return PHASES.find((p) => p.n === n) || PHASES[0];
}

export function getMission(id) {
  for (const p of PHASES) {
    const m = p.missions.find((x) => x.id === id);
    if (m) return { ...m, phase: p.n };
  }
  return null;
}
