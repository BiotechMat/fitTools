/**
 * Better Auth handler (ACCOUNTS.md §4 — A1). All auth flows (magic link,
 * Google, Apple, session, sign-out) run through this one dynamic route.
 * With no DATABASE_URL configured the route degrades to 503 and the rest of
 * the site is unaffected (the house env-gating pattern). Tool pages remain
 * fully static — no middleware exists (§4.4).
 */

import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

export const runtime = "nodejs";

function disabled(): Response {
  return Response.json(
    { error: "accounts-not-configured" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

function buildHandler(method: "GET" | "POST"): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const auth = getAuth();
    if (auth === null) return disabled();
    const handlers = toNextJsHandler(auth);
    return handlers[method](request);
  };
}

export const GET = buildHandler("GET");
export const POST = buildHandler("POST");
