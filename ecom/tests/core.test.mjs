import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, levelFromXp } from '../js/store.js';
import { scoreProduct, unitEconomics } from '../js/scoring.js';
import { startDay, endDay, completeTask, ensurePhaseTasks, autoValidate } from '../js/planner.js';
import { MODULES } from '../js/content/academy.js';
import { PHASES } from '../js/content/phases.js';

function memStorage() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), dump: () => m };
}

test('isolation : une donnée scopée exige un projet valide', () => {
  const s = createStore({ storage: memStorage() });
  assert.throws(() => s.add('products', { name: 'X' }));
  assert.throws(() => s.add('products', { name: 'X', projectId: 'inconnu' }));
  assert.throws(() => s.list('products'));
});

test('isolation : les projets ne voient jamais les données des autres', () => {
  const s = createStore({ storage: memStorage() });
  const a = s.createProject({ name: 'Bébé' });
  const b = s.createProject({ name: 'Sport' });
  s.add('products', { projectId: a.id, name: 'Veilleuse' });
  s.add('products', { projectId: b.id, name: 'Gourde' });
  assert.deepEqual(s.list('products', a.id).map((p) => p.name), ['Veilleuse']);
  assert.deepEqual(s.list('products', b.id).map((p) => p.name), ['Gourde']);
});

test('isolation : un enregistrement ne change jamais de projet', () => {
  const s = createStore({ storage: memStorage() });
  const a = s.createProject({ name: 'A' });
  const b = s.createProject({ name: 'B' });
  const p = s.add('products', { projectId: a.id, name: 'X' });
  s.update('products', p.id, { projectId: b.id, name: 'Y' });
  assert.equal(s.find('products', p.id).projectId, a.id);
  assert.equal(s.find('products', p.id).name, 'Y');
});

test('suppression de projet en cascade', () => {
  const s = createStore({ storage: memStorage() });
  const a = s.createProject({ name: 'A' });
  const b = s.createProject({ name: 'B' });
  s.add('products', { projectId: a.id, name: 'X' });
  s.add('tasks', { projectId: a.id, title: 't', status: 'todo' });
  s.add('products', { projectId: b.id, name: 'Z' });
  s.deleteProject(a.id);
  assert.equal(s.state.products.length, 1);
  assert.equal(s.state.tasks.length, 0);
  assert.ok(s.state.projects[0].priority, 'un projet prioritaire subsiste');
});

test('persistance : rechargement depuis le stockage', () => {
  const st = memStorage();
  const s1 = createStore({ storage: st });
  s1.createProject({ name: 'Persisté' });
  const s2 = createStore({ storage: st });
  assert.equal(s2.state.projects[0].name, 'Persisté');
});

test('export / import JSON', () => {
  const s = createStore({ storage: memStorage() });
  s.createProject({ name: 'Backup' });
  const json = s.exportJson();
  const t = createStore({ storage: memStorage() });
  t.importJson(json);
  assert.equal(t.state.projects[0].name, 'Backup');
  assert.throws(() => t.importJson('{"x":1}'));
});

test('économie unitaire : TVA belge, frais, CPA max', () => {
  const e = unitEconomics({ sellPrice: 39, buyPrice: 9, shipping: 5 });
  assert.equal(e.vat, 6.77);
  assert.ok(e.cpaMax > 16 && e.cpaMax < 17.5, `cpaMax=${e.cpaMax}`);
  assert.equal(unitEconomics({ sellPrice: 0, buyPrice: 1 }), null);
});

test('scoring : critères manquants signalés, jamais inventés', () => {
  const r = scoreProduct({ sellPrice: 39, buyPrice: 9, shipping: 5, scores: { demand: { v: 5 } } });
  assert.equal(r.verdict, 'Incomplet');
  assert.ok(r.missing.length >= 6);
  const full = scoreProduct({
    sellPrice: 39, buyPrice: 6, shipping: 3,
    scores: Object.fromEntries(['demand', 'competition', 'differentiation', 'demo', 'adPotential', 'logistics', 'risk', 'retention'].map((k) => [k, { v: 5 }])),
  });
  assert.equal(full.score, 100);
  assert.equal(full.verdict, 'Test prioritaire');
});

test('Daily OS : 1 priorité + 2 secondaires max, projet prioritaire en premier', () => {
  const s = createStore({ storage: memStorage() });
  const a = s.createProject({ name: 'A' });
  const b = s.createProject({ name: 'B' });
  s.setPriorityProject(b.id);
  const plan = startDay(s, '2026-11-23');
  assert.equal(plan.taskIds.length, 3);
  assert.equal(s.find('tasks', plan.priorityTaskId).projectId, b.id);
  assert.equal(startDay(s, '2026-11-23').id, plan.id, 'pas de double plan');
  assert.ok(a);
});

test('mission avec preuve : refusée sans preuve, acceptée avec', () => {
  const s = createStore({ storage: memStorage() });
  const p = s.createProject({ name: 'A' });
  ensurePhaseTasks(s, p);
  const t = s.list('tasks', p.id).find((x) => x.missionId === 'p1m2');
  assert.throws(() => completeTask(s, t.id, ''));
  completeTask(s, t.id, 'Mes 5 lignes');
  assert.equal(s.find('tasks', t.id).status, 'done');
  assert.ok(s.state.profile.xp > 0);
});

test('phase suivante débloquée quand toutes les missions sont faites', () => {
  const s = createStore({ storage: memStorage() });
  const p = s.createProject({ name: 'A' });
  ensurePhaseTasks(s, p);
  for (const t of s.list('tasks', p.id)) completeTask(s, t.id, 'preuve ok');
  assert.equal(s.find('projects', p.id).phase, 2);
  assert.ok(s.list('tasks', p.id).some((t) => t.missionId === 'p2m1'));
});

test('mission "check" validée uniquement par les données réelles', () => {
  const s = createStore({ storage: memStorage() });
  const p = s.createProject({ name: 'A' });
  s.update('projects', p.id, { phase: 4 });
  ensurePhaseTasks(s, s.find('projects', p.id));
  const t = s.list('tasks', p.id).find((x) => x.missionId === 'p4m1');
  assert.throws(() => completeTask(s, t.id, 'je jure'));
  for (let i = 0; i < 5; i++) s.add('products', { projectId: p.id, name: `P${i}`, scores: { demand: { v: 3 }, demo: { v: 3 }, risk: { v: 3 } } });
  autoValidate(s, p.id);
  assert.equal(s.find('tasks', t.id).status, 'done');
});

test('fin de journée : bilan + tâches non faites replanifiées', () => {
  const s = createStore({ storage: memStorage() });
  const p = s.createProject({ name: 'A' });
  const plan = startDay(s, '2026-11-23');
  const res = endDay(s, plan.id, { blockers: 'temps' });
  assert.equal(res.review.done.length, 0);
  assert.equal(res.review.undone.length, plan.taskIds.length);
  assert.equal(s.find('tasks', plan.taskIds[0]).postponed, 1);
  assert.ok(p);
});

test('XP et niveaux', () => {
  assert.equal(levelFromXp(0).level, 1);
  assert.equal(levelFromXp(100).level, 2);
  assert.equal(levelFromXp(299).level, 2);
  assert.equal(levelFromXp(300).level, 3);
});

test('contenu : 26 modules Academy et 15 phases', () => {
  assert.equal(MODULES.length, 26);
  assert.equal(PHASES.length, 15);
  for (const m of MODULES.filter((x) => x.lesson)) {
    assert.ok(m.lesson.quiz.length >= 3);
    for (const q of m.lesson.quiz) assert.ok(q.c < q.a.length);
  }
});
