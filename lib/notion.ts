/**
 * Notion two-way sync — structure prête à brancher.
 *
 * Renseigne les variables d'environnement (voir .env.example) puis les
 * fonctions ci-dessous poussent/récupèrent les données vers les bases Notion
 * de l'équipe (Arthur, Jérémy, André) sans jamais ouvrir l'UI Notion.
 *
 * Aucune clé n'est en dur : tout vient de process.env.
 */

import type { JeremyTask, Priority } from "./types";

const NOTION_API = "https://api.notion.com/v1";

export const NOTION_ENV = {
  apiKey: process.env.NOTION_API_KEY ?? "",
  version: process.env.NOTION_VERSION ?? "2022-06-28",
  webhookSecret: process.env.NOTION_WEBHOOK_SECRET ?? "",
  db: {
    tasks: process.env.NOTION_DB_TASKS ?? "",
    content: process.env.NOTION_DB_CONTENT ?? "",
    crm: process.env.NOTION_DB_CRM ?? "",
  },
  /** Base par membre d'équipe (id de database Notion). */
  team: {
    arthur: process.env.NOTION_DB_ARTHUR ?? "",
    jeremy: process.env.NOTION_DB_JEREMY ?? "",
    andre: process.env.NOTION_DB_ANDRE ?? "",
  },
} as const;

export type TeamMember = keyof typeof NOTION_ENV.team;

export function notionEnabled(): boolean {
  return Boolean(NOTION_ENV.apiKey);
}

/** État de configuration (sans exposer les secrets) — pour l'UI de statut. */
export function notionConfigStatus() {
  return {
    connected: notionEnabled(),
    databases: {
      Tâches: Boolean(NOTION_ENV.db.tasks),
      Contenu: Boolean(NOTION_ENV.db.content),
      CRM: Boolean(NOTION_ENV.db.crm),
      Arthur: Boolean(NOTION_ENV.team.arthur),
      Jérémy: Boolean(NOTION_ENV.team.jeremy),
      André: Boolean(NOTION_ENV.team.andre),
    },
  };
}

class NotionNotConfigured extends Error {
  constructor() {
    super("Notion n'est pas configuré (NOTION_API_KEY manquante).");
    this.name = "NotionNotConfigured";
  }
}

async function notionFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!notionEnabled()) throw new NotionNotConfigured();
  const res = await fetch(`${NOTION_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${NOTION_ENV.apiKey}`,
      "Notion-Version": NOTION_ENV.version,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    // Notion est une source externe : jamais de cache silencieux.
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Notion API ${res.status}: ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* SORTANT — pousser une tâche vers une base Notion                    */
/* ------------------------------------------------------------------ */

export interface OutboundTask {
  title: string;
  priority: Priority;
  slot?: string;
  pole?: string;
  deadline?: string;
}

/**
 * Crée une page-tâche dans une base Notion.
 * ⚠️ Les noms de propriétés ("Name", "Priorité"…) doivent correspondre
 * EXACTEMENT au schéma de ta base Notion — adapte-les ici si besoin.
 */
export async function pushTaskToNotion(
  task: OutboundTask,
  databaseId: string = NOTION_ENV.db.tasks,
): Promise<{ id: string; url?: string }> {
  if (!databaseId) throw new Error("databaseId manquant pour pushTaskToNotion.");

  const body = {
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: task.title } }] },
      Priorité: { select: { name: task.priority } },
      ...(task.slot
        ? { Créneau: { rich_text: [{ text: { content: task.slot } }] } }
        : {}),
      ...(task.pole ? { Pôle: { select: { name: task.pole } } } : {}),
      ...(task.deadline
        ? { Deadline: { rich_text: [{ text: { content: task.deadline } }] } }
        : {}),
    },
  };

  const page = await notionFetch<{ id: string; url?: string }>("/pages", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { id: page.id, url: page.url };
}

/** Raccourci : pousser vers la base d'un membre d'équipe. */
export function pushTaskToMember(task: OutboundTask, member: TeamMember) {
  const databaseId = NOTION_ENV.team[member];
  if (!databaseId) throw new Error(`Base Notion non configurée pour ${member}.`);
  return pushTaskToNotion(task, databaseId);
}

/* ------------------------------------------------------------------ */
/* ENTRANT — normaliser un payload webhook Notion en tâche interne     */
/* ------------------------------------------------------------------ */

type AnyRecord = Record<string, unknown>;

function readTitle(props: AnyRecord): string {
  for (const key of Object.keys(props)) {
    const p = props[key] as AnyRecord;
    if (p?.type === "title" && Array.isArray(p.title)) {
      return (p.title as AnyRecord[])
        .map((t) => (t?.plain_text as string) ?? "")
        .join("")
        .trim();
    }
  }
  return "Tâche Notion";
}

function readSelect(props: AnyRecord, name: string): string | undefined {
  const p = props[name] as AnyRecord | undefined;
  const sel = p?.select as AnyRecord | undefined;
  return (sel?.name as string) ?? undefined;
}

function toPriority(v: string | undefined): Priority {
  return v === "P1" || v === "P2" || v === "P3" ? v : "P3";
}

/**
 * Convertit une page Notion (reçue via webhook) en JeremyTask exploitable
 * par la grille chrono. Permissif : ne casse pas si des champs manquent.
 */
export function normalizeIncoming(payload: AnyRecord): JeremyTask | null {
  const page = (payload?.data ?? payload?.page ?? payload) as AnyRecord;
  const props = (page?.properties ?? {}) as AnyRecord;
  const title = readTitle(props);
  if (!title) return null;
  return {
    id: (page?.id as string) ?? `notion-${Date.now()}`,
    title,
    source: "Notion",
    priority: toPriority(readSelect(props, "Priorité")),
    slot: "Auto → à planifier",
  };
}

/** Vérifie le secret partagé d'un webhook entrant. */
export function verifyWebhookSecret(header: string | null): boolean {
  if (!NOTION_ENV.webhookSecret) return false; // refuse tant que non configuré
  return header === NOTION_ENV.webhookSecret;
}
