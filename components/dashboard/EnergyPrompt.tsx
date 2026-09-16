"use client";

import { useCockpit, Energy } from "@/components/shell/CockpitContext";
import { IconBolt } from "@/components/ui/Icons";

const LEVELS: { key: Energy; label: string; color: string; advice: string }[] = [
  {
    key: "low",
    label: "Basse",
    color: "bg-pole-alert",
    advice: "Priorité aux P3 (admin, research). Lance un micro-sprint 10 min.",
  },
  {
    key: "medium",
    label: "Moyenne",
    color: "bg-pole-secretary",
    advice: "P2 : batching contenu, relances, préparation de calls.",
  },
  {
    key: "high",
    label: "Haute",
    color: "bg-pole-delivery",
    advice: "P1 : closings, delivery client, tâches complexes maintenant.",
  },
];

export function EnergyPrompt() {
  const { energy, setEnergy } = useCockpit();
  const current = LEVELS.find((l) => l.key === energy)!;

  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <div className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBolt className="text-pole-secretary" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Énergie du jour
        </span>
      </div>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l.key}
            onClick={() => setEnergy(l.key)}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              energy === l.key
                ? "border-deck-line2 bg-deck-panel2 text-deck-ink"
                : "border-deck-line bg-deck-panel2/40 text-deck-mute hover:text-deck-ink"
            }`}
          >
            <span className="mb-1 flex justify-center">
              <span className={`h-2 w-2 rounded-full ${l.color}`} />
            </span>
            {l.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] leading-snug text-deck-mute">
        <span className="font-semibold text-deck-ink">Reco 80/20 : </span>
        {current.advice}
      </p>
      <p className="mt-1 text-[11px] text-deck-faint">
        L&apos;agenda met en avant tes priorités selon ce niveau.
      </p>
    </div>
  );
}
