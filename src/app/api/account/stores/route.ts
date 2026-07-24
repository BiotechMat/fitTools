/**
 * GET /api/account/stores — the initial pull (ACCOUNTS.md §6.4): every
 * stored document for the signed-in user, with per-document updatedAt etags
 * the client sends back on conditional PUTs. Namespaces the user's
 * consent/band state doesn't permit are simply absent (they were never
 * writable — the PUT gate is authoritative).
 */

import { getSessionInfo } from "@/lib/auth/server";
import { dbEnabled, fetchDocuments, hasActiveConsent } from "@/lib/account/db";
import { bandAllowsHealthStorage } from "@/lib/auth/server";
import { namespaceByKey } from "@/lib/account/namespaces";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  if (!dbEnabled()) {
    return Response.json({ error: "accounts-not-configured" }, { status: 503 });
  }
  const session = await getSessionInfo(request.headers);
  if (session === null) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  const healthConsented =
    bandAllowsHealthStorage(session.ageBand) &&
    (await hasActiveConsent(session.userId, "health-storage"));
  const rows = await fetchDocuments(session.userId);
  const documents: Record<string, { doc: string; updatedAt: string }> = {};
  for (const row of rows) {
    const ns = namespaceByKey(row.namespace);
    if (ns === undefined) continue; // unknown/retired namespace — never served
    if (ns.healthFlavoured && !healthConsented) continue;
    documents[row.namespace] = { doc: row.doc, updatedAt: row.updatedAt };
  }
  return Response.json(
    { documents, healthConsented },
    { headers: { "Cache-Control": "no-store" } },
  );
}
