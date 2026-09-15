"use client";

import { useEffect, useRef, useState } from "react";
import { IconBolt, IconPlay, IconPause, IconRefresh, IconArrow } from "@/components/ui/Icons";

/* ---------------------------------------------------------------- */
/* Micro-sprint : force-timer de 10 min pour vaincre l'inertie      */
/* ---------------------------------------------------------------- */

const SPRINT = 10 * 60;

function fmt(s: number) {
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function MicroSprint() {
  const [remaining, setRemaining] = useState(SPRINT);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1;
        setRunning(false);
        setDone(true);
        return 0;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
  }, [running]);

  const start = () => {
    setDone(false);
    if (remaining === 0) setRemaining(SPRINT);
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setDone(false);
    setRemaining(SPRINT);
  };

  const progress = 1 - remaining / SPRINT;

  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <div className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBolt className="text-pole-alert" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Micro-sprint · 10 min
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center">
          <svg width={96} height={96} className="-rotate-90">
            <circle cx={48} cy={48} r={42} fill="none" stroke="#232B37" strokeWidth={8} />
            <circle
              cx={48}
              cy={48}
              r={42}
              fill="none"
              stroke="#EF4444"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${progress * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
              style={{ transition: "stroke-dasharray 1s linear" }}
            />
          </svg>
          <span
            className={`tnum absolute text-xl font-bold text-deck-ink ${
              running ? "animate-pulseSoft" : ""
            }`}
          >
            {fmt(remaining)}
          </span>
        </div>

        <div className="flex-1">
          <p className="text-sm text-deck-mute">
            {done
              ? "Sprint bouclé. Tu es lancé — enchaîne ou prends 2 min."
              : "Juste 10 minutes. Pas de perfection, juste démarrer."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => (running ? setRunning(false) : start())}
              className="inline-flex items-center gap-2 rounded-xl bg-pole-alert px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              {running ? <IconPause /> : <IconPlay />}
              {running ? "Stop" : remaining === SPRINT || done ? "Démarrer" : "Reprendre"}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2.5 text-deck-mute transition hover:text-deck-ink"
              aria-label="Réinitialiser"
            >
              <IconRefresh />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Décomposeur : gros projet -> sous-tâches séquentielles <= 35 min */
/* ---------------------------------------------------------------- */

type SubTask = { title: string; minutes: number };

function decompose(input: string): SubTask[] {
  const t = input.toLowerCase();
  const name = input.trim().replace(/\.$/, "");

  let steps: SubTask[];
  if (/(vid[ée]o|contenu|script|post|reel|tournage)/.test(t)) {
    steps = [
      { title: "Choisir l'angle + le hook", minutes: 15 },
      { title: "Écrire le script (bullet points)", minutes: 30 },
      { title: "Tourner une première prise", minutes: 25 },
      { title: "Monter / sous-titrer l'essentiel", minutes: 35 },
      { title: "Publier + programmer", minutes: 15 },
    ];
  } else if (/(call|closing|audit|prospect|vente|offre)/.test(t)) {
    steps = [
      { title: "Relire les notes & l'historique du prospect", minutes: 15 },
      { title: "Préparer 3 questions de découverte", minutes: 20 },
      { title: "Cadrer l'offre & les objections probables", minutes: 30 },
      { title: "Répéter l'ouverture à voix haute", minutes: 15 },
      { title: "Débrief + prochaine action", minutes: 15 },
    ];
  } else {
    steps = [
      { title: "Clarifier l'objectif & le livrable", minutes: 15 },
      { title: "Rassembler les éléments nécessaires", minutes: 25 },
      { title: "Premier jet (brouillon, imparfait)", minutes: 35 },
      { title: "Relire & corriger", minutes: 20 },
      { title: "Finaliser & envoyer", minutes: 15 },
    ];
  }
  return steps.map((s, i) => ({
    ...s,
    title: i === 0 && name ? `${s.title} — « ${name} »` : s.title,
    minutes: Math.min(35, s.minutes),
  }));
}

function TaskDecomposer() {
  const [value, setValue] = useState("");
  const [subtasks, setSubtasks] = useState<SubTask[] | null>(null);

  const run = () => {
    if (!value.trim()) return;
    setSubtasks(decompose(value));
  };

  const total = subtasks?.reduce((a, s) => a + s.minutes, 0) ?? 0;

  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <div className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconArrow className="text-pole-content" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Décomposeur · sous-tâches ≤ 35 min
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Décris le gros projet qui te bloque…"
          className="flex-1 rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2.5 text-sm text-deck-ink outline-none placeholder:text-deck-faint"
        />
        <button
          onClick={run}
          className="rounded-xl bg-pole-content px-3.5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Découper
        </button>
      </div>

      {subtasks && (
        <>
          <ol className="mt-3 space-y-1.5">
            {subtasks.map((s, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pole-content/15 text-[11px] font-bold text-pole-content">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-deck-ink">{s.title}</span>
                <span className="tnum shrink-0 rounded-md bg-deck-line px-2 py-0.5 text-[11px] text-deck-mute">
                  {s.minutes} min
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-2 flex items-center justify-between text-[11px] text-deck-faint">
            <span className="tnum">
              {subtasks.length} étapes · {total} min au total
            </span>
            <button className="font-semibold text-pole-content transition hover:brightness-125">
              Envoyer au Scheduler 80/20 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function EmergencyTools() {
  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-deck-mute">
          Outils ADHD d&apos;urgence
        </span>
      </header>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MicroSprint />
        <TaskDecomposer />
      </div>
    </section>
  );
}
