import { KPIS } from "@/lib/mock-data";
import { Gauge } from "@/components/ui/Gauge";
import { IconTarget } from "@/components/ui/Icons";

export function KpiGauges() {
  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-4 flex items-center gap-2 text-deck-mute">
        <IconTarget className="text-pole-content" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Ratios & KPIs
        </span>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {KPIS.map((k) => (
          <Gauge
            key={k.key}
            value={k.value}
            pole={k.pole}
            label={k.label}
            suffix={k.suffix}
            caption={k.caption}
          />
        ))}
      </div>
    </section>
  );
}
