import { notionConfigStatus } from "@/lib/notion";
import { IconRefresh } from "@/components/ui/Icons";

/** Panneau de statut du pont Notion (lecture serveur de la config). */
export function NotionSync() {
  const status = notionConfigStatus();
  const entries = Object.entries(status.databases);
  const ready = entries.filter(([, ok]) => ok).length;

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel p-5 shadow-deck">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-deck-mute">
          <IconRefresh className="text-pole-acquisition" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">
            Notion Sync · webhook 2 sens
          </span>
        </div>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
            status.connected
              ? "border-pole-delivery/40 bg-pole-delivery/10 text-pole-delivery"
              : "border-pole-secretary/40 bg-pole-secretary/10 text-pole-secretary"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              status.connected ? "bg-pole-delivery animate-pulseSoft" : "bg-pole-secretary"
            }`}
          />
          {status.connected ? "Connecté" : "À configurer"}
        </span>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {entries.map(([name, ok]) => (
          <div
            key={name}
            className="flex items-center gap-2 rounded-xl border border-deck-line bg-deck-panel2/60 px-3 py-2"
          >
            <span
              className={`h-2 w-2 rounded-full ${ok ? "bg-pole-delivery" : "bg-deck-line2"}`}
            />
            <span className="text-xs text-deck-ink">{name}</span>
            <span
              className={`ml-auto text-[10px] font-semibold uppercase ${
                ok ? "text-pole-delivery" : "text-deck-faint"
              }`}
            >
              {ok ? "OK" : "—"}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-deck-faint">
        {ready}/{entries.length} bases mappées · alimente Arthur / Jérémy / André sans
        ouvrir Notion. Renseigne les clés dans <code className="text-deck-mute">.env</code>{" "}
        (voir <code className="text-deck-mute">.env.example</code>). Webhook entrant :{" "}
        <code className="text-deck-mute">/api/notion</code>.
      </p>
    </section>
  );
}
