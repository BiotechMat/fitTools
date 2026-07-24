/**
 * Server-side auth (ACCOUNTS.md §4 — A1). Better Auth over Neon Postgres,
 * constructed lazily and **env-gated**: with no DATABASE_URL the site builds,
 * runs and stays byte-identical signed-out (the house degradation pattern —
 * same as Pulse without its API key). Nothing here is imported by client
 * code; the auth client lives in `client.ts` and loads only in the
 * /signin and /account chunks (§4.5 JS-budget rule).
 *
 * Decisions implemented (ACCOUNTS §9): magic link + Google + Apple ·
 * 60-day rolling sessions with a ~5-min signed cookie cache · database-backed
 * rate limiting (in-memory counters don't survive serverless instances) ·
 * a self-declared age band on the user record (band only, never a date of
 * birth — §7.7) · account linking across providers sharing a verified email
 * (the Apple-private-relay caveat is §4.1's accepted papercut).
 */

import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "@neondatabase/serverless";
import { SITE_URL } from "@/lib/site";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import { isAgeBand, type AgeBand } from "@/lib/auth/shared";

export { AGE_BANDS, bandAllowsHealthStorage, isAgeBand, type AgeBand } from "@/lib/auth/shared";

const SIXTY_DAYS_S = 60 * 60 * 24 * 60;
const COOKIE_CACHE_S = 60 * 5;
const MAGIC_LINK_TTL_S = 60 * 15;

/** True when auth is configured for this deployment (DATABASE_URL present). */
export function authEnabled(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
}

function buildAuth() {
  const socialProviders: {
    google?: { clientId: string; clientSecret: string };
    apple?: { clientId: string; clientSecret: string };
  } = {};
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
    socialProviders.apple = {
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    };
  }

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: new Pool({ connectionString: process.env.DATABASE_URL }),
    session: {
      expiresIn: SIXTY_DAYS_S,
      cookieCache: { enabled: true, maxAge: COOKIE_CACHE_S },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
    },
    user: {
      additionalFields: {
        // Self-declared age band — the band only, never a date of birth
        // (ACCOUNTS §7.7 data minimisation). Set at first sign-in.
        ageBand: { type: "string", required: false, input: true },
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "apple"],
      },
    },
    socialProviders,
    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_TTL_S,
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail(email, url);
        },
      }),
      nextCookies(),
    ],
  });
}

/** Inferred from construction so plugin/session typing flows through. */
type Auth = ReturnType<typeof buildAuth>;

let instance: Auth | null = null;

/**
 * The lazily-constructed Better Auth instance, or null when the deployment
 * carries no database (auth features degrade to 503 at the route; the rest
 * of the site is unaffected).
 */
export function getAuth(): Auth | null {
  if (!authEnabled()) return null;
  if (instance === null) instance = buildAuth();
  return instance;
}

export interface SessionInfo {
  userId: string;
  email: string;
  ageBand: AgeBand | null;
}

/**
 * Resolve the session behind a request, or null (signed out / auth
 * disabled). The account API routes gate on this.
 */
export async function getSessionInfo(headers: Headers): Promise<SessionInfo | null> {
  const auth = getAuth();
  if (auth === null) return null;
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const user = session.user as typeof session.user & { ageBand?: unknown };
  return {
    userId: user.id,
    email: user.email,
    ageBand: isAgeBand(user.ageBand) ? user.ageBand : null,
  };
}
