"use client";

import { useState } from "react";
import { IconBolt, IconArrow } from "@/components/ui/Icons";

const QUESTIONS = [
  {
    key: "problem",
    q: "1 · Quel problème / douleur tu adresses ?",
    placeholder: "Ex : les closers annoncent le prix trop tôt et perdent le deal",
  },
  {
    key: "proof",
    q: "2 · Ton exemple / preuve concrète ?",
    placeholder: "Ex : la semaine dernière, un silence de 4 s a fait signer un +3 500 €",
  },
  {
    key: "action",
    q: "3 · L'action ou la leçon à retenir (CTA) ?",
    placeholder: "Ex : attends la valeur avant le prix — teste-le sur ton prochain call",
  },
] as const;

type Key = (typeof QUESTIONS)[number]["key"];

export function GuidedScripting() {
  const [answers, setAnswers] = useState<Record<Key, string>>({
    problem: "",
    proof: "",
    action: "",
  });
  const [post, setPost] = useState<string | null>(null);

  const set = (k: Key, v: string) => setAnswers((a) => ({ ...a, [k]: v }));

  const generate = () => {
    const { problem, proof, action } = answers;
    if (!problem.trim() && !proof.trim() && !action.trim()) return;
    const hook = problem.trim()
      ? `La plupart galèrent avec ça : ${problem.trim()}.`
      : "Voici un truc que peu de gens appliquent.";
    const body = proof.trim()
      ? `Concrètement — ${proof.trim()}.`
      : "J'ai testé, et la différence est réelle.";
    const cta = action.trim()
      ? `À retenir : ${action.trim()}.`
      : "À toi de jouer.";
    setPost(`${hook}\n\n${body}\n\n${cta}\n\n➜ Enregistre ce post si ça te parle.`);
  };

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBolt className="text-pole-content" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Guided Scripting · 3 questions → post prêt
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Questions */}
        <div className="space-y-3">
          {QUESTIONS.map((item) => (
            <label key={item.key} className="block">
              <span className="mb-1 block text-[12px] font-medium text-deck-mute">
                {item.q}
              </span>
              <textarea
                rows={2}
                value={answers[item.key]}
                onChange={(e) => set(item.key, e.target.value)}
                placeholder={item.placeholder}
                className="w-full resize-none rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none transition placeholder:text-deck-faint focus:border-pole-content"
              />
            </label>
          ))}
          <button
            onClick={generate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pole-content px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            <IconBolt width={16} height={16} />
            Générer le post
          </button>
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-deck-faint">
            Post généré · éditable
          </div>
          {post ? (
            <>
              <textarea
                value={post}
                onChange={(e) => setPost(e.target.value)}
                rows={9}
                className="flex-1 resize-none rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2.5 text-sm leading-relaxed text-deck-ink outline-none focus:border-pole-content"
              />
              <button className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-pole-content/40 bg-pole-content/10 px-3 py-2 text-sm font-semibold text-pole-content transition hover:brightness-125">
                <IconArrow width={15} height={15} />
                Envoyer au calendrier éditorial
              </button>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-deck-line p-6 text-center text-[12px] text-deck-faint">
              Réponds aux 3 questions puis « Générer le post » —
              fini la page blanche.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
