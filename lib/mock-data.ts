import { ClientCard, KpiGauge, NotificationItem } from "./types";

/**
 * Placeholder cockpit data. Wire these to the real sources (Notion / Slack /
 * sales-call notes) later — the UI reads only from these shapes.
 */

export const CA = {
  month: 18450,
  monthGoal: 25000,
  quarter: 47200,
  quarterGoal: 75000,
  commissions: 4612,
  currency: "€",
  byClient: [
    { name: "Léhi", pole: "delivery" as const, amount: 9200 },
    { name: "Andréa", pole: "acquisition" as const, amount: 5100 },
    { name: "Arthur", pole: "content" as const, amount: 2650 },
    { name: "Studio K.", pole: "delivery" as const, amount: 1500 },
  ],
};

export const KPIS: KpiGauge[] = [
  {
    key: "personal-closing",
    label: "Closing perso",
    value: 42,
    suffix: "%",
    pole: "delivery",
    caption: "12 closés / 28 calls",
  },
  {
    key: "client-closing",
    label: "Closing clients",
    value: 37,
    suffix: "%",
    pole: "acquisition",
    caption: "moyenne pôle Léhi",
  },
  {
    key: "setting-closing",
    label: "Setting → Closing",
    value: 61,
    suffix: "%",
    pole: "content",
    caption: "RDV setés qui closent",
  },
  {
    key: "audited-calls",
    label: "Calls audités",
    value: 80,
    suffix: "%",
    pole: "secretary",
    caption: "8 / 10 cette semaine",
  },
];

export const CLIENTS: ClientCard[] = [
  {
    id: "lehi",
    name: "Léhi",
    offer: "Setting + Closing high-ticket",
    pole: "delivery",
    stage: "Recrutement",
    nextAction: "Auditer 2 calls closer + brief recrutement setter",
    auditedCalls: 8,
    totalCalls: 10,
    lastCallLabel: "Call closing — 12:40",
    monthlyCa: 9200,
    onboarding: [
      { label: "Panier moyen", value: "3 500 €" },
      { label: "Volume leads/sem.", value: "45" },
      { label: "Objectif M+1", value: "15 closings" },
    ],
  },
  {
    id: "andrea",
    name: "Andréa",
    offer: "Acquisition — génération de leads",
    pole: "acquisition",
    stage: "Script",
    nextAction: "Valider script d'accroche v2 avant lancement ads",
    auditedCalls: 3,
    totalCalls: 6,
    lastCallLabel: "Discovery — hier 16:10",
    monthlyCa: 5100,
    onboarding: [
      { label: "Canal", value: "Cold DM + Ads" },
      { label: "CPL cible", value: "12 €" },
      { label: "Budget/sem.", value: "600 €" },
    ],
  },
  {
    id: "arthur",
    name: "Arthur",
    offer: "Contenu & traitement d'objections",
    pole: "content",
    stage: "Audit",
    nextAction: "Extraire 5 objections récurrentes des derniers calls",
    auditedCalls: 2,
    totalCalls: 4,
    lastCallLabel: "Kick-off — lun. 09:30",
    monthlyCa: 2650,
    onboarding: [
      { label: "Format", value: "Short vidéo" },
      { label: "Cadence", value: "5 / sem." },
      { label: "Angle", value: "Preuve + objection" },
    ],
  },
  {
    id: "studio-k",
    name: "Studio K.",
    offer: "Accompagnement scale",
    pole: "delivery",
    stage: "Scale",
    nextAction: "Préparer bilan trimestriel + upsell rétention",
    auditedCalls: 6,
    totalCalls: 6,
    lastCallLabel: "Suivi — mar. 11:00",
    monthlyCa: 1500,
    onboarding: [
      { label: "Ancienneté", value: "4 mois" },
      { label: "MRR", value: "1 500 €" },
      { label: "NPS", value: "9 / 10" },
    ],
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    kind: "task",
    pole: "delivery",
    title: "Bloc Delivery — audit call closer Léhi",
    meta: "17:30 · 45 min · chargé",
    priority: "P1",
  },
  {
    id: "n2",
    kind: "rescheduled",
    pole: "alert",
    title: "« Extraire objections Arthur » replanifiée",
    meta: "Auto → demain 10:00 (créneau libre 80/20)",
    priority: "P2",
  },
  {
    id: "n3",
    kind: "secretary",
    pole: "secretary",
    title: "Jérémy — préparer contrat Studio K.",
    meta: "Reçu via Notion · deadline 18:00",
    priority: "P1",
  },
  {
    id: "n4",
    kind: "secretary",
    pole: "acquisition",
    title: "Client Andréa — demande de report RDV",
    meta: "Entrant · à traiter en 5 s (Cmd+K)",
    priority: "P2",
  },
  {
    id: "n5",
    kind: "task",
    pole: "content",
    title: "Batch contenu — 3 hooks à valider",
    meta: "Vendredi 08:55 · séquence guidée 3 h",
    priority: "P3",
  },
];

export const COUNTS = {
  activeTasks: 7,
  rescheduled: 2,
  secretary: 3,
};
