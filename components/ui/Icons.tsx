import type { SVGProps } from "react";

/** Minimal inline icon set (stroke-based, 24px grid) — no external icon dep. */
const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconBell = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const IconClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconRefresh = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M21 12a9 9 0 1 1-2.64-6.36" />
    <path d="M21 4v5h-5" />
  </svg>
);

export const IconInbox = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 13h4l1.5 3h5L16 13h4" />
    <path d="M4 13 6 5h12l2 8v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Z" />
  </svg>
);

export const IconPlay = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconBolt = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconTarget = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconCommand = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6Z" />
  </svg>
);
