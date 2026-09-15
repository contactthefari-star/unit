"use client";

import { useState } from "react";
import { IconPlay, IconArrow, IconBolt } from "@/components/ui/Icons";

type CreatedTask = { title: string; minutes: number; slot: string } | null;

export function VideoLearning() {
  const [takeaway, setTakeaway] = useState("");
  const [testIdea, setTestIdea] = useState("");
  const [snippet, setSnippet] = useState("");
  const [created, setCreated] = useState<CreatedTask>(null);

  const convert = () => {
    const title = testIdea.trim() || takeaway.trim();
    if (!title) return;
    setCreated({
      title: `Tester : ${title}`,
      minutes: 30,
      slot: "Demain · 10:00",
    });
  };

  const fields: {
    key: string;
    label: string;
    placeholder: string;
    value: string;
    set: (v: string) => void;
    accent: string;
  }[] = [
    {
      key: "takeaway",
      label: "Takeaway 80/20",
      placeholder: "La seule idée qui change tout dans cette vidéo…",
      value: takeaway,
      set: setTakeaway,
      accent: "focus:border-pole-delivery",
    },
    {
      key: "test",
      label: "Idée de test actionnable",
      placeholder: "Ce que je teste dès mon prochain call…",
      value: testIdea,
      set: setTestIdea,
      accent: "focus:border-pole-secretary",
    },
    {
      key: "snippet",
      label: "Snippet de script",
      placeholder: "La phrase / tournure exacte à réutiliser…",
      value: snippet,
      set: setSnippet,
      accent: "focus:border-pole-content",
    },
  ];

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-deck-mute">
          Video Learning · apprendre en exécutant
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Left — embedded player (placeholder) */}
        <div className="overflow-hidden rounded-2xl border border-deck-line bg-deck-panel shadow-deck">
          <div className="relative aspect-video w-full bg-gradient-to-br from-[#0d1219] to-[#161d28]">
            {/* subtle grid backdrop */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute inset-0 grid place-items-center">
              <button
                className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20"
                aria-label="Lire la vidéo"
              >
                <IconPlay width={26} height={26} />
              </button>
            </div>
            <div className="absolute left-4 top-4 rounded-md bg-black/40 px-2 py-1 text-[11px] text-deck-mute">
              Module — Traiter l&apos;objection « c&apos;est trop cher »
            </div>
            {/* fake timeline */}
            <div className="absolute inset-x-4 bottom-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[42%] rounded-full bg-pole-acquisition" />
              </div>
              <div className="tnum mt-1 flex justify-between text-[11px] text-deck-mute">
                <span>12:34</span>
                <span>28:10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — active capture form */}
        <div className="flex flex-col rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-deck-faint">
            Capture active
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 block text-[11px] font-medium text-deck-mute">
                  {f.label}
                </span>
                <textarea
                  rows={2}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className={`w-full resize-none rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none transition placeholder:text-deck-faint ${f.accent}`}
                />
              </label>
            ))}
          </div>

          <button
            onClick={convert}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-pole-delivery px-4 py-2.5 text-sm font-semibold text-deck-bg transition hover:brightness-110 active:scale-[0.98]"
          >
            <IconBolt width={16} height={16} />
            Convertir en tâche (Scheduler 80/20)
          </button>

          {created && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-pole-delivery/40 bg-pole-delivery/10 p-3">
              <IconArrow width={16} height={16} className="shrink-0 text-pole-delivery" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-deck-ink">{created.title}</div>
                <div className="tnum text-[11px] text-pole-delivery">
                  Planifié · {created.slot} · {created.minutes} min
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
