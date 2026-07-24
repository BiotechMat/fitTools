/**
 * GET/POST /api/account/consent — the granular storage consents
 * (ACCOUNTS.md §7.2). Two kinds: "health-storage" (calculator history,
 * dashboard vitals, supplement stack — 16+ bands) and "bloodwork-storage"
 * (blood results — 18+ band; Mat 2026-07-24: manual entry and purchased
 * tests persist to the account). The server refuses a grant outside the
 * kind's band regardless of UI. Revoking a consent deletes the server
 * copies of exactly the namespaces it covered and keeps local ones.
 */

import { getSessionInfo } from "@/lib/auth/server";
import { bandAllowsConsent, type ConsentKind } from "@/lib/auth/shared";
import {
  dbEnabled,
  fetchConsents,
  grantConsent,
  revokeConsent,
  CONSENT_POLICY_VERSION,
} from "@/lib/account/db";
import { namespacesForConsent } from "@/lib/account/namespaces";

export const runtime = "nodejs";

const KINDS: readonly ConsentKind[] = ["health-storage", "bloodwork-storage"];

function isConsentKind(v: unknown): v is ConsentKind {
  return typeof v === "string" && (KINDS as readonly string[]).includes(v);
}

interface KindState {
  state: "never-asked" | "granted" | "revoked";
  eligible: boolean;
  grantedAt?: string;
  revokedAt?: string;
  policyVersion?: string;
}

export async function GET(request: Request): Promise<Response> {
  if (!dbEnabled()) {
    return Response.json({ error: "accounts-not-configured" }, { status: 503 });
  }
  const session = await getSessionInfo(request.headers);
  if (session === null) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  const rows = await fetchConsents(session.userId);
  const kinds: Record<string, KindState> = {};
  for (const kind of KINDS) {
    const row = rows.find((c) => c.kind === kind);
    kinds[kind] = {
      state:
        row === undefined ? "never-asked" : row.revokedAt === null ? "granted" : "revoked",
      eligible: bandAllowsConsent(kind, session.ageBand),
      ...(row !== undefined && row.revokedAt === null
        ? { grantedAt: row.grantedAt, policyVersion: row.policyVersion }
        : {}),
      ...(row !== undefined && row.revokedAt !== null ? { revokedAt: row.revokedAt } : {}),
    };
  }
  return Response.json(
    { ageBand: session.ageBand, kinds, policyVersion: CONSENT_POLICY_VERSION },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request): Promise<Response> {
  if (!dbEnabled()) {
    return Response.json({ error: "accounts-not-configured" }, { status: 503 });
  }
  const session = await getSessionInfo(request.headers);
  if (session === null) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-body" }, { status: 400 });
  }
  const r = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  if (!isConsentKind(r.kind) || typeof r.granted !== "boolean") {
    return Response.json({ error: "invalid-body" }, { status: 400 });
  }
  if (r.granted) {
    if (!bandAllowsConsent(r.kind, session.ageBand)) {
      return Response.json({ error: "age-band-not-eligible" }, { status: 403 });
    }
    await grantConsent(session.userId, r.kind);
  } else {
    await revokeConsent(session.userId, r.kind, namespacesForConsent(r.kind));
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
