/* SHANI · moteur de la semaine (V1)
 *
 * Entrée : le profil du questionnaire
 *   { adultes, enfants, exclus: [...], soirs: [...], temps: "15"|"30"|"45",
 *     magasin, budget: "60"|"90"|"130"|"180", gouts: "oui"|"non" }
 * Sortie : 7 jours × (petitdej, lunch, souper), la liste de courses,
 * les tâches de prépa de la veille et le coût estimé.
 *
 * Tout est calculé à partir de data.js. Les prix sont des estimations.
 */
(function () {
  var S = window.SHANI;
  var JOURS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];
  var NOMS_JOURS = { lun: "Lundi", mar: "Mardi", mer: "Mercredi", jeu: "Jeudi", ven: "Vendredi", sam: "Samedi", dim: "Dimanche" };
  var REPAS = ["petitdej", "lunch", "souper"];
  var EXCLU_TAG = { porc: "porc", boeuf: "boeuf", poisson: "poisson", "fruits-de-mer": "fruitsdemer", champignons: "champignons", oignon: "oignon", epice: "epice" };
  var BUDGET_MAX = { "60": 60, "90": 90, "130": 130, "180": null };

  // Petit générateur pseudo-aléatoire, pour qu'une même graine donne la même semaine.
  function hasard(graine) {
    var s = (graine >>> 0) || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }
  function melanger(liste, rnd) {
    var a = liste.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }

  // Portions d'adulte : un ado compte pour 1, un enfant pour 0,6, un petit pour 0,4.
  function portions(p) {
    if (Array.isArray(p.ages)) return Math.max(1, (p.adultes || 0) + p.ages.reduce(function (s, a) { return s + (a >= 12 ? 1 : a >= 4 ? 0.6 : 0.4); }, 0));
    return Math.max(1, (p.adultes || 0) + 0.5 * (p.enfants || 0));
  }
  function parId(id) { for (var i = 0; i < S.RECETTES.length; i++) if (S.RECETTES[i].id === id) return S.RECETTES[i]; return null; }

  // Une recette est-elle permise pour ce foyer ? (interdits = règle stricte)
  function permise(rec, p) {
    var ex = (p.exclus || []).filter(function (x) { return x !== "aucun"; }).map(function (x) { return EXCLU_TAG[x] || x; });
    for (var i = 0; i < ex.length; i++) if (rec.tags.indexOf(ex[i]) > -1) return false;
    return true;
  }

  function charge(jour, p) { return (p.soirs || []).indexOf(jour) > -1; }
  function veilleDe(jour) { return JOURS[(JOURS.indexOf(jour) + 6) % 7]; }

  // Le souper de ce soir convient-il au temps disponible ?
  // Une prépa la veille n'est possible que si la veille n'est pas un soir chargé.
  function convientSoir(rec, jour, p) {
    var weekend = jour === "sam" || jour === "dim";
    var prepaOk = !!rec.v && !charge(veilleDe(jour), p);
    if (charge(jour, p)) return rec.rapide || prepaOk;
    if (weekend) return true;
    var t = Number(p.temps || 30);
    return t >= 45 || rec.total <= t + 15 || (prepaOk && rec.cuis >= 20);
  }

  function score(rec, jour, p, rnd) {
    var s = rnd();
    if ((p.enfants || 0) > 0 && rec.k) s += 0.6;
    if ((p.soirs || []).indexOf(jour) > -1 && rec.v) s += 0.4;
    if (rec.we && !(jour === "sam" || jour === "dim")) s -= 2;
    if (rec.we && (jour === "sam" || jour === "dim")) s += 0.5;
    return s;
  }

  function coutRepas(id, p) { var r = parId(id); return r ? S.coutPortion(r, p.magasin) * portions(p) : 0; }
  function coutSemaine(sem, p) {
    var t = 0;
    JOURS.forEach(function (j) { REPAS.forEach(function (m) { if (sem[j][m]) t += coutRepas(sem[j][m], p); }); });
    return t;
  }

  // Choisit une recette pour un créneau en évitant les répétitions.
  // Si rien ne convient, on assouplit d'abord la répétition, puis le temps,
  // mais jamais les interdits.
  function choisir(repas, jour, p, rnd, deja) {
    var niveaux = [
      function (r) { return (deja[r.id] || 0) < (repas === "souper" ? 1 : 2) && (repas !== "souper" || convientSoir(r, jour, p)); },
      function (r) { return (deja[r.id] || 0) < 2 && (repas !== "souper" || convientSoir(r, jour, p)); },
      function (r) { return repas !== "souper" || r.rapide || convientSoir(r, jour, p); },
      function () { return true; }
    ];
    for (var n = 0; n < niveaux.length; n++) {
      var cands = S.RECETTES.filter(function (r) { return r.r === repas && permise(r, p) && niveaux[n](r); });
      if (!cands.length) continue;
      var notes = cands.map(function (r) { return { id: r.id, s: score(r, jour, p, rnd) }; });
      notes.sort(function (a, b) { return b.s - a.s; });
      return notes[0].id;
    }
    return null;
  }

  // Alternatives compatibles pour remplacer un seul repas.
  function alternatives(sem, jour, repas, p) {
    var deja = {};
    JOURS.forEach(function (j) { REPAS.forEach(function (m) { var id = sem[j][m]; if (id) deja[id] = (deja[id] || 0) + 1; }); });
    var actuel = sem[jour][repas];
    return S.RECETTES.filter(function (r) {
      if (r.r !== repas || r.id === actuel || !permise(r, p)) return false;
      if (repas === "souper" && (!convientSoir(r, jour, p) || deja[r.id])) return false;
      return true;
    }).sort(function (a, b) { return S.coutPortion(a, p.magasin) - S.coutPortion(b, p.magasin); });
  }

  // Remplace les soupers les plus chers jusqu'à tenir le budget.
  function ajusterBudget(sem, p) {
    var max = BUDGET_MAX.hasOwnProperty(p.budget) ? BUDGET_MAX[p.budget] : Number(p.budget) || null;
    if (!max) return;
    for (var essai = 0; essai < 20 && coutSemaine(sem, p) > max; essai++) {
      var pire = null;
      JOURS.forEach(function (j) { REPAS.forEach(function (m) {
        var c = coutRepas(sem[j][m], p);
        if (!pire || c > pire.c) pire = { j: j, m: m, c: c };
      }); });
      var alt = alternatives(sem, pire.j, pire.m, p)[0];
      if (!alt || S.coutPortion(alt, p.magasin) * portions(p) >= pire.c) break;
      sem[pire.j][pire.m] = alt.id;
    }
  }

  function generer(p, graine) {
    var rnd = hasard(graine || Date.now());
    var sem = {}, deja = {};
    JOURS.forEach(function (j) {
      sem[j] = {};
      REPAS.forEach(function (m) {
        var id = choisir(m, j, p, rnd, deja);
        sem[j][m] = id;
        if (id) deja[id] = (deja[id] || 0) + 1;
      });
    });
    ajusterBudget(sem, p);
    return sem;
  }

  function remplacer(sem, jour, repas, nouvelId) {
    var copie = JSON.parse(JSON.stringify(sem));
    copie[jour][repas] = nouvelId;
    return copie;
  }

  // Liste de courses : quantités additionnées et adaptées au foyer, par rayon.
  function listeCourses(sem, p) {
    var k = portions(p) / 4, tot = {};
    JOURS.forEach(function (j) { REPAS.forEach(function (m) {
      var r = parId(sem[j][m]); if (!r) return;
      r.i.forEach(function (x) { tot[x[0]] = (tot[x[0]] || 0) + x[1] * k; });
    }); });
    var rayons = {};
    Object.keys(tot).forEach(function (id) {
      var ing = S.INGREDIENTS[id], q = tot[id];
      var prix = (ing[2] === "pc" ? q * ing[3] : q / 1000 * ing[3]) * (S.MAGASINS[p.magasin] || 1);
      (rayons[ing[1]] = rayons[ing[1]] || []).push({ id: id, nom: ing[0], qte: arrondir(q, ing[2]), unite: ing[2], prix: prix });
    });
    Object.keys(rayons).forEach(function (r) { rayons[r].sort(function (a, b) { return a.nom.localeCompare(b.nom, "fr"); }); });
    return rayons;
  }
  function arrondir(q, u) {
    if (u === "pc") return Math.ceil(q * 2) / 2;
    if (q >= 1000) return Math.round(q / 50) * 50;
    if (q >= 100) return Math.round(q / 10) * 10;
    return Math.max(5, Math.round(q / 5) * 5);
  }

  // Tâches de prépa : la veille de chaque soir chargé (et des plats longs).
  function taches(sem, p) {
    var out = [];
    JOURS.forEach(function (j, i) {
      var r = parId(sem[j].souper); if (!r || !r.v) return;
      var weekend = j === "sam" || j === "dim";
      var long = !weekend && r.total > Number(p.temps || 30) + 15;
      var rapide = r.rapide && charge(j, p);
      if ((!charge(j, p) && !long) || rapide) return;
      var veille = veilleDe(j);
      if (charge(veille, p)) return;
      out.push({ quand: veille, pour: j, texte: r.v[0], minutes: r.v[1], recette: r.id, fait: false });
    });
    return out;
  }

  window.SHANI_MOTEUR = {
    JOURS: JOURS, NOMS_JOURS: NOMS_JOURS, REPAS: REPAS,
    generer: generer, alternatives: alternatives, remplacer: remplacer,
    coutSemaine: coutSemaine, listeCourses: listeCourses, taches: taches,
    portions: portions, parId: parId, permise: permise
  };
})();
