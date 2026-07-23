import { describe, expect, it } from "vitest";
import {
  parseDailyStore,
  serializeDailyStore,
  advanceStreak,
  recordResult,
  hasPlayed,
  ballparkKey,
  mythKey,
  MAX_FREEZES,
  type StreakState,
} from "@/lib/daily-store";

const fresh: StreakState = { current: 0, best: 0, freezes: 0, lastPlayed: null };

describe("advanceStreak — played-streak with freezes (DAILY-GAMES.md §6)", () => {
  it("first play starts a streak of 1", () => {
    const s = advanceStreak(fresh, "2026-07-23");
    expect(s.current).toBe(1);
    expect(s.best).toBe(1);
    expect(s.lastPlayed).toBe("2026-07-23");
  });

  it("consecutive days increment", () => {
    let s = advanceStreak(fresh, "2026-07-01");
    s = advanceStreak(s, "2026-07-02");
    s = advanceStreak(s, "2026-07-03");
    expect(s.current).toBe(3);
    expect(s.best).toBe(3);
  });

  it("is idempotent for the same day", () => {
    const a = advanceStreak(fresh, "2026-07-23");
    const b = advanceStreak(a, "2026-07-23");
    expect(b).toEqual(a);
  });

  it("earns a freeze on completing a week", () => {
    let s = fresh;
    for (let d = 1; d <= 7; d++) {
      s = advanceStreak(s, `2026-07-0${d}`);
    }
    expect(s.current).toBe(7);
    expect(s.freezes).toBe(1);
  });

  it("bridges a single missed day using an earned freeze", () => {
    // Build a 7-day streak (earns 1 freeze), then skip one day.
    let s = fresh;
    for (let d = 1; d <= 7; d++) s = advanceStreak(s, `2026-07-0${d}`);
    expect(s.freezes).toBe(1);
    // Play on the 9th (8th was missed) — freeze bridges it.
    s = advanceStreak(s, "2026-07-09");
    expect(s.current).toBe(8);
    expect(s.freezes).toBe(0);
  });

  it("resets to a warm day-one when the gap exceeds the freeze balance", () => {
    let s = advanceStreak(fresh, "2026-07-01");
    s = advanceStreak(s, "2026-07-02"); // current 2, no freezes
    s = advanceStreak(s, "2026-07-20"); // long gap, no freezes to spend
    expect(s.current).toBe(1);
    expect(s.best).toBe(2); // best is preserved
  });

  it("never rewrites history for an out-of-order (past) play", () => {
    let s = advanceStreak(fresh, "2026-07-10");
    s = advanceStreak(s, "2026-07-05"); // earlier than lastPlayed
    expect(s.lastPlayed).toBe("2026-07-10");
    expect(s.current).toBe(1);
  });

  it("caps freezes at MAX_FREEZES", () => {
    let s = fresh;
    // 28 consecutive days would earn 4 freezes uncapped; cap holds at MAX.
    const base = new Date("2026-01-01T00:00:00Z");
    for (let i = 0; i < 28; i++) {
      const d = new Date(base.getTime() + i * 86_400_000).toISOString().slice(0, 10);
      s = advanceStreak(s, d);
    }
    expect(s.current).toBe(28);
    expect(s.freezes).toBeLessThanOrEqual(MAX_FREEZES);
    expect(s.freezes).toBe(MAX_FREEZES);
  });
});

describe("recordResult", () => {
  const empty = parseDailyStore(null);

  it("stores a ballpark result and advances the streak", () => {
    const store = recordResult(
      empty,
      ballparkKey("2026-07-23"),
      { game: "ballpark", puzzle: 203, tier: "hot" },
      "2026-07-23",
    );
    expect(hasPlayed(store, ballparkKey("2026-07-23"))).toBe(true);
    expect(store.streak.current).toBe(1);
  });

  it("stores a myth result WITHOUT touching the daily streak", () => {
    const store = recordResult(
      empty,
      mythKey(30),
      { game: "myth", puzzle: 30, correct: 4, total: 5 },
      "2026-07-23",
    );
    expect(hasPlayed(store, mythKey(30))).toBe(true);
    expect(store.streak.current).toBe(0);
  });
});

describe("parse/serialize round-trip and tolerance", () => {
  it("round-trips a populated store", () => {
    const store = recordResult(
      parseDailyStore(null),
      ballparkKey("2026-07-23"),
      { game: "ballpark", puzzle: 203, tier: "bullseye" },
      "2026-07-23",
    );
    expect(parseDailyStore(serializeDailyStore(store))).toEqual(store);
  });

  it("degrades corrupt input to empty", () => {
    expect(parseDailyStore("not json").results).toEqual({});
    expect(parseDailyStore('{"version":99}').streak.current).toBe(0);
  });

  it("drops malformed result entries but keeps valid ones", () => {
    const raw = JSON.stringify({
      version: 1,
      results: {
        good: { game: "ballpark", puzzle: 1, tier: "hot" },
        bad: { game: "nonsense" },
      },
      streak: { current: 2, best: 5, freezes: 1, lastPlayed: "2026-07-23" },
    });
    const parsed = parseDailyStore(raw);
    expect(Object.keys(parsed.results)).toEqual(["good"]);
    expect(parsed.streak.best).toBe(5);
  });
});
