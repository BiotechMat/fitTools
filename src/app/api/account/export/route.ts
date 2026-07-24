/**
 * GET /api/account/export — portability (ACCOUNTS.md §7.3): everything we
 * hold for the signed-in user, one JSON file, no exceptions. Documents are
 * embedded parsed (not as strings) so the export is directly readable.
 */

import { getSessionInfo } from "@/lib/auth/server";
import { dbEnabled, fetchConsents, fetchDocuments } from "@/lib/account/db";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  if (!dbEnabled()) {
    return Response.json({ error: "accounts-not-configured" }, { status: 503 });
  }
  const session = await getSessionInfo(request.headers);
  if (session === null) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  const [rows, consents] = await Promise.all([
    fetchDocuments(session.userId),
    fetchConsents(session.userId),
  ]);
  const documents: Record<string, { updatedAt: string; document: unknown }> = {};
  for (const row of rows) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(row.doc);
    } catch {
      parsed = null;
    }
    documents[row.namespace] = { updatedAt: row.updatedAt, document: parsed };
  }
  const payload = {
    exportedAt: new Date().toISOString(),
    account: { email: session.email, ageBand: session.ageBand },
    consents,
    documents,
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="fittools-export.json"',
      "Cache-Control": "no-store",
    },
  });
}
