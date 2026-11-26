// Tests du moteur SHANI : node repas/app/tests/moteur.test.js
global.window = {};
require('../data.js');
require('../moteur.js');
const S = window.SHANI, M = window.SHANI_MOTEUR;
let echecs = 0;
const ok = (c, msg) => { if (!c) { echecs++; console.log('  ÉCHEC :', msg); } };
const scen = {
  'A · couple + 1 enfant': { adultes: 2, enfants: 1, exclus: ['aucun'], soirs: ['aucun'], temps: '30', magasin: 'Colruyt', budget: '90', gouts: 'non' },
  'B · famille 3 enfants, goûts différents': { adultes: 2, enfants: 3, exclus: ['poisson', 'champignons', 'oignon'], soirs: ['aucun'], temps: '30', magasin: 'Lidl', budget: '130', gouts: 'oui' },
  'C · budget limité': { adultes: 2, enfants: 2, exclus: ['aucun'], soirs: ['aucun'], temps: '30', magasin: 'Aldi', budget: '60', gouts: 'non' },
  'D · beaucoup d\'activités': { adultes: 2, enfants: 2, exclus: ['porc'], soirs: ['lun', 'mar', 'mer', 'jeu'], temps: '15', magasin: 'Delhaize', budget: '130', gouts: 'oui' },
};
const BUD = { '60': 60, '90': 90, '130': 130, '180': Infinity };
for (const [nom, p] of Object.entries(scen)) {
  console.log('\n' + nom);
  for (let g = 1; g <= 30; g++) {
    const sem = M.generer(p, g);
    const vus = {};
    M.JOURS.forEach(j => M.REPAS.forEach(m => {
      const r = M.parId(sem[j][m]);
      ok(r, `${j} ${m} vide (graine ${g})`);
      if (!r) return;
      ok(M.permise(r, p), `${r.n} contient un interdit (graine ${g})`);
      if (m === 'souper') { ok(!vus[r.id], `${r.n} 2 fois au souper (graine ${g})`); vus[r.id] = 1; }
      if (m === 'souper' && p.soirs.includes(j)) ok(r.rapide || r.v, `${j} chargé mais ${r.n} long sans prépa (graine ${g})`);
      const veille = M.JOURS[(M.JOURS.indexOf(j) + 6) % 7];
      if (m === 'souper' && p.soirs.includes(j) && !r.rapide) ok(!p.soirs.includes(veille), `${j} : prépa prévue la veille alors que ${veille} est chargé (graine ${g})`);
    }));
    const cout = M.coutSemaine(sem, p);
    ok(cout <= BUD[p.budget] + 0.01, `budget dépassé : ${cout.toFixed(2)} € > ${p.budget} (graine ${g})`);
    if (g === 1) {
      const t = M.taches(sem, p);
      t.forEach(x => ok(!p.soirs.includes(x.quand), `tâche un soir chargé (${x.quand})`));
      console.log('  coût estimé', cout.toFixed(2), '€ ·', (cout / 7 / (p.adultes + p.enfants)).toFixed(2), '€/pers/jour · tâches', t.length);
      M.JOURS.forEach(j => console.log('   ', j, '|', M.parId(sem[j].petitdej).n, '|', M.parId(sem[j].lunch).n, '|', M.parId(sem[j].souper).n));
      t.forEach(x => console.log('    prépa', x.quand, '→', x.pour, ':', x.texte, `(${x.minutes} min)`));
    }
  }
}
// E : changer un repas après validation
console.log('\nE · changer un repas');
const p = scen['A · couple + 1 enfant'];
const sem = M.generer(p, 7);
const avant = JSON.stringify(M.listeCourses(sem, p));
const alt = M.alternatives(sem, 'mer', 'souper', p);
ok(alt.length > 0, 'aucune alternative');
const sem2 = M.remplacer(sem, 'mer', 'souper', alt[0].id);
ok(sem2.mer.souper === alt[0].id, 'le remplacement n\'a pas été appliqué');
let autres = 0; M.JOURS.forEach(j => M.REPAS.forEach(m => { if (!(j === 'mer' && m === 'souper') && sem[j][m] !== sem2[j][m]) autres++; }));
ok(autres === 0, 'le remplacement a modifié d\'autres repas');
ok(JSON.stringify(M.listeCourses(sem2, p)) !== avant, 'la liste de courses n\'a pas été recalculée');
console.log('  remplacé', M.parId(sem.mer.souper).n, '→', alt[0].n, '·', alt.length, 'alternatives');
const lc = M.listeCourses(sem2, p);
console.log('  liste : ' + Object.keys(lc).map(r => S.RAYONS[r] + ' (' + lc[r].length + ')').join(', '));
console.log('\n' + (echecs ? echecs + ' échec(s)' : 'TOUS LES TESTS PASSENT'));
process.exit(echecs ? 1 : 0);
