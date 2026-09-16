"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase, STATE_TABLE } from "@/lib/supabase";
import { useSupabase } from "@/components/shell/SupabaseContext";

/**
 * Drop-in de `usePersistentState`, mais synchronisé multi-appareils.
 *
 * Stratégie « offline-first » :
 *  - localStorage sert toujours de cache immédiat (l'app marche hors-ligne).
 *  - Si Supabase est configuré ET l'utilisateur connecté, on lit la valeur
 *    distante au montage (elle gagne : c'est la source multi-appareils), puis
 *    chaque modification est renvoyée dans le cloud (debounce 700 ms).
 *  - Sans clés ou sans session → comportement identique à usePersistentState.
 */
export function useSyncedState<T>(key: string, initial: T) {
  const { enabled, session } = useSupabase();
  const userId = session?.user?.id ?? null;

  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const skipNextWrite = useRef(false);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) Hydratation locale (une fois).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      /* storage indisponible */
    }
    setHydrated(true);
  }, [key]);

  // 2) Chargement distant quand une session est disponible.
  useEffect(() => {
    if (!enabled || !userId) return;
    const sb = getSupabase();
    if (!sb) return;
    let active = true;

    sb.from(STATE_TABLE)
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (!active || !data) return;
        skipNextWrite.current = true;
        setState(data.value as T);
        try {
          localStorage.setItem(key, JSON.stringify(data.value));
        } catch {
          /* ignore */
        }
      });

    return () => {
      active = false;
    };
  }, [enabled, userId, key]);

  // 3) Écriture locale + push cloud (debounce) à chaque changement.
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* quota / mode privé */
    }

    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }

    if (!enabled || !userId) return;
    const sb = getSupabase();
    if (!sb) return;

    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => {
      sb.from(STATE_TABLE)
        .upsert(
          {
            user_id: userId,
            key,
            value: state,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,key" },
        )
        .then(() => {
          /* silencieux : la source de vérité locale reste affichée */
        });
    }, 700);

    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [key, state, hydrated, enabled, userId]);

  const set = useCallback((v: T | ((prev: T) => T)) => setState(v), []);

  return [state, set] as const;
}
