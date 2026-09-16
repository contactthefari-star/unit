"use client";

import { useState } from "react";
import { IconTarget, IconArrow, IconBolt } from "@/components/ui/Icons";

interface Diag {
  id: string;
  label: string;
  detail: string;
  fix: string;
}

const DIAGNOSTICS: Diag[] = [
  { id: "script", label: "Mauvais script", detail: "Structure de call absente ou confuse", fix: "Réécrire le script Straight Line" },
  { id: "jargon", label: "Jargon / flou", detail: "Vocabulaire technique qui perd le prospect", fix: "Simplifier le pitch en langage client" },
  { id: "price", label: "Prix trop tôt", detail: "Annonce du prix avant la valeur", fix: "Créer la séquence douleur → désir → prix" },
  { id: "discovery", label: "Découverte faible", detail: "Peu de questions, pas de douleur creusée", fix: "Batterie de 5 questions de découverte" },
  { id: "framing", label: "Pas de cadrage", detail: "Aucun cadre posé en ouverture", fix: "Ajouter un cadrage + agenda de call" },
  { id: "nextstep", label: "Pas de next step", detail: "Fin de call sans engagement clair", fix: "Script de closing + prochaine action" },
];

export function ClosingMatrix() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [validated, setValidated] = useState(false);

  const toggle = (id: string) => {
    setValidated(false);
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const chosen = DIAGNOSTICS.filter((d) => selected.has(d.id));

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconTarget className="text-pole-delivery" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Matrice diagnostic · onboarding closing
        </span>
      </header>

      <p className="mb-3 text-sm text-deck-mute">
        Coche les points faibles repérés à l&apos;audit. À la validation, l&apos;app
        génère le <span className="text-deck-ink">dossier client</span> et les{" "}
        <span className="text-deck-ink">tâches correctives</span> associées.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DIAGNOSTICS.map((d) => {
          const on = selected.has(d.id);
          return (
            <button
              key={d.id}
              onClick={() => toggle(d.id)}
              className={`rounded-xl border p-3 text-left transition ${
                on
                  ? "border-pole-delivery/50 bg-pole-delivery/10"
                  : "border-deck-line bg-deck-panel hover:border-deck-line2"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-deck-ink">{d.label}</span>
                <span
                  className={`grid h-4 w-4 place-items-center rounded-md border ${
                    on
                      ? "border-pole-delivery bg-pole-delivery text-deck-bg"
                      : "border-deck-line2"
                  }`}
                >
                  {on ? "✓" : ""}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-deck-faint">{d.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="tnum text-[11px] text-deck-faint">
          {selected.size} point(s) sélectionné(s)
        </span>
        <button
          onClick={() => setValidated(selected.size > 0)}
          disabled={selected.size === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-pole-delivery px-4 py-2.5 text-sm font-semibold text-deck-bg transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconBolt width={16} height={16} />
          Valider → générer dossier + tâches
        </button>
      </div>

      {validated && (
        <div className="mt-3 rounded-xl border border-pole-delivery/40 bg-pole-delivery/10 p-3">
          <div className="mb-2 text-xs font-semibold text-pole-delivery">
            Dossier client créé · {chosen.length} tâche(s) correctives planifiées
          </div>
          <ul className="space-y-1.5">
            {chosen.map((d, i) => (
              <li key={d.id} className="flex items-center gap-2 text-sm text-deck-ink">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pole-delivery/15 text-[11px] font-bold text-pole-delivery">
                  {i + 1}
                </span>
                <IconArrow width={14} height={14} className="shrink-0 text-pole-delivery" />
                {d.fix}
                <span className="tnum ml-auto rounded-md bg-deck-line px-2 py-0.5 text-[11px] text-deck-mute">
                  P1
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
