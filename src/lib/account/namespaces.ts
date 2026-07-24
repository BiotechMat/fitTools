/**
 * The account namespace registry (ACCOUNTS.md §6.2) — the single source of
 * truth for every savable surface. One entry per namespace: its consent
 * flag, the change events that signal a local edit, `collect` (snapshot the
 * device's current document, serialised), `apply` (adopt a merged document
 * locally) and `merge` over the wire format. The sync engine, the store
 * API's validation, export and delete-all are all driven from this list, so
 * adding a savable surface is a store module + one entry here + a save
 * affordance (§6.5) — never a server change.
 *
 * Consent rule (ACCOUNTS §7.2): `healthFlavoured: true` namespaces sync only
 * with an active health-storage consent AND a 16+ age band; the rest sync
 * for every signed-in band. The `bloodwork` namespace is DELIBERATELY absent
 * until A4 — the server rejects unknown namespaces, which IS the pre-A4
 * gate in code (§6.4).
 *
 * Merges take and return the wire format (raw JSON strings): each side is
 * tolerant-parsed by the namespace's own parser first, so corrupt or foreign
 * input degrades to empty and a merge widens, never throws — the server
 * re-parses with these same functions and never trusts the wire.
 */

import {
  parseHistory,
  serializeHistory,
  readRawHistory,
  writeHistory,
  HISTORY_CHANGE_EVENT,
} from "@/lib/history";
import {
  parseDashboard,
  serializeDashboard,
  readRawDashboard,
  writeDashboard,
  DASHBOARD_CHANGE_EVENT,
} from "@/lib/dashboard-store";
import {
  parseDailyStore,
  serializeDailyStore,
  readRawDailyStore,
  writeDailyStore,
  DAILY_CHANGE_EVENT,
} from "@/lib/daily-store";
import {
  parsePulseStore,
  serializePulseStore,
  readRawPulseStore,
  writePulseStore,
  PULSE_CHANGE_EVENT,
} from "@/lib/pulse-store";
import { mergeDaily, mergeDashboard, mergeHistory, mergePulse } from "@/lib/account/merge";
import {
  favouritesStore,
  mergeCollections,
  parseCollection,
  serializeCollection,
  stackStore,
  trainingStore,
  type CollectionStore,
} from "@/lib/account/collections";
import {
  collectArcadeDoc,
  distributeArcadeDoc,
  mergeArcadeDocs,
  parseArcadeDoc,
  serializeArcadeDoc,
} from "@/lib/account/arcade-doc";
import {
  collectPrefsDoc,
  distributePrefsDoc,
  mergePrefsDocs,
  parsePrefsDoc,
  serializePrefsDoc,
  PREFS_CHANGE_EVENTS,
} from "@/lib/account/prefs-doc";

/** Grows at A4 with `bloodwork` (its own namespace + consent kind). */
export type AccountNamespaceKey =
  | "history"
  | "dashboard"
  | "daily"
  | "pulse"
  | "arcade"
  | "stack"
  | "training"
  | "favourites"
  | "prefs";

export interface AccountNamespace {
  key: AccountNamespaceKey;
  /** Document schema version carried in `store_documents.version`. */
  version: 1;
  /**
   * Requires the health-storage consent + a 16+ age band to sync
   * (ACCOUNTS §6.2/§7.2). Enforced server-side; mirrored client-side so the
   * engine never even sends a gated document without consent.
   */
  healthFlavoured: boolean;
  /**
   * Same-tab events that signal a local edit (the engine debounce-pushes on
   * these). Empty = no reactive signal; the engine pushes this namespace on
   * its load/pagehide cycles instead (the arcade case — the games write
   * their own keys without events, by design).
   */
  changeEvents: readonly string[];
  /** Snapshot the device's current document, serialised. SSR-safe. */
  collect: () => string;
  /** Adopt a (merged) document locally. Guarded; never throws. */
  apply: (raw: string) => void;
  /**
   * Merge two serialised documents (base, overlay) → serialised result.
   * Overlay should be the more recently updated side (see merge.ts).
   */
  merge: (baseRaw: string | null, overlayRaw: string | null) => string;
}

