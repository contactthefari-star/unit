"use client";

import { useState } from "react";
import { NOTIFICATIONS, COUNTS } from "@/lib/mock-data";
import { POLE_CLASSES } from "@/lib/types";
import { IconBell, IconRefresh, IconInbox, IconCommand } from "@/components/ui/Icons";

function Badge({
  icon,
  count,
  tone,
  label,
}: {
  icon: React.ReactNode;
  count: number;
  tone: string;
  label: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2 px-3 py-1.5"
      title={label}
    >
      <span className={tone}>{icon}</span>
      <span className="tnum text-sm font-semibold text-deck-ink">{count}</span>
      <span className="hidden text-[11px] uppercase tracking-wider text-deck-faint sm:inline">
        {label}
      </span>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-deck-line bg-deck-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 md:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pole-acquisition to-pole-content font-black text-white shadow-glow">
            ✦
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide text-deck-ink">
              UNIT <span className="text-deck-mute">Flight Deck</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-deck-faint">
              Growth Operator Cockpit
            </div>
          </div>
        </div>

        {/* Notification badges */}
        <div className="ml-auto flex items-center gap-2">
          <Badge
            icon={<IconBell width={17} height={17} />}
            count={COUNTS.activeTasks}
            tone="text-pole-delivery"
            label="Tâches jour"
          />
          <Badge
            icon={<IconRefresh width={17} height={17} />}
            count={COUNTS.rescheduled}
            tone="text-pole-alert"
            label="Replanifiées"
          />
          <Badge
            icon={<IconInbox width={17} height={17} />}
            count={COUNTS.secretary}
            tone="text-pole-secretary"
            label="Secrétaire"
          />

          <button
            onClick={() => setOpen((o) => !o)}
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-deck-line bg-deck-panel2 text-deck-mute transition hover:text-deck-ink"
            aria-label="Ouvrir le centre de notifications"
          >
            <IconBell />
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-pole-alert px-1 text-[10px] font-bold text-white">
              {COUNTS.activeTasks + COUNTS.rescheduled + COUNTS.secretary}
            </span>
          </button>
        </div>
      </div>

      {/* Dropdown feed */}
      {open && (
        <div className="mx-auto max-w-[1400px] px-4 pb-3 md:px-6">
          <div className="rounded-2xl border border-deck-line bg-deck-panel p-2 shadow-deck">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-deck-mute">
                Flux du jour
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-deck-faint">
                <IconCommand width={13} height={13} /> Cmd+K pour capturer
              </span>
            </div>
            <ul className="space-y-1">
              {NOTIFICATIONS.map((n) => {
                const c = POLE_CLASSES[n.pole];
                return (
                  <li
                    key={n.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-deck-panel2"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-deck-ink">{n.title}</div>
                      <div className="tnum truncate text-[11px] text-deck-faint">
                        {n.meta}
                      </div>
                    </div>
                    {n.priority && (
                      <span
                        className={`rounded-md border border-deck-line px-1.5 py-0.5 text-[10px] font-bold ${
                          n.priority === "P1"
                            ? "text-pole-alert"
                            : n.priority === "P2"
                              ? "text-pole-secretary"
                              : "text-deck-faint"
                        }`}
                      >
                        {n.priority}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
