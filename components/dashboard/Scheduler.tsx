"use client";

import { SCHEDULE, RESCHEDULED, MARKET_RESEARCH } from "@/lib/mock-data";
import { POLE_CLASSES, PRIORITY_META, Priority } from "@/lib/types";
import { useCockpit, Energy } from "@/components/shell/CockpitContext";
import { IconClock, IconRefresh, IconBolt } from "@/components/ui/Icons";

/** Selon l'énergie, quelles priorités mettre en avant / estomper. */
function emphasisFor(p: Priority | undefined, energy: Energy): "up" | "down" | "flat" {
  if (!p) return "flat";
  if (energy === "high") return p === "P1" ? "up" : p === "P3" ? "down" : "flat";
  if (energy === "low") return p === "P3" ? "up" : p === "P1" ? "down" : "flat";
  return p === "P2" ? "up" : "flat";
}

const ENERGY_LABEL: Record<Energy, string> = {
  high: "Énergie haute → priorise tes P1",
  medium: "Énergie moyenne → cap sur les P2",
  low: "Énergie basse → avance les P3, garde les P1 pour plus tard",
};

function PriorityTag({ p }: { p: Priority }) {
  const m = PRIORITY_META[p];
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${m.softBg} ${m.text}`}>
      {p}
    </span>
  );
}

function Timeline({ energy }: { energy: Energy }) {
  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-deck-mute">
          <IconClock className="text-pole-acquisition" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            Agenda 80/20 · Aujourd&apos;hui
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(["P1", "P2", "P3"] as Priority[]).map((p) => (
            <span key={p} className="flex items-center gap-1 text-[10px] text-deck-faint">
              <span className={`h-2 w-2 rounded-full ${PRIORITY_META[p].dot}`} />
              {p}
            </span>
          ))}
        </div>
      </header>

      {/* Bandeau énergie */}
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2 text-[12px] text-deck-mute">
        <IconBolt width={15} height={15} className="text-pole-secretary" />
        {ENERGY_LABEL[energy]}
      </div>

      <ol className="relative space-y-1 before:absolute before:left-[54px] before:top-2 before:bottom-2 before:w-px before:bg-deck-line">
        {SCHEDULE.map((b) => {
          const c = POLE_CLASSES[b.pole];
          const isNow = b.status === "now";
          const isDone = b.status === "done";
          const isBreak = b.status === "break";
          const emph = emphasisFor(b.priority, energy);
          return (
            <li key={b.id} className="relative flex items-stretch gap-3">
              <div className="tnum w-[46px] shrink-0 pt-2.5 text-right text-[11px] text-deck-faint">
                {b.start}
              </div>
              <div className="relative flex w-4 shrink-0 items-start justify-center pt-3">
                <span
                  className={`z-10 h-2.5 w-2.5 rounded-full ring-4 ring-deck-panel ${
                    isNow ? `${c.dot} animate-pulseSoft` : isDone ? c.dot : "bg-deck-line2"
                  }`}
                />
              </div>
              <div
                className={`mb-1 flex-1 rounded-xl border px-3 py-2 transition ${
                  isNow
                    ? `border-transparent ${c.softBg} ring-1 ring-inset ${c.ring}`
                    : emph === "up"
                      ? "border-pole-secretary/40 bg-deck-panel2/60 ring-1 ring-inset ring-pole-secretary/30"
                      : "border-deck-line bg-deck-panel2/60"
                } ${isDone ? "opacity-55" : emph === "down" ? "opacity-40" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm ${
                      isDone ? "text-deck-mute line-through" : "text-deck-ink"
                    }`}
                  >
                    {isBreak ? "☕ " : ""}
                    {b.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {emph === "up" && !isDone && !isNow && (
                      <span className="rounded-md bg-pole-secretary/15 px-1.5 py-0.5 text-[10px] font-bold text-pole-secretary">
                        RECO
                      </span>
                    )}
                    {b.priority && <PriorityTag p={b.priority} />}
                    {isNow && (
                      <span className="rounded-md bg-pole-alert px-1.5 py-0.5 text-[10px] font-bold text-white">
                        EN COURS
                      </span>
                    )}
                  </div>
                </div>
                <div className="tnum text-[11px] text-deck-faint">
                  {b.start}–{b.end}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function RescheduleQueue() {
  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconRefresh className="text-pole-alert" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Replanification auto · sans culpabilité
        </span>
      </header>
      <ul className="space-y-2">
        {RESCHEDULED.map((t) => {
          const m = PRIORITY_META[t.priority];
          return (
            <li key={t.id} className="rounded-xl border border-deck-line bg-deck-panel2/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-deck-ink">{t.title}</span>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${m.softBg} ${m.text}`}>
                  {t.priority}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                <span className="text-deck-faint line-through">{t.from}</span>
                <span className="text-pole-alert">→</span>
                <span className="font-semibold text-pole-delivery">{t.to}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-deck-faint">{t.reason}</div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-xl border border-dashed border-pole-content/40 bg-pole-content/5 p-3">
        <div className="flex items-center gap-2">
          <IconBolt width={16} height={16} className="text-pole-content" />
          <span className="text-xs font-semibold text-pole-content">
            {MARKET_RESEARCH.title}
          </span>
        </div>
        <div className="tnum mt-1 text-[11px] text-deck-mute">
          {MARKET_RESEARCH.when} · session récurrente
        </div>
        <ul className="mt-2 space-y-1">
          {MARKET_RESEARCH.template.map((t) => (
            <li key={t} className="flex items-center gap-2 text-[11px] text-deck-faint">
              <span className="h-1 w-1 rounded-full bg-pole-content" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Scheduler() {
  const { energy } = useCockpit();
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Timeline energy={energy} />
      <RescheduleQueue />
    </section>
  );
}
