// ECOM COMMAND CENTER — application (MVP V1).
import { createStore, levelFromXp } from './store.js';
import { CRITERIA, scoreProduct } from './scoring.js';
import { startDay, endDay, completeTask, currentPlan, todayKey, phaseProgress, overallProgress, ensurePhaseTasks, autoValidate, advancePhaseIfComplete } from './planner.js';
import { PHASES, getPhase, getMission } from './content/phases.js';
import { MODULES, getModule } from './content/academy.js';
import { saveFile, getBlob, deleteFile, purgeOrphans } from './files.js';
import { EXPERTS } from './content/experts.js';

let storage = null;
try { storage = window.localStorage; } catch { /* navigation privée */ }
const store = createStore({ storage });
const S = () => store.state;
const root = document.getElementById('root');
const ui = { review: false, quiz: {}, chatBusy: false, copilotDraft: '', expert: 'auto', addProduct: false, addTask: false, addProject: false };

// ---------- utilitaires
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '')) ? esc(u) : '');
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short' }) : '');
const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} Mo` : `${Math.max(1, Math.round(b / 1024))} Ko`);
const activeProject = () => S().projects.find((p) => p.id === S().settings.activeProjectId) || S().projects.find((p) => p.status !== 'archived') || null;

const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  tasks: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
  spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  flag: '<path d="M4 22V4a1 1 0 0 1 1-1h12l-2 5 2 5H5"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  focus: '<circle cx="12" cy="12" r="3"/><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  euro: '<path d="M18 7a7 7 0 1 0 0 10M4 10h10M4 14h10"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
};
const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

// Le toast vit hors du rendu principal : il ne réinitialise jamais la saisie en cours.
function toast(msg, bad = false) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = `toast${bad ? ' bad' : ''}`;
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.appendChild(el);
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.remove(), 2800);
}

// ---------- routage
function parseRoute() {
  const parts = (location.hash.replace(/^#\/?/, '') || 'today').split('/').filter(Boolean);
  return { parts, name: parts[0] };
}
const go = (h) => { location.hash = h; };

// ---------- layout
function sidebar(r) {
  const p = activeProject();
  const projects = S().projects.filter((x) => x.status !== 'archived');
  const lv = levelFromXp(S().profile.xp);
  const on = (cond) => (cond ? ' on' : '');
  const pp = r.parts[0] === 'p' ? r.parts[2] || 'home' : null;
  return `<aside class="side">
    <div class="brand"><div class="logo">EC</div><div>Command Center<small>E-commerce OS</small></div></div>
    <select class="projsel" data-change="switch-project" aria-label="Projet actif">
      ${projects.map((x) => `<option value="${x.id}" ${p?.id === x.id ? 'selected' : ''}>${x.priority ? '★ ' : ''}${esc(x.name)}</option>`).join('')}
      <option value="__new">+ Nouveau projet</option>
    </select>
    <nav class="navsec"><h6>Pilotage</h6>
      <button class="nav${on(r.name === 'today')}" data-act="go" data-to="#/today">${icon('sun')}Aujourd’hui</button>
      <button class="nav${on(r.name === 'center')}" data-act="go" data-to="#/center">${icon('grid')}Command Center</button>
    </nav>
    ${p ? `<nav class="navsec"><h6>${esc(p.name)}</h6>
      <button class="nav${on(pp === 'home')}" data-act="go" data-to="#/p/${p.id}">${icon('layout')}Dashboard</button>
      <button class="nav${on(pp === 'tasks')}" data-act="go" data-to="#/p/${p.id}/tasks">${icon('tasks')}Tâches</button>
      <button class="nav${on(pp === 'products')}" data-act="go" data-to="#/p/${p.id}/products">${icon('box')}Produits</button>
      <button class="nav${on(pp === 'files')}" data-act="go" data-to="#/p/${p.id}/files">${icon('folder')}Fichiers</button>
    </nav>` : ''}
    <nav class="navsec"><h6>Ressources</h6>
      <button class="nav${on(r.name === 'academy')}" data-act="go" data-to="#/academy">${icon('book')}Academy</button>
      <button class="nav${on(r.name === 'copilot')}" data-act="go" data-to="#/copilot">${icon('spark')}Copilot IA</button>
      <button class="nav${on(r.name === 'settings')}" data-act="go" data-to="#/settings">${icon('cog')}Réglages</button>
    </nav>
    <div class="grow"></div>
    <div class="xpbox"><div class="row"><b>Niveau ${lv.level}</b><span class="sp"></span><span>${S().profile.xp} XP</span></div><div class="bar" style="margin-top:8px"><i style="width:${lv.pct}%"></i></div></div>
  </aside>`;
}

function topbar(title, sub = '') {
  const dark = S().settings.theme !== 'light';
  return `<header class="top">
    <div class="crumbs">${esc(title)}${sub ? `<span>· ${esc(sub)}</span>` : ''}</div>
    <button class="icon-btn" data-act="focus" title="${S().settings.focus ? 'Quitter le mode Focus' : 'Mode Focus'}" aria-label="Mode Focus">${icon('focus')}</button>
    <button class="icon-btn" data-act="theme" title="Changer de thème" aria-label="Changer de thème">${icon(dark ? 'sun' : 'moon')}</button>
  </header>`;
}

// ---------- onboarding
function onboarding() {
  return `<div class="page narrow" style="padding-top:8vh">
    <div class="row"><div class="logo" style="width:40px;height:40px;font-size:15px">EC</div><div><h1>Ecom Command Center</h1><div class="sub">Ton système pour apprendre, lancer et piloter tes marques.</div></div></div>
    <form class="card" data-form="onboard" style="display:flex;flex-direction:column;gap:14px">
      <h2>Démarrage — 30 secondes</h2>
      <div class="f"><label for="ob-name">Ton prénom</label><input id="ob-name" name="name" required maxlength="40" autocomplete="given-name"></div>
      <div class="f"><label for="ob-proj">Nom de ton premier projet</label><input id="ob-proj" name="project" required maxlength="80" placeholder="Ex. Enfants et bébés"></div>
      <div class="f"><label for="ob-niche">Niche visée (facultatif)</label><input id="ob-niche" name="niche" maxlength="120" placeholder="Ex. sommeil du bébé"></div>
      <div class="f"><label for="ob-budget">Budget de départ en € (facultatif)</label><input id="ob-budget" name="budget" type="number" min="0" step="1"></div>
      <button class="btn primary big" type="submit">Créer mon espace ${icon('arrow')}</button>
      <div class="muted">Tes données restent sur cet appareil. Pense à exporter une sauvegarde dans Réglages.</div>
    </form>
  </div>`;
}

// ---------- tâche guidée
function missionBlock(t, { expanded = false } = {}) {
  const m = t.missionId ? getMission(t.missionId) : null;
  const done = t.status === 'done';
  const guide = m ? `
    <dl class="kv" style="margin-top:14px">
      <dt>Pourquoi</dt><dd>${esc(m.why)}</dd>
      <dt>Livrable</dt><dd>${esc(m.deliverable)}</dd>
      ${m.tools.length ? `<dt>Outils</dt><dd>${m.tools.map((x) => `<span class="pill" style="margin:0 4px 4px 0">${esc(x)}</span>`).join('')}</dd>` : ''}
    </dl>
    <ol class="steps">${m.how.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
    ${m.lesson ? `<div style="margin-top:12px"><a href="#/academy/${m.lesson}">Ouvrir la leçon ${icon('arrow').replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')}</a></div>` : ''}` : (t.notes ? `<p class="sub" style="margin-top:10px">${esc(t.notes)}</p>` : '');
  let action = '';
  if (done) action = `<div class="row" style="margin-top:14px"><span class="pill ok">${icon('check').replace('<svg', '<svg style="width:12px;height:12px"')} Terminé ${fmtDate(t.doneAt)}</span>${t.proof ? `<span class="muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Preuve : ${esc(t.proof)}</span>` : ''}</div>`;
  else if (m?.check) action = `<div class="row wrap" style="margin-top:14px"><span class="pill b">Validation automatique</span><span class="muted">Se valide quand tes données remplissent la condition.</span><span class="sp"></span><button class="btn sm" data-act="go" data-to="#/p/${t.projectId}/products">Ouvrir Produits</button><button class="btn sm" data-act="recheck" data-id="${t.projectId}">Vérifier</button></div>`;
  else action = `<div class="row wrap" style="margin-top:14px;align-items:flex-end">
      ${m?.proof ? `<div class="f sp" style="min-width:220px"><label for="proof-${t.id}">Preuve (lien, chiffre ou livrable)</label><input id="proof-${t.id}" maxlength="2000" placeholder="Colle ici ton livrable"></div>` : '<span class="sp"></span>'}
      ${t.status !== 'doing' ? `<button class="btn" data-act="task-doing" data-id="${t.id}">${icon('play')}Commencer</button>` : ''}
      <button class="btn primary" data-act="task-done" data-id="${t.id}">${icon('check')}Terminé</button>
    </div>`;
  const header = `<div class="row wrap"><span class="pill v">Phase ${t.phase || '—'}</span>${t.status === 'doing' ? '<span class="pill b">En cours</span>' : ''}<span class="pill">${icon('clock').replace('<svg', '<svg style="width:12px;height:12px"')} ${t.estimate || '?'} min</span>${(t.postponed || 0) >= 3 ? '<span class="pill warn">Reportée 3× — à découper ?</span>' : ''}</div>`;
  return expanded
    ? `${header}<h2>${esc(t.title)}</h2>${guide}${action}`
    : `<details data-key="task-${t.id}"><summary><span style="color:var(--ink);font-weight:600">${esc(t.title)}</span><span class="sp"></span><span class="pill">${t.estimate || '?'} min</span></summary><div style="padding-top:10px">${header}${guide}${action}</div></details>`;
}

// ---------- AUJOURD'HUI (Daily OS)
function viewToday() {
  const name = S().profile.name;
  const plan = currentPlan(store);
  const ended = S().dailyPlans.filter((d) => d.date === todayKey() && d.endedAt).at(-1);
  const last = S().dailyPlans.filter((d) => d.date !== todayKey()).at(-1);
  const gap = last ? Math.round((Date.now() - new Date(last.date).getTime()) / 86400000) : 0;
  const hello = gap > 2 ? `Content de te revoir, ${esc(name)}. On reprend là où tu t’étais arrêté.` : `Bonjour ${esc(name)}.`;

  if (!plan && ended && !ui.forceStart) {
    const r = ended.review;
    return `<div class="page narrow">
      <div><h1>Journée terminée</h1><div class="sub">Bilan du ${fmtDate(ended.endedAt)}.</div></div>
      <div class="grid g2">
        <div class="card"><h3>${icon('check')}Réalisé</h3>${r.done.length ? `<ul style="margin:10px 0 0 18px">${r.done.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="sub" style="margin-top:8px">Rien de coché aujourd’hui. Ce n’est pas grave : la prochaine session reprend ici.</p>'}</div>
        <div class="card"><h3>${icon('clock')}Replanifié</h3>${r.undone.length ? `<ul style="margin:10px 0 0 18px">${r.undone.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="sub" style="margin-top:8px">Tout est fait.</p>'}</div>
      </div>
      ${r.blockers ? `<div class="card"><h3>Blocages notés</h3><p class="sub" style="margin-top:8px">${esc(r.blockers)}</p></div>` : ''}
      <div class="card row wrap"><div class="sp"><b>${r.minutes} min</b> de travail validé${r.skills.length ? ` · compétences : ${r.skills.map((s) => esc(getModule(s)?.title || s)).join(', ')}` : ''}</div><button class="btn" data-act="restart-day">Nouvelle session</button></div>
    </div>`;
  }

  if (!plan) {
    return `<div class="page narrow" style="padding-top:6vh">
      <div><h1>${hello}</h1><div class="sub">Un clic : le système analyse tes projets et te donne une seule priorité.</div></div>
      <div class="card hero" style="text-align:center;padding:40px 20px">
        <button class="btn primary big" data-act="start-day">${icon('play')}DÉMARRER MA JOURNÉE</button>
        <div class="muted" style="margin-top:12px">1 priorité · 2 tâches secondaires maximum</div>
      </div>
    </div>`;
  }

  const tasks = plan.taskIds.map((id) => store.find('tasks', id)).filter(Boolean);
  const [main, ...rest] = tasks;
  const proj = main ? store.find('projects', main.projectId) : null;
  const doneN = tasks.filter((t) => t.status === 'done').length;
  if (ui.review) {
    return `<div class="page narrow">
      <div><h1>Terminer ma journée</h1><div class="sub">${doneN}/${tasks.length} tâches terminées. Les autres seront replanifiées automatiquement.</div></div>
      <form class="card" data-form="end-day" style="display:flex;flex-direction:column;gap:14px">
        <div class="f"><label for="ed-b">Qu’est-ce qui t’a bloqué ? (facultatif)</label><textarea id="ed-b" name="blockers" maxlength="1000"></textarea></div>
        <div class="f"><label for="ed-n">Une note pour la prochaine session (facultatif)</label><textarea id="ed-n" name="notes" maxlength="2000"></textarea></div>
        <div class="row"><button class="btn ghost" type="button" data-act="review-cancel">Annuler</button><span class="sp"></span><button class="btn primary" type="submit">${icon('flag')}Clôturer la journée</button></div>
      </form>
    </div>`;
  }
  return `<div class="page narrow">
    <div class="row wrap"><div class="sp"><h1>Ta priorité</h1><div class="sub">${proj ? esc(proj.name) : ''} · ${doneN}/${tasks.length} terminées aujourd’hui</div></div>
      <button class="btn" data-act="end-day-open">${icon('flag')}TERMINER MA JOURNÉE</button></div>
    ${main ? `<div class="card hero mission">${missionBlock(main, { expanded: true })}</div>` : ''}
    ${rest.length && !S().settings.focus ? `<div class="card"><h3 style="margin-bottom:12px">Ensuite (si tu as le temps)</h3><div style="display:flex;flex-direction:column;gap:12px">${rest.map((t) => `<div>${missionBlock(t)}</div>`).join('')}</div></div>` : ''}
  </div>`;
}

// ---------- COMMAND CENTER
function projectStats(p) {
  const products = store.list('products', p.id);
  const best = products.map((x) => scoreProduct(x).score).filter((x) => x != null).sort((a, b) => b - a)[0];
  const fin = store.list('finance', p.id);
  const spent = fin.filter((f) => f.kind === 'expense').reduce((s, f) => s + Number(f.amount), 0);
  const revenue = fin.filter((f) => f.kind === 'revenue').reduce((s, f) => s + Number(f.amount), 0);
  const next = store.list('tasks', p.id).filter((t) => t.status !== 'done').sort((a, b) => (a.phase || 99) - (b.phase || 99) || (a.order ?? 99) - (b.order ?? 99))[0];
  return { products: products.length, best, spent, revenue, next, progress: overallProgress(p, store) };
}

function viewCenter() {
  const projects = S().projects.filter((p) => p.status !== 'archived');
  const active = projects.filter((p) => p.status === 'active');
  const prio = projects.find((p) => p.priority);
  const stats = new Map(projects.map((p) => [p.id, projectStats(p)]));
  const budget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const spent = [...stats.values()].reduce((s, x) => s + x.spent, 0);
  const revenue = [...stats.values()].reduce((s, x) => s + x.revenue, 0);
  return `<div class="page">
    <div class="row wrap"><div class="sp"><h1>Command Center</h1><div class="sub">Tous tes projets, l’essentiel uniquement.</div></div><button class="btn primary" data-act="new-project">${icon('plus')}Nouveau projet</button></div>
    ${ui.addProject ? newProjectForm() : ''}
    <div class="grid g4 kpis">
      <div class="card kpi"><div class="lbl">Projets actifs</div><div class="val">${active.length}</div></div>
      <div class="card kpi"><div class="lbl">Projet prioritaire</div><div class="val sm">${prio ? esc(prio.name) : '—'}</div></div>
      <div class="card kpi"><div class="lbl">Dépensé / budget</div><div class="val sm">${eur(spent)} <span class="muted">/ ${eur(budget)}</span></div></div>
      <div class="card kpi"><div class="lbl">Revenus enregistrés</div><div class="val sm">${eur(revenue)}</div></div>
    </div>
    <div class="grid g3">
      ${projects.map((p) => { const st = stats.get(p.id); const ph = getPhase(p.phase); return `<div class="card" style="display:flex;flex-direction:column;gap:12px">
        <div class="row"><div class="sp" style="min-width:0"><h3>${p.priority ? `<span style="color:var(--warn)">${icon('star')}</span>` : ''}${esc(p.name)}</h3><div class="muted">${esc(p.niche || 'Niche à définir')}</div></div><span class="pill ${p.status === 'active' ? 'ok' : ''}">${p.status === 'active' ? 'Actif' : 'En pause'}</span></div>
        <div><div class="row muted"><span>Phase ${p.phase}/15 · ${esc(ph.title)}</span><span class="sp"></span><span>${st.progress}%</span></div><div class="bar" style="margin-top:6px"><i style="width:${st.progress}%"></i></div></div>
        <div class="muted">Prochaine étape : <span style="color:var(--ink)">${st.next ? esc(st.next.title) : '—'}</span></div>
        <div class="row"><button class="btn sm primary" data-act="go" data-to="#/p/${p.id}">Ouvrir</button>${p.priority ? '' : `<button class="btn sm ghost" data-act="set-priority" data-id="${p.id}">Rendre prioritaire</button>`}</div>
      </div>`; }).join('')}
    </div>
    ${projects.length > 1 ? `<div class="card pad0"><div style="padding:16px 18px 4px"><h3>Comparateur de projets</h3><div class="muted">Critères objectifs issus de tes données. Aucune donnée = « — ».</div></div><div class="tablewrap"><table>
      <thead><tr><th>Projet</th><th>Phase</th><th>Progression</th><th>Produits</th><th>Meilleur score</th><th>Dépensé</th><th>Revenus</th></tr></thead>
      <tbody>${projects.map((p) => { const st = stats.get(p.id); return `<tr><td><a href="#/p/${p.id}">${esc(p.name)}</a></td><td>${p.phase}/15</td><td>${st.progress}%</td><td>${st.products}</td><td>${st.best ?? '—'}</td><td>${eur(st.spent)}</td><td>${eur(st.revenue)}</td></tr>`; }).join('')}</tbody></table></div></div>` : ''}
  </div>`;
}

function newProjectForm() {
  return `<form class="card" data-form="new-project"><div class="formgrid">
    <div class="f"><label>Nom du projet</label><input name="name" required maxlength="80" placeholder="Ex. Maison et décoration"></div>
    <div class="f"><label>Niche</label><input name="niche" maxlength="120"></div>
    <div class="f"><label>Budget (€)</label><input name="budget" type="number" min="0" step="1"></div>
  </div><div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn ghost" type="button" data-act="cancel-project">Annuler</button><button class="btn primary" type="submit">Créer</button></div></form>`;
}

// ---------- DASHBOARD PROJET
function viewProject(p) {
  const pr = phaseProgress(store, p);
  const st = projectStats(p);
  const tasks = store.list('tasks', p.id);
  const open = tasks.filter((t) => t.status !== 'done').sort((a, b) => (a.status === 'doing' ? -1 : 0) - (b.status === 'doing' ? -1 : 0) || (a.phase || 99) - (b.phase || 99) || (a.order ?? 99) - (b.order ?? 99)).slice(0, 3);
  const fin = store.list('finance', p.id).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return `<div class="page">
    <div class="row wrap"><div class="sp"><h1>${esc(p.name)}</h1><div class="sub">${esc(p.niche || 'Niche à définir')}${p.priority ? ' · Projet prioritaire' : ''}</div></div>
      ${p.priority ? '' : `<button class="btn" data-act="set-priority" data-id="${p.id}">${icon('star')}Rendre prioritaire</button>`}</div>
    <div class="card">
      <div class="row"><h3>${icon('target')}Parcours · Phase ${p.phase}/15</h3><span class="sp"></span><span class="muted">${st.progress}% du parcours</span></div>
      <div class="phases" style="margin:14px 0" title="15 phases">${PHASES.map((x) => `<i class="${x.n < p.phase ? 'done' : x.n === p.phase ? 'cur' : ''}"></i>`).join('')}</div>
      <h2>${esc(pr.phase.title)}</h2>
      <p class="sub" style="margin-top:4px">${esc(pr.phase.goal)}</p>
      <details data-key="phase" style="margin-top:12px"><summary>Critère de validation et missions (${pr.done}/${pr.total})</summary>
        <p style="margin:10px 0" class="muted">${esc(pr.phase.validation)}</p>
        <div class="list">${pr.phase.missions.map((m) => { const t = tasks.find((x) => x.missionId === m.id); const ok = t?.status === 'done'; return `<div class="row" style="padding:6px 0"><span class="check ${ok ? 'on' : ''}">${icon('check')}</span><span>${esc(m.title)}</span></div>`; }).join('')}</div>
      </details>
    </div>
    <div class="grid g2">
      <div class="card pad0"><div class="hd" style="padding:16px 18px 0"><h3>${icon('tasks')}Prochaines tâches</h3><a href="#/p/${p.id}/tasks" class="muted">Tout voir</a></div>
        <div class="list">${open.length ? open.map((t) => `<div class="li click" data-act="go" data-to="#/p/${p.id}/tasks"><span class="check"></span><span class="t sp">${esc(t.title)}</span><span class="pill">${t.estimate || '?'} min</span></div>`).join('') : '<div class="empty"><b>Aucune tâche ouverte</b>Démarre ta journée pour générer la suite.</div>'}</div>
      </div>
      <div class="card"><h3>${icon('grid')}En bref</h3>
        <div class="grid g3" style="margin-top:14px">
          <div class="kpi"><div class="lbl">Produits</div><div class="val">${st.products}</div></div>
          <div class="kpi"><div class="lbl">Meilleur score</div><div class="val">${st.best ?? '—'}</div></div>
          <div class="kpi"><div class="lbl">Fichiers</div><div class="val">${store.list('files', p.id).length}</div></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="hd"><h3>${icon('euro')}Budget et dépenses réelles</h3><span class="muted">${eur(st.spent)} dépensés / ${eur(p.budget)} · ${eur(st.revenue)} encaissés</span></div>
      ${p.budget ? `<div class="bar"><i style="width:${Math.min(100, Math.round((st.spent / p.budget) * 100))}%"></i></div>` : ''}
      <details data-key="fin" style="margin-top:12px"><summary>Ajouter une dépense ou un revenu</summary>
        <form data-form="finance" style="margin-top:10px"><div class="formgrid">
          <div class="f"><label>Type</label><select name="kind"><option value="expense">Dépense</option><option value="revenue">Revenu</option></select></div>
          <div class="f"><label>Montant (€)</label><input name="amount" type="number" min="0.01" step="0.01" required></div>
          <div class="f"><label>Libellé</label><input name="label" required maxlength="120" placeholder="Ex. Échantillon fournisseur"></div>
        </div><div class="row" style="margin-top:10px"><span class="muted sp">Uniquement des montants réels. Les simulations se font dans Produits.</span><button class="btn primary sm" type="submit">Enregistrer</button></div></form>
      </details>
      ${fin.length ? `<div class="list" style="margin-top:10px">${fin.slice(0, 8).map((f) => `<div class="row" style="padding:7px 0;border-top:1px solid var(--line)"><span class="pill ${f.kind === 'revenue' ? 'ok' : ''}">${f.kind === 'revenue' ? 'Revenu' : 'Dépense'}</span><span class="sp">${esc(f.label)}</span><span class="muted">${fmtDate(f.createdAt)}</span><b>${eur(f.amount)}</b><button class="btn ghost sm" data-act="del-finance" data-id="${f.id}" aria-label="Supprimer">${icon('trash')}</button></div>`).join('')}</div>` : ''}
    </div>
    <details data-key="psettings" class="card"><summary>Paramètres du projet</summary>
      <form data-form="edit-project" style="margin-top:12px"><div class="formgrid">
        <div class="f"><label>Nom</label><input name="name" value="${esc(p.name)}" required maxlength="80"></div>
        <div class="f"><label>Niche</label><input name="niche" value="${esc(p.niche)}" maxlength="120"></div>
        <div class="f"><label>Budget (€)</label><input name="budget" type="number" min="0" value="${p.budget || 0}"></div>
        <div class="f"><label>Statut</label><select name="status"><option value="active" ${p.status === 'active' ? 'selected' : ''}>Actif</option><option value="paused" ${p.status === 'paused' ? 'selected' : ''}>En pause</option><option value="archived">Archivé</option></select></div>
      </div><div class="row" style="margin-top:12px"><button class="btn danger" type="button" data-act="delete-project" data-id="${p.id}">${icon('trash')}Supprimer le projet</button><span class="sp"></span><button class="btn primary" type="submit">Enregistrer</button></div></form>
    </details>
  </div>`;
}

// ---------- TÂCHES
function viewTasks(p) {
  const tasks = store.list('tasks', p.id);
  const open = tasks.filter((t) => t.status !== 'done').sort((a, b) => (a.phase || 99) - (b.phase || 99) || (a.order ?? 99) - (b.order ?? 99));
  const done = tasks.filter((t) => t.status === 'done').sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
  return `<div class="page narrow">
    <div class="row wrap"><div class="sp"><h1>Tâches</h1><div class="sub">${open.length} ouvertes · ${done.length} terminées</div></div><button class="btn primary" data-act="toggle-add-task">${icon('plus')}Tâche libre</button></div>
    ${ui.addTask ? `<form class="card" data-form="add-task"><div class="formgrid">
      <div class="f full"><label>Titre</label><input name="title" required maxlength="140"></div>
      <div class="f"><label>Durée estimée (min)</label><input name="estimate" type="number" min="5" max="480" value="30"></div>
      <div class="f"><label>Échéance</label><input name="due" type="date"></div>
      <div class="f"><label>Note</label><input name="notes" maxlength="500"></div>
    </div><div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn ghost" type="button" data-act="toggle-add-task">Annuler</button><button class="btn primary" type="submit">Ajouter</button></div></form>` : ''}
    <div class="card" style="display:flex;flex-direction:column;gap:14px">${open.length ? open.map((t) => `<div class="row" style="align-items:flex-start"><div class="sp" style="min-width:0">${missionBlock(t)}</div>${t.missionId ? '' : `<button class="btn ghost sm" data-act="del-task" data-id="${t.id}" aria-label="Supprimer">${icon('trash')}</button>`}</div>`).join('') : '<div class="empty"><b>Rien à faire ici</b>Les missions de la phase suivante apparaîtront automatiquement.</div>'}</div>
    ${done.length ? `<details class="card"><summary>Terminées (${done.length})</summary><div class="list" style="margin-top:8px">${done.map((t) => `<div class="row" style="padding:7px 0"><span class="check on">${icon('check')}</span><span class="sp">${esc(t.title)}</span><span class="muted">${fmtDate(t.doneAt)}</span></div>`).join('')}</div></details>` : ''}
  </div>`;
}

// ---------- PRODUITS
const scoreClass = (s) => (s == null ? '' : s >= 75 ? 'hi' : s >= 60 ? 'mid' : 'lo');
const STATUS = { idea: 'Idée', shortlist: 'Shortlist', test: 'En test', rejected: 'Écarté' };

function viewProducts(p) {
  const items = store.list('products', p.id).map((x) => ({ x, r: scoreProduct(x) })).sort((a, b) => (b.r.score ?? -1) - (a.r.score ?? -1));
  return `<div class="page">
    <div class="row wrap"><div class="sp"><h1>Product Research</h1><div class="sub">Note chaque produit sur les mêmes critères. Un score aide à comparer, il ne garantit rien.</div></div><button class="btn primary" data-act="toggle-add-product">${icon('plus')}Ajouter un produit</button></div>
    ${ui.addProduct ? `<form class="card" data-form="add-product"><div class="formgrid">
      <div class="f"><label>Nom du produit</label><input name="name" required maxlength="120"></div>
      <div class="f"><label>URL (fiche, pub, fournisseur)</label><input name="url" type="url" maxlength="500" placeholder="https://"></div>
      <div class="f"><label>Niche</label><input name="niche" maxlength="80" value="${esc(p.niche)}"></div>
      <div class="f"><label>Coût d’achat (€)</label><input name="buyPrice" type="number" min="0" step="0.01"></div>
      <div class="f"><label>Livraison par unité (€)</label><input name="shipping" type="number" min="0" step="0.01"></div>
      <div class="f"><label>Prix de vente TTC envisagé (€)</label><input name="sellPrice" type="number" min="0" step="0.01"></div>
    </div><div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn ghost" type="button" data-act="toggle-add-product">Annuler</button><button class="btn primary" type="submit">Ajouter et noter</button></div></form>` : ''}
    <div class="card pad0">${items.length ? `<div class="list">${items.map(({ x, r }) => `<div class="li click" data-act="go" data-to="#/p/${p.id}/products/${x.id}">
      <div class="score ${scoreClass(r.score)}">${r.score ?? '—'}</div>
      <div class="sp" style="min-width:0"><div class="t">${esc(x.name)}</div><div class="muted">${esc(x.niche || '')}${r.eco ? ` · marge ${r.eco.marginPct}% · CPA max ${eur(r.eco.cpaMax)}` : ' · prix à compléter'}</div></div>
      <span class="pill ${x.status === 'shortlist' || x.status === 'test' ? 'v' : x.status === 'rejected' ? 'bad' : ''}">${STATUS[x.status] || 'Idée'}</span>
      <span class="pill">${esc(r.verdict)}</span></div>`).join('')}</div>`
      : `<div class="empty"><b>Aucun produit</b>Cherche dans Meta Ads Library, TikTok Creative Center ou Minea, puis ajoute-le ici.</div>`}</div>
    <div class="muted">Intégrations Minea, Trendtrack, PiPiADS : non connectées (prévu V7). Ajout manuel en attendant.</div>
  </div>`;
}

function viewProduct(p, id) {
  const x = store.find('products', id);
  if (!x || x.projectId !== p.id) return `<div class="page"><div class="empty"><b>Produit introuvable dans ce projet</b></div></div>`;
  const r = scoreProduct(x);
  const sc = x.scores || {};
  return `<div class="page">
    <div class="row wrap"><a href="#/p/${p.id}/products" class="muted">← Produits</a></div>
    <div class="row wrap"><div class="score ${scoreClass(r.score)}" style="width:58px;height:58px;font-size:19px">${r.score ?? '—'}</div><div class="sp" style="min-width:0"><h1>${esc(x.name)}</h1><div class="sub">${esc(r.verdict)} · complétude ${r.completeness}%${x.url && safeUrl(x.url) ? ` · <a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">ouvrir le lien</a>` : ''}</div></div>
      <select data-change="product-status" data-id="${x.id}" style="width:auto" aria-label="Statut">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${x.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <button class="btn" data-act="ask-copilot-product" data-id="${x.id}">${icon('spark')}Analyser avec le Copilot</button></div>
    <div class="grid g2">
      <div class="card"><h3>${icon('euro')}Économie unitaire (Belgique, TVA 21 %)</h3>
        <form data-form="product-prices" data-id="${x.id}" class="formgrid" style="margin-top:12px">
          <div class="f"><label>Coût (€)</label><input name="buyPrice" type="number" min="0" step="0.01" value="${x.buyPrice ?? ''}"></div>
          <div class="f"><label>Livraison (€)</label><input name="shipping" type="number" min="0" step="0.01" value="${x.shipping ?? ''}"></div>
          <div class="f"><label>Prix TTC (€)</label><input name="sellPrice" type="number" min="0" step="0.01" value="${x.sellPrice ?? ''}"></div>
          <div class="full row"><span class="muted sp">Simulation : change les prix pour tester.</span><button class="btn sm primary" type="submit">Recalculer</button></div>
        </form>
        ${r.eco ? `<dl class="kv" style="margin-top:14px"><dt>TVA incluse</dt><dd>${eur(r.eco.vat)}</dd><dt>Frais paiement</dt><dd>${eur(r.eco.fees)} <span class="muted">(estim. 2,9 % + 0,25 €)</span></dd><dt>CPA max</dt><dd><b>${eur(r.eco.cpaMax)}</b> <span class="muted">au-delà, chaque vente perd de l’argent</span></dd><dt>ROAS min</dt><dd>${r.eco.roasMin ?? '—'}</dd><dt>Multiple</dt><dd>×${r.eco.multiple ?? '—'} <span class="muted">(viser ×3)</span></dd></dl>` : '<p class="muted" style="margin-top:12px">Renseigne coût et prix pour calculer la marge.</p>'}
        <p class="muted" style="margin-top:12px">Estimations, pas des données réelles. Hors pub, retours et outils.</p>
      </div>
      <div class="card"><h3>${icon('target')}Détail du score</h3>
        ${r.parts.length ? `<div class="list" style="margin-top:10px">${r.parts.map((q) => `<div style="padding:6px 0"><div class="row"><span class="sp">${esc(q.label)} <span class="muted">×${q.weight}</span></span><b>${q.v}/5</b></div>${q.why ? `<div class="muted">${esc(q.why)}</div>` : ''}</div>`).join('')}</div>` : ''}
        ${r.missing.length ? `<p class="muted" style="margin-top:10px">Non renseigné (exclu du calcul) : ${r.missing.map(esc).join(', ')}.</p>` : ''}
      </div>
    </div>
    <form class="card" data-form="product-scores" data-id="${x.id}">
      <div class="hd"><h3>Noter les critères (1 = mauvais, 5 = excellent)</h3><button class="btn primary sm" type="submit">Enregistrer</button></div>
      <div class="grid g2">${CRITERIA.map((c) => `<div class="f"><label for="sc-${c.key}">${esc(c.label)} · <output id="o-${c.key}">${sc[c.key]?.v ?? '—'}</output></label>
        <input id="sc-${c.key}" type="range" min="0" max="5" step="1" name="${c.key}" value="${sc[c.key]?.v ?? 0}" data-input="range-out" data-out="o-${c.key}">
        <input name="${c.key}_why" maxlength="300" placeholder="${esc(c.hint)}" value="${esc(sc[c.key]?.why || '')}"></div>`).join('')}</div>
      <p class="muted" style="margin-top:12px">0 = non renseigné. Justifie chaque note : sans justification, la note ne vaut rien.</p>
    </form>
    <form class="card" data-form="product-notes" data-id="${x.id}"><div class="f"><label>Notes : problème résolu, différenciation, idée de marque, saisonnalité</label><textarea name="notes" maxlength="5000">${esc(x.notes || '')}</textarea></div>
      <div class="row" style="margin-top:10px"><button class="btn danger sm" type="button" data-act="del-product" data-id="${x.id}">${icon('trash')}Supprimer</button><span class="sp"></span><button class="btn primary sm" type="submit">Enregistrer</button></div></form>
  </div>`;
}

// ---------- FICHIERS
const thumbUrls = new Map();
function viewFiles(p) {
  const files = store.list('files', p.id).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return `<div class="page narrow">
    <div class="row wrap"><div class="sp"><h1>Fichiers</h1><div class="sub">Dossier du projet ${esc(p.name)}. Images, PDF, créatives, factures, captures.</div></div>
      <label class="btn primary" style="color:#fff">${icon('upload')}Ajouter<input type="file" multiple class="hide" data-change="upload"></label></div>
    <div class="card pad0">${files.length ? `<div class="list">${files.map((f) => `<div class="li">
      ${f.category === 'Image' ? `<img class="thumb" data-thumb="${f.id}" alt="">` : `<div class="thumb">${esc((f.name.split('.').pop() || '').slice(0, 4).toUpperCase())}</div>`}
      <div class="sp" style="min-width:0"><div class="t">${esc(f.name)}</div><div class="muted">${esc(f.category)} · ${fmtSize(f.size)} · ${fmtDate(f.createdAt)}</div></div>
      <button class="btn ghost sm" data-act="dl-file" data-id="${f.id}" aria-label="Télécharger">${icon('download')}</button>
      <button class="btn ghost sm" data-act="del-file" data-id="${f.id}" aria-label="Supprimer">${icon('trash')}</button></div>`).join('')}</div>`
      : '<div class="empty"><b>Dossier vide</b>Ajoute tes captures Google Trends, devis fournisseurs, créatives…</div>'}</div>
    <div class="muted">Stockés sur cet appareil (25 Mo max par fichier). Synchronisation cloud prévue avec Supabase Storage.</div>
  </div>`;
}

async function hydrateThumbs() {
  for (const img of root.querySelectorAll('img[data-thumb]')) {
    const id = img.dataset.thumb;
    if (!thumbUrls.has(id)) {
      const blob = await getBlob(id).catch(() => null);
      if (blob) thumbUrls.set(id, URL.createObjectURL(blob));
    }
    if (thumbUrls.has(id)) img.src = thumbUrls.get(id);
  }
}

// ---------- ACADEMY
function viewAcademy() {
  const L = S().learning;
  const done = MODULES.filter((m) => L.lessons[m.id]).length;
  return `<div class="page">
    <div><h1>Ecom Academy</h1><div class="sub">${done}/${MODULES.length} modules terminés. Chaque leçon est reliée à une mission de tes projets.</div></div>
    <div class="grid g4">${MODULES.map((m) => { const ok = !!L.lessons[m.id]; const q = L.quizzes[m.id]; return `<div class="card modulecard ${m.lesson ? '' : 'soon'}" ${m.lesson ? `data-act="go" data-to="#/academy/${m.id}"` : ''}>
      <div class="row"><span class="muted">${String(m.n).padStart(2, '0')}</span><span class="sp"></span>${ok ? '<span class="pill ok">Terminé</span>' : m.lesson ? '<span class="pill v">Disponible</span>' : '<span class="pill">En préparation</span>'}</div>
      <b>${esc(m.title)}</b>${q ? `<span class="muted">Quiz ${q.score}/${q.total}</span>` : ''}</div>`; }).join('')}</div>
  </div>`;
}

function viewModule(id) {
  const m = getModule(id);
  if (!m?.lesson) return `<div class="page"><div class="empty"><b>Module en préparation</b><a href="#/academy">Retour</a></div></div>`;
  const l = m.lesson;
  const done = !!S().learning.lessons[id];
  const qs = ui.quiz[id] || {};
  const answered = Object.keys(qs).length;
  return `<div class="page narrow">
    <a href="#/academy" class="muted">← Academy</a>
    <div><span class="pill v">Module ${m.n}</span><h1 style="margin-top:8px">${esc(m.title)}</h1><p class="sub" style="margin-top:6px;font-size:15px">${esc(l.summary)}</p></div>
    ${l.sections.map((s) => `<div class="card"><h3>${esc(s.h)}</h3><p style="margin-top:8px">${esc(s.p)}</p></div>`).join('')}
    <div class="card"><h3>Exemple concret</h3><p style="margin-top:8px">${esc(l.example)}</p></div>
    <div class="grid g2"><div class="card"><h3>Outils</h3><div class="row wrap" style="margin-top:10px">${l.tools.map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</div></div>
      <div class="card"><h3>Exercice</h3><p style="margin-top:8px">${esc(l.exercise)}</p></div></div>
    <div class="card quiz"><h3>Quiz (2/3 pour valider)</h3>
      ${l.quiz.map((q, i) => `<div style="margin-top:14px"><b>${i + 1}. ${esc(q.q)}</b>${q.a.map((a, j) => { const pick = qs[i]; const cls = pick == null ? '' : j === q.c ? 'right' : pick === j ? 'wrong' : ''; return `<button class="btn opt ${cls}" ${pick != null ? 'disabled' : ''} data-act="quiz" data-mod="${id}" data-q="${i}" data-a="${j}">${esc(a)}</button>`; }).join('')}</div>`).join('')}
      ${answered === l.quiz.length ? `<div class="row" style="margin-top:14px"><b class="sp">Score : ${l.quiz.filter((q, i) => qs[i] === q.c).length}/${l.quiz.length}</b><button class="btn sm" data-act="quiz-reset" data-mod="${id}">Recommencer</button></div>` : ''}
    </div>
    <div class="row">${done ? '<span class="pill ok">Leçon terminée</span>' : `<button class="btn primary" data-act="lesson-done" data-mod="${id}">${icon('check')}J’ai terminé la leçon</button>`}</div>
  </div>`;
}

// ---------- COPILOT
function copilotContext(p) {
  if (!p) return null;
  const pr = phaseProgress(store, p);
  const tasks = store.list('tasks', p.id).filter((t) => t.status !== 'done').slice(0, 8).map((t) => t.title);
  const products = store.list('products', p.id).map((x) => { const r = scoreProduct(x); return { name: x.name, status: x.status, score: r.score, verdict: r.verdict, sellPrice: x.sellPrice, buyPrice: x.buyPrice, shipping: x.shipping, cpaMax: r.eco?.cpaMax ?? null, marginPct: r.eco?.marginPct ?? null, missing: r.missing, notes: (x.notes || '').slice(0, 400) }; }).slice(0, 15);
  const lv = levelFromXp(S().profile.xp);
  return {
    project: { name: p.name, niche: p.niche, budget: p.budget, phase: `${p.phase}/15 — ${pr.phase.title}`, phaseGoal: pr.phase.goal, missionsDone: `${pr.done}/${pr.total}` },
    openTasks: tasks, products,
    learner: { level: lv.level, lessonsDone: Object.keys(S().learning.lessons) },
    today: todayKey(),
  };
}

function viewCopilot() {
  const p = activeProject();
  if (!p) return `<div class="page"><div class="empty"><b>Crée un projet d’abord</b></div></div>`;
  const conv = store.list('conversations', p.id)[0];
  const msgs = conv?.messages || [];
  return `<div class="page narrow">
    <div class="row wrap"><div class="sp"><h1>Copilot IA</h1><div class="sub">Une équipe d’experts e-commerce qui connaît le projet <b>${esc(p.name)}</b>. Il te dira aussi quand une idée est mauvaise.</div></div>
      ${msgs.length ? `<button class="btn ghost sm" data-act="clear-chat">Nouvelle conversation</button>` : ''}</div>
    <div class="card chat" id="chat">${msgs.length ? msgs.map((m) => `<div class="msg ${m.role}${m.error ? ' err' : ''}">${m.expert ? `<div class="pill v" style="margin-bottom:8px">${esc(m.expert)}</div><br>` : ''}${esc(m.content)}</div>`).join('') : `<div class="empty"><b>Pose une question sur ton projet</b>Exemples : « Ce produit vaut-il un test ? » · « Écris 3 angles pub » · « Que faire cette semaine ? »</div>`}
      ${ui.chatBusy ? '<div class="msg assistant muted">Analyse en cours…</div>' : ''}</div>
    <form class="card" data-form="chat" style="display:flex;flex-direction:column;gap:10px">
      <div class="row wrap"><label for="expert" style="white-space:nowrap">Expert</label><select id="expert" name="expert" style="width:auto;flex:1;min-width:180px">${[['auto', 'Automatique (orchestrateur)'], ...EXPERTS.map((e) => [e.id, e.name])].map(([v, n]) => `<option value="${v}" ${ui.expert === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
      <textarea name="q" required maxlength="4000" placeholder="Ta question…">${esc(ui.copilotDraft)}</textarea>
      <div class="row"><span class="muted sp">N’invente ni chiffres ni sources. Signale ce qui manque. Le contexte du projet est envoyé avec ta question.</span><button class="btn primary" type="submit" ${ui.chatBusy ? 'disabled' : ''}>${icon('send')}Envoyer</button></div>
    </form>
  </div>`;
}

async function sendChat(q, expert) {
  const p = activeProject();
  let conv = store.list('conversations', p.id)[0];
  if (!conv) conv = store.add('conversations', { projectId: p.id, messages: [] });
  const messages = [...conv.messages, { role: 'user', content: q }];
  store.update('conversations', conv.id, { messages });
  ui.chatBusy = true; ui.copilotDraft = ''; render();
  let reply;
  try {
    const res = await fetch('/api/copilot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expert, context: copilotContext(p), messages: messages.filter((m) => !m.error).slice(-12).map(({ role, content }) => ({ role, content })) }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 404) reply = { role: 'assistant', error: true, content: 'Le Copilot n’est pas encore déployé sur ce serveur (route /api/copilot absente). Voir docs/ecom/TECHNICAL_ARCHITECTURE.md.' };
    else if (!res.ok) reply = { role: 'assistant', error: true, content: data.error || `Erreur ${res.status}` };
    else reply = { role: 'assistant', content: data.text, expert: data.expert };
  } catch {
    reply = { role: 'assistant', error: true, content: 'Connexion impossible. Vérifie ta connexion internet.' };
  }
  ui.chatBusy = false;
  store.update('conversations', conv.id, { messages: [...messages, reply] });
  if (!reply.error) store.logActivity('ai', 'Question au Copilot', p.id);
  requestAnimationFrame(() => document.getElementById('chat')?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' }));
}

// ---------- RÉGLAGES
function viewSettings() {
  return `<div class="page narrow">
    <h1>Réglages</h1>
    <form class="card" data-form="profile"><div class="formgrid"><div class="f full"><label>Prénom</label><input name="name" value="${esc(S().profile.name)}" maxlength="40" required></div></div><div class="row" style="margin-top:12px"><span class="sp"></span><button class="btn primary sm" type="submit">Enregistrer</button></div></form>
    <div class="card"><h3>Sauvegarde</h3><p class="sub" style="margin:8px 0 12px">Tes données sont sur cet appareil. Exporte une sauvegarde régulièrement (les fichiers binaires ne sont pas inclus).</p>
      <div class="row wrap"><button class="btn" data-act="export">${icon('download')}Exporter (JSON)</button><label class="btn">${icon('upload')}Importer<input type="file" accept="application/json" class="hide" data-change="import"></label></div></div>
    <div class="card"><h3>Projets archivés</h3>${S().projects.filter((p) => p.status === 'archived').map((p) => `<div class="row" style="margin-top:10px"><span class="sp">${esc(p.name)}</span><button class="btn sm" data-act="unarchive" data-id="${p.id}">Réactiver</button></div>`).join('') || '<p class="muted" style="margin-top:8px">Aucun.</p>'}</div>
    <div class="card"><h3>Zone sensible</h3><p class="sub" style="margin:8px 0 12px">Efface toutes les données de cet appareil. Irréversible.</p><button class="btn danger" data-act="reset">${icon('trash')}Tout effacer</button></div>
  </div>`;
}

// ---------- rendu
function render() {
  document.documentElement.dataset.theme = S().settings.theme || 'dark';
  document.body.classList.toggle('focus', !!S().settings.focus);
  if (!S().profile.createdAt || !S().projects.length) { root.innerHTML = onboarding(); return; }
  const open = new Set([...root.querySelectorAll('details[open][data-key]')].map((d) => d.dataset.key));
  const r = parseRoute();
  let html; let title = ''; let sub = '';
  if (r.name === 'p') {
    const p = store.find('projects', r.parts[1]);
    if (!p) { go('#/center'); return; }
    if (S().settings.activeProjectId !== p.id) queueMicrotask(() => store.setActiveProject(p.id));
    const sec = r.parts[2];
    title = p.name;
    if (!sec) { html = viewProject(p); sub = 'Dashboard'; }
    else if (sec === 'tasks') { html = viewTasks(p); sub = 'Tâches'; }
    else if (sec === 'products' && r.parts[3]) { html = viewProduct(p, r.parts[3]); sub = 'Produit'; }
    else if (sec === 'products') { html = viewProducts(p); sub = 'Produits'; }
    else if (sec === 'files') { html = viewFiles(p); sub = 'Fichiers'; }
    else { html = viewProject(p); }
  } else if (r.name === 'center') { html = viewCenter(); title = 'Command Center'; }
  else if (r.name === 'academy') { html = r.parts[1] ? viewModule(r.parts[1]) : viewAcademy(); title = 'Academy'; }
  else if (r.name === 'copilot') { html = viewCopilot(); title = 'Copilot IA'; sub = activeProject()?.name || ''; }
  else if (r.name === 'settings') { html = viewSettings(); title = 'Réglages'; }
  else { html = viewToday(); title = 'Aujourd’hui'; sub = new Date().toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' }); }
  root.innerHTML = `<div class="app">${sidebar(r)}<main class="main">${topbar(title, sub)}${html}</main></div>`;
  for (const d of root.querySelectorAll('details[data-key]')) if (open.has(d.dataset.key)) d.open = true;
  if (ui.lastHash !== location.hash) { ui.lastHash = location.hash; root.querySelector('.page')?.classList.add('fade'); }
  hydrateThumbs();
}

// ---------- actions
const num = (v) => (v === '' || v == null ? null : Math.max(0, Number(v)));

const ACTIONS = {
  go: (el) => go(el.dataset.to),
  focus: () => store.setSetting('focus', !S().settings.focus),
  theme: () => store.setSetting('theme', S().settings.theme === 'light' ? 'dark' : 'light'),
  'start-day': () => { ui.forceStart = false; const plan = startDay(store); if (!plan) toast('Aucune tâche ouverte. Crée un projet actif.', true); },
  'restart-day': () => { ui.forceStart = true; const plan = startDay(store); if (!plan) { ui.forceStart = false; toast('Plus aucune tâche ouverte. Bravo.'); } },
  'end-day-open': () => { ui.review = true; render(); },
  'review-cancel': () => { ui.review = false; render(); },
  'task-doing': (el) => store.update('tasks', el.dataset.id, { status: 'doing' }),
  'task-done': (el) => {
    const proof = document.getElementById(`proof-${el.dataset.id}`)?.value || '';
    try { completeTask(store, el.dataset.id, proof); toast('Bien joué. +XP'); } catch (e) { toast(e.message, true); }
  },
  recheck: (el) => { const n = autoValidate(store, el.dataset.id).length; toast(n ? `${n} mission(s) validée(s) par tes données` : 'Condition pas encore remplie', !n); },
  'set-priority': (el) => { store.setPriorityProject(el.dataset.id); toast('Projet prioritaire mis à jour'); },
  'new-project': () => { ui.addProject = !ui.addProject; render(); },
  'cancel-project': () => { ui.addProject = false; render(); },
  'delete-project': async (el) => {
    const p = store.find('projects', el.dataset.id);
    if (!p || !confirm(`Supprimer « ${p.name} » et TOUTES ses données (produits, tâches, fichiers, finances) ? Irréversible.`)) return;
    store.deleteProject(p.id);
    await purgeOrphans(store).catch(() => {});
    go('#/center');
    toast('Projet supprimé');
  },
  unarchive: (el) => store.update('projects', el.dataset.id, { status: 'active' }),
  'toggle-add-task': () => { ui.addTask = !ui.addTask; render(); },
  'del-task': (el) => { if (confirm('Supprimer cette tâche ?')) store.remove('tasks', el.dataset.id); },
  'del-finance': (el) => { if (confirm('Supprimer cette ligne ?')) store.remove('finance', el.dataset.id); },
  'toggle-add-product': () => { ui.addProduct = !ui.addProduct; render(); },
  'del-product': (el) => { const x = store.find('products', el.dataset.id); if (x && confirm(`Supprimer ${x.name} ?`)) { store.remove('products', x.id); go(`#/p/${x.projectId}/products`); } },
  'ask-copilot-product': (el) => {
    const x = store.find('products', el.dataset.id);
    ui.copilotDraft = `Analyse le produit « ${x.name} » de mon projet. Dis-moi clairement s’il mérite un test, ce qui manque dans mon analyse, les risques, et comment me différencier. Sois franc si c’est une mauvaise idée.`;
    ui.expert = 'product-research';
    go('#/copilot');
  },
  'dl-file': async (el) => {
    const f = store.find('files', el.dataset.id);
    const blob = await getBlob(f.id).catch(() => null);
    if (!blob) return toast('Fichier introuvable sur cet appareil', true);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = f.name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  },
  'del-file': async (el) => { const f = store.find('files', el.dataset.id); if (f && confirm(`Supprimer ${f.name} ?`)) { await deleteFile(store, f.id); toast('Fichier supprimé'); } },
  'lesson-done': (el) => { if (store.markLesson(el.dataset.mod)) { store.addXp('lesson_done', getModule(el.dataset.mod).title); toast('Leçon terminée. +XP'); } },
  quiz: (el) => {
    const { mod } = el.dataset; const qi = Number(el.dataset.q); const a = Number(el.dataset.a);
    ui.quiz[mod] = { ...(ui.quiz[mod] || {}), [qi]: a };
    const quiz = getModule(mod).lesson.quiz;
    if (Object.keys(ui.quiz[mod]).length === quiz.length) {
      const score = quiz.filter((q, i) => ui.quiz[mod][i] === q.c).length;
      const { passed, firstPass } = store.recordQuiz(mod, score, quiz.length);
      if (firstPass) { store.addXp('quiz_passed', `Quiz ${getModule(mod).title}`); store.markLesson(mod); }
      for (const p of S().projects) autoValidateLesson(p, mod, passed);
      toast(passed ? 'Quiz réussi' : 'Pas encore : relis la leçon et recommence', !passed);
    }
    render();
  },
  'quiz-reset': (el) => { delete ui.quiz[el.dataset.mod]; render(); },
  'clear-chat': () => { const p = activeProject(); const c = store.list('conversations', p.id)[0]; if (c && confirm('Effacer la conversation ?')) store.remove('conversations', c.id); },
  export: () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([store.exportJson()], { type: 'application/json' }));
    a.download = `ecom-command-center-${todayKey()}.json`; a.click();
  },
  reset: () => { if (confirm('Effacer TOUTES les données de cet appareil ?') && confirm('Vraiment ? Cette action est irréversible.')) { store.reset(); purgeOrphans(store).catch(() => {}); go('#/today'); } },
};

/** La mission « suivre la leçon » se valide uniquement si le quiz est réussi (preuve réelle). */
function autoValidateLesson(project, mod, passed) {
  if (!passed) return;
  for (const t of store.list('tasks', project.id)) {
    const m = t.missionId && getMission(t.missionId);
    if (m?.lesson === mod && t.status !== 'done') {
      store.update('tasks', t.id, { status: 'done', doneAt: new Date().toISOString(), proof: 'Quiz réussi' });
      store.addXp('mission_done', m.title, project.id);
      advancePhaseIfComplete(store, project.id);
    }
  }
}

const FORMS = {
  onboard: (d) => {
    store.setProfile({ name: d.name.trim().slice(0, 40), createdAt: new Date().toISOString() });
    const p = store.createProject({ name: d.project, niche: d.niche, budget: d.budget });
    ensurePhaseTasks(store, p);
    go('#/today');
  },
  'new-project': (d) => { const p = store.createProject(d); ensurePhaseTasks(store, p); ui.addProject = false; go(`#/p/${p.id}`); },
  'edit-project': (d) => {
    const p = activeProject();
    store.update('projects', p.id, { name: d.name.trim().slice(0, 80), niche: d.niche.slice(0, 120), budget: num(d.budget) || 0, status: d.status });
    if (d.status === 'archived') { go('#/center'); toast('Projet archivé (récupérable dans Réglages)'); } else toast('Projet enregistré');
  },
  finance: (d) => {
    const amount = Number(d.amount);
    if (!(amount > 0)) return toast('Montant invalide', true);
    store.add('finance', { projectId: activeProject().id, kind: d.kind === 'revenue' ? 'revenue' : 'expense', amount: Math.round(amount * 100) / 100, label: d.label.slice(0, 120), date: todayKey(), real: true });
    toast('Enregistré');
  },
  'add-task': (d) => {
    store.add('tasks', { projectId: activeProject().id, title: d.title.slice(0, 140), estimate: Math.min(480, Math.max(5, Number(d.estimate) || 30)), due: d.due || null, notes: d.notes.slice(0, 500), status: 'todo', source: 'manual', postponed: 0 });
    ui.addTask = false; toast('Tâche ajoutée');
  },
  'add-product': (d) => {
    const x = store.add('products', { projectId: activeProject().id, name: d.name.slice(0, 120), url: d.url.slice(0, 500), niche: d.niche.slice(0, 80), buyPrice: num(d.buyPrice), shipping: num(d.shipping), sellPrice: num(d.sellPrice), status: 'idea', scores: {} });
    ui.addProduct = false;
    store.logActivity('product', `Produit ajouté : ${x.name}`, x.projectId);
    go(`#/p/${x.projectId}/products/${x.id}`);
  },
  'product-prices': (d, form) => store.update('products', form.dataset.id, { buyPrice: num(d.buyPrice), shipping: num(d.shipping), sellPrice: num(d.sellPrice) }),
  'product-scores': (d, form) => {
    const x = store.find('products', form.dataset.id);
    const scores = {};
    for (const c of CRITERIA) { const v = Number(d[c.key]); if (v >= 1) scores[c.key] = { v, why: (d[`${c.key}_why`] || '').slice(0, 300) }; }
    const first = !x.scored && Object.keys(scores).length >= 5;
    store.update('products', x.id, { scores, scored: x.scored || first });
    if (first) store.addXp('product_scored', x.name, x.projectId);
    autoValidate(store, x.projectId);
    toast('Score enregistré');
  },
  'product-notes': (d, form) => { store.update('products', form.dataset.id, { notes: d.notes.slice(0, 5000) }); toast('Notes enregistrées'); },
  'end-day': (d) => {
    const plan = currentPlan(store);
    if (plan) endDay(store, plan.id, d);
    ui.review = false; ui.forceStart = false;
    render();
  },
  chat: (d) => { const q = d.q.trim(); if (!q || ui.chatBusy) return; ui.expert = d.expert; sendChat(q, d.expert); },
  profile: (d) => { store.setProfile({ name: d.name.trim().slice(0, 40) }); toast('Enregistré'); },
};

const CHANGES = {
  'switch-project': (el) => {
    if (el.value === '__new') { ui.addProject = true; go('#/center'); render(); return; }
    store.setActiveProject(el.value);
    go(`#/p/${el.value}`);
  },
  'product-status': (el) => { store.update('products', el.dataset.id, { status: el.value }); autoValidate(store, store.find('products', el.dataset.id).projectId); toast('Statut mis à jour'); },
  upload: async (el) => {
    const p = activeProject();
    let n = 0;
    for (const f of el.files) { try { await saveFile(store, p.id, f); n++; } catch (e) { toast(e.message, true); } }
    if (n) { store.logActivity('file', `${n} fichier(s) ajouté(s)`, p.id); toast(`${n} fichier(s) ajouté(s)`); }
  },
  import: async (el) => {
    const f = el.files[0]; if (!f) return;
    try { if (confirm('Remplacer toutes les données actuelles par cette sauvegarde ?')) { store.importJson(await f.text()); toast('Sauvegarde importée'); } } catch (e) { toast(e.message, true); }
  },
};

root.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
});
root.addEventListener('submit', (e) => {
  const form = e.target.closest('form[data-form]');
  if (!form) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form).entries());
  try { FORMS[form.dataset.form]?.(d, form); } catch (err) { toast(err.message, true); }
});
root.addEventListener('change', (e) => {
  const el = e.target.closest('[data-change]');
  if (el) CHANGES[el.dataset.change]?.(el);
});
root.addEventListener('input', (e) => {
  const el = e.target;
  if (el.dataset.input === 'range-out') { const o = document.getElementById(el.dataset.out); if (o) o.textContent = el.value === '0' ? '—' : el.value; }
});

store.subscribe(() => render());
window.addEventListener('hashchange', () => { ui.review = false; render(); window.scrollTo(0, 0); });
render();
