"use client";

import { useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { IconBolt } from "@/components/ui/Icons";

type ResType = "Framework" | "Lien" | "Citation";
interface Resource {
  id: string;
  type: ResType;
  text: string;
}

const TYPES: ResType[] = ["Framework", "Lien", "Citation"];

const TYPE_STYLE: Record<ResType, string> = {
  Framework: "bg-pole-delivery/10 text-pole-delivery",
  Lien: "bg-pole-acquisition/10 text-pole-acquisition",
  Citation: "bg-pole-content/10 text-pole-content",
};

const SEED: Resource[] = [
  { id: "r1", type: "Framework", text: "Straight Line — cadre → découverte → boucle certitude" },
  { id: "r2", type: "Citation", text: "« Les gens achètent avec l'émotion et justifient avec la logique. »" },
  { id: "r3", type: "Lien", text: "Swipe file d'accroches high-ticket (Notion)" },
];

export function ResourceHub() {
  const [items, setItems] = usePersistentState<Resource[]>("ufd.resources", SEED);
  const [type, setType] = useState<ResType>("Framework");
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setItems((l) => [{ id: `r${Date.now()}`, type, text: text.trim() }, ...l]);
    setText("");
  };

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBolt className="text-pole-delivery" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Resource Hub · coffre à savoir
        </span>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-deck-line bg-deck-panel p-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResType)}
          className="rounded-lg border border-deck-line bg-deck-panel2 px-2 py-1.5 text-xs text-deck-mute outline-none"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Framework, lien ou citation à garder…"
          className="min-w-[200px] flex-1 bg-transparent px-1 py-1.5 text-sm text-deck-ink outline-none placeholder:text-deck-faint"
        />
        <button
          onClick={add}
          className="rounded-lg bg-pole-delivery px-3 py-1.5 text-sm font-semibold text-deck-bg transition hover:brightness-110"
        >
          Ajouter
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-deck-line bg-deck-panel p-3"
          >
            <span
              className={`mb-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${TYPE_STYLE[r.type]}`}
            >
              {r.type}
            </span>
            <p className="text-[13px] leading-snug text-deck-ink">{r.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
