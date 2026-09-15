import {
  ClientCard,
  ContentCard,
  JeremyTask,
  KpiGauge,
  NotificationItem,
  RescheduledTask,
  ScheduleBlock,
  SecretaryRequest,
} from "./types";

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
    kpi: { label: "RDV closing / sem.", target: 10, actual: 8 },
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
    kpi: { label: "Leads qualifiés / sem.", target: 45, actual: 42 },
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
    kpi: { label: "Posts publiés / sem.", target: 5, actual: 2 },
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
    kpi: { label: "MRR", target: 2000, actual: 1500, unit: "\u20ac" },
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

export const SCHEDULE: ScheduleBlock[] = [
  {
    id: "b1",
    start: "09:00",
    end: "09:45",
    title: "Prospection — 20 messages ciblés",
    pole: "acquisition",
    priority: "P2",
    status: "done",
  },
  {
    id: "b2",
    start: "10:00",
    end: "10:45",
    title: "Audit calls closer — Léhi",
    pole: "delivery",
    priority: "P1",
    status: "done",
  },
  {
    id: "b3",
    start: "11:00",
    end: "11:15",
    title: "Pause obligatoire",
    pole: "secretary",
    status: "break",
  },
  {
    id: "b4",
    start: "14:30",
    end: "15:15",
    title: "Call closing — prospect Studio K.",
    pole: "delivery",
    priority: "P1",
    status: "now",
  },
  {
    id: "b5",
    start: "15:30",
    end: "16:15",
    title: "Relances pipeline tiède",
    pole: "acquisition",
    priority: "P2",
    status: "todo",
  },
  {
    id: "b6",
    start: "16:30",
    end: "17:15",
    title: "Batch objections — Arthur",
    pole: "content",
    priority: "P2",
    status: "todo",
  },
  {
    id: "b7",
    start: "17:30",
    end: "18:15",
    title: "Bloc Delivery — brief recrutement setter",
    pole: "delivery",
    priority: "P1",
    status: "todo",
  },
];

export const RESCHEDULED: RescheduledTask[] = [
  {
    id: "r1",
    title: "Extraire 5 objections récurrentes (Arthur)",
    priority: "P2",
    from: "Aujourd'hui 11:30 — manqué",
    to: "Demain 10:00",
    reason: "Créneau libre 80/20 le plus proche",
  },
  {
    id: "r2",
    title: "Market research — nouveaux frameworks US",
    priority: "P3",
    from: "Hier 18:00 — non terminé",
    to: "Dimanche 10:00",
    reason: "Session récurrente dédiée",
  },
];

export const CONTENT: ContentCard[] = [
  {
    id: "c1",
    day: "Lun",
    hook: "« J'ai perdu 3 deals cette semaine à cause de ça »",
    angle: "Erreur n°1 en closing : parler prix trop tôt",
    status: "published",
    objection: "C'est trop cher",
  },
  {
    id: "c2",
    day: "Mar",
    hook: "Le silence qui fait signer",
    angle: "Technique du silence après l'annonce du prix",
    status: "ready",
    objection: "Je dois réfléchir",
  },
  {
    id: "c3",
    day: "Mer",
    hook: "Ton prospect dit « je dois en parler à… »",
    angle: "Isoler la vraie objection en 2 questions",
    status: "ready",
    objection: "Décision partagée",
  },
  {
    id: "c4",
    day: "Jeu",
    hook: "3 phrases qui tuent un call",
    angle: "Ce qu'un closer ne devrait jamais dire",
    status: "idea",
  },
  {
    id: "c5",
    day: "Ven",
    hook: "Comment je prépare un call en 5 min",
    angle: "Mini-routine de briefing avant chaque RDV",
    status: "idea",
    objection: "Manque de préparation",
  },
];

export const FRIDAY_BATCHING = {
  when: "Vendredi · 08:55 → 12:00",
  steps: [
    "Relire les hooks « Prêt à filmer » (5 min)",
    "Tournage enchaîné, une prise par angle (2 h)",
    "Marquer chaque carte comme « Publié » à l'export",
  ],
};

export const SECRETARY_REQUESTS: SecretaryRequest[] = [
  {
    id: "s1",
    text: "Client Andréa — demande de report du RDV de jeudi",
    pole: "acquisition",
    minutes: 10,
    slot: "Auj. 15:30",
    deadline: "Réponse avant 18:00",
    priority: "P2",
  },
  {
    id: "s2",
    text: "Studio K. — envoyer le récap d'audit + prochaines étapes",
    pole: "delivery",
    minutes: 20,
    slot: "Auj. 16:30",
    deadline: "Réponse avant demain 10:00",
    priority: "P1",
  },
];

export const JEREMY_TASKS: JeremyTask[] = [
  {
    id: "j1",
    title: "Préparer le contrat Studio K. (signature)",
    source: "Notion",
    priority: "P1",
    slot: "Auto → Auj. 17:30",
  },
  {
    id: "j2",
    title: "Mettre à jour le CRM après les calls du jour",
    source: "Slack",
    priority: "P3",
    slot: "Auto → Demain 09:00",
  },
];

export const MARKET_RESEARCH = {
  title: "US Market Benchmarking",
  when: "Dimanche · 10:00 → 10:45",
  template: [
    "Nouveau framework repéré",
    "Script / accroche à tester",
    "Idée d'A/B test cette semaine",
  ],
};
