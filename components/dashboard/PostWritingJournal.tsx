"use client";

import { useState } from "react";
import { IconBolt } from "@/components/ui/Icons";

interface Entry {
  id: string;
  date: string;
  text: string;
}

const SEED: Entry[] = [
  {
    id: "j1",
    date: "hier",
    text: "Écrire sur une objection réelle d'un call = fluide, zéro page blanche.",
  },
];

export function PostWritingJournal() {
  const [entries, setEntries] = useState<Entry[]>(SEED);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setEntries((l) => [
      { id: `j${Date.now()}`, date: "à l'instant", text: text.trim() },
      ...l,
    ]);
    setText("");
  };

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBolt className="text-pole-secretary" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Journal post-écriture · affiner tes sujets
        </span>
      </header>

      <div className="flex items-start gap-2">
        <textarea
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ce que j'ai aimé écrire / ce qui a été le plus fluide…"
          className="flex-1 resize-none rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none placeholder:text-deck-faint focus:border-pole-secretary"
        />
        <button
          onClick={add}
          className="shrink-0 rounded-xl bg-pole-secretary px-3.5 py-2.5 text-sm font-semibold text-deck-bg transition hover:brightness-110"
        >
          Noter
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex items-start gap-2 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pole-secretary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-deck-ink">{e.text}</p>
              <span className="text-[11px] text-deck-faint">{e.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
