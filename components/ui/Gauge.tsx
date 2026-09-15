import { HEX, Pole } from "@/lib/types";

/** Radial progress gauge drawn with SVG (no chart lib). value: 0..100 */
export function Gauge({
  value,
  pole,
  label,
  suffix = "%",
  caption,
  size = 118,
}: {
  value: number;
  pole: Pole;
  label: string;
  suffix?: string;
  caption?: string;
  size?: number;
}) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  const color = HEX[pole];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#232B37"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            style={{ transition: "stroke-dasharray .6s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tnum text-2xl font-semibold text-deck-ink">
            {pct}
            <span className="text-sm text-deck-mute">{suffix}</span>
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-[13px] font-semibold text-deck-ink">{label}</div>
        {caption && (
          <div className="tnum text-[11px] text-deck-faint">{caption}</div>
        )}
      </div>
    </div>
  );
}
