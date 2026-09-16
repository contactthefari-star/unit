import { CA } from "@/lib/mock-data";
import { POLE_CLASSES } from "@/lib/types";
import { IconBolt } from "@/components/ui/Icons";

function money(n: number) {
  return n.toLocaleString("fr-FR");
}

function StatTile({
  label,
  value,
  sub,
  goal,
  accent = "text-deck-ink",
  barColor = "bg-pole-delivery",
}: {
  label: string;
  value: string;
  sub?: string;
  goal?: number;
  accent?: string;
  barColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-deck-faint">
        {label}
      </div>
      <div className={`tnum mt-1.5 text-2xl font-bold ${accent}`}>{value}</div>
      {typeof goal === "number" && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-deck-line">
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{ width: `${Math.min(100, goal)}%` }}
            />
          </div>
          <div className="tnum mt-1.5 text-[11px] text-deck-faint">{sub}</div>
        </div>
      )}
      {typeof goal !== "number" && sub && (
        <div className="tnum mt-1 text-[11px] text-deck-faint">{sub}</div>
      )}
    </div>
  );
}

export function CaTracker() {
  const monthPct = Math.round((CA.month / CA.monthGoal) * 100);
  const quarterPct = Math.round((CA.quarter / CA.quarterGoal) * 100);
  const maxClient = Math.max(...CA.byClient.map((c) => c.amount));

  return (
    <section className="rounded-2xl border border-deck-line bg-deck-panel2/40 p-4">
      <header className="mb-3 flex items-center gap-2 text-deck-mute">
        <IconBolt className="text-pole-delivery" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          CA & Commissions
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="CA du mois"
          value={`${money(CA.month)} ${CA.currency}`}
          goal={monthPct}
          sub={`${monthPct}% de ${money(CA.monthGoal)} ${CA.currency}`}
          accent="text-pole-delivery"
          barColor="bg-pole-delivery"
        />
        <StatTile
          label="CA trimestre"
          value={`${money(CA.quarter)} ${CA.currency}`}
          goal={quarterPct}
          sub={`${quarterPct}% de ${money(CA.quarterGoal)} ${CA.currency}`}
          accent="text-pole-acquisition"
          barColor="bg-pole-acquisition"
        />
        <StatTile
          label="Commissions"
          value={`${money(CA.commissions)} ${CA.currency}`}
          sub="Calcul auto du pôle"
          accent="text-pole-secretary"
        />
        <div className="rounded-2xl border border-deck-line bg-deck-panel p-4 shadow-deck">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-deck-faint">
            CA par client
          </div>
          <ul className="mt-2 space-y-2">
            {CA.byClient.map((c) => {
              const cl = POLE_CLASSES[c.pole];
              return (
                <li key={c.name} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cl.dot}`} />
                  <span className="w-16 truncate text-xs text-deck-mute">{c.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-deck-line">
                    <span
                      className={`block h-full rounded-full ${cl.bg}`}
                      style={{ width: `${(c.amount / maxClient) * 100}%` }}
                    />
                  </span>
                  <span className="tnum w-16 text-right text-[11px] text-deck-ink">
                    {money(c.amount)} {CA.currency}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
