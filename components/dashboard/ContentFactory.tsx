"use client";

import { useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { CONTENT, FRIDAY_BATCHING } from "@/lib/mock-data";
import {
  ContentCard,
  CONTENT_STATUS_META,
  ContentStatus,
  WEEK_DAYS,
  WeekDay,
} from "@/lib/types";
import { IconBolt, IconPlay } from "@/components/ui/Icons";
import { VoiceButton } from "@/components/ui/VoiceButton";

const STATUS_ORDER: ContentStatus[] = ["idea", "ready", "published"];

function Card({ card, onCycle }: { card: ContentCard; onCycle: (id: string) => void }) {
  const s = CONTENT_STATUS_META[card.status];
  return (
    <article className="rounded-xl border border-deck-line bg-deck-panel2/60 p-3">
      <p className="text-[13px] font-semibold leading-snug text-deck-ink">
        {card.hook}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-deck-mute">{card.angle}</p>
      {card.objection && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-pole-content/10 px-1.5 py-0.5 text-[10px] text-pole-content">
          objection · {card.objection}
        </div>
      )}
      <button
        onClick={() => onCycle(card.id)}
        className={`mt-2 flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[10px] font-bold uppercase tracking-wide ${s.softBg} ${s.text} transition hover:brightness-125`}
        title="Changer le statut"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
        {s.label}
      </button>
    </article>
  );
}

export function ContentFactory() {
  const [cards, setCards] = usePersistentState<ContentCard[]>("ufd.content", CONTENT);
  const [idea, setIdea] = useState("");
  const [dropDay, setDropDay] = useState<WeekDay>("Jeu");

  const addIdea = () => {
    const hook = idea.trim();
    if (!hook) return;
    setCards((c) => [
      { id: `c${Date.now()}`, day: dropDay, hook, angle: "Angle à préciser", status: "idea" },
      ...c,
    ]);
    setIdea("");
  };

  const cycle = (id: string) =>
    setCards((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              status:
                STATUS_ORDER[
                  (STATUS_ORDER.indexOf(c.status) + 1) % STATUS_ORDER.length
                ],
            }
          : c,
      ),
    );

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-deck-mute">
          Content Factory · calendrier éditorial
        </span>
        <div className="flex items-center gap-2 text-[11px]">
          {STATUS_ORDER.map((s) => {
            const m = CONTENT_STATUS_META[s];
            return (
              <span key={s} className="flex items-center gap-1 text-deck-faint">
                <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                {m.label}
              </span>
            );
          })}
        </div>
      </header>

      {/* Fast Drop idea capture */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-deck-line bg-deck-panel p-2">
        <IconBolt width={16} height={16} className="ml-1 text-pole-content" />
        <input
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addIdea()}
          placeholder="Fast Drop — balance une idée, une objection, une phrase entendue…"
          className="min-w-[200px] flex-1 bg-transparent px-1 py-1.5 text-sm text-deck-ink outline-none placeholder:text-deck-faint"
        />
        <VoiceButton
          onText={(t) => setIdea((v) => (v ? `${v} ${t}` : t))}
          title="Dicter une idée"
          className="h-8 w-8"
        />
        <select
          value={dropDay}
          onChange={(e) => setDropDay(e.target.value as WeekDay)}
          className="rounded-lg border border-deck-line bg-deck-panel2 px-2 py-1.5 text-xs text-deck-mute outline-none"
        >
          {WEEK_DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          onClick={addIdea}
          className="rounded-lg bg-pole-content px-3 py-1.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Capturer
        </button>
      </div>

      {/* Weekly board Mon-Sun */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {WEEK_DAYS.map((d) => {
          const dayCards = cards.filter((c) => c.day === d);
          const isFriday = d === "Ven";
          return (
            <div
              key={d}
              className={`flex w-[210px] shrink-0 flex-col rounded-xl border p-2 ${
                isFriday
                  ? "border-pole-content/40 bg-pole-content/5"
                  : "border-deck-line bg-deck-panel/40"
              }`}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wide text-deck-ink">
                  {d}
                </span>
                <span className="tnum text-[11px] text-deck-faint">
                  {dayCards.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {dayCards.map((c) => (
                  <Card key={c.id} card={c} onCycle={cycle} />
                ))}
                {dayCards.length === 0 && (
                  <div className="rounded-xl border border-dashed border-deck-line px-2 py-4 text-center text-[11px] text-deck-faint">
                    —
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Friday batching mode */}
      <div className="mt-3 rounded-xl border border-dashed border-pole-content/40 bg-pole-content/5 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-pole-content/15 text-pole-content">
            <IconPlay width={15} height={15} />
          </span>
          <span className="text-sm font-semibold text-pole-content">
            Friday Batching Mode
          </span>
          <span className="tnum text-[11px] text-deck-mute">{FRIDAY_BATCHING.when}</span>
          <span className="ml-auto text-[11px] text-deck-faint">
            Séquence guidée · zéro context-switch
          </span>
        </div>
        <ol className="mt-2 grid gap-1.5 sm:grid-cols-3">
          {FRIDAY_BATCHING.steps.map((s, i) => (
            <li
              key={s}
              className="flex items-start gap-2 rounded-lg bg-deck-panel2/60 px-2.5 py-2 text-[11px] text-deck-mute"
            >
              <span className="tnum font-bold text-pole-content">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
