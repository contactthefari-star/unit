"use client";

import { useEffect, useState } from "react";

/**
 * useState qui se synchronise avec localStorage (persistance client, sans backend).
 * SSR-safe : lit après le montage et n'écrase jamais le storage avant l'hydratation.
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setState(JSON.parse(raw) as T);
    } catch {
      /* storage indisponible — on garde la valeur par défaut */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* quota / mode privé — on ignore */
    }
  }, [key, state, hydrated]);

  return [state, setState] as const;
}
