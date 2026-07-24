/**
 * The account namespace registry (ACCOUNTS.md §6.2) — the single source of
 * truth for every savable surface. One entry per namespace: its consent
 * requirement, the change events that signal a local edit, `collect`
 * (snapshot the device's current document, serialised), `apply` (adopt a
 * merged document locally) and `merge` over the wire format. The sync
 * engine, the store API's validation, export and delete-all are all driven
 * from this list, so adding a savable surface is a store module + one entry
 * here + a save affordance (§6.5) — never a server change.
 *
 * Consent rule (ACCOUNTS §7.2/§7.7): a namespace with `consentKind` syncs
 * only with that consent active AND the band it demands — "health-storage"
 * (history, dashboard, stack) needs 16+, "bloodwork-storage" (blood
 * results — Mat, 2026-07-24: manual now, purchased-test auto-population
 * later) needs 18+. Enforced server-side; mirrored client-side so the
 * engine never even sends a gated document without consent.
 *
 * Blood values travel ONLY under the `bloodwork` namespace: the dashboard
 * document strips its biomarkers at collect (and the server rejects any
 * dashboard document carrying them), so the two consents can never leak
 * into each other.
 *
 * Merges take and return the wire format (raw JSON strings): each side is
 * tolerant-parsed by the namespace's own parser first, so corrupt or
 * foreign input degrades to empty and a merge widens, never throws — the
 * server re-parses with these same functions and never trusts the wire.
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
  readDashboard,
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
import {
  BLOODWORK_CHANGE_EVENTS,
  collectBloodworkDoc,
  distributeBloodworkDoc,
  mergeBloodworkDocs,
  parseBloodworkDoc,
  serializeBloodworkDoc,
} from "@/lib/account/bloodwork-doc";
import type { ConsentKind } from "@/lib/auth/shared";

export type AccountNamespaceKey =
  | "history"
  | "dashboard"
  | "daily"
  | "pulse"
  | "arcade"
  | "stack"
  | "training"
  | "favourites"
  | "prefs"
  | "bloodwork";

export interface AccountNamespace {
  key: AccountNamespaceKey;
  /** Document schema version carried in `store_documents.version`. */
  version: 1;
  /**
   * The consent this namespace requires to sync, if any. Band rules ride on
   * the kind (shared.ts): health-storage → 16+, bloodwork-storage → 18+.
   * Undefined = syncs for every signed-in band with no extra consent.
   */
  consentKind?: ConsentKind;
  /**
   * Same-tab events that signal a local edit (the engine debounce-pushes on
   * these). May be shared between namespaces reading the same store (the
   * dashboard/bloodwork pair). Empty = no reactive signal; pushed on the
   * engine's load/pagehide cycles instead (the arcade case).
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
  consentKind?: ConsentKind,
): AccountNamespace {
  return {
    key,
    version: 1,
    ...(consentKind !== undefined ? { consentKind } : {}),
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
    consentKind: "health-storage",
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
    consentKind: "health-storage",
    changeEvents: [DASHBOARD_CHANGE_EVENT],
    // Biomarkers are STRIPPED from this namespace's wire document — blood
    // values travel only under `bloodwork` and its own consent.
    collect: () =>
      serializeDashboard({ ...parseDashboard(readRawDashboard()), biomarkers: [] }),
    apply: (raw) => {
      // Adopt vitals + metrics; preserve this device's local readings.
      const incoming = parseDashboard(raw);
      writeDashboard({ ...incoming, biomarkers: readDashboard().biomarkers });
    },
    merge: (baseRaw, overlayRaw) =>
      serializeDashboard({
        ...mergeDashboard(parseDashboard(baseRaw), parseDashboard(overlayRaw)),
        biomarkers: [],
      }),
  },
  {
    key: "daily",
    version: 1,
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
    changeEvents: [], // games write their keys without events — pushed on load/pagehide
    collect: () => serializeArcadeDoc(collectArcadeDoc()),
    apply: (raw) => {
      distributeArcadeDoc(parseArcadeDoc(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializeArcadeDoc(mergeArcadeDocs(parseArcadeDoc(baseRaw), parseArcadeDoc(overlayRaw))),
  },
  collectionNamespace("stack", stackStore, "health-storage"),
  collectionNamespace("training", trainingStore),
  collectionNamespace("favourites", favouritesStore),
  {
    key: "prefs",
    version: 1,
    changeEvents: PREFS_CHANGE_EVENTS,
    collect: () => serializePrefsDoc(collectPrefsDoc()),
    apply: (raw) => {
      distributePrefsDoc(parsePrefsDoc(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializePrefsDoc(mergePrefsDocs(parsePrefsDoc(baseRaw), parsePrefsDoc(overlayRaw))),
  },
  {
    key: "bloodwork",
    version: 1,
    consentKind: "bloodwork-storage",
    changeEvents: BLOODWORK_CHANGE_EVENTS,
    collect: () => serializeBloodworkDoc(collectBloodworkDoc()),
    apply: (raw) => {
      distributeBloodworkDoc(parseBloodworkDoc(raw));
    },
    merge: (baseRaw, overlayRaw) =>
      serializeBloodworkDoc(
        mergeBloodworkDocs(parseBloodworkDoc(baseRaw), parseBloodworkDoc(overlayRaw)),
      ),
  },
];

export function namespaceByKey(key: string): AccountNamespace | undefined {
  return ACCOUNT_NAMESPACES.find((ns) => ns.key === key);
}

export function isAccountNamespaceKey(key: string): key is AccountNamespaceKey {
  return ACCOUNT_NAMESPACES.some((ns) => ns.key === key);
}

/** Namespaces covered by a given consent kind (revocation deletes these). */
export function namespacesForConsent(kind: ConsentKind): readonly AccountNamespaceKey[] {
  return ACCOUNT_NAMESPACES.filter((ns) => ns.consentKind === kind).map((ns) => ns.key);
}

export interface ConsentFlags {
  healthStorage: boolean;
  bloodworkStorage: boolean;
}

export function consentSatisfied(ns: AccountNamespace, consents: ConsentFlags): boolean {
  if (ns.consentKind === undefined) return true;
  return ns.consentKind === "health-storage" ? consents.healthStorage : consents.bloodworkStorage;
}

/**
 * Registry invariants, asserted by a unit test so a broken entry fails the
 * build (the validateMetrics / validateCorpus pattern). Returns problem
 * descriptions; empty = valid.
 */
export function validateNamespaces(): string[] {
  const problems: string[] = [];
  const keys = new Set<string>();
  for (const ns of ACCOUNT_NAMESPACES) {
    if (keys.has(ns.key)) problems.push(`duplicate namespace key: ${ns.key}`);
    keys.add(ns.key);
    for (const event of ns.changeEvents) {
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
  const expectedConsent: Record<AccountNamespaceKey, ConsentKind | undefined> = {
    history: "health-storage",
    dashboard: "health-storage",
    daily: undefined,
    pulse: undefined,
    arcade: undefined,
    stack: "health-storage",
    training: undefined,
    favourites: undefined,
    prefs: undefined,
    bloodwork: "bloodwork-storage",
  };
  for (const ns of ACCOUNT_NAMESPACES) {
    if (ns.consentKind !== expectedConsent[ns.key]) {
      problems.push(`${ns.key}: consentKind disagrees with ACCOUNTS.md §6.2`);
    }
  }
  return problems;
}
