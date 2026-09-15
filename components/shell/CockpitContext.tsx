"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TabId } from "@/lib/nav";
import { RepurposedDraft } from "@/lib/types";

export type Energy = "low" | "medium" | "high";
export type Phase = "focus" | "break";

const TAB_IDS: TabId[] = [
  "dashboard",
  "clients",
  "closing",
  "content",
  "unit",
  "calendar",
];

const FOCUS_SECONDS = 45 * 60;
const BREAK_SECONDS = 15 * 60;

interface CockpitCtx {
  // Pomodoro 45/15
  phase: Phase;
  remaining: number;
  running: boolean;
  cycles: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  // Énergie du jour
  energy: Energy;
  setEnergy: (e: Energy) => void;
  // Deep Work Shield
  manualShield: boolean;
  toggleShield: () => void;
  shieldActive: boolean; // manuel OU auto (focus en cours)
  // Navigation partagée
  tab: TabId;
  setTab: (t: TabId) => void;
  // Content Repurposing Bridge (audit client -> contenu)
  repurposed: RepurposedDraft[];
  addRepurposed: (d: RepurposedDraft) => void;
}

const Ctx = createContext<CockpitCtx | null>(null);

export function useCockpit(): CockpitCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCockpit doit être utilisé dans <CockpitProvider>");
  return v;
}

export function CockpitProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("focus");
  const [remaining, setRemaining] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [energy, setEnergy] = useState<Energy>("high");
  const [manualShield, setManualShield] = useState(false);
  const [tab, setTab] = useState<TabId>("dashboard");
  const [repurposed, setRepurposed] = useState<RepurposedDraft[]>([]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  // Deep-link: /?tab=clients ouvre directement l'onglet correspondant.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && (TAB_IDS as string[]).includes(t)) setTab(t as TabId);
  }, []);

  const addRepurposed = useCallback(
    (d: RepurposedDraft) => setRepurposed((list) => [d, ...list]),
    [],
  );

  const switchPhase = useCallback((next: Phase) => {
    setPhase(next);
    setRemaining(next === "focus" ? FOCUS_SECONDS : BREAK_SECONDS);
  }, []);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        if (phase === "focus") {
          setCycles((c) => c + 1);
          queueMicrotask(() => switchPhase("break"));
          return 0;
        }
        // fin de pause → retour focus, arrêt (pause obligatoire respectée)
        queueMicrotask(() => {
          switchPhase("focus");
          setRunning(false);
        });
        return 0;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running, phase, switchPhase]);

  const start = () => {
    if (remaining === 0) switchPhase(phase);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    switchPhase("focus");
  };

  const shieldActive = manualShield || (running && phase === "focus");

  return (
    <Ctx.Provider
      value={{
        phase,
        remaining,
        running,
        cycles,
        start,
        pause,
        reset,
        energy,
        setEnergy,
        manualShield,
        toggleShield: () => setManualShield((s) => !s),
        shieldActive,
        tab,
        setTab,
        repurposed,
        addRepurposed,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
