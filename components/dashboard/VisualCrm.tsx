"use client";

import { CLIENTS } from "@/lib/mock-data";
import {
  ClientCard,
  CRM_STAGES,
  POLE_CLASSES,
  POLE_LABEL,
} from "@/lib/types";
import { useCockpit } from "@/components/shell/CockpitContext";
import { IconArrow, IconPlay, IconMegaphone } from "@/components/ui/Icons";

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

function Card({ card }: { card: ClientCard }) {
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
        <div>
          <h3 className="text-base font-bold text-deck-ink">{card.name}</h3>
          <p className="text-xs text-deck-mute">{card.offer}</p>
        </div>
        <span
          className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${c.softBg} ${c.text}`}
        >
          {POLE_LABEL[card.pole]}
        </span>
      </div>

      <StageBar card={card} />

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

      {/* Content Repurposing Bridge */}
      <button
        onClick={repurpose}
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-pole-content/40 bg-pole-content/10 px-3 py-2 text-sm font-semibold text-pole-content transition hover:brightness-125"
      >
        <IconMegaphone width={15} height={15} />
        Convertir en contenu
      </button>
    </article>
  );
}

export function VisualCrm() {
  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-deck-mute">
          CRM visuel · pipeline clients
        </span>
        <span className="text-[11px] text-deck-faint">{CLIENTS.length} clients actifs</span>
      </header>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {CLIENTS.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </div>
    </section>
  );
}
