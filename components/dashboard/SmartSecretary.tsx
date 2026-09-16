"use client";

import { useEffect, useState, useCallback } from "react";
import { SECRETARY_REQUESTS, JEREMY_TASKS } from "@/lib/mock-data";
import {
  JeremyTask,
  Pole,
  Priority,
  PRIORITY_META,
  SecretaryRequest,
} from "@/lib/types";
import { IconCommand, IconInbox, IconArrow } from "@/components/ui/Icons";

/** Demo heuristic: estimate execution time from the request text. */
function estimate(text: string): { minutes: number; pole: Pole; priority: Priority } {
  const t = text.toLowerCase();
  if (/(contrat|audit|call|closing|signature)/.test(t))
    return { minutes: 45, pole: "delivery", priority: "P1" };
  if (/(relance|report|rdv|répond|repond|mail|message)/.test(t))
    return { minutes: 10, pole: "acquisition", priority: "P2" };
  if (/(script|objection|contenu|post|vidéo|video)/.test(t))
    return { minutes: 25, pole: "content", priority: "P2" };
  return { minutes: 20, pole: "secretary", priority: "P3" };
}

const FREE_SLOTS = [
  "Auj. 15:30",
  "Auj. 16:30",
  "Demain 09:00",
  "Demain 10:00",
  "Demain 14:30",
];

function priorityDot(p: Priority) {
  return PRIORITY_META[p].dot;
}

export function SmartSecretary() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [requests, setRequests] = useState<SecretaryRequest[]>(SECRETARY_REQUESTS);
  const [jeremy] = useState<JeremyTask[]>(JEREMY_TASKS);
  const [slotCursor, setSlotCursor] = useState(2);

  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    const { minutes, pole, priority } = estimate(text);
    const slot = FREE_SLOTS[slotCursor % FREE_SLOTS.length];
    const req: SecretaryRequest = {
      id: `s${Date.now()}`,
      text,
      pole,
      minutes,
      slot,
      deadline:
        priority === "P1" ? "Réponse avant 18:00" : "Réponse avant demain 10:00",
      priority,
    };
    setRequests((r) => [req, ...r]);
    setSlotCursor((c) => c + 1);
    setValue("");
    setOpen(false);
  };

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-deck-mute">
          Secrétaire intelligente
        </span>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-deck-line bg-deck-panel2 px-2.5 py-1.5 text-[11px] text-deck-mute transition hover:text-deck-ink"
        >
          <IconCommand width={13} height={13} /> Fast Drop
          <kbd className="rounded bg-deck-line px-1.5 py-0.5 text-[10px] text-deck-ink">
            ⌘K
          </kbd>
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Client requests handler */}
        <div className="rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
          <div className="mb-2 flex items-center gap-2 text-deck-mute">
            <IconInbox width={17} height={17} className="text-pole-secretary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Requêtes clients · slot 80/20 auto
            </span>
          </div>
          <ul className="space-y-2">
            {requests.map((r) => {
              const m = PRIORITY_META[r.priority];
              return (
                <li
                  key={r.id}
                  className="rounded-xl border border-deck-line bg-deck-panel2/60 p-3"
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priorityDot(r.priority)}`} />
                    <span className="text-sm text-deck-ink">{r.text}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                    <span className="tnum text-deck-mute">⏱ {r.minutes} min</span>
                    <span className="text-deck-faint">→</span>
                    <span className="font-semibold text-pole-delivery">{r.slot}</span>
                    <span className={`rounded-md px-1.5 py-0.5 font-bold ${m.softBg} ${m.text}`}>
                      {r.priority}
                    </span>
                    <span className="ml-auto text-pole-secretary">{r.deadline}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Jérémy / team bridge */}
        <div className="rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
          <div className="mb-2 flex items-center gap-2 text-deck-mute">
            <IconArrow width={17} height={17} className="text-pole-secretary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pont Jérémy / Équipe · Notion + Slack
            </span>
          </div>
          <ul className="space-y-2">
            {jeremy.map((t) => {
              const m = PRIORITY_META[t.priority];
              return (
                <li
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-deck-line bg-deck-panel2/60 p-3"
                >
                  <span
                    className={`rounded-md border border-deck-line px-1.5 py-0.5 text-[10px] font-semibold ${
                      t.source === "Notion" ? "text-deck-ink" : "text-pole-acquisition"
                    }`}
                  >
                    {t.source}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-deck-ink">{t.title}</div>
                    <div className="tnum text-[11px] text-pole-delivery">{t.slot}</div>
                  </div>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${m.softBg} ${m.text}`}>
                    {t.priority}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[11px] text-deck-faint">
            Positionnées automatiquement dans la grille chrono selon leur priorité.
          </p>
        </div>
      </div>

      {/* Cmd+K Fast Drop modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-deck-bg/70 p-4 pt-[18vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-deck-line2 bg-deck-panel shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-deck-line px-4 py-2.5 text-deck-faint">
              <IconCommand width={15} height={15} />
              <span className="text-[11px] uppercase tracking-wider">
                Fast Drop · capture en 5 s
              </span>
              <kbd className="ml-auto rounded bg-deck-line px-1.5 py-0.5 text-[10px] text-deck-mute">
                Échap
              </kbd>
            </div>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Nouvelle requête client, idée, tâche… (Entrée pour placer)"
              className="w-full bg-transparent px-4 py-4 text-base text-deck-ink outline-none placeholder:text-deck-faint"
            />
            <div className="flex items-center justify-between border-t border-deck-line px-4 py-2.5">
              <span className="text-[11px] text-deck-faint">
                Estime le temps · trouve le slot 80/20 · fixe la deadline
              </span>
              <button
                onClick={submit}
                className="rounded-lg bg-pole-secretary px-3 py-1.5 text-sm font-semibold text-deck-bg transition hover:brightness-110"
              >
                Placer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
