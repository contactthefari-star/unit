# Activer le partage famille (Supabase)

Le partage permet à la famille de dire « je m'en occupe » sur un dîner, et partage aussi le planning et tes recettes perso.

## 1. Créer le projet (5 minutes)

1. Va sur https://supabase.com et crée un compte gratuit.
2. Clique **New project**. Nom : `cuisine-keto`. Région : **Frankfurt** (proche de la Belgique). Choisis un mot de passe et garde-le pour toi.
3. Attends que le projet soit prêt (1 à 2 minutes).

## 2. Créer la table

Dans le menu de gauche, ouvre **SQL Editor**, colle tout le bloc ci-dessous, puis clique **Run**.

```sql
create table if not exists public.kv (
  col text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);

alter table public.kv enable row level security;

-- Seules les 3 listes de l'app sont autorisées : planning, coups de main, recettes perso.
create policy "lire" on public.kv for select to anon
  using (col in ('semaines','aide','recettes'));
create policy "ajouter" on public.kv for insert to anon
  with check (col in ('semaines','aide','recettes'));
create policy "modifier" on public.kv for update to anon
  using (col in ('semaines','aide','recettes'))
  with check (col in ('semaines','aide','recettes'));
create policy "supprimer" on public.kv for delete to anon
  using (col in ('semaines','aide','recettes'));
```

## 3. Récupérer les deux valeurs

Va dans **Project Settings → API** (ou **Data API**) et copie :

- **Project URL** : ressemble à `https://abcdefgh.supabase.co`
- **anon public key** : une longue clé qui commence par `eyJ…`

La clé « anon » est faite pour être dans une app publique : elle ne donne accès qu'à ce que les règles ci-dessus autorisent. Ne donne **jamais** la clé `service_role`.

## 4. Les coller dans l'app

Dans `cuisine/index.html`, remplis ces deux lignes :

```js
const SUPABASE_URL='https://abcdefgh.supabase.co';
const SUPABASE_KEY='eyJ...';
```

Ou envoie les deux valeurs à Claude, qui les ajoute pour toi.

## À savoir

- Toute personne qui a le lien de l'app peut lire et modifier le planning partagé. C'est fait pour la famille : ne partage pas le lien publiquement.
- Sans connexion, les changements sont gardés sur le téléphone et envoyés dès que le réseau revient.
- Le budget, les courses cochées et le stock restent sur chaque téléphone.
