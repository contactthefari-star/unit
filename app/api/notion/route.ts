import { NextRequest, NextResponse } from "next/server";
import {
  normalizeIncoming,
  notionConfigStatus,
  verifyWebhookSecret,
} from "@/lib/notion";

// Toujours dynamique : on parle à une API externe, jamais de cache de build.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/notion
 * Renvoie l'état de configuration (sans exposer les secrets) — utile pour
 * l'indicateur de statut du cockpit.
 */
export function GET() {
  return NextResponse.json(notionConfigStatus());
}

/**
 * POST /api/notion
 * Webhook entrant depuis Notion (nouvelle tâche, modif, etc.).
 * - Gère le challenge de vérification initial de Notion.
 * - Sinon vérifie le secret partagé puis normalise le payload en tâche interne.
 */
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }

  // 1) Challenge de vérification (setup du webhook côté Notion)
  const challenge =
    (payload.verification_token as string) ?? (payload.challenge as string);
  if (challenge) {
    return NextResponse.json({ challenge });
  }

  // 2) Sécurité : secret partagé (header x-unit-signature)
  if (!verifyWebhookSecret(req.headers.get("x-unit-signature"))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 3) Normalisation → tâche interne à placer dans la grille chrono 80/20
  const task = normalizeIncoming(payload);
  if (!task) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // TODO (branchement) : persister `task` (DB / store) puis l'auto-planifier
  // via le moteur 80/20. Ici on renvoie la tâche normalisée.
  return NextResponse.json({ ok: true, task });
}
