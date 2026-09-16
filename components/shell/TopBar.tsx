"use client";

import { useState } from "react";
import { NOTIFICATIONS, COUNTS } from "@/lib/mock-data";
import { POLE_CLASSES } from "@/lib/types";
import { TabId, TAB_LABEL } from "@/lib/nav";
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
      className="flex items-center gap-1.5 rounded-lg border border-deck-line bg-deck-panel2 px-2.5 py-1.5"
      title={label}
    >
      <span className={tone}>{icon}</span>
      <span className="tnum text-sm font-semibold text-deck-ink">{count}</span>
      <span className="hidden text-[10px] uppercase tracking-wider text-deck-faint lg:inline">
        {label}
      </span>
    </div>
  );
}

export function TopBar({ active, shield }: { active: TabId; shield: boolean }) {
  const [open, setOpen] = useState(false);
  const total = COUNTS.activeTasks + COUNTS.rescheduled + COUNTS.secretary;

  return (
    <div className="sticky top-0 z-30 border-b border-deck-line bg-deck-bg/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3 md:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold text-deck-ink">
            {TAB_LABEL[active]}
          </h1>
          {shield && (
            <span className="text-[11px] font-semibold text-pole-alert">
              Deep Work actif — notifications en file jusqu&apos;à la pause
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge
            icon={<IconBell width={16} height={16} />}
            count={COUNTS.activeTasks}
            tone="text-pole-delivery"
            label="Tâches jour"
          />
          <Badge
            icon={<IconRefresh width={16} height={16} />}
            count={COUNTS.rescheduled}
            tone="text-pole-alert"
            label="Replanifiées"
          />
          <Badge
            icon={<IconInbox width={16} height={16} />}
            count={COUNTS.secretary}
            tone="text-pole-secretary"
            label="Secrétaire"
          />
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative grid h-9 w-9 place-items-center rounded-lg border border-deck-line bg-deck-panel2 text-deck-mute transition hover:text-deck-ink"
            aria-label="Notifications"
          >
            <IconBell />
            {total > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-pole-alert px-1 text-[10px] font-bold text-white">
                {total}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-3 md:px-6">
          <div className="rounded-2xl border border-deck-line bg-deck-panel p-2 shadow-deck">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-deck-mute">
                Flux du jour
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-deck-faint">
                <IconCommand width={13} height={13} /> Cmd+K pour capturer
              </span>
            </div>
            <ul className="max-h-72 space-y-1 overflow-y-auto">
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
                      <span className="rounded-md border border-deck-line px-1.5 py-0.5 text-[10px] font-bold text-deck-mute">
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
    </div>
  );
}
