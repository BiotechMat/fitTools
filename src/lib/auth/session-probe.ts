/**
 * The nav session probe (ACCOUNTS.md §4.4/§4.5). Hand-written and tiny —
 * the Better Auth client never enters the shared bundle. Anonymous visitors
 * make **zero** extra requests: the probe only fetches when this device has
 * a local sign-in hint, set on successful sign-in and cleared on sign-out.
 * (If a user wipes localStorage the nav shows signed-out until they next
 * visit /account or sign in again — an honest, documented trade for keeping
 * every anonymous pageview static-only.)
 */

export const ACCOUNT_HINT_KEY = "fittools.account.hint";
export const ACCOUNT_CHANGE_EVENT = "fittools:account-change";

export interface ProbeSession {
  email: string;
  ageBand: string | null;
}

export type ProbeState =
  | { status: "unknown" }
  | { status: "signed-out" }
  | { status: "signed-in"; session: ProbeSession };

let cached: ProbeState = { status: "unknown" };
let inflight: Promise<ProbeState> | null = null;

export function hasAccountHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ACCOUNT_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAccountHint(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (on) window.localStorage.setItem(ACCOUNT_HINT_KEY, "1");
    else window.localStorage.removeItem(ACCOUNT_HINT_KEY);
    window.dispatchEvent(new Event(ACCOUNT_CHANGE_EVENT));
  } catch {
    // storage unavailable — probe stays hintless
  }
}

/**
 * Resolve the current session state. No hint → signed-out with no network.
 * With a hint, one GET to Better Auth's session endpoint, cached for the
 * page's lifetime (the server's ~5-min cookie cache does the heavier
 * lifting across navigations).
 */
export async function probeSession(): Promise<ProbeState> {
  if (typeof window === "undefined") return { status: "unknown" };
  if (!hasAccountHint()) return { status: "signed-out" };
  if (cached.status !== "unknown") return cached;
  if (inflight !== null) return inflight;
  inflight = (async (): Promise<ProbeState> => {
    try {
      const response = await fetch("/api/auth/get-session", {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) {
        cached = { status: "signed-out" };
        return cached;
      }
      const body: unknown = await response.json();
      const user =
        typeof body === "object" && body !== null
          ? (body as { user?: { email?: unknown; ageBand?: unknown } }).user
          : undefined;
      if (user && typeof user.email === "string") {
        cached = {
          status: "signed-in",
          session: {
            email: user.email,
            ageBand: typeof user.ageBand === "string" ? user.ageBand : null,
          },
        };
      } else {
        // Hint was stale (session expired or revoked) — clear it.
        setAccountHint(false);
        cached = { status: "signed-out" };
      }
      return cached;
    } catch {
      cached = { status: "signed-out" };
      return cached;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Drop the cached probe (after sign-in/out) so the next read re-fetches. */
export function resetProbe(): void {
  cached = { status: "unknown" };
}
