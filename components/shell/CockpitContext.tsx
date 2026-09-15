"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type Energy = "low" | "medium" | "high";
export type Phase = "focus" | "break";

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
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

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
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
