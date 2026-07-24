/**
 * PUT /api/account/stores/[namespace] — conditional document upsert
 * (ACCOUNTS.md §6.4). The gates, in order:
 *
 *   503  accounts not configured          401  no session
 *   404  unknown namespace                     (this IS the pre-A4 bloodwork
 *                                              gate — the namespace does not
 *                                              exist server-side)
 *   403  health-flavoured namespace without an active health-storage consent
 *        or with an under-16 age band (ACCOUNTS §7.2/§7.7)
 *   413  document over the size cap
 *   422  a dashboard document carrying biomarker readings (pre-A4 gate)
 *   428  missing If-Match precondition
 *   409  stale etag — body carries the current document to re-merge against
 *
 * The stored document is the namespace's tolerant re-parse of the wire body
 * (never the raw wire bytes): garbage in degrades to empty, exactly as the
 * client-side stores behave.
 */

import { bandAllowsHealthStorage, getSessionInfo } from "@/lib/auth/server";
import { dbEnabled, fetchDocument, hasActiveConsent, putDocument } from "@/lib/account/db";
import { namespaceByKey } from "@/lib/account/namespaces";
import { parseDashboard } from "@/lib/dashboard-store";

export const runtime = "nodejs";

/** ~128 kB — an order of magnitude above real document sizes (ACCOUNTS §6.4). */
const MAX_DOC_BYTES = 128 * 1024;

export async function PUT(
  request: Request,
  context: { params: Promise<{ namespace: string }> },
): Promise<Response> {
  if (!dbEnabled()) {
    return Response.json({ error: "accounts-not-configured" }, { status: 503 });
  }
  const session = await getSessionInfo(request.headers);
  if (session === null) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  const { namespace } = await context.params;
  const ns = namespaceByKey(namespace);
  if (ns === undefined) {
    return Response.json({ error: "unknown-namespace" }, { status: 404 });
  }
  if (ns.healthFlavoured) {
    const allowed =
      bandAllowsHealthStorage(session.ageBand) &&
      (await hasActiveConsent(session.userId, "health-storage"));
    if (!allowed) {
      return Response.json({ error: "consent-required" }, { status: 403 });
    }
  }

  const raw = await request.text();
  if (raw.length > MAX_DOC_BYTES) {
    return Response.json({ error: "document-too-large" }, { status: 413 });
  }
  // Tolerant re-parse via the namespace's own merge with an empty base:
  // whatever survives is exactly what the client-side parser would keep.
  const sanitised = ns.merge(null, raw);

  if (ns.key === "dashboard" && parseDashboard(sanitised).biomarkers.length > 0) {
    // Blood values do not cross until A4 (ACCOUNTS §3.2/§6.4).
    return Response.json({ error: "biomarkers-not-accepted" }, { status: 422 });
  }

  const ifMatch = request.headers.get("If-Match");
  if (ifMatch === null) {
    return Response.json({ error: "precondition-required" }, { status: 428 });
  }
  const expected = ifMatch === "" || ifMatch === "null" ? null : ifMatch;

  const updatedAt = await putDocument(session.userId, ns.key, ns.version, sanitised, expected);
  if (updatedAt === null) {
    const current = await fetchDocument(session.userId, ns.key);
    return Response.json(
      {
        error: "conflict",
        current: current === null ? null : { doc: current.doc, updatedAt: current.updatedAt },
      },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }
  return Response.json({ updatedAt }, { headers: { "Cache-Control": "no-store" } });
}
