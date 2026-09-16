-- UNIT Flight Deck — schéma Supabase
-- À exécuter UNE FOIS dans Supabase > SQL Editor > New query > Run.
--
-- Modèle simple clé-valeur : chaque « module » de l'app (clients, agenda,
-- contenu, resources, journal, énergie…) est stocké en JSON, par utilisateur.
-- Pas de migration à refaire quand l'app évolue : la structure JSON vit côté app.

create table if not exists public.app_state (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Row Level Security : chacun ne voit et n'écrit QUE ses propres lignes.
alter table public.app_state enable row level security;

drop policy if exists "own rows - select" on public.app_state;
create policy "own rows - select"
  on public.app_state for select
  using (auth.uid() = user_id);

drop policy if exists "own rows - insert" on public.app_state;
create policy "own rows - insert"
  on public.app_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "own rows - update" on public.app_state;
create policy "own rows - update"
  on public.app_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own rows - delete" on public.app_state;
create policy "own rows - delete"
  on public.app_state for delete
  using (auth.uid() = user_id);
