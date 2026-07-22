import { describe, expect, it } from "vitest";
import {
  HISTORY_LIMIT_PER_TOOL,
  type HistoryFile,
  type StoredResult,
  frameDelta,
  latestBefore,
  parseHistory,
  serializeHistory,
  upsertResult,
} from "@/lib/history";

/**
 * Local result history (DESIGN.md §6, SPEC §10 HistoryProvider note).
 * Pure core: parsing is tolerant of corrupt storage, upserts collapse to
 * one entry per tool per local calendar day, and the comparison baseline
 * is the most recent entry from an EARLIER day (never "since 4 seconds
 * ago"). Delta framing follows the positive-frame rules in DESIGN.md §4.
 */

const at = (iso: string, tool = "one-rep-max-calculator", value = 100): StoredResult => ({
  tool,
  value,
  savedAt: iso,
});

const empty: HistoryFile = { version: 1, results: [] };

describe("parseHistory", () => {
  it("returns empty history for null, junk and wrong shapes", () => {
    expect(parseHistory(null)).toEqual(empty);
    expect(parseHistory("not json {")).toEqual(empty);
    expect(parseHistory('"a string"')).toEqual(empty);
    expect(parseHistory('{"version":99,"results":[]}')).toEqual(empty);
    expect(parseHistory('{"version":1,"results":"nope"}')).toEqual(empty);
  });

  it("drops malformed entries but keeps valid ones", () => {
    const raw = JSON.stringify({
      version: 1,
      results: [
        at("2026-03-12T10:00:00.000Z"),
        { tool: "x" }, // missing fields
        { tool: 3, value: "y", savedAt: 9 }, // wrong types
        at("2026-03-13T10:00:00.000Z", "tdee", 2500),
      ],
    });
    const parsed = parseHistory(raw);
    expect(parsed.results).toHaveLength(2);
    expect(parsed.results[1].tool).toBe("tdee");
  });

  it("round-trips through serializeHistory", () => {
    const file = upsertResult(empty, at("2026-03-12T10:00:00.000Z"));
    expect(parseHistory(serializeHistory(file))).toEqual(file);
  });
});

describe("upsertResult", () => {
  it("appends entries from different days", () => {
    let h = upsertResult(empty, at("2026-03-12T10:00:00.000Z", "t", 100));
    h = upsertResult(h, at("2026-03-13T10:00:00.000Z", "t", 102));
    expect(h.results.map((r) => r.value)).toEqual([100, 102]);
  });

  it("replaces the same tool's entry from the same local day (latest wins)", () => {
    let h = upsertResult(empty, at("2026-03-12T10:00:00.000Z", "t", 100));
    h = upsertResult(h, at("2026-03-12T18:30:00.000Z", "t", 105));
    expect(h.results).toHaveLength(1);
    expect(h.results[0].value).toBe(105);
  });

  it("keeps same-day entries for different tools separate", () => {
    let h = upsertResult(empty, at("2026-03-12T10:00:00.000Z", "a", 1));
    h = upsertResult(h, at("2026-03-12T11:00:00.000Z", "b", 2));
    expect(h.results).toHaveLength(2);
  });

  it("caps stored entries per tool, dropping the oldest", () => {
    let h = empty;
    for (let i = 0; i < HISTORY_LIMIT_PER_TOOL + 5; i++) {
      const day = String(1 + (i % 28)).padStart(2, "0");
      const month = i < 28 ? "01" : "02";
      h = upsertResult(h, at(`2026-${month}-${day}T10:00:00.000Z`, "t", i));
    }
    const mine = h.results.filter((r) => r.tool === "t");
    expect(mine).toHaveLength(HISTORY_LIMIT_PER_TOOL);
    expect(mine[0].value).toBe(5); // oldest five dropped
  });
});

describe("latestBefore", () => {
  const now = new Date("2026-03-14T09:00:00.000Z");

  it("returns null with no history", () => {
    expect(latestBefore(empty, "t", now)).toBeNull();
  });

  it("ignores entries saved today — baseline must be a previous day", () => {
    let h = upsertResult(empty, at("2026-03-14T07:00:00.000Z", "t", 999));
    expect(latestBefore(h, "t", now)).toBeNull();
    h = upsertResult(h, at("2026-03-12T10:00:00.000Z", "t", 100));
    expect(latestBefore(h, "t", now)?.value).toBe(100);
  });

  it("returns the most recent prior-day entry for the right tool", () => {
    let h = upsertResult(empty, at("2026-03-10T10:00:00.000Z", "t", 90));
    h = upsertResult(h, at("2026-03-12T10:00:00.000Z", "t", 100));
    h = upsertResult(h, at("2026-03-13T10:00:00.000Z", "other", 500));
    expect(latestBefore(h, "t", now)?.value).toBe(100);
  });
});

describe("frameDelta", () => {
  it("up-is-better: improvement, level and behind", () => {
    expect(frameDelta("up", 0.25, 100, 102.5)).toEqual({ kind: "better", deltaAbs: 2.5 });
    expect(frameDelta("up", 0.25, 100, 100.2)).toEqual({ kind: "level" });
    expect(frameDelta("up", 0.25, 100, 97.5)).toEqual({ kind: "behind", deltaAbs: 2.5 });
  });

  it("down-is-better inverts the framing (e.g. heart age)", () => {
    expect(frameDelta("down", 0.05, 41, 40)).toEqual({ kind: "better", deltaAbs: 1 });
    expect(frameDelta("down", 0.05, 41, 42)).toEqual({ kind: "behind", deltaAbs: 1 });
    expect(frameDelta("down", 0.05, 41, 41)).toEqual({ kind: "level" });
  });

  it("valence-free metrics report change without judgement (e.g. TDEE)", () => {
    expect(frameDelta("none", 25, 2500, 2620)).toEqual({
      kind: "changed",
      deltaAbs: 120,
      direction: "up",
    });
    expect(frameDelta("none", 25, 2500, 2380)).toEqual({
      kind: "changed",
      deltaAbs: 120,
      direction: "down",
    });
    expect(frameDelta("none", 25, 2500, 2510)).toEqual({ kind: "level" });
  });

  it("treats the epsilon noise floor as level in both directions", () => {
    expect(frameDelta("up", 1, 100, 101)).toEqual({ kind: "level" });
    expect(frameDelta("up", 1, 100, 99)).toEqual({ kind: "level" });
  });
});
