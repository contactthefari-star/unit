// Product Scoring transparent (cahier des charges §7).
// Chaque critère : note 1–5 saisie par l'utilisateur + justification.
// La marge est CALCULÉE à partir des prix, jamais saisie à la main.
// Un score n'est jamais une garantie de succès.

export const VAT_BE = 0.21;
export const PAYMENT_FEE_RATE = 0.029;
export const PAYMENT_FEE_FIXED = 0.25;

export const CRITERIA = [
  { key: 'demand', label: 'Demande', weight: 3, hint: 'Recherches, pubs actives depuis longtemps, avis nombreux.' },
  { key: 'competition', label: 'Concurrence (5 = faible)', weight: 2, hint: '5 = peu de vendeurs sérieux. 1 = saturé, guerre des prix.' },
  { key: 'differentiation', label: 'Potentiel de différenciation', weight: 2, hint: 'Peux-tu faire mieux : offre, qualité, marque, bundle ?' },
  { key: 'demo', label: 'Facilité de démonstration', weight: 2, hint: 'Le bénéfice se voit-il en 3 secondes de vidéo ?' },
  { key: 'adPotential', label: 'Potentiel publicitaire', weight: 2, hint: 'Angles clairs, effet « waouh », créatives faciles.' },
  { key: 'logistics', label: 'Logistique (5 = simple)', weight: 1, hint: 'Léger, non fragile, pas de tailles, délais courts.' },
  { key: 'risk', label: 'Risques (5 = faible)', weight: 2, hint: 'Réglementation, retours, SAV, copie facile.' },
  { key: 'retention', label: 'Fidélisation / réachat', weight: 1, hint: 'Consommable, accessoires, gamme possible ?' },
];

const round2 = (n) => Math.round(n * 100) / 100;

/** Économie unitaire. Prix de vente TTC (Belgique). */
export function unitEconomics({ sellPrice, buyPrice, shipping = 0, vatRate = VAT_BE }) {
  const sell = Number(sellPrice);
  const buy = Number(buyPrice);
  const ship = Number(shipping) || 0;
  if (!(sell > 0) || !(buy >= 0)) return null;
  const vat = sell - sell / (1 + vatRate);
  const fees = sell * PAYMENT_FEE_RATE + PAYMENT_FEE_FIXED;
  const contribution = sell - vat - fees - buy - ship; // = CPA max avant perte
  const net = sell - vat;
  return {
    vat: round2(vat),
    fees: round2(fees),
    contribution: round2(contribution),
    marginPct: round2((contribution / net) * 100),
    cpaMax: round2(Math.max(0, contribution)),
    roasMin: contribution > 0 ? round2(sell / contribution) : null,
    multiple: buy + ship > 0 ? round2(sell / (buy + ship)) : null,
  };
}

/** Note de marge 1–5 dérivée du % de contribution (après TVA, frais, produit, livraison). */
export function marginScore(marginPct) {
  if (marginPct == null || Number.isNaN(marginPct)) return null;
  if (marginPct >= 55) return 5;
  if (marginPct >= 45) return 4;
  if (marginPct >= 35) return 3;
  if (marginPct >= 20) return 2;
  return 1;
}

const MARGIN_WEIGHT = 3;

/**
 * Score global /100. Les critères non renseignés sont exclus (et signalés),
 * on ne les remplace jamais par une valeur inventée.
 */
export function scoreProduct(product) {
  const scores = product.scores || {};
  const eco = unitEconomics(product);
  const parts = [];
  const missing = [];
  for (const c of CRITERIA) {
    const v = Number(scores[c.key]?.v);
    if (v >= 1 && v <= 5) parts.push({ ...c, v, why: scores[c.key]?.why || '' });
    else missing.push(c.label);
  }
  const ms = eco ? marginScore(eco.marginPct) : null;
  if (ms) parts.push({ key: 'margin', label: 'Marge (calculée)', weight: MARGIN_WEIGHT, v: ms, why: `Contribution ${eco.marginPct} % du prix HT, CPA max ${eco.cpaMax} €.` });
  else missing.push('Marge (prix manquants)');

  const totalW = parts.reduce((s, p) => s + p.weight, 0);
  const allW = CRITERIA.reduce((s, c) => s + c.weight, 0) + MARGIN_WEIGHT;
  if (!totalW) return { score: null, parts, missing, eco, completeness: 0, verdict: 'Incomplet' };
  const score = Math.round((parts.reduce((s, p) => s + p.v * p.weight, 0) / (totalW * 5)) * 100);
  const completeness = Math.round((totalW / allW) * 100);
  let verdict = 'Faible';
  if (completeness < 60) verdict = 'Incomplet';
  else if (ms === 1) verdict = 'Marge insuffisante';
  else if (score >= 75) verdict = 'Test prioritaire';
  else if (score >= 60) verdict = 'À creuser';
  return { score, parts, missing, eco, completeness, verdict };
}