function collectionNamespace(
  key: AccountNamespaceKey,
  store: CollectionStore,
  healthFlavoured: boolean,
): AccountNamespace {
  return {
    key,
    version: 1,
    healthFlavoured,
    changeEvents: [store.changeEvent],
    collect: () => serializeCollection(parseCollection(store.readRaw())),
    apply: (raw) => {
      store.write(parseCollection(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializeCollection(mergeCollections(parseCollection(baseRaw), parseCollection(overlayRaw))),
  };
}

export const ACCOUNT_NAMESPACES: readonly AccountNamespace[] = [
  {
    key: "history",
    version: 1,
    healthFlavoured: true,
    changeEvents: [HISTORY_CHANGE_EVENT],
    collect: () => serializeHistory(parseHistory(readRawHistory())),
    apply: (raw) => {
      writeHistory(parseHistory(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializeHistory(mergeHistory(parseHistory(baseRaw), parseHistory(overlayRaw))),
  },
  {
    key: "dashboard",
    version: 1,
    healthFlavoured: true,
    changeEvents: [DASHBOARD_CHANGE_EVENT],
    collect: () => serializeDashboard(parseDashboard(readRawDashboard())),
    apply: (raw) => {
      writeDashboard(parseDashboard(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializeDashboard(mergeDashboard(parseDashboard(baseRaw), parseDashboard(overlayRaw))),
  },
  {
    key: "daily",
    version: 1,
    healthFlavoured: false,
    changeEvents: [DAILY_CHANGE_EVENT],
    collect: () => serializeDailyStore(parseDailyStore(readRawDailyStore())),
    apply: (raw) => {
      writeDailyStore(parseDailyStore(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializeDailyStore(mergeDaily(parseDailyStore(baseRaw), parseDailyStore(overlayRaw))),
  },
  {
    key: "pulse",
    version: 1,
    healthFlavoured: false,
    changeEvents: [PULSE_CHANGE_EVENT],
    collect: () => serializePulseStore(parsePulseStore(readRawPulseStore())),
    apply: (raw) => {
      writePulseStore(parsePulseStore(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializePulseStore(mergePulse(parsePulseStore(baseRaw), parsePulseStore(overlayRaw))),
  },
  {
    key: "arcade",
    version: 1,
    healthFlavoured: false,
    changeEvents: [], // games write their keys without events — pushed on load/pagehide
    collect: () => serializeArcadeDoc(collectArcadeDoc()),
    apply: (raw) => {
      distributeArcadeDoc(parseArcadeDoc(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializeArcadeDoc(mergeArcadeDocs(parseArcadeDoc(baseRaw), parseArcadeDoc(overlayRaw))),
  },
  collectionNamespace("stack", stackStore, true),
  collectionNamespace("training", trainingStore, false),
  collectionNamespace("favourites", favouritesStore, false),
  {
    key: "prefs",
    version: 1,
    healthFlavoured: false,
    changeEvents: PREFS_CHANGE_EVENTS,
    collect: () => serializePrefsDoc(collectPrefsDoc()),
    apply: (raw) => {
      distributePrefsDoc(parsePrefsDoc(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializePrefsDoc(mergePrefsDocs(parsePrefsDoc(baseRaw), parsePrefsDoc(overlayRaw))),
  },
];

export function namespaceByKey(key: string): AccountNamespace | undefined {
  return ACCOUNT_NAMESPACES.find((ns) => ns.key === key);
}

export function isAccountNamespaceKey(key: string): key is AccountNamespaceKey {
  return ACCOUNT_NAMESPACES.some((ns) => ns.key === key);
}

/**
 * Registry invariants, asserted by a unit test so a broken entry fails the
 * build (the validateMetrics / validateCorpus pattern). Returns problem
 * descriptions; empty = valid.
 */
export function validateNamespaces(): string[] {
  const problems: string[] = [];
  const keys = new Set<string>();
  const changeEvents = new Set<string>();
  for (const ns of ACCOUNT_NAMESPACES) {
    if (keys.has(ns.key)) problems.push(`duplicate namespace key: ${ns.key}`);
    keys.add(ns.key);
    for (const event of ns.changeEvents) {
      if (changeEvents.has(event)) problems.push(`duplicate change event: ${event}`);
      changeEvents.add(event);
      if (!event.startsWith("fittools:"))
        problems.push(`${ns.key}: change event outside the fittools:* convention`);
    }
    // The merge must tolerate garbage on either side and round-trip empties.
    try {
      const merged = ns.merge(null, null);
      JSON.parse(merged);
      const withGarbage = ns.merge("{not json", merged);
      JSON.parse(withGarbage);
    } catch {
      problems.push(`${ns.key}: merge threw or produced non-JSON`);
    }
    // Collect must be SSR-safe and produce parseable JSON.
    try {
      JSON.parse(ns.collect());
    } catch {
      problems.push(`${ns.key}: collect threw or produced non-JSON`);
    }
  }
  // The consent split must match ACCOUNTS.md §6.2 exactly.
  const expectedHealthFlavoured: Record<AccountNamespaceKey, boolean> = {
    history: true,
    dashboard: true,
    daily: false,
    pulse: false,
    arcade: false,
    stack: true,
    training: false,
    favourites: false,
    prefs: false,
  };
  for (const ns of ACCOUNT_NAMESPACES) {
    if (ns.healthFlavoured !== expectedHealthFlavoured[ns.key]) {
      problems.push(`${ns.key}: healthFlavoured flag disagrees with ACCOUNTS.md §6.2`);
    }
  }
  return problems;
}

/** Namespaces a signed-in user may sync given their consent/band state. */
export function syncableNamespaces(healthConsented: boolean): readonly AccountNamespace[] {
  return healthConsented
    ? ACCOUNT_NAMESPACES
    : ACCOUNT_NAMESPACES.filter((ns) => !ns.healthFlavoured);
}
