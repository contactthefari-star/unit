// Daily Operating System (cahier des charges §5).
// 1 priorité + 2 tâches secondaires maximum. Aucune validation inventée :
// une mission "proof" exige une preuve, une mission "check" se valide sur les données réelles.

import { PHASES, getPhase, getMission } from './content/phases.js';

export const MAX_SECONDARY = 2;

export function todayKey(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Évalue une condition "check" sur les données réelles du projet. */
export function evaluateCheck(store, projectId, check) {
  if (!check) return false;
  const products = store.list('products', projectId);
  const [metric, raw] = check.split('>=');
  const n = Number(raw);
  if (metric === 'products') return products.filter((p) => p.scores && Object.keys(p.scores).length >= 3).length >= n;
  if (metric === 'shortlist') return products.filter((p) => p.status === 'shortlist' || p.status === 'test').length >= n;
  return false;
}

/** Crée les tâches des missions de la phase courante qui n'existent pas encore. */
export function ensurePhaseTasks(store, project) {
  const phase = getPhase(project.phase);
  const tasks = store.list('tasks', project.id);
  const created = [];
  phase.missions.forEach((m, i) => {
    if (tasks.some((t) => t.missionId === m.id)) return;
    created.push(store.add('tasks', {
      projectId: project.id, title: m.title, missionId: m.id, phase: phase.n, order: i,
      estimate: m.estimate, status: 'todo', source: 'mission', postponed: 0,
    }));
  });
  return created;
}

/** Valide automatiquement les missions dont la condition est remplie par les données. */
export function autoValidate(store, projectId) {
  const done = [];
  for (const t of store.list('tasks', projectId)) {
    if (t.status === 'done' || !t.missionId) continue;
    const m = getMission(t.missionId);
    if (m?.check && evaluateCheck(store, projectId, m.check)) {
      store.update('tasks', t.id, { status: 'done', doneAt: new Date().toISOString(), proof: `Validé par les données : ${m.check}` });
      store.addXp('mission_done', m.title, projectId);
      done.push(t);
    }
  }
  if (done.length) advancePhaseIfComplete(store, projectId);
  return done;
}

export function phaseProgress(store, project) {
  const phase = getPhase(project.phase);
  const tasks = store.list('tasks', project.id);
  const done = phase.missions.filter((m) => tasks.some((t) => t.missionId === m.id && t.status === 'done')).length;
  return { phase, done, total: phase.missions.length, pct: Math.round((done / phase.missions.length) * 100) };
}

export function overallProgress(project, store) {
  const totalMissions = PHASES.reduce((s, p) => s + p.missions.length, 0);
  const tasks = store.list('tasks', project.id);
  const done = tasks.filter((t) => t.missionId && t.status === 'done').length;
  return Math.round((done / totalMissions) * 100);
}

export function advancePhaseIfComplete(store, projectId) {
  const project = store.find('projects', projectId);
  if (!project) return false;
  const { done, total } = phaseProgress(store, project);
  if (done < total || project.phase >= PHASES.length) return false;
  store.update('projects', projectId, { phase: project.phase + 1 });
  store.logActivity('phase', `Phase ${project.phase + 1} débloquée`, projectId);
  ensurePhaseTasks(store, store.find('projects', projectId));
  return true;
}

/** Termine une tâche. Refuse si la mission exige une preuve absente. */
export function completeTask(store, taskId, proof = '') {
  const t = store.find('tasks', taskId);
  if (!t) throw new Error('Tâche introuvable');
  const m = t.missionId ? getMission(t.missionId) : null;
  const cleanProof = String(proof || '').trim();
  if (m?.proof && cleanProof.length < 3) throw new Error('Preuve requise : colle un lien, un chiffre ou le livrable.');
  if (m?.check && !evaluateCheck(store, t.projectId, m.check)) throw new Error('Condition non remplie dans tes données. Termine l’action dans le module concerné.');
  store.update('tasks', taskId, { status: 'done', doneAt: new Date().toISOString(), proof: cleanProof });
  store.addXp(m ? 'mission_done' : 'task_done', t.title, t.projectId);
  advancePhaseIfComplete(store, t.projectId);
  return store.find('tasks', taskId);
}

function rank(store) {
  const projects = store.state.projects.filter((p) => p.status === 'active');
  const prio = new Map(projects.map((p) => [p.id, p.priority ? 0 : 1]));
  const open = store.state.tasks.filter((t) => t.status !== 'done' && prio.has(t.projectId));
  return open.sort((a, b) =>
    prio.get(a.projectId) - prio.get(b.projectId)
    || (a.status === 'doing' ? -1 : 0) - (b.status === 'doing' ? -1 : 0)
    || (a.due || '9999').localeCompare(b.due || '9999')
    || (a.phase || 99) - (b.phase || 99)
    || (a.order ?? 99) - (b.order ?? 99)
    || a.createdAt.localeCompare(b.createdAt));
}

/** DÉMARRER MA JOURNÉE : analyse projets + tâches, renvoie le plan du jour. */
export function startDay(store, date = todayKey()) {
  const existing = store.state.dailyPlans.find((d) => d.date === date && !d.endedAt);
  if (existing) return existing;
  for (const p of store.state.projects.filter((x) => x.status === 'active')) {
    ensurePhaseTasks(store, p);
    autoValidate(store, p.id);
  }
  const ranked = rank(store);
  if (!ranked.length) return null;
  const [first, ...rest] = ranked;
  const taskIds = [first.id, ...rest.slice(0, MAX_SECONDARY).map((t) => t.id)];
  const blockers = ranked.filter((t) => (t.postponed || 0) >= 3).map((t) => t.id);
  const plan = store.add('dailyPlans', { date, taskIds, priorityTaskId: first.id, startedAt: new Date().toISOString(), blockers });
  store.logActivity('day', 'Journée démarrée');
  return plan;
}

/** TERMINER MA JOURNÉE : bilan + replanification des tâches non terminées. */
export function endDay(store, planId, { blockers = '', notes = '' } = {}) {
  const plan = store.find('dailyPlans', planId);
  if (!plan || plan.endedAt) return null;
  const tasks = plan.taskIds.map((id) => store.find('tasks', id)).filter(Boolean);
  const done = tasks.filter((t) => t.status === 'done');
  const undone = tasks.filter((t) => t.status !== 'done');
  for (const t of undone) store.update('tasks', t.id, { postponed: (t.postponed || 0) + 1, status: 'todo' });
  const skills = [...new Set(done.map((t) => t.missionId && getPhase(getMission(t.missionId).phase).skill).filter(Boolean))];
  const review = {
    done: done.map((t) => t.title),
    undone: undone.map((t) => t.title),
    skills,
    blockers: String(blockers).slice(0, 1000),
    notes: String(notes).slice(0, 2000),
    minutes: done.reduce((s, t) => s + (t.estimate || 0), 0),
  };
  store.update('dailyPlans', planId, { endedAt: new Date().toISOString(), review });
  store.addXp('day_closed', 'Journée clôturée');
  const next = rank(store)[0] || null;
  return { review, next };
}

export function currentPlan(store, date = todayKey()) {
  return store.state.dailyPlans.find((d) => d.date === date && !d.endedAt) || null;
}
