import { EnergyPrompt } from "@/components/dashboard/EnergyPrompt";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { KpiGauges } from "@/components/dashboard/KpiGauges";
import { CaTracker } from "@/components/dashboard/CaTracker";
import { EmergencyTools } from "@/components/dashboard/EmergencyTools";

function SummaryTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-deck-faint">
        {label}
      </div>
      <div className={`tnum mt-1 text-xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

export function DashboardView() {
  return (
    <div className="space-y-4">
      {/* 80/20 summary strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile label="MRR global" value="12 300 €" accent="text-pole-delivery" />
        <SummaryTile label="P1 restantes" value="3" accent="text-pole-alert" />
        <SummaryTile label="Calls audités" value="8 / 10" accent="text-pole-secretary" />
        <SummaryTile label="Cycles 45/15" value="4 aujourd'hui" accent="text-pole-acquisition" />
      </div>

      {/* Pacing + energy */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,0.9fr)_1fr]">
        <FocusTimer />
        <EnergyPrompt />
      </div>

      {/* KPIs */}
      <KpiGauges />

      {/* CA & commissions */}
      <CaTracker />

      {/* Emergency ADHD tools */}
      <EmergencyTools />
    </div>
  );
}
