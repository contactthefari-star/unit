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
