import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté navigateur.
 * Activé uniquement si les 2 variables publiques sont présentes — sinon
 * l'app retombe proprement sur le stockage local (localStorage).
 *
 * .env.local :
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseEnabled(): boolean {
  return Boolean(url && anon);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled()) return null;
  if (!client) {
    client = createClient(url as string, anon as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

/** Nom de la table clé-valeur qui stocke l'état de l'app par utilisateur. */
export const STATE_TABLE = "app_state";
