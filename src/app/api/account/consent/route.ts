/**
 * GET/POST /api/account/consent — the granular health-storage consent
 * (ACCOUNTS.md §7.2). GET returns the user's consent state; POST grants or
 * revokes. Granting requires a 16+ age band (§7.7 — under-16s are never
 * offered this consent and the server refuses it regardless of UI).
 * Revoking deletes the gated server copies and keeps local ones.
 */

import { bandAllowsHealthStorage, getSessionInfo } from "@/lib/auth/server";
import {
  dbEnabled,
  fetchConsents,
  grantConsent,
  revokeConsent,
  CONSENT_POLICY_VERSION,
} from "@/lib/account/db";
import { ACCOUNT_NAMESPACES } from "@/lib/account/namespaces";

export const runtime = "nodejs";

const HEALTH_NAMESPACES = ACCOUNT_NAMESPACES.filter((ns) => ns.healthFlavoured).map(
  (ns) => ns.key,
);

export async function GET(request: Request): Promise<Response> {
  if (!dbEnabled()) {
    return Response.json({ error: "accounts-not-configured" }, { status: 503 });
  }
  const session = await getSessionInfo(request.headers);
  if (session === null) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  const consents = await fetchConsents(session.userId);
  const health = consents.find((c) => c.kind === "health-storage");
  return Response.json(
    {
      ageBand: session.ageBand,
      eligibleForHealthStorage: bandAllowsHealthStorage(session.ageBand),
      healthStorage:
        health === undefined
          ? { state: "never-asked" }
          : health.revokedAt === null
            ? { state: "granted", grantedAt: health.grantedAt, policyVersion: health.policyVersion }
            : { state: "revoked", revokedAt: health.revokedAt },
      policyVersion: CONSENT_POLICY_VERSION,
    },
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
  if (r.kind !== "health-storage" || typeof r.granted !== "boolean") {
    return Response.json({ error: "invalid-body" }, { status: 400 });
  }
  if (r.granted) {
    if (!bandAllowsHealthStorage(session.ageBand)) {
      return Response.json({ error: "age-band-not-eligible" }, { status: 403 });
    }
    await grantConsent(session.userId, "health-storage");
  } else {
    await revokeConsent(session.userId, "health-storage", HEALTH_NAMESPACES);
  }
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
