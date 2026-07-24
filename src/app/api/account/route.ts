/**
 * DELETE /api/account — erasure (ACCOUNTS.md §7.3): immediate hard delete
 * of everything — store documents, consents, sessions, linked provider
 * accounts and the user record. The one honest caveat (provider backup
 * tail, ~7 days) is disclosed in the §7 posture, not here in code.
 */

import { getSessionInfo } from "@/lib/auth/server";
import { dbEnabled, deleteAccount } from "@/lib/account/db";

export const runtime = "nodejs";

export async function DELETE(request: Request): Promise<Response> {
  if (!dbEnabled()) {
    return Response.json({ error: "accounts-not-configured" }, { status: 503 });
  }
  const session = await getSessionInfo(request.headers);
  if (session === null) {
    return Response.json({ error: "unauthorised" }, { status: 401 });
  }
  await deleteAccount(session.userId);
  return Response.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
}
