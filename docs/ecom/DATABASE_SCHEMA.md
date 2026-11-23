# DATABASE SCHEMA

V1 : même structure en local (JSON). V2 : tables Postgres Supabase ci-dessous, chaque table avec `user_id` et RLS.

## Collections V1 (implémentées)
| Collection | Scope | Champs principaux |
|---|---|---|
| `projects` | user | id, name, niche, budget, status (active/paused/archived), priority, phase (1–15) |
| `tasks` | projet | id, projectId, title, missionId, phase, order, estimate, status (todo/doing/done), due, notes, proof, postponed, doneAt, source (mission/manual) |
| `products` | projet | id, projectId, name, url, niche, buyPrice, shipping, sellPrice, status (idea/shortlist/test/rejected), scores{key:{v,why}}, notes |
| `files` | projet | id, projectId, name, type, size, category (binaire en IndexedDB, clé = id) |
| `finance` | projet | id, projectId, kind (expense/revenue), amount, label, date, real |
| `conversations` | projet | id, projectId, messages[{role, content, expert, error}] |
| `stores` | projet | prévu V3 |
| `brands` | projet | prévu V3 |
| `dailyPlans` | user | id, date, taskIds[], priorityTaskId, startedAt, endedAt, review{done, undone, skills, blockers, notes, minutes} |
| `activity` | user | id, type, label, projectId, at (300 dernières) |
| `profile` | user | name, xp, createdAt |
| `learning` | user | lessons{moduleId: date}, quizzes{moduleId: {score,total,passed}} |

## Tables V2 → V8 (prévues)
Users, Projects, Brands, Stores, Products, Suppliers, Competitors, Tasks, DailyPlans, LearningModules, Skills, Progress, Campaigns, Creatives, Expenses, Revenues, Audits, Benchmarks, Documents, AIConversations, Integrations.

Relations : `projects 1─n stores`, `brands n─n stores`, `projects 1─n (products, suppliers, competitors, tasks, campaigns, documents…)`, `products n─n suppliers`, `campaigns 1─n creatives`.

## SQL Supabase (V2) — modèle de base
```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  niche text default '',
  budget numeric(12,2) default 0 check (budget >= 0),
  status text not null default 'active' check (status in ('active','paused','archived')),
  priority boolean not null default false,
  phase smallint not null default 1 check (phase between 1 and 15),
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.projects enable row level security;
create policy own_projects on public.projects for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Modèle pour toute table scopée par projet (products, tasks, files, finance, conversations…)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  project_id uuid not null references public.projects on delete cascade,
  name text not null, url text, niche text,
  buy_price numeric(10,2), shipping numeric(10,2), sell_price numeric(10,2),
  status text not null default 'idea', scores jsonb not null default '{}', notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
alter table public.products enable row level security;
create policy own_products on public.products for all
  using (user_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()))
  with check (user_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
-- project_id non modifiable :
create or replace function public.lock_project_id() returns trigger language plpgsql as $$
begin if new.project_id <> old.project_id then raise exception 'project_id immuable'; end if; return new; end $$;
create trigger products_lock before update on public.products for each row execute function public.lock_project_id();
```
