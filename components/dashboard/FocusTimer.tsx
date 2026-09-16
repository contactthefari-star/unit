"use client";

import { useCockpit } from "@/components/shell/CockpitContext";
import { IconPlay, IconPause, IconRefresh, IconLock, IconClock } from "@/components/ui/Icons";

const FOCUS_SECONDS = 45 * 60;
const BREAK_SECONDS = 15 * 60;

function fmt(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function FocusTimer() {
  const { phase, remaining, running, cycles, start, pause, reset } = useCockpit();
  const onBreak = phase === "break";
  const total = onBreak ? BREAK_SECONDS : FOCUS_SECONDS;
  const progress = 1 - remaining / total;

  return (
    <>
      <section className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-deck-mute">
            <IconClock className="text-pole-acquisition" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              Smart Pacing · 45 / 15
            </span>
          </div>
          <span className="tnum rounded-full border border-deck-line bg-deck-panel2 px-2.5 py-1 text-[11px] text-deck-mute">
            Cycle {cycles + (onBreak ? 0 : 1)}
          </span>
        </header>

        <div className="flex items-center gap-5">
          <div className="relative grid h-32 w-32 shrink-0 place-items-center">
            <svg width={128} height={128} className="-rotate-90">
              <circle cx={64} cy={64} r={57} fill="none" stroke="#232B37" strokeWidth={10} />
              <circle
                cx={64}
                cy={64}
                r={57}
                fill="none"
                stroke={onBreak ? "#F59E0B" : "#3B82F6"}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={`${progress * 2 * Math.PI * 57} ${2 * Math.PI * 57}`}
                style={{ transition: "stroke-dasharray 1s linear" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="tnum text-3xl font-bold tracking-tight text-deck-ink">
                {fmt(remaining)}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                  onBreak ? "text-pole-secretary" : "text-pole-acquisition"
                }`}
              >
                {onBreak ? "Pause" : "Focus"}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-sm text-deck-mute">
              {onBreak
                ? "Pause obligatoire — l'écran se verrouille pour couper le contexte."
                : running
                  ? "Deep Work Shield actif : navigation gelée jusqu'à la pause."
                  : "45 minutes de focus profond. Une seule tâche, zéro friction."}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => (running ? pause() : start())}
                className="inline-flex items-center gap-2 rounded-xl bg-pole-acquisition px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
              >
                {running ? <IconPause /> : <IconPlay />}
                {running ? "Pause" : remaining === total ? "Démarrer" : "Reprendre"}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2.5 text-sm font-medium text-deck-mute transition hover:text-deck-ink"
                aria-label="Réinitialiser"
              >
                <IconRefresh />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mandatory-break full-screen lock */}
      {onBreak && running && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-deck-bg/95 backdrop-blur-md">
          <div className="flex items-center gap-2 text-pole-secretary">
            <IconLock />
            <span className="text-sm font-bold uppercase tracking-[0.25em]">
              Pause obligatoire
            </span>
          </div>
          <div className="tnum text-7xl font-bold text-deck-ink">{fmt(remaining)}</div>
          <p className="max-w-sm text-center text-sm text-deck-mute">
            Lève-toi, hydrate-toi, respire. Le cockpit se rouvre à la fin de la pause.
          </p>
          <button
            onClick={reset}
            className="text-[11px] uppercase tracking-widest text-deck-faint transition hover:text-deck-mute"
          >
            Terminer la pause plus tôt
          </button>
        </div>
      )}
    </>
  );
}
