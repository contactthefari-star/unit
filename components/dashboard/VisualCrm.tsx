"use client";

import { useState } from "react";
import { CLIENTS } from "@/lib/mock-data";
import {
  ClientCard,
  CrmStage,
  CRM_STAGES,
  Pole,
  POLE_CLASSES,
  POLE_LABEL,
} from "@/lib/types";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useCockpit } from "@/components/shell/CockpitContext";
import {
  IconArrow,
  IconPlay,
  IconMegaphone,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
} from "@/components/ui/Icons";
import { VoiceButton } from "@/components/ui/VoiceButton";

const POLES: Pole[] = ["delivery", "acquisition", "content", "secretary", "alert"];

interface DraftClient {
  id: string;
  name: string;
  offer: string;
  pole: Pole;
  stage: CrmStage;
  nextAction: string;
  kpiLabel: string;
  kpiTarget: string;
  kpiActual: string;
  kpiUnit: string;
}

function emptyDraft(): DraftClient {
  return {
    id: "",
    name: "",
    offer: "",
    pole: "delivery",
    stage: "Audit",
    nextAction: "",
    kpiLabel: "RDV closing / sem.",
    kpiTarget: "10",
    kpiActual: "0",
    kpiUnit: "",
  };
}

function toDraft(c: ClientCard): DraftClient {
  return {
    id: c.id,
    name: c.name,
    offer: c.offer,
    pole: c.pole,
    stage: c.stage,
    nextAction: c.nextAction,
    kpiLabel: c.kpi.label,
    kpiTarget: String(c.kpi.target),
    kpiActual: String(c.kpi.actual),
    kpiUnit: c.kpi.unit ?? "",
  };
}

/** Fusionne un brouillon avec un client existant (ou en crée un neuf). */
function applyDraft(d: DraftClient, prev?: ClientCard): ClientCard {
  return {
    id: d.id || `cl-${Date.now()}`,
    name: d.name.trim() || "Nouveau client",
    offer: d.offer.trim() || "Offre à préciser",
    pole: d.pole,
    stage: d.stage,
    nextAction: d.nextAction.trim() || "Définir la prochaine action",
    auditedCalls: prev?.auditedCalls ?? 0,
    totalCalls: prev?.totalCalls ?? 0,
    lastCallLabel: prev?.lastCallLabel ?? "Aucun call audité",
    monthlyCa: prev?.monthlyCa ?? 0,
    kpi: {
      label: d.kpiLabel.trim() || "KPI",
      target: Number(d.kpiTarget) || 0,
      actual: Number(d.kpiActual) || 0,
      unit: d.kpiUnit.trim() || undefined,
    },
    onboarding: prev?.onboarding ?? [
      { label: "Panier moyen", value: "—" },
      { label: "Volume/sem.", value: "—" },
      { label: "Objectif M+1", value: "—" },
    ],
  };
}

