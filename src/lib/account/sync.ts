/**
 * The account sync engine (ACCOUNTS.md §6). Client-only, lazy-loaded — only
 * ever imported dynamically once a device carries the sign-in hint, so
 * anonymous visitors pay zero bytes and make zero requests (§4.5).
 *
 * Behaviour (§6.1): pull → merge → write-local → push on start; debounced
 * push (~2 s) on every store change event; conditional writes with the
 * per-document updatedAt etag — a 409 re-pulls, re-merges with the same
 * pure merge functions and re-pushes once, so a stale writer resolves by
 * merge, never by data loss. Local always keeps working; failed pushes
 * retry on the next change or page load. Namespaces without change events
 * (arcade) are pushed on start and pagehide.
 *
 * Consent gating is mirrored client-side (§7.2): health-flavoured
 * namespaces are not even collected for the wire without an active
 * health-storage consent — the server enforces the same rule
 * authoritatively.
 */

import {
  ACCOUNT_NAMESPACES,
  type AccountNamespace,
} from "@/lib/account/namespaces";
import { setAccountHint } from "@/lib/auth/session-probe";

const DEBOUNCE_MS = 2000;

interface ServerDocument {
  doc: string;
  updatedAt: string;
}

interface PullResponse {
  documents: Record<string, ServerDocument>;
  healthConsented: boolean;
}

interface EngineState {
  running: boolean;
  healthConsented: boolean;
  /** Last server etag per namespace (null = no server doc yet). */
  etags: Map<string, string | null>;
  /** Last document string pushed/adopted per namespace (skip no-op pushes). */
  lastSynced: Map<string, string>;
  timers: Map<string, ReturnType<typeof setTimeout>>;
  unsubscribers: (() => void)[];
}

const state: EngineState = {
  running: false,
  healthConsented: false,
  etags: new Map(),
  lastSynced: new Map(),
  timers: new Map(),
  unsubscribers: [],
};

function syncable(ns: AccountNamespace): boolean {
  return !ns.healthFlavoured || state.healthConsented;
}

async function pushNamespace(ns: AccountNamespace, allowRetry = true): Promise<void> {
  if (!state.running || !syncable(ns)) return;
  const doc = ns.collect();
  if (state.lastSynced.get(ns.key) === doc) return; // nothing new
  const etag = state.etags.get(ns.key);
  try {
    const response = await fetch(`/api/account/stores/${ns.key}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "If-Match": etag ?? "",
      },
      body: doc,
      keepalive: true,
    });
    if (response.ok) {
      const body: unknown = await response.json();
      const updatedAt =
        typeof body === "object" && body !== null
          ? (body as { updatedAt?: unknown }).updatedAt
          : undefined;
      if (typeof updatedAt === "string") state.etags.set(ns.key, updatedAt);
      state.lastSynced.set(ns.key, doc);
      return;
    }
    if (response.status === 409 && allowRetry) {
      // Stale writer (ACCOUNTS §6.1): adopt server + local via merge, retry once.
      const body: unknown = await response.json().catch(() => null);
      const current =
        typeof body === "object" && body !== null
          ? (body as { current?: { doc?: unknown; updatedAt?: unknown } | null }).current
          : null;
      if (current && typeof current.doc === "string" && typeof current.updatedAt === "string") {
        const merged = ns.merge(current.doc, ns.collect());
        ns.apply(merged);
        state.etags.set(ns.key, current.updatedAt);
        state.lastSynced.delete(ns.key);
        await pushNamespace(ns, false);
      } else {
        // Server doc vanished (e.g. consent revoked elsewhere) — re-pull soon.
        state.etags.set(ns.key, null);
      }
      return;
    }
    if (response.status === 403) {
      // Consent revoked / band-gated server-side — mirror it and stop sending.
      state.healthConsented = false;
      return;
    }
    if (response.status === 401) {
      // Session gone — stop the engine and clear the device hint.
      stopAccountSync();
      setAccountHint(false);
      return;
    }
    // 5xx / 503: leave lastSynced unset — the next change or load retries.
  } catch {
    // Offline — local keeps working; the next change or load retries (§2.2).
  }
}

function scheduleFlush(ns: AccountNamespace): void {
  const existing = state.timers.get(ns.key);
  if (existing !== undefined) clearTimeout(existing);
  state.timers.set(
    ns.key,
    setTimeout(() => {
      state.timers.delete(ns.key);
      void pushNamespace(ns);
    }, DEBOUNCE_MS),
  );
}

async function initialSync(): Promise<void> {
  let pull: PullResponse;
  try {
    const response = await fetch("/api/account/stores", {
      headers: { Accept: "application/json" },
    });
    if (response.status === 401) {
      stopAccountSync();
      setAccountHint(false);
      return;
    }
    if (!response.ok) return; // 503 (not configured) or transient — try next load
    pull = (await response.json()) as PullResponse;
  } catch {
    return;
  }
  state.healthConsented = pull.healthConsented === true;

  for (const ns of ACCOUNT_NAMESPACES) {
    if (!state.running) return;
    if (!syncable(ns)) continue;
    const server = pull.documents[ns.key];
    if (server !== undefined) {
      // Convention (merge.ts): overlay is the fresher side — this device.
      const merged = ns.merge(server.doc, ns.collect());
      ns.apply(merged);
      state.etags.set(ns.key, server.updatedAt);
      if (merged !== server.doc) {
        await pushNamespace(ns);
      } else {
        state.lastSynced.set(ns.key, merged);
      }
    } else {
      state.etags.set(ns.key, null);
      // First upload — but don't bother sending a canonical empty document.
      if (ns.collect() !== ns.merge(null, null)) await pushNamespace(ns);
    }
  }
}

function onPageHide(): void {
  // Flush anything pending, plus the event-less namespaces (arcade).
  for (const ns of ACCOUNT_NAMESPACES) {
    const timer = state.timers.get(ns.key);
    if (timer !== undefined) {
      clearTimeout(timer);
      state.timers.delete(ns.key);
    }
    void pushNamespace(ns);
  }
}

/** Start the engine (idempotent). Called by <AccountSync /> when signed in. */
export function startAccountSync(): void {
  if (typeof window === "undefined" || state.running) return;
  state.running = true;
  for (const ns of ACCOUNT_NAMESPACES) {
    for (const event of ns.changeEvents) {
      const handler = (): void => scheduleFlush(ns);
      window.addEventListener(event, handler);
      state.unsubscribers.push(() => window.removeEventListener(event, handler));
    }
  }
  const pagehide = (): void => onPageHide();
  window.addEventListener("pagehide", pagehide);
  state.unsubscribers.push(() => window.removeEventListener("pagehide", pagehide));
  void initialSync();
}

/** Stop and reset (sign-out, session expiry, tests). */
export function stopAccountSync(): void {
  state.running = false;
  for (const unsub of state.unsubscribers) unsub();
  state.unsubscribers = [];
  for (const timer of state.timers.values()) clearTimeout(timer);
  state.timers.clear();
  state.etags.clear();
  state.lastSynced.clear();
  state.healthConsented = false;
}

/** Re-run the full pull/merge/push cycle (after a consent change). */
export function resyncAccount(): void {
  if (!state.running) return;
  void initialSync();
}
