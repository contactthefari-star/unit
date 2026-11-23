// Test de bout en bout dans Chromium : node ecom/tests/e2e.mjs
// Sert le dépôt en local (même structure que Vercel : /ecom/…) et parcourt le MVP.
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const SHOTS = process.env.SHOTS || '';

const server = http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/api/copilot') {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Copilot non configuré (test local).' }));
  }
  let path = join(ROOT, url);
  if (url === '/ecom' || url === '/ecom/') path = join(ROOT, 'ecom/index.html');
  if (!path.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1360, height: 860 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && !/fonts|Failed to load resource/.test(m.text()) && errors.push(m.text()));
page.on('dialog', (d) => d.accept());
const step = (s) => console.log('✓', s);
const shot = async (n) => { if (!SHOTS) return; await page.waitForTimeout(400); await page.screenshot({ path: `${SHOTS}/${n}.png` }); };
const ok = (cond, msg) => { if (!cond) throw new Error(`ÉCHEC : ${msg}`); };

try {
  await page.goto(`${base}/ecom`);
  await page.fill('#ob-name', 'Fari');
  await page.fill('#ob-proj', 'Enfants et bébés');
  await page.fill('#ob-niche', 'sommeil bébé');
  await page.fill('#ob-budget', '500');
  await shot('01-onboarding');
  await page.click('button[type=submit]');
  await page.waitForSelector('text=DÉMARRER MA JOURNÉE');
  step('onboarding + création du premier projet');
  await shot('02-today-start');

  await page.click('text=DÉMARRER MA JOURNÉE');
  await page.waitForSelector('.hero.mission');
  ok(await page.locator('.hero.mission h2').innerText() !== '', 'priorité affichée');
  step('Daily OS : plan du jour généré');
  await shot('03-today-plan');

  // Mission à preuve : refus sans preuve
  await page.goto(`${base}/ecom#/p/${await page.evaluate(() => JSON.parse(localStorage.getItem('ecc.v1')).projects[0].id)}/tasks`);
  await page.click('text=Écrire ton modèle économique en 5 lignes');
  const det = page.locator('details[open]');
  await det.locator('button:has-text("Terminé")').click();
  await page.waitForSelector('.toast.bad');
  step('mission sans preuve refusée');
  await det.locator('input[id^=proof-]').fill('Parents 25-35 ans, panier 35 €, marge 40 %, budget 300 €, 3 semaines');
  await det.locator('button:has-text("Terminé")').click();
  await page.waitForSelector('text=Terminées (1)');
  step('mission validée avec preuve');

  // Academy + quiz => valide la mission leçon et débloque la phase 2
  await page.goto(`${base}/ecom#/academy/fondamentaux`);
  for (const [i, a] of [[0, 1], [1, 2], [2, 0]]) await page.click(`[data-q="${i}"][data-a="${a}"]`);
  await page.waitForSelector('text=Score : 3/3');
  await shot('04-academy-quiz');
  const phase = await page.evaluate(() => JSON.parse(localStorage.getItem('ecc.v1')).projects[0].phase);
  ok(phase === 2, `phase 2 débloquée (actuelle ${phase})`);
  step('quiz réussi → mission validée → phase 2 débloquée');

  // Second projet + isolation
  await page.goto(`${base}/ecom#/center`);
  await page.click('button[data-act=new-project]');
  await page.fill('form[data-form=new-project] input[name=name]', 'Sport');
  await page.click('form[data-form=new-project] button[type=submit]');
  await page.waitForSelector('h1:has-text("Sport")');
  const sportId = page.url().split('/p/')[1];
  step('second projet créé');

  // Produit dans le projet Sport
  await page.goto(`${base}/ecom#/p/${sportId}/products`);
  await page.click('text=Ajouter un produit');
  await page.fill('form[data-form=add-product] input[name=name]', 'Gourde pliable');
  await page.fill('form[data-form=add-product] input[name=buyPrice]', '4');
  await page.fill('form[data-form=add-product] input[name=shipping]', '3');
  await page.fill('form[data-form=add-product] input[name=sellPrice]', '29.9');
  await page.click('form[data-form=add-product] button[type=submit]');
  await page.waitForSelector('text=Économie unitaire');
  for (const k of ['demand', 'competition', 'differentiation', 'demo', 'adPotential']) await page.locator(`#sc-${k}`).fill('4');
  await page.click('form[data-form=product-scores] button[type=submit]');
  await page.waitForSelector('text=Score enregistré');
  const score = await page.locator('.score').first().innerText();
  ok(/^\d+$/.test(score.trim()), `score numérique (${score})`);
  step(`produit noté : score ${score}`);
  await shot('05-product');

  // Isolation : le projet Bébé ne voit pas la gourde
  const bebeId = await page.evaluate(() => JSON.parse(localStorage.getItem('ecc.v1')).projects[0].id);
  await page.goto(`${base}/ecom#/p/${bebeId}/products`);
  await page.waitForSelector('text=Aucun produit');
  step('isolation : produit invisible dans l’autre projet');

  // Fichier
  await page.goto(`${base}/ecom#/p/${bebeId}/files`);
  await page.setInputFiles('input[data-change=upload]', { name: 'tendance.csv', mimeType: 'text/csv', buffer: Buffer.from('mois,valeur\n1,40') });
  await page.waitForSelector('text=tendance.csv');
  step('fichier ajouté au projet');

  // Finance réelle
  await page.goto(`${base}/ecom#/p/${bebeId}`);
  await page.click('text=Ajouter une dépense ou un revenu');
  await page.fill('form[data-form=finance] input[name=amount]', '42.5');
  await page.fill('form[data-form=finance] input[name=label]', 'Échantillon');
  await page.click('form[data-form=finance] button[type=submit]');
  await page.waitForSelector('text=Échantillon');
  step('dépense réelle enregistrée');

  await page.goto(`${base}/ecom#/center`);
  await page.waitForSelector('text=Comparateur de projets');
  ok((await page.locator('.kpi .val').nth(2).innerText()).includes('42,50'), 'dépenses agrégées');
  step('Command Center : KPIs + comparateur');
  await shot('06-center');

  // Copilot : erreur honnête quand non configuré
  await page.goto(`${base}/ecom#/copilot`);
  await page.fill('form[data-form=chat] textarea', 'Que faire cette semaine ?');
  await page.click('form[data-form=chat] button[type=submit]');
  await page.waitForSelector('.msg.err');
  step('Copilot : message clair si non configuré');

  // Fin de journée
  await page.goto(`${base}/ecom#/today`);
  await page.click('text=TERMINER MA JOURNÉE');
  await page.fill('#ed-b', 'Manque de temps');
  await page.click('form[data-form=end-day] button[type=submit]');
  await page.waitForSelector('text=Journée terminée');
  step('fin de journée : bilan affiché');
  await shot('07-review');

  // Thème clair + mobile
  await page.click('[data-act=theme]');
  ok(await page.evaluate(() => document.documentElement.dataset.theme) === 'light', 'thème clair');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/ecom#/center`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok(!overflow, 'pas de scroll horizontal sur mobile');
  await shot('08-mobile-light');
  step('thème clair + mobile sans débordement');

  // Persistance après rechargement
  await page.reload();
  await page.waitForSelector('text=Command Center');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('ecc.v1')).projects.length) === 2, 'persistance');
  step('données persistées après rechargement');

  ok(!errors.length, `erreurs JS : ${errors.join(' | ')}`);
  console.log('\nE2E OK');
} catch (e) {
  console.error(e.message, errors);
  await page.screenshot({ path: `${SHOTS || '.'}/fail.png` }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
