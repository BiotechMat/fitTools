/**
 * The account namespace registry (ACCOUNTS.md §6.2) — the single source of
 * truth for every savable surface. One entry per namespace: its storage key,
 * change event, consent flag, and merge function over the wire format
 * (serialised documents). The sync engine, the store API's validation, export
 * and delete-all are all driven from this list, so adding a savable surface
 * is a store module + one entry here + a save affordance (§6.5) — never a
 * server change.
 *
 * Consent rule (ACCOUNTS §7.2): `healthFlavoured: true` namespaces sync only
 * with an active health-storage consent AND a 16+ age band; the rest sync for
 * every signed-in band. The `bloodwork` namespace does not exist here until
 * A4 — the server rejects unknown namespaces, which IS the pre-A4 gate.
 *
 * Merges take and return the wire format (raw JSON strings): each side is
 * tolerant-parsed by the namespace's own store parser first, so corrupt or
 * foreign input degrades to empty and a merge widens, never throws
 * (ACCOUNTS §6.4 — the server re-parses with these same functions and never
 * trusts the wire).
 */

import { parseHistory, serializeHistory, HISTORY_STORAGE_KEY, HISTORY_CHANGE_EVENT } from "@/lib/history";
import {
  parseDashboard,
  serializeDashboard,
  DASHBOARD_STORAGE_KEY,
  DASHBOARD_CHANGE_EVENT,
} from "@/lib/dashboard-store";
import {
  parseDailyStore,
  serializeDailyStore,
  DAILY_STORAGE_KEY,
  DAILY_CHANGE_EVENT,
} from "@/lib/daily-store";
import {
  parsePulseStore,
  serializePulseStore,
  PULSE_STORAGE_KEY,
  PULSE_CHANGE_EVENT,
} from "@/lib/pulse-store";
import { mergeDaily, mergeDashboard, mergeHistory, mergePulse } from "@/lib/account/merge";

/** Grows with the A2 build: arcade, stack, training, favourites, prefs. */
export type AccountNamespaceKey = "history" | "dashboard" | "daily" | "pulse";

export interface AccountNamespace {
  key: AccountNamespaceKey;
  /** The store's localStorage key — also what the sync engine reads/writes. */
  storageKey: string;
  /** The store's same-tab change event the engine subscribes to. */
  changeEvent: string;
  /** Document schema version carried in `store_documents.version`. */
  version: 1;
  /**
   * Requires the health-storage consent + a 16+ age band to sync
   * (ACCOUNTS §6.2/§7.2). Enforced server-side; mirrored client-side so the
   * engine never even sends a gated document without consent.
   */
  healthFlavoured: boolean;
  /**
   * Merge two serialised documents (base, overlay) → serialised result.
   * Overlay should be the more recently updated side (see merge.ts).
   */
  merge: (baseRaw: string | null, overlayRaw: string | null) => string;
}

export const ACCOUNT_NAMESPACES: readonly AccountNamespace[] = [
  {
    key: "history",
    storageKey: HISTORY_STORAGE_KEY,
    changeEvent: HISTORY_CHANGE_EVENT,
    version: 1,
    healthFlavoured: true,
    merge: (baseRaw, overlayRaw) =>
      serializeHistory(mergeHistory(parseHistory(baseRaw), parseHistory(overlayRaw))),
  },
  {
    key: "dashboard",
    storageKey: DASHBOARD_STORAGE_KEY,
    changeEvent: DASHBOARD_CHANGE_EVENT,
    version: 1,
    healthFlavoured: true,
    merge: (baseRaw, overlayRaw) =>
      serializeDashboard(mergeDashboard(parseDashboard(baseRaw), parseDashboard(overlayRaw))),
  },
  {
    key: "daily",
    storageKey: DAILY_STORAGE_KEY,
    changeEvent: DAILY_CHANGE_EVENT,
    version: 1,
    healthFlavoured: false,
    merge: (baseRaw, overlayRaw) =>
      serializeDailyStore(mergeDaily(parseDailyStore(baseRaw), parseDailyStore(overlayRaw))),
  },
  {
    key: "pulse",
    storageKey: PULSE_STORAGE_KEY,
    changeEvent: PULSE_CHANGE_EVENT,
    version: 1,
    healthFlavoured: false,
    merge: (baseRaw, overlayRaw) =>
      serializePulseStore(mergePulse(parsePulseStore(baseRaw), parsePulseStore(overlayRaw))),
  },
];

export function namespaceByKey(key: string): AccountNamespace | undefined {
  return ACCOUNT_NAMESPACES.find((ns) => ns.key === key);
}

/**
 * Registry invariants, asserted by a unit test so a broken entry fails the
 * build (the validateMetrics / validateCorpus pattern). Returns problem
 * descriptions; empty = valid.
 */
export function validateNamespaces(): string[] {
  const problems: string[] = [];
  const keys = new Set<string>();
  const storageKeys = new Set<string>();
  const changeEvents = new Set<string>();
  for (const ns of ACCOUNT_NAMESPACES) {
    if (keys.has(ns.key)) problems.push(`duplicate namespace key: ${ns.key}`);
    keys.add(ns.key);
    if (storageKeys.has(ns.storageKey))
      problems.push(`duplicate storage key: ${ns.storageKey}`);
    storageKeys.add(ns.storageKey);
    if (changeEvents.has(ns.changeEvent))
      problems.push(`duplicate change event: ${ns.changeEvent}`);
    changeEvents.add(ns.changeEvent);
    if (!ns.storageKey.startsWith("fittools."))
      problems.push(`${ns.key}: storage key outside the fittools.* convention`);
    if (!ns.changeEvent.startsWith("fittools:"))
      problems.push(`${ns.key}: change event outside the fittools:* convention`);
    // The merge must tolerate garbage on either side and round-trip empties.
    try {
      const merged = ns.merge(null, null);
      JSON.parse(merged);
      const withGarbage = ns.merge("{not json", merged);
      JSON.parse(withGarbage);
    } catch {
      problems.push(`${ns.key}: merge threw or produced non-JSON`);
    }
  }
  // The consent split must match ACCOUNTS.md §6.2 exactly.
  const expectedHealthFlavoured: Record<AccountNamespaceKey, boolean> = {
    history: true,
    dashboard: true,
    daily: false,
    pulse: false,
  };
  for (const ns of ACCOUNT_NAMESPACES) {
    if (ns.healthFlavoured !== expectedHealthFlavoured[ns.key]) {
      problems.push(`${ns.key}: healthFlavoured flag disagrees with ACCOUNTS.md §6.2`);
    }
  }
  return problems;
}
