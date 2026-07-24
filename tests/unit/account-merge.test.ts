import { describe, expect, it } from "vitest";
import {
  mergeDaily,
  mergeDashboard,
  mergeHistory,
  mergePulse,
} from "@/lib/account/merge";
import {
  ACCOUNT_NAMESPACES,
  namespaceByKey,
  validateNamespaces,
} from "@/lib/account/namespaces";
import { parseHistory, serializeHistory, type HistoryFile } from "@/lib/history";
import type { DashboardProfile } from "@/lib/dashboard-store";
import { MAX_FREEZES, type DailyStore } from "@/lib/daily-store";
import type { PulseStore } from "@/lib/pulse-store";

const emptyHistory: HistoryFile = { version: 1, results: [] };

function history(results: HistoryFile["results"]): HistoryFile {
  return { version: 1, results };
}

function dashboard(partial: Partial<DashboardProfile>): DashboardProfile {
  return { version: 1, profile: {}, metrics: [], biomarkers: [], ...partial };
}

function daily(partial: Partial<DailyStore>): DailyStore {
  return {
    version: 1,
    results: {},
    streak: { current: 0, best: 0, freezes: 0, lastPlayed: null },
    ...partial,
  };
}

function pulse(partial: Partial<PulseStore>): PulseStore {
  return { version: 1, likes: [], saves: [], seen: [], affinity: {}, ...partial };
}

describe("mergeHistory (ACCOUNTS §6.2 — union by tool/day, latest wins, capped)", () => {
  it("unions entries from two devices, ordered chronologically", () => {
    const a = history([
      { tool: "tdee-calculator", value: 2500, savedAt: "2026-07-01T10:00:00.000Z" },
    ]);
    const b = history([
      { tool: "one-rep-max-calculator", value: 140, savedAt: "2026-06-30T10:00:00.000Z" },
    ]);
    const merged = mergeHistory(a, b);
    expect(merged.results).toHaveLength(2);
    expect(merged.results[0].tool).toBe("one-rep-max-calculator"); // chronological
    expect(merged.results[1].tool).toBe("tdee-calculator");
  });

  it("same tool + same local day: the later save wins, no duplicate", () => {
    const a = history([
      { tool: "tdee-calculator", value: 2400, savedAt: "2026-07-01T09:00:00.000Z" },
    ]);
    const b = history([
      { tool: "tdee-calculator", value: 2510, savedAt: "2026-07-01T18:00:00.000Z" },
    ]);
    const merged = mergeHistory(a, b);
    expect(merged.results).toHaveLength(1);
    expect(merged.results[0].value).toBe(2510);
  });

  it("neither side's unique entries are lost (the stale-tab race)", () => {
    // Desktop saved Tue+Wed; the stale phone tab holds Mon only + a new Thu save.
    const server = history([
      { tool: "tdee-calculator", value: 2400, savedAt: "2026-07-01T08:00:00.000Z" },
      { tool: "tdee-calculator", value: 2420, savedAt: "2026-07-02T08:00:00.000Z" },
    ]);
    const stalePhone = history([
      { tool: "tdee-calculator", value: 2380, savedAt: "2026-06-29T08:00:00.000Z" },
      { tool: "tdee-calculator", value: 2450, savedAt: "2026-07-03T08:00:00.000Z" },
    ]);
    const merged = mergeHistory(server, stalePhone);
    expect(merged.results.map((r) => r.value)).toEqual([2380, 2400, 2420, 2450]);
  });

  it("respects the per-tool cap by dropping the oldest", () => {
    const a = history(
      Array.from({ length: 20 }, (_, i) => ({
        tool: "tdee-calculator",
        value: 2000 + i,
        savedAt: new Date(Date.UTC(2026, 0, i + 1, 12)).toISOString(),
      })),
    );
    const b = history(
      Array.from({ length: 20 }, (_, i) => ({
        tool: "tdee-calculator",
        value: 3000 + i,
        savedAt: new Date(Date.UTC(2026, 1, i + 1, 12)).toISOString(),
      })),
    );
    const merged = mergeHistory(a, b);
    expect(merged.results).toHaveLength(30);
    // The newest survive; the oldest ten from January were dropped.
    expect(merged.results[merged.results.length - 1].value).toBe(3019);
    expect(merged.results[0].value).toBe(2010);
  });

  it("merging with empty is identity", () => {
    const a = history([
      { tool: "tdee-calculator", value: 2500, savedAt: "2026-07-01T10:00:00.000Z" },
    ]);
    expect(mergeHistory(a, emptyHistory)).toEqual(a);
    expect(mergeHistory(emptyHistory, a)).toEqual(a);
  });
});

