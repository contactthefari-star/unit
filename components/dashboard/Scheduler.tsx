"use client";

import { useState } from "react";
import { SCHEDULE, RESCHEDULED, MARKET_RESEARCH } from "@/lib/mock-data";
import {
  BlockStatus,
  Pole,
  POLE_CLASSES,
  POLE_LABEL,
  PRIORITY_META,
  Priority,
  ScheduleBlock,
} from "@/lib/types";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useCockpit, Energy } from "@/components/shell/CockpitContext";
import {
  IconClock,
  IconRefresh,
  IconBolt,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@/components/ui/Icons";
import { VoiceButton } from "@/components/ui/VoiceButton";

const POLES: Pole[] = ["delivery", "acquisition", "content", "secretary", "alert"];

/** Selon l'énergie, quelles priorités mettre en avant / estomper. */
function emphasisFor(p: Priority | undefined, energy: Energy): "up" | "down" | "flat" {
  if (!p) return "flat";
  if (energy === "high") return p === "P1" ? "up" : p === "P3" ? "down" : "flat";
  if (energy === "low") return p === "P3" ? "up" : p === "P1" ? "down" : "flat";
  return p === "P2" ? "up" : "flat";
}

const ENERGY_LABEL: Record<Energy, string> = {
  high: "Énergie haute → priorise tes P1",
  medium: "Énergie moyenne → cap sur les P2",
  low: "Énergie basse → avance les P3, garde les P1 pour plus tard",
};

interface DraftBlock {
  id: string;
  start: string;
  end: string;
  title: string;
  pole: Pole;
  priority: "" | Priority;
  status: BlockStatus;
}

function emptyBlock(): DraftBlock {
  return {
    id: "",
    start: "09:00",
    end: "09:45",
    title: "",
    pole: "delivery",
    priority: "P1",
    status: "todo",
  };
}

function toDraft(b: ScheduleBlock): DraftBlock {
  return {
    id: b.id,
    start: b.start,
    end: b.end,
    title: b.title,
    pole: b.pole,
    priority: b.priority ?? "",
    status: b.status,
  };
}

/** Tri chronologique sur "HH:MM". */
function byStart(a: ScheduleBlock, b: ScheduleBlock) {
  return a.start.localeCompare(b.start);
}

function PriorityTag({ p }: { p: Priority }) {
  const m = PRIORITY_META[p];
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${m.softBg} ${m.text}`}>
      {p}
    </span>
  );
}

function BlockForm({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: DraftBlock;
  setDraft: (d: DraftBlock) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (patch: Partial<DraftBlock>) => setDraft({ ...draft, ...patch });
  const field =
    "w-full rounded-lg border border-deck-line bg-deck-panel2 px-2.5 py-2 text-sm text-deck-ink outline-none placeholder:text-deck-faint focus:border-pole-acquisition";
  const label = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-deck-faint";

  return (
    <div className="mb-3 rounded-xl border border-pole-acquisition/40 bg-deck-panel2/60 p-3 ring-1 ring-inset ring-pole-acquisition/30">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-mute">
          {draft.id ? "Modifier le bloc" : "Nouveau bloc"}
        </span>
        <button
          onClick={onCancel}
          aria-label="Fermer"
          className="grid h-6 w-6 place-items-center rounded-md text-deck-faint hover:text-deck-ink"
        >
          <IconX width={15} height={15} />
        </button>
      </div>

      <div className="mb-2">
        <span className={label}>Intitulé</span>
        <div className="flex items-center gap-2">
          <input
            className={field}
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Call closing — prospect…"
          />
          <VoiceButton onText={(t) => set({ title: t })} title="Dicter l'intitulé" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className={label}>Début</span>
          <input
            type="time"
            className={`${field} tnum`}
            value={draft.start}
            onChange={(e) => set({ start: e.target.value })}
          />
        </div>
        <div>
          <span className={label}>Fin</span>
          <input
            type="time"
            className={`${field} tnum`}
            value={draft.end}
            onChange={(e) => set({ end: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <div>
          <span className={label}>Pôle</span>
          <select
            className={field}
            value={draft.pole}
            onChange={(e) => set({ pole: e.target.value as Pole })}
          >
            {POLES.map((p) => (
              <option key={p} value={p}>
                {POLE_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={label}>Priorité</span>
          <select
            className={field}
            value={draft.priority}
            onChange={(e) => set({ priority: e.target.value as "" | Priority })}
          >
            <option value="">—</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>
        </div>
        <div>
          <span className={label}>Statut</span>
          <select
            className={field}
            value={draft.status}
            onChange={(e) => set({ status: e.target.value as BlockStatus })}
          >
            <option value="todo">À faire</option>
            <option value="now">En cours</option>
            <option value="done">Fait</option>
            <option value="break">Pause</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onSave}
          className="flex-1 rounded-lg bg-pole-acquisition px-3 py-2 text-sm font-semibold text-deck-bg transition hover:brightness-110"
        >
          {draft.id ? "Enregistrer" : "Ajouter le bloc"}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-deck-line px-3 py-2 text-sm text-deck-mute transition hover:text-deck-ink"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

function Timeline({ energy }: { energy: Energy }) {
  const [blocks, setBlocks] = usePersistentState<ScheduleBlock[]>("ufd.schedule", SCHEDULE);
  const [draft, setDraft] = useState<DraftBlock | null>(null);

  const openNew = () => setDraft(emptyBlock());
  const openEdit = (b: ScheduleBlock) => setDraft(toDraft(b));
  const close = () => setDraft(null);

  const save = () => {
    if (!draft) return;
    const built: ScheduleBlock = {
      id: draft.id || `b-${Date.now()}`,
      start: draft.start,
      end: draft.end,
      title: draft.title.trim() || "Bloc sans titre",
      pole: draft.pole,
      priority: draft.priority || undefined,
      status: draft.status,
    };
    setBlocks((list) => {
      const exists = list.some((b) => b.id === built.id);
      const next = exists ? list.map((b) => (b.id === built.id ? built : b)) : [...list, built];
      return [...next].sort(byStart);
    });
    setDraft(null);
  };

  const remove = (id: string) => {
    setBlocks((list) => list.filter((b) => b.id !== id));
    setDraft((d) => (d && d.id === id ? null : d));
  };

  const toggleDone = (id: string) =>
    setBlocks((list) =>
      list.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "done" ? "todo" : "done" }
          : b,
      ),
    );

  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-deck-mute">
          <IconClock className="text-pole-acquisition" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            Agenda 80/20 · Aujourd&apos;hui
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {(["P1", "P2", "P3"] as Priority[]).map((p) => (
              <span key={p} className="flex items-center gap-1 text-[10px] text-deck-faint">
                <span className={`h-2 w-2 rounded-full ${PRIORITY_META[p].dot}`} />
                {p}
              </span>
            ))}
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-pole-acquisition px-2.5 py-1.5 text-xs font-semibold text-deck-bg transition hover:brightness-110"
          >
            <IconPlus width={14} height={14} />
            Bloc
          </button>
        </div>
      </header>

      {/* Bandeau énergie */}
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2 text-[12px] text-deck-mute">
        <IconBolt width={15} height={15} className="text-pole-secretary" />
        {ENERGY_LABEL[energy]}
      </div>

      {draft && (
        <BlockForm draft={draft} setDraft={setDraft} onSave={save} onCancel={close} />
      )}

      <ol className="relative space-y-1 before:absolute before:left-[54px] before:top-2 before:bottom-2 before:w-px before:bg-deck-line">
        {blocks.map((b) => {
          const c = POLE_CLASSES[b.pole];
          const isNow = b.status === "now";
          const isDone = b.status === "done";
          const isBreak = b.status === "break";
          const emph = emphasisFor(b.priority, energy);
          return (
            <li key={b.id} className="group relative flex items-stretch gap-3">
              <div className="tnum w-[46px] shrink-0 pt-2.5 text-right text-[11px] text-deck-faint">
                {b.start}
              </div>
              <div className="relative flex w-4 shrink-0 items-start justify-center pt-3">
                <span
                  className={`z-10 h-2.5 w-2.5 rounded-full ring-4 ring-deck-panel ${
                    isNow ? `${c.dot} animate-pulseSoft` : isDone ? c.dot : "bg-deck-line2"
                  }`}
                />
              </div>
              <div
                className={`mb-1 flex-1 rounded-xl border px-3 py-2 transition ${
                  isNow
                    ? `border-transparent ${c.softBg} ring-1 ring-inset ${c.ring}`
                    : emph === "up"
                      ? "border-pole-secretary/40 bg-deck-panel2/60 ring-1 ring-inset ring-pole-secretary/30"
                      : "border-deck-line bg-deck-panel2/60"
                } ${isDone ? "opacity-55" : emph === "down" ? "opacity-40" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    {!isBreak && (
                      <button
                        onClick={() => toggleDone(b.id)}
                        title={isDone ? "Rouvrir" : "Marquer comme fait"}
                        aria-label={isDone ? "Rouvrir" : "Marquer comme fait"}
                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${
                          isDone
                            ? "border-pole-delivery bg-pole-delivery/20 text-pole-delivery"
                            : "border-deck-line2 text-transparent hover:text-deck-mute"
                        }`}
                      >
                        <IconCheck width={13} height={13} />
                      </button>
                    )}
                    <span
                      className={`truncate text-sm ${
                        isDone ? "text-deck-mute line-through" : "text-deck-ink"
                      }`}
                    >
                      {isBreak ? "☕ " : ""}
                      {b.title}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {emph === "up" && !isDone && !isNow && (
                      <span className="rounded-md bg-pole-secretary/15 px-1.5 py-0.5 text-[10px] font-bold text-pole-secretary">
                        RECO
                      </span>
                    )}
                    {b.priority && <PriorityTag p={b.priority} />}
                    {isNow && (
                      <span className="rounded-md bg-pole-alert px-1.5 py-0.5 text-[10px] font-bold text-white">
                        EN COURS
                      </span>
                    )}
                    {/* Actions édition — visibles au survol */}
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(b)}
                        title="Modifier"
                        aria-label="Modifier le bloc"
                        className="grid h-6 w-6 place-items-center rounded-md text-deck-faint hover:text-deck-ink"
                      >
                        <IconEdit width={14} height={14} />
                      </button>
                      <button
                        onClick={() => remove(b.id)}
                        title="Supprimer"
                        aria-label="Supprimer le bloc"
                        className="grid h-6 w-6 place-items-center rounded-md text-deck-faint hover:text-pole-alert"
                      >
                        <IconTrash width={14} height={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="tnum text-[11px] text-deck-faint">
                  {b.start}–{b.end}
                </div>
              </div>
            </li>
          );
        })}
        {blocks.length === 0 && (
          <li className="rounded-xl border border-dashed border-deck-line px-3 py-6 text-center text-sm text-deck-faint">
            Journée vide — ajoute ton premier bloc.
          </li>
        )}
      </ol>
    </div>
  );
}

function RescheduleQueue() {
  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconRefresh className="text-pole-alert" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Replanification auto · sans culpabilité
        </span>
      </header>
      <ul className="space-y-2">
        {RESCHEDULED.map((t) => {
          const m = PRIORITY_META[t.priority];
          return (
            <li key={t.id} className="rounded-xl border border-deck-line bg-deck-panel2/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-deck-ink">{t.title}</span>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${m.softBg} ${m.text}`}>
                  {t.priority}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                <span className="text-deck-faint line-through">{t.from}</span>
                <span className="text-pole-alert">→</span>
                <span className="font-semibold text-pole-delivery">{t.to}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-deck-faint">{t.reason}</div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-xl border border-dashed border-pole-content/40 bg-pole-content/5 p-3">
        <div className="flex items-center gap-2">
          <IconBolt width={16} height={16} className="text-pole-content" />
          <span className="text-xs font-semibold text-pole-content">
            {MARKET_RESEARCH.title}
          </span>
        </div>
        <div className="tnum mt-1 text-[11px] text-deck-mute">
          {MARKET_RESEARCH.when} · session récurrente
        </div>
        <ul className="mt-2 space-y-1">
          {MARKET_RESEARCH.template.map((t) => (
            <li key={t} className="flex items-center gap-2 text-[11px] text-deck-faint">
              <span className="h-1 w-1 rounded-full bg-pole-content" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Scheduler() {
  const { energy } = useCockpit();
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Timeline energy={energy} />
      <RescheduleQueue />
    </section>
  );
}
