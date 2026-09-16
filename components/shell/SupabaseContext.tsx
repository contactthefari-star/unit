"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseEnabled } from "@/lib/supabase";

type SignInResult = { ok: boolean; message: string };

interface SupabaseCtx {
  /** true si les clés Supabase sont configurées. */
  enabled: boolean;
  /** true tant qu'on n'a pas déterminé l'état de session au démarrage. */
  loading: boolean;
  session: Session | null;
  email: string | null;
  /** Envoie un lien magique de connexion à l'email donné. */
  signIn: (email: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<SupabaseCtx | null>(null);

export function useSupabase(): SupabaseCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSupabase doit être utilisé dans <SupabaseProvider>");
  return v;
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const enabled = supabaseEnabled();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    const sb = getSupabase();
    if (!sb) return;

    let active = true;
    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [enabled]);

  const signIn = async (rawEmail: string): Promise<SignInResult> => {
    const sb = getSupabase();
    if (!sb) return { ok: false, message: "Supabase non configuré." };
    const email = rawEmail.trim();
    if (!email) return { ok: false, message: "Entre ton email." };
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) return { ok: false, message: error.message };
    return {
      ok: true,
      message: "Lien de connexion envoyé — ouvre ta boîte mail.",
    };
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setSession(null);
  };

  return (
    <Ctx.Provider
      value={{
        enabled,
        loading,
        session,
        email: session?.user?.email ?? null,
        signIn,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
