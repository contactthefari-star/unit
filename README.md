# UNIT Flight Deck

Cockpit mono-écran pour Growth Operator (profil TDAH) : cycles 45/15, zéro
friction de décision. Application **Next.js + TailwindCSS + TypeScript**.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production
npm start          # sert le build
```

## Navigation

Sidebar fixe à gauche, 6 onglets (deep-link `?tab=<id>`) :

| Onglet | Contenu |
| --- | --- |
| `dashboard` | Résumé 80/20 + MRR, chrono 45/15, énergie du jour, KPIs, CA, outils d'urgence |
| `clients` | CRM visuel : stage, baromètre KPI (cible/réel), prochaine action, onboarding, « Convertir en contenu » |
| `closing` | Matrice diagnostic → génère dossier client + tâches |
| `content` | Recyclage audit, Guided Scripting, Lecture active, calendrier éditorial, Resource Hub, Journal, Video Learning |
| `unit` | Secrétaire ⌘K, alertes programmées, statut Notion Sync |
| `calendar` | Agenda 80/20 (piloté par l'énergie) + replanification auto |

## Fonctionnels notables

- **Chrono 45/15** global : verrouillage écran obligatoire en pause.
- **Deep Work Shield** : gèle la navigation automatiquement pendant un focus.
- **Énergie du jour** : met en avant/estompe les priorités P1/P2/P3 dans l'agenda.
- **⌘K Fast Drop** : capture une requête → estime le temps → slot 80/20 → deadline.
- **Persistance locale** : les saisies (contenu, resources, journal, énergie,
  file de recyclage) sont sauvegardées via `localStorage` (hook
  `hooks/usePersistentState.ts`).

## Structure

```
app/            layout, page (AppShell), api/notion (webhook)
components/
  shell/        Sidebar, TopBar, AppShell, CockpitContext (état partagé)
  views/        une vue par onglet
  dashboard/    modules (timer, CRM, scheduler, content factory, etc.)
  ui/           Gauge, Icons
lib/            types, mock-data (données de démo), nav, notion
hooks/          usePersistentState
```

## Données

Tout est en **données de démonstration** dans `lib/mock-data.ts` — l'UI ne lit
que ces structures. À remplacer par les vraies sources (Notion / Slack / notes
de call).

## Notion Sync (à configurer)

Structure prête (`app/api/notion/route.ts` + `lib/notion.ts`). Renseigner les
clés dans `.env.local` (voir `.env.example`) :

```
NOTION_API_KEY=...
NOTION_WEBHOOK_SECRET=...
NOTION_DB_TASKS=...        # + CONTENT, CRM, ARTHUR, JEREMY, ANDRE
```

Webhook entrant : `POST /api/notion` (auth par header `x-unit-signature`).

## Roadmap (prochaines étapes)

- [ ] Brancher les vraies clés Notion (sync 2 sens réelle).
- [ ] Persistance serveur + authentification (base de données) pour un usage
      multi-appareils.
- [ ] Notifications push natives (service worker + backend planifié).
