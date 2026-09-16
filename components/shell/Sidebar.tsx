"use client";

import { NAV, NavItem, TabId } from "@/lib/nav";
import {
  IconGrid,
  IconUsers,
  IconTarget,
  IconMegaphone,
  IconBolt,
  IconCalendar,
  IconShield,
} from "@/components/ui/Icons";

const ICONS: Record<NavItem["icon"], (p: { width?: number; height?: number }) => JSX.Element> = {
  grid: IconGrid,
  users: IconUsers,
  target: IconTarget,
  megaphone: IconMegaphone,
  bolt: IconBolt,
  calendar: IconCalendar,
};

export function Sidebar({
  active,
  onSelect,
  shield,
  onToggleShield,
}: {
  active: TabId;
  onSelect: (id: TabId) => void;
  shield: boolean;
  onToggleShield: () => void;
}) {
  return (
    <aside className="sticky top-0 flex h-screen w-[236px] shrink-0 flex-col border-r border-deck-line bg-deck-panel/60 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pole-acquisition to-pole-content font-black text-white shadow-glow">
          ✦
        </div>
        <div className="leading-tight">
          <div className="text-sm font-bold tracking-wide text-deck-ink">
            UNIT <span className="text-deck-mute">Flight Deck</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-deck-faint">
            Growth Operator
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              disabled={shield}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                isActive
                  ? "bg-deck-panel2 text-deck-ink"
                  : "text-deck-mute hover:bg-deck-panel2/60 hover:text-deck-ink"
              } ${shield ? "cursor-not-allowed opacity-40" : ""}`}
            >
              {isActive && (
                <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-pole-acquisition" />
              )}
              <Icon
                width={19}
                height={19}
                {...({
                  className: isActive ? "text-pole-acquisition" : "",
                } as object)}
              />
              <span className="flex-1">
                <span className="block text-sm font-medium leading-tight">
                  {item.label}
                </span>
                <span className="block text-[10px] text-deck-faint">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>

      {/* Deep Work Shield */}
      <div className="border-t border-deck-line p-3">
        <button
          onClick={onToggleShield}
          className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
            shield
              ? "border-pole-alert/40 bg-pole-alert/10 text-pole-alert"
              : "border-deck-line bg-deck-panel2/60 text-deck-mute hover:text-deck-ink"
          }`}
        >
          <IconShield width={18} height={18} />
          <span className="flex-1">
            <span className="block text-xs font-semibold">Deep Work Shield</span>
            <span className="block text-[10px] text-deck-faint">
              {shield ? "Actif — navigation gelée" : "Verrouiller le cockpit"}
            </span>
          </span>
          <span
            className={`h-2 w-2 rounded-full ${
              shield ? "bg-pole-alert animate-pulseSoft" : "bg-deck-line2"
            }`}
          />
        </button>
      </div>
    </aside>
  );
}
