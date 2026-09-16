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
- **CRM éditable** : ajouter / modifier / supprimer un client (pôle, étape,
  prochaine action, KPI cible/réel). Persisté en local.
- **Agenda éditable** : créer / modifier / supprimer un bloc, cocher « fait »
  d'un clic. Tri chronologique automatique. Persisté en local.
- **Dictée vocale** : bouton 🎤 sur les champs texte (nom, offre, action, KPI,
  intitulé de bloc, idée de contenu) via l'API navigateur Web Speech
  (`hooks/useVoiceInput.ts`). Se masque si le navigateur ne la gère pas.
- **Persistance locale** : les saisies (clients, agenda, contenu, resources,
  journal, énergie, file de recyclage) sont sauvegardées via `localStorage`
  (hook `hooks/usePersistentState.ts`).

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

Les **données de démonstration** vivent dans `lib/mock-data.ts` et servent de
graine initiale. Les modules éditables (clients, agenda, contenu, resources,
journal) recopient cette graine dans `localStorage` au premier lancement, puis
lisent/écrivent ta version. À remplacer par les vraies sources (Notion / Slack /
notes de call) ou une base serveur pour un usage multi-appareils.

## Cloud Sync — Supabase (multi-appareils + login)

Sans clés, l'app marche en local (localStorage). Avec Supabase, tes données
(clients, agenda, contenu, resources, journal, énergie) suivent sur tous tes
appareils connectés au même compte. Mise en place, **une seule fois** :

1. Crée un projet gratuit sur [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → colle le contenu de
   [`supabase/schema.sql`](supabase/schema.sql) → **Run** (crée la table
   `app_state` + la sécurité RLS : chacun ne voit que ses lignes).
3. **Settings → API** → copie *Project URL* et *anon public key* dans
   `.env.local` :

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. Relance `npm run dev`, va dans l'onglet **UNIT → Cloud Sync**, entre ton
   email : tu reçois un **lien magique**, tu cliques, tu es connecté et
   synchronisé.

Détails techniques :
- Login par **lien magique** (Supabase Auth, aucun mot de passe à gérer).
- Modèle **clé-valeur JSON** (`app_state`) : pas de migration à refaire quand
  l'app évolue. Sécurité par **RLS** (`auth.uid() = user_id`).
- **Offline-first** : `hooks/useSyncedState.ts` écrit d'abord en local puis
  pousse dans le cloud (debounce). Au chargement, la valeur distante gagne.
- Sur Vercel : ajoute les 2 variables `NEXT_PUBLIC_SUPABASE_*` dans
  *Project → Settings → Environment Variables*, puis redeploie.

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
- [x] Persistance serveur + authentification (Supabase) pour un usage
      multi-appareils.
- [ ] Notifications push natives (service worker + backend planifié).
