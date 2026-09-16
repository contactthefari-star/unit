"use client";

import { useState } from "react";
import { useCockpit } from "@/components/shell/CockpitContext";
import { IconBolt, IconArrow } from "@/components/ui/Icons";

type SourceType = "Livre" | "Article" | "Newsletter";
const SOURCES: SourceType[] = ["Livre", "Article", "Newsletter"];

export function ReadingSession() {
  const { addRepurposed } = useCockpit();
  const [type, setType] = useState<SourceType>("Livre");
  const [title, setTitle] = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [application, setApplication] = useState("");
  const [sent, setSent] = useState(false);

  const hook = takeaway.trim()
    ? `J'ai retenu un truc puissant : ${takeaway.trim()}`
    : "Le hook se génère à partir de ton takeaway…";

  const send = () => {
    if (!takeaway.trim() && !application.trim()) return;
    addRepurposed({
      id: `read-${Date.now()}`,
      from: `${type}${title.trim() ? " · " + title.trim() : ""}`,
      hook: takeaway.trim() ? hook : `Note de lecture — ${type}`,
      angle: application.trim() || "Application à préciser",
    });
    setSent(true);
    setTakeaway("");
    setApplication("");
    setTitle("");
  };

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBolt className="text-pole-content" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Lecture active · capture → batching vendredi
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="flex gap-2">
            {SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => setType(s)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  type === s
                    ? "border-pole-content/50 bg-pole-content/10 text-pole-content"
                    : "border-deck-line bg-deck-panel2/40 text-deck-mute hover:text-deck-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la source (ex : « Influence », newsletter X…)"
            className="w-full rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none placeholder:text-deck-faint focus:border-pole-content"
          />
          <textarea
            rows={2}
            value={takeaway}
            onChange={(e) => {
              setTakeaway(e.target.value);
              setSent(false);
            }}
            placeholder="Takeaway / concept clé…"
            className="w-full resize-none rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none placeholder:text-deck-faint focus:border-pole-content"
          />
          <textarea
            rows={2}
            value={application}
            onChange={(e) => {
              setApplication(e.target.value);
              setSent(false);
            }}
            placeholder="Application concrète UNIT / client…"
            className="w-full resize-none rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none placeholder:text-deck-faint focus:border-pole-content"
          />
        </div>

        <div className="flex flex-col rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-deck-faint">
            Hook auto-généré
          </div>
          <p className="flex-1 rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2.5 text-sm leading-relaxed text-deck-ink">
            {hook}
          </p>
          <button
            onClick={send}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-pole-content px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            <IconArrow width={16} height={16} />
            Envoyer au batching vendredi
          </button>
          {sent && (
            <div className="mt-2 rounded-lg border border-pole-content/40 bg-pole-content/10 px-3 py-2 text-[12px] text-pole-content">
              Ajouté à la file de contenu (inbox recyclage) ✓
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