function StageBar({ card }: { card: ClientCard }) {
  const current = CRM_STAGES.indexOf(card.stage);
  const c = POLE_CLASSES[card.pole];
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1">
        {CRM_STAGES.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= current ? c.bg : "bg-deck-line"}`} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between">
        {CRM_STAGES.map((s, i) => (
          <span
            key={s}
            className={`text-[9px] uppercase tracking-wide ${
              i === current
                ? `${c.text} font-bold`
                : i < current
                  ? "text-deck-mute"
                  : "text-deck-faint"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function Card({
  card,
  onEdit,
  onDelete,
}: {
  card: ClientCard;
  onEdit: (c: ClientCard) => void;
  onDelete: (id: string) => void;
}) {
  const c = POLE_CLASSES[card.pole];
  const { addRepurposed, setTab } = useCockpit();

  const repurpose = () => {
    addRepurposed({
      id: `rp-${card.id}-${Date.now()}`,
      from: card.name,
      hook: `Retour d'expérience — ${card.name}`,
      angle: `${card.offer} : 1 objection fréquente → 1 solution concrète`,
    });
    setTab("content");
  };

  return (
    <article
      className={`flex w-[320px] shrink-0 flex-col rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck ring-1 ring-inset ${c.ring}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-deck-ink">{card.name}</h3>
          <p className="text-xs text-deck-mute">{card.offer}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${c.softBg} ${c.text}`}
          >
            {POLE_LABEL[card.pole]}
          </span>
        </div>
      </div>

      <StageBar card={card} />

      {/* KPI barometer — target vs actual */}
      {(() => {
        const ratio = card.kpi.target > 0 ? card.kpi.actual / card.kpi.target : 0;
        const pct = Math.min(100, Math.round(ratio * 100));
        const tone =
          ratio >= 0.9
            ? { bar: "bg-pole-delivery", text: "text-pole-delivery", label: "Dans la cible" }
            : ratio >= 0.6
              ? { bar: "bg-pole-secretary", text: "text-pole-secretary", label: "À surveiller" }
              : { bar: "bg-pole-alert", text: "text-pole-alert", label: "Sous la cible" };
        return (
          <div className="mt-3 rounded-xl border border-deck-line bg-deck-panel2 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-deck-faint">
                {card.kpi.label}
              </span>
              <span className={`text-[10px] font-bold ${tone.text}`}>{tone.label}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-deck-line">
                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="tnum text-[11px] font-semibold text-deck-ink">
                {card.kpi.actual}
                <span className="text-deck-faint">/{card.kpi.target}{card.kpi.unit ?? ""}</span>
              </span>
            </div>
          </div>
        );
      })()}

      <div className="mt-3 rounded-xl border border-deck-line bg-deck-panel2 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-deck-faint">
          Prochaine action
        </div>
        <div className="mt-1 flex items-start gap-2">
          <IconArrow width={16} height={16} className={`mt-0.5 shrink-0 ${c.text}`} />
          <p className="text-sm leading-snug text-deck-ink">{card.nextAction}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          className={`grid h-9 w-9 place-items-center rounded-full ${c.softBg} ${c.text} transition hover:brightness-125`}
          aria-label={`Écouter : ${card.lastCallLabel}`}
        >
          <IconPlay width={16} height={16} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-deck-ink">{card.lastCallLabel}</div>
          <div className="tnum text-[11px] text-deck-faint">
            Calls audités {card.auditedCalls}/{card.totalCalls}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-deck-line pt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-deck-faint">
          Onboarding pré-rempli
        </div>
        <dl className="mt-2 grid grid-cols-3 gap-2">
          {card.onboarding.map((o) => (
            <div key={o.label} className="rounded-lg bg-deck-panel2 px-2 py-1.5">
              <dt className="text-[9px] uppercase tracking-wide text-deck-faint">
                {o.label}
              </dt>
              <dd className="tnum text-xs font-semibold text-deck-ink">{o.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {/* Content Repurposing Bridge */}
        <button
          onClick={repurpose}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-pole-content/40 bg-pole-content/10 px-3 py-2 text-sm font-semibold text-pole-content transition hover:brightness-125"
        >
          <IconMegaphone width={15} height={15} />
          Convertir en contenu
        </button>
        <button
          onClick={() => onEdit(card)}
          title="Modifier le client"
          aria-label="Modifier le client"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-deck-line bg-deck-panel2 text-deck-mute transition hover:text-deck-ink hover:border-deck-line2"
        >
          <IconEdit width={16} height={16} />
        </button>
        <button
          onClick={() => onDelete(card.id)}
          title="Supprimer le client"
          aria-label="Supprimer le client"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-deck-line bg-deck-panel2 text-deck-mute transition hover:text-pole-alert hover:border-pole-alert/40"
        >
          <IconTrash width={16} height={16} />
        </button>
      </div>
    </article>
  );
}

function ClientForm({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: DraftClient;
  setDraft: (d: DraftClient) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const set = (patch: Partial<DraftClient>) => setDraft({ ...draft, ...patch });
  const field =
    "w-full rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none placeholder:text-deck-faint focus:border-pole-acquisition";
  const label = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-deck-faint";

  return (
    <div className="w-[320px] shrink-0 rounded-2xl border border-pole-acquisition/40 bg-deck-panel p-4 shadow-deck ring-1 ring-inset ring-pole-acquisition/30">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-deck-mute">
          {draft.id ? "Modifier le client" : "Nouveau client"}
        </span>
        <button
          onClick={onCancel}
          aria-label="Fermer"
          className="grid h-7 w-7 place-items-center rounded-lg text-deck-faint hover:text-deck-ink"
        >
          <IconX width={16} height={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <span className={label}>Nom</span>
          <div className="flex items-center gap-2">
            <input
              className={field}
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Léhi, Andréa…"
            />
            <VoiceButton onText={(t) => set({ name: t })} title="Dicter le nom" />
          </div>
        </div>

        <div>
          <span className={label}>Offre</span>
          <div className="flex items-center gap-2">
            <input
              className={field}
              value={draft.offer}
              onChange={(e) => set({ offer: e.target.value })}
              placeholder="Setting + Closing high-ticket"
            />
            <VoiceButton onText={(t) => set({ offer: t })} title="Dicter l'offre" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
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
            <span className={label}>Étape</span>
            <select
              className={field}
              value={draft.stage}
              onChange={(e) => set({ stage: e.target.value as CrmStage })}
            >
              {CRM_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className={label}>Prochaine action</span>
          <div className="flex items-start gap-2">
            <textarea
              rows={2}
              className={`${field} resize-none`}
              value={draft.nextAction}
              onChange={(e) => set({ nextAction: e.target.value })}
              placeholder="Auditer 2 calls + brief recrutement…"
            />
            <VoiceButton onText={(t) => set({ nextAction: t })} title="Dicter l'action" />
          </div>
        </div>

        <div>
          <span className={label}>KPI suivi</span>
          <div className="flex items-center gap-2">
            <input
              className={field}
              value={draft.kpiLabel}
              onChange={(e) => set({ kpiLabel: e.target.value })}
              placeholder="RDV closing / sem."
            />
            <VoiceButton onText={(t) => set({ kpiLabel: t })} title="Dicter le KPI" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div>
              <span className={label}>Réel</span>
              <input
                className={`${field} tnum`}
                inputMode="numeric"
                value={draft.kpiActual}
                onChange={(e) => set({ kpiActual: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <span className={label}>Cible</span>
              <input
                className={`${field} tnum`}
                inputMode="numeric"
                value={draft.kpiTarget}
                onChange={(e) => set({ kpiTarget: e.target.value })}
                placeholder="10"
              />
            </div>
            <div>
              <span className={label}>Unité</span>
              <input
                className={field}
                value={draft.kpiUnit}
                onChange={(e) => set({ kpiUnit: e.target.value })}
                placeholder="€, %"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onSave}
            className="flex-1 rounded-xl bg-pole-acquisition px-3 py-2.5 text-sm font-semibold text-deck-bg transition hover:brightness-110"
          >
            {draft.id ? "Enregistrer" : "Ajouter le client"}
          </button>
          <button
            onClick={onCancel}
            className="rounded-xl border border-deck-line px-3 py-2.5 text-sm text-deck-mute transition hover:text-deck-ink"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

export function VisualCrm() {
  const [clients, setClients] = usePersistentState<ClientCard[]>("ufd.clients", CLIENTS);
  const [draft, setDraft] = useState<DraftClient | null>(null);

  const openNew = () => setDraft(emptyDraft());
  const openEdit = (c: ClientCard) => setDraft(toDraft(c));
  const close = () => setDraft(null);

  const save = () => {
    if (!draft) return;
    setClients((list) => {
      const prev = list.find((c) => c.id === draft.id);
      const built = applyDraft(draft, prev);
      return prev
        ? list.map((c) => (c.id === built.id ? built : c))
        : [built, ...list];
    });
    setDraft(null);
  };

  const remove = (id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Supprimer ce client ?")) return;
    setClients((list) => list.filter((c) => c.id !== id));
    setDraft((d) => (d && d.id === id ? null : d));
  };

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-deck-mute">
          CRM visuel · pipeline clients
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-deck-faint">{clients.length} clients actifs</span>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-pole-acquisition px-3 py-1.5 text-sm font-semibold text-deck-bg transition hover:brightness-110"
          >
            <IconPlus width={15} height={15} />
            Nouveau client
          </button>
        </div>
      </header>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {draft && (
          <ClientForm draft={draft} setDraft={setDraft} onSave={save} onCancel={close} />
        )}
        {clients.map((c) => (
          <Card key={c.id} card={c} onEdit={openEdit} onDelete={remove} />
        ))}
        {clients.length === 0 && !draft && (
          <div className="grid h-40 w-full place-items-center rounded-2xl border border-dashed border-deck-line text-sm text-deck-faint">
            Aucun client — clique sur « Nouveau client » pour démarrer ton pipeline.
          </div>
        )}
      </div>
    </section>
  );
}
