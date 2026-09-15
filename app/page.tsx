import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { CaTracker } from "@/components/dashboard/CaTracker";
import { KpiGauges } from "@/components/dashboard/KpiGauges";
import { VisualCrm } from "@/components/dashboard/VisualCrm";
import { Scheduler } from "@/components/dashboard/Scheduler";
import { SmartSecretary } from "@/components/dashboard/SmartSecretary";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <NotificationCenter />

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-4 md:px-6">
        {/* Top row: pacing engine + KPIs side by side */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(340px,0.9fr)_1.6fr]">
          <FocusTimer />
          <KpiGauges />
        </div>

        {/* Smart pacing & scheduler — 80/20 auto-rescheduling */}
        <Scheduler />

        {/* Smart secretary — Cmd+K fast drop + Jérémy bridge */}
        <SmartSecretary />

        {/* CA & commissions */}
        <CaTracker />

        {/* Visual CRM pipeline */}
        <VisualCrm />
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 pb-6 pt-2 md:px-6">
        <p className="text-[11px] text-deck-faint">
          UNIT Flight Deck · vue cockpit mono-écran · données de démonstration —
          à brancher sur Notion / Slack / notes de call.
        </p>
      </footer>
    </div>
  );
}
