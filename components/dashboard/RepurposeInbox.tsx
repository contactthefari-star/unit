"use client";

import { useCockpit } from "@/components/shell/CockpitContext";
import { IconMegaphone, IconArrow } from "@/components/ui/Icons";

export function RepurposeInbox() {
  const { repurposed, setTab } = useCockpit();

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-deck-mute">
          <IconMegaphone className="text-pole-content" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            Recyclage audit → contenu
          </span>
        </div>
        {repurposed.length > 0 && (
          <span className="tnum rounded-full border border-deck-line bg-deck-panel2 px-2.5 py-1 text-[11px] text-deck-mute">
            {repurposed.length} brouillon(s)
          </span>
        )}
      </header>

      {repurposed.length === 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-deck-line px-4 py-4">
          <p className="text-[12px] text-deck-faint">
            Vide pour l&apos;instant. Dans un dossier client, clique
            <span className="text-pole-content"> « Convertir en contenu » </span>
            pour transformer l&apos;audit et les objections en brouillons de posts.
          </p>
          <button
            onClick={() => setTab("clients")}
            className="shrink-0 rounded-lg border border-deck-line bg-deck-panel2 px-3 py-2 text-[12px] font-semibold text-deck-mute transition hover:text-deck-ink"
          >
            Aller aux clients →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {repurposed.map((d) => (
            <article
              key={d.id}
              className="rounded-xl border border-pole-content/30 bg-pole-content/5 p-3"
            >
              <div className="mb-1 inline-flex items-center gap-1 rounded-md bg-pole-content/15 px-1.5 py-0.5 text-[10px] font-semibold text-pole-content">
                depuis {d.from}
              </div>
              <p className="text-sm font-semibold leading-snug text-deck-ink">{d.hook}</p>
              <p className="mt-1 text-[11px] leading-snug text-deck-mute">{d.angle}</p>
              <button className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-pole-content transition hover:brightness-125">
                <IconArrow width={13} height={13} />
                Envoyer au calendrier éditorial
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
