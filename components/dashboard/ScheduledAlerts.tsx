"use client";

import { useState } from "react";
import { IconBell, IconClock } from "@/components/ui/Icons";

interface Alert {
  id: string;
  when: string;
  message: string;
  on: boolean;
}

const SEED: Alert[] = [
  {
    id: "a1",
    when: "Lun–Jeu · 17h25",
    message: "Cockpit : bloc Delivery 17h30 prêt. Call chargé.",
    on: true,
  },
  {
    id: "a2",
    when: "Vendredi · 08h55",
    message: "Content Batching démarre dans 5 minutes.",
    on: true,
  },
  {
    id: "a3",
    when: "Dimanche · 11h30",
    message: "Séquence de clôture hebdo (15 min avant shutdown).",
    on: true,
  },
];

export function ScheduledAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(SEED);

  const toggle = (id: string) =>
    setAlerts((l) => l.map((a) => (a.id === id ? { ...a, on: !a.on } : a)));

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBell className="text-pole-secretary" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Alertes programmées · rythme réel
        </span>
      </header>

      <ul className="space-y-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-3 rounded-xl border border-deck-line bg-deck-panel2/60 p-3"
          >
            <IconClock width={16} height={16} className="shrink-0 text-pole-acquisition" />
            <div className="min-w-0 flex-1">
              <div className="tnum text-[11px] font-semibold text-deck-mute">{a.when}</div>
              <div className="truncate text-sm text-deck-ink">{a.message}</div>
            </div>
            <button
              onClick={() => toggle(a.id)}
              role="switch"
              aria-checked={a.on}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                a.on ? "bg-pole-delivery" : "bg-deck-line2"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                  a.on ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[11px] text-deck-faint">
        Aperçu des déclencheurs. L&apos;envoi de notifications natives (push) sera
        activé avec le backend / service worker.
      </p>
    </section>
  );
}
