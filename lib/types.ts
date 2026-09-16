export type Pole = "delivery" | "acquisition" | "content" | "secretary" | "alert";

export type Priority = "P1" | "P2" | "P3";

export const POLE_LABEL: Record<Pole, string> = {
  delivery: "Delivery & Clients",
  acquisition: "Acquisition & Leads",
  content: "Contenu & Objections",
  secretary: "Secrétariat & Tâches",
  alert: "Retard / Replanif.",
};

export const POLE_OWNER: Record<Pole, string> = {
  delivery: "Léhi",
  acquisition: "Andréa",
  content: "Arthur",
  secretary: "Jérémy",
  alert: "Système",
};

/** Tailwind-safe class fragments per pole (kept static so JIT keeps them). */
export const POLE_CLASSES: Record<
  Pole,
  { text: string; bg: string; ring: string; dot: string; softBg: string }
> = {
  delivery: {
    text: "text-pole-delivery",
    bg: "bg-pole-delivery",
    ring: "ring-pole-delivery/40",
    dot: "bg-pole-delivery",
    softBg: "bg-pole-delivery/10",
  },
  acquisition: {
    text: "text-pole-acquisition",
    bg: "bg-pole-acquisition",
    ring: "ring-pole-acquisition/40",
    dot: "bg-pole-acquisition",
    softBg: "bg-pole-acquisition/10",
  },
  content: {
    text: "text-pole-content",
    bg: "bg-pole-content",
    ring: "ring-pole-content/40",
    dot: "bg-pole-content",
    softBg: "bg-pole-content/10",
  },
  secretary: {
    text: "text-pole-secretary",
    bg: "bg-pole-secretary",
    ring: "ring-pole-secretary/40",
    dot: "bg-pole-secretary",
    softBg: "bg-pole-secretary/10",
  },
  alert: {
    text: "text-pole-alert",
    bg: "bg-pole-alert",
    ring: "ring-pole-alert/40",
    dot: "bg-pole-alert",
    softBg: "bg-pole-alert/10",
  },
};

export const HEX: Record<Pole, string> = {
  delivery: "#10B981",
  acquisition: "#3B82F6",
  content: "#8B5CF6",
  secretary: "#F59E0B",
  alert: "#EF4444",
};

export type CrmStage = "Audit" | "Script" | "Recrutement" | "Scale";
export const CRM_STAGES: CrmStage[] = ["Audit", "Script", "Recrutement", "Scale"];

export interface ClientKpi {
  label: string;
  target: number;
  actual: number;
  unit?: string;
}

export interface ClientCard {
  id: string;
  name: string;
  offer: string;
  pole: Pole;
  stage: CrmStage;
  nextAction: string;
  auditedCalls: number;
  totalCalls: number;
  lastCallLabel: string;
  onboarding: { label: string; value: string }[];
  monthlyCa: number;
  kpi: ClientKpi;
}

export interface KpiGauge {
  key: string;
  label: string;
  value: number; // 0..100 (percent) — or ratio value
  suffix?: string;
  pole: Pole;
  caption: string;
}

export interface NotificationItem {
  id: string;
  kind: "task" | "rescheduled" | "secretary";
  pole: Pole;
  title: string;
  meta: string;
  priority?: Priority;
}

export type BlockStatus = "done" | "now" | "todo" | "break";

export interface ScheduleBlock {
  id: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  title: string;
  pole: Pole;
  priority?: Priority;
  status: BlockStatus;
}

export interface RescheduledTask {
  id: string;
  title: string;
  priority: Priority;
  from: string; // original slot label
  to: string; // new auto slot label
  reason: string;
}

export interface RepurposedDraft {
  id: string;
  from: string; // client source
  hook: string;
  angle: string;
}

export type ContentStatus = "idea" | "ready" | "published";

export const CONTENT_STATUS_META: Record<
  ContentStatus,
  { label: string; text: string; softBg: string; dot: string }
> = {
  idea: {
    label: "Idée",
    text: "text-deck-mute",
    softBg: "bg-deck-line/60",
    dot: "bg-deck-faint",
  },
  ready: {
    label: "Prêt à filmer",
    text: "text-pole-secretary",
    softBg: "bg-pole-secretary/10",
    dot: "bg-pole-secretary",
  },
  published: {
    label: "Publié",
    text: "text-pole-delivery",
    softBg: "bg-pole-delivery/10",
    dot: "bg-pole-delivery",
  },
};

export const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export interface ContentCard {
  id: string;
  day: WeekDay;
  hook: string;
  angle: string;
  status: ContentStatus;
  objection?: string;
}

export interface SecretaryRequest {
  id: string;
  text: string;
  pole: Pole;
  minutes: number;
  slot: string;
  deadline: string;
  priority: Priority;
}

export interface JeremyTask {
  id: string;
  title: string;
  source: "Notion" | "Slack";
  priority: Priority;
  slot: string;
}

export const PRIORITY_META: Record<
  Priority,
  { label: string; text: string; softBg: string; dot: string }
> = {
  P1: {
    label: "Haut impact · Delivery & Closing",
    text: "text-pole-alert",
    softBg: "bg-pole-alert/10",
    dot: "bg-pole-alert",
  },
  P2: {
    label: "Moyen · Contenu & Objections",
    text: "text-pole-secretary",
    softBg: "bg-pole-secretary/10",
    dot: "bg-pole-secretary",
  },
  P3: {
    label: "Bas · Research & Admin",
    text: "text-pole-acquisition",
    softBg: "bg-pole-acquisition/10",
    dot: "bg-pole-acquisition",
  },
};
