// Couche de données. Local-first (localStorage) derrière une interface unique,
// pour basculer vers Supabase sans toucher aux écrans (voir TECHNICAL_ARCHITECTURE.md).
//
// Règle d'isolation : toute collection "scopée" exige un projectId à l'écriture
// et à la lecture. Un enregistrement ne peut jamais changer de projet.

export const SCHEMA_VERSION = 1;

export const PROJECT_SCOPED = ['stores', 'brands', 'tasks', 'products', 'files', 'finance', 'conversations'];
export const GLOBAL = ['projects', 'dailyPlans', 'activity'];
export const COLLECTIONS = [...GLOBAL, ...PROJECT_SCOPED];

export const XP_RULES = {
  task_done: 20,
  mission_done: 30,
  lesson_done: 15,
  quiz_passed: 25,
  product_scored: 10,
  day_closed: 10,
};

export function levelFromXp(xp) {
  // Niveau n atteint à 100 * n * (n - 1) / 2 XP : 0, 100, 300, 600, 1000…
  let level = 1;
  while (100 * level * (level + 1) / 2 <= xp) level++;
  const floor = 100 * (level - 1) * level / 2;
  const next = 100 * level * (level + 1) / 2;
  return { level, floor, next, pct: Math.round(((xp - floor) / (next - floor)) * 100) };
}

export function emptyState() {
  const s = {
    version: SCHEMA_VERSION,
    profile: { name: '', xp: 0, createdAt: null },
    settings: { theme: 'dark', activeProjectId: null, focus: false },
    learning: { lessons: {}, quizzes: {} },
  };
  for (const c of COLLECTIONS) s[c] = [];
  return s;
}

const defaultUid = () =>
  (globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

export function createStore({ storage, key = 'ecc.v1', now = () => new Date().toISOString(), uid = defaultUid } = {}) {
  let state = load();
  const subs = new Set();

  function load() {
    try {
      const raw = storage?.getItem(key);
      if (!raw) return emptyState();
      return migrate(JSON.parse(raw));
    } catch {
      return emptyState();
    }
  }

  function migrate(s) {
    const base = emptyState();
    const out = { ...base, ...s, profile: { ...base.profile, ...s.profile }, settings: { ...base.settings, ...s.settings }, learning: { ...base.learning, ...s.learning } };
    for (const c of COLLECTIONS) if (!Array.isArray(out[c])) out[c] = [];
    out.version = SCHEMA_VERSION;
    return out;
  }

  function commit() {
    try { storage?.setItem(key, JSON.stringify(state)); } catch (e) { console.error('Sauvegarde impossible', e); }
    subs.forEach((fn) => fn(state));
  }

  function assertCol(col) {
    if (!COLLECTIONS.includes(col)) throw new Error(`Collection inconnue : ${col}`);
  }

  function log(type, label, projectId = null) {
    state.activity.unshift({ id: uid(), type, label, projectId, at: now() });
    if (state.activity.length > 300) state.activity.length = 300;
  }

  const api = {
    get state() { return state; },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },

    list(col, projectId) {
      assertCol(col);
      if (PROJECT_SCOPED.includes(col)) {
        if (!projectId) throw new Error(`projectId requis pour lire ${col}`);
        return state[col].filter((r) => r.projectId === projectId);
      }
      return state[col];
    },

    find(col, id) {
      assertCol(col);
      return state[col].find((r) => r.id === id) || null;
    },

    add(col, data) {
      assertCol(col);
      if (PROJECT_SCOPED.includes(col)) {
        if (!data.projectId || !state.projects.some((p) => p.id === data.projectId)) {
          throw new Error(`projectId valide requis pour ${col}`);
        }
      }
      const rec = { ...data, id: uid(), createdAt: now(), updatedAt: now() };
      state[col].push(rec);
      commit();
      return rec;
    },

    update(col, id, patch) {
      assertCol(col);
      const i = state[col].findIndex((r) => r.id === id);
      if (i < 0) return null;
      const { id: _i, projectId: _p, createdAt: _c, ...safe } = patch;
      state[col][i] = { ...state[col][i], ...safe, updatedAt: now() };
      commit();
      return state[col][i];
    },

    remove(col, id) {
      assertCol(col);
      const before = state[col].length;
      state[col] = state[col].filter((r) => r.id !== id);
      if (state[col].length !== before) commit();
      return state[col].length !== before;
    },

    // ---- Projets
    createProject({ name, niche = '', budget = 0 }) {
      const clean = String(name || '').trim();
      if (!clean) throw new Error('Nom de projet requis');
      const first = state.projects.filter((p) => p.status !== 'archived').length === 0;
      const p = { id: uid(), name: clean.slice(0, 80), niche: String(niche).slice(0, 120), budget: Math.max(0, Number(budget) || 0), status: 'active', priority: first, phase: 1, createdAt: now(), updatedAt: now() };
      state.projects.push(p);
      if (!state.settings.activeProjectId) state.settings.activeProjectId = p.id;
      log('project', `Projet créé : ${p.name}`, p.id);
      commit();
      return p;
    },

    setPriorityProject(id) {
      state.projects = state.projects.map((p) => ({ ...p, priority: p.id === id }));
      commit();
    },

    setActiveProject(id) {
      if (id && !state.projects.some((p) => p.id === id)) return;
      state.settings.activeProjectId = id;
      commit();
    },

    /** Supprime un projet ET toutes ses données (isolation : rien ne fuit vers un autre projet). */
    deleteProject(id) {
      state.projects = state.projects.filter((p) => p.id !== id);
      for (const c of PROJECT_SCOPED) state[c] = state[c].filter((r) => r.projectId !== id);
      state.dailyPlans = state.dailyPlans.map((d) => ({ ...d, taskIds: (d.taskIds || []).filter((t) => state.tasks.some((x) => x.id === t)) }));
      if (state.settings.activeProjectId === id) state.settings.activeProjectId = state.projects[0]?.id || null;
      if (!state.projects.some((p) => p.priority) && state.projects[0]) state.projects[0].priority = true;
      commit();
    },

    // ---- Progression
    addXp(reason, label = '', projectId = null) {
      const pts = XP_RULES[reason] || 0;
      state.profile.xp += pts;
      log('xp', `+${pts} XP · ${label || reason}`, projectId);
      commit();
      return pts;
    },

    logActivity(type, label, projectId = null) { log(type, label, projectId); commit(); },

    setSetting(k, v) { state.settings[k] = v; commit(); },
    setProfile(patch) { state.profile = { ...state.profile, ...patch }; commit(); },

    markLesson(moduleId) {
      if (state.learning.lessons[moduleId]) return false;
      state.learning.lessons[moduleId] = now();
      commit();
      return true;
    },

    recordQuiz(moduleId, score, total) {
      const prev = state.learning.quizzes[moduleId];
      const passed = score / total >= 2 / 3;
      const firstPass = passed && !prev?.passed;
      state.learning.quizzes[moduleId] = { score, total, passed: passed || !!prev?.passed, at: now() };
      commit();
      return { passed, firstPass };
    },

    // ---- Sauvegarde
    exportJson() { return JSON.stringify(state, null, 2); },
    importJson(text) {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.projects)) throw new Error('Fichier de sauvegarde invalide');
      state = migrate(parsed);
      commit();
    },
    reset() { state = emptyState(); commit(); },
  };
  return api;
}