describe("mergeDashboard (ACCOUNTS §6.2 — vitals by updatedAt; unions)", () => {
  it("vitals: the more recently updated side wins whole", () => {
    const older = dashboard({
      profile: { heightCm: 180, weightKg: 82, updatedAt: "2026-07-01T10:00:00.000Z" },
    });
    const newer = dashboard({
      profile: { heightCm: 180, weightKg: 80, updatedAt: "2026-07-10T10:00:00.000Z" },
    });
    expect(mergeDashboard(older, newer).profile.weightKg).toBe(80);
    expect(mergeDashboard(newer, older).profile.weightKg).toBe(80); // symmetric
  });

  it("vitals: a stamped side beats an unstamped one; overlay wins when neither is stamped", () => {
    const stamped = dashboard({
      profile: { weightKg: 81, updatedAt: "2026-07-01T10:00:00.000Z" },
    });
    const unstamped = dashboard({ profile: { weightKg: 99 } });
    expect(mergeDashboard(unstamped, stamped).profile.weightKg).toBe(81);
    expect(mergeDashboard(stamped, unstamped).profile.weightKg).toBe(81);
    expect(mergeDashboard(dashboard({}), unstamped).profile.weightKg).toBe(99);
  });

  it("metric points union with same-local-day replace", () => {
    const a = dashboard({
      metrics: [
        { metric: "tdee.kcal", value: 2400, savedAt: "2026-07-01T09:00:00.000Z" },
        { metric: "orm.kg", value: 140, savedAt: "2026-07-02T09:00:00.000Z" },
      ],
    });
    const b = dashboard({
      metrics: [{ metric: "tdee.kcal", value: 2450, savedAt: "2026-07-01T20:00:00.000Z" }],
    });
    const merged = mergeDashboard(a, b);
    expect(merged.metrics).toHaveLength(2);
    expect(merged.metrics.find((m) => m.metric === "tdee.kcal")?.value).toBe(2450);
  });

  it("biomarkers union by (marker, takenAt); overlay wins the exact-key tie", () => {
    const a = dashboard({
      biomarkers: [
        { marker: "apob", value: 0.9, unit: "g/L", takenAt: "2026-06-01", source: "manual" },
      ],
    });
    const b = dashboard({
      biomarkers: [
        { marker: "apob", value: 0.85, unit: "g/L", takenAt: "2026-06-01", source: "manual" },
        { marker: "hdl", value: 1.4, unit: "mmol/L", takenAt: "2026-06-01", source: "manual" },
      ],
    });
    const merged = mergeDashboard(a, b);
    expect(merged.biomarkers).toHaveLength(2);
    expect(merged.biomarkers.find((r) => r.marker === "apob")?.value).toBe(0.85);
  });
});

