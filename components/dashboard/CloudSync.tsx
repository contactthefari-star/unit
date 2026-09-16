"use client";

import { useState } from "react";
import { useSupabase } from "@/components/shell/SupabaseContext";
import { IconShield, IconRefresh, IconCheck } from "@/components/ui/Icons";

export function CloudSync() {
  const { enabled, loading, email, signIn, signOut } = useSupabase();
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    const res = await signIn(input);
    setMsg(res.message);
    setBusy(false);
  };

  const field =
    "w-full rounded-xl border border-deck-line bg-deck-panel2 px-3 py-2 text-sm text-deck-ink outline-none placeholder:text-deck-faint focus:border-pole-delivery";

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconRefresh className="text-pole-delivery" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Cloud Sync · multi-appareils
        </span>
      </header>

      {/* Cas 1 : clés absentes */}
      {!enabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-deck-faint" />
            <span className="text-sm text-deck-mute">
              Non configuré — l&apos;app sauvegarde en local sur cet appareil.
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-deck-faint">
            Pour synchroniser PC ↔ téléphone : crée un projet sur supabase.com,
            lance le script <code className="text-deck-mute">supabase/schema.sql</code>,
            puis renseigne <code className="text-deck-mute">NEXT_PUBLIC_SUPABASE_URL</code> et
            <code className="text-deck-mute"> NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans
            <code className="text-deck-mute"> .env.local</code> (voir README).
          </p>
        </div>
      )}

      {/* Cas 2 : configuré, en cours de vérif */}
      {enabled && loading && (
        <div className="flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2 text-sm text-deck-mute">
          <span className="h-2 w-2 animate-pulseSoft rounded-full bg-pole-secretary" />
          Vérification de la session…
        </div>
      )}

      {/* Cas 3 : configuré, non connecté → formulaire lien magique */}
      {enabled && !loading && !email && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2">
            <IconShield width={15} height={15} className="text-pole-secretary" />
            <span className="text-sm text-deck-mute">
              Connecte-toi pour synchroniser tes données (lien magique par email).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="email"
              className={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !busy && submit()}
              placeholder="ton@email.com"
            />
            <button
              onClick={submit}
              disabled={busy}
              className="shrink-0 rounded-xl bg-pole-delivery px-4 py-2 text-sm font-semibold text-deck-bg transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "…" : "Recevoir le lien"}
            </button>
          </div>
          {msg && <p className="text-[12px] text-deck-mute">{msg}</p>}
        </div>
      )}

      {/* Cas 4 : connecté */}
      {enabled && !loading && email && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-pole-delivery/40 bg-pole-delivery/10 px-3 py-2">
            <IconCheck width={16} height={16} className="text-pole-delivery" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-deck-ink">Synchronisé</div>
              <div className="truncate text-[12px] text-deck-mute">{email}</div>
            </div>
          </div>
          <p className="text-[12px] text-deck-faint">
            Tes clients, ton agenda et tes captures suivent sur tous tes appareils
            connectés à ce compte.
          </p>
          <button
            onClick={signOut}
            className="rounded-xl border border-deck-line px-3 py-2 text-sm text-deck-mute transition hover:text-deck-ink"
          >
            Se déconnecter
          </button>
        </div>
      )}
    </section>
  );
}
