"use client";

import { useEffect, useState } from "react";
import { TabId } from "@/lib/nav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { DashboardView } from "@/components/views/DashboardView";
import { ClientsView } from "@/components/views/ClientsView";
import { ClosingView } from "@/components/views/ClosingView";
import { ContentView } from "@/components/views/ContentView";
import { UnitView } from "@/components/views/UnitView";
import { AgendaView } from "@/components/views/AgendaView";

const VIEWS: Record<TabId, () => JSX.Element> = {
  dashboard: DashboardView,
  clients: ClientsView,
  closing: ClosingView,
  content: ContentView,
  unit: UnitView,
  calendar: AgendaView,
};

export function AppShell() {
  const [active, setActive] = useState<TabId>("dashboard");
  const [shield, setShield] = useState(false);
  const View = VIEWS[active];

  // Deep-link: /?tab=clients ouvre directement l'onglet correspondant.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && t in VIEWS) setActive(t as TabId);
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        active={active}
        onSelect={setActive}
        shield={shield}
        onToggleShield={() => setShield((s) => !s)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar active={active} shield={shield} />
        <main className="flex-1 px-4 py-4 md:px-6">
          <div className="mx-auto max-w-[1400px]">
            <View />
          </div>
        </main>
        <footer className="px-4 pb-6 pt-2 md:px-6">
          <p className="mx-auto max-w-[1400px] text-[11px] text-deck-faint">
            UNIT Flight Deck · cockpit mono-écran · données de démonstration —
            à brancher sur Notion / Slack / notes de call.
          </p>
        </footer>
      </div>
    </div>
  );
}