describe("mergeDaily (DAILY-GAMES §8 — union results; streak maxima)", () => {
  it("unions results by key", () => {
    const a = daily({
      results: { "ballpark:2026-07-01": { game: "ballpark", puzzle: 10, tier: "hot" } },
    });
    const b = daily({
      results: { "ballpark:2026-07-02": { game: "ballpark", puzzle: 11, tier: "cold" } },
    });
    const merged = mergeDaily(a, b);
    expect(Object.keys(merged.results).sort()).toEqual([
      "ballpark:2026-07-01",
      "ballpark:2026-07-02",
    ]);
  });

  it("takes max(current, best), the larger freeze balance (capped) and later lastPlayed", () => {
    const a = daily({
      streak: { current: 3, best: 9, freezes: 1, lastPlayed: "2026-07-01" },
    });
    const b = daily({
      streak: { current: 5, best: 6, freezes: MAX_FREEZES + 4, lastPlayed: "2026-06-20" },
    });
    const merged = mergeDaily(a, b);
    expect(merged.streak).toEqual({
      current: 5,
      best: 9,
      freezes: MAX_FREEZES,
      lastPlayed: "2026-07-01",
    });
  });

  it("merging with empty is identity", () => {
    const a = daily({
      results: { "myth:w4": { game: "myth", puzzle: 4, correct: 4, total: 5 } },
      streak: { current: 2, best: 2, freezes: 0, lastPlayed: "2026-07-01" },
    });
    expect(mergeDaily(a, daily({}))).toEqual(a);
    expect(mergeDaily(daily({}), a)).toEqual(a);
  });
});

describe("mergePulse (PULSE §6 — monotonic sets; LWW affinity)", () => {
  it("unions likes and saves without duplicates, base order first", () => {
    const a = pulse({ likes: ["c1", "c2"], saves: ["c1"] });
    const b = pulse({ likes: ["c2", "c3"], saves: ["c4"] });
    const merged = mergePulse(a, b);
    expect(merged.likes).toEqual(["c1", "c2", "c3"]);
    expect(merged.saves).toEqual(["c1", "c4"]);
  });

  it("bounds the merged seen-set to the most recent 200", () => {
    const a = pulse({ seen: Array.from({ length: 150 }, (_, i) => `a${i}`) });
    const b = pulse({ seen: Array.from({ length: 150 }, (_, i) => `b${i}`) });
    const merged = mergePulse(a, b);
    expect(merged.seen).toHaveLength(200);
    expect(merged.seen[merged.seen.length - 1]).toBe("b149");
  });

  it("affinity: overlay wins per category, base fills the rest", () => {
    const a = pulse({ affinity: { training: 0.4, sleep: 0.2 } });
    const b = pulse({ affinity: { training: -0.1 } });
    const merged = mergePulse(a, b);
    expect(merged.affinity).toEqual({ training: -0.1, sleep: 0.2 });
  });
});

describe("namespace registry (ACCOUNTS §6.2)", () => {
  it("validates: unique keys/events, conventions, consent flags, safe merges", () => {
    expect(validateNamespaces()).toEqual([]);
  });

  it("covers every savable surface with the documented consent split", () => {
    expect(ACCOUNT_NAMESPACES.map((n) => n.key).sort()).toEqual([
      "arcade",
      "daily",
      "dashboard",
      "favourites",
      "history",
      "prefs",
      "pulse",
      "stack",
      "training",
    ]);
    // Consent-gated: the health-flavoured trio, exactly (ACCOUNTS §6.2).
    const gated = ACCOUNT_NAMESPACES.filter((n) => n.healthFlavoured).map((n) => n.key);
    expect(gated.sort()).toEqual(["dashboard", "history", "stack"]);
    // bloodwork is deliberately ABSENT until A4 — its absence IS the gate.
    expect(namespaceByKey("bloodwork")).toBeUndefined();
  });

  it("wire-format merge round-trips: garbage on either side degrades, data survives", () => {
    const ns = namespaceByKey("history");
    if (!ns) throw new Error("history namespace missing");
    const doc = serializeHistory(
      history([{ tool: "tdee-calculator", value: 2500, savedAt: "2026-07-01T10:00:00.000Z" }]),
    );
    const merged = ns.merge("{corrupt", doc);
    expect(parseHistory(merged).results).toHaveLength(1);
    const both = ns.merge(doc, null);
    expect(parseHistory(both).results).toHaveLength(1);
  });
});
