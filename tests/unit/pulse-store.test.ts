import { describe, expect, it } from "vitest";
import {
  applyEngagement,
  isLiked,
  isSaved,
  parsePulseStore,
  recordSeen,
  toggleLike,
  toggleSave,
} from "@/lib/pulse-store";
import type { PulseStore } from "@/lib/pulse-store";

const EMPTY: PulseStore = { version: 1, likes: [], saves: [], seen: [], affinity: {} };

describe("pulse-store — pure core (PULSE.md §6)", () => {
  it("toggles likes and saves idempotently", () => {
    let s = toggleLike(EMPTY, "a");
    expect(isLiked(s, "a")).toBe(true);
    s = toggleLike(s, "a");
    expect(isLiked(s, "a")).toBe(false);

    s = toggleSave(EMPTY, "b");
    expect(isSaved(s, "b")).toBe(true);
  });

  it("clamps affinity to [-1, 1]", () => {
    let s = EMPTY;
    for (let i = 0; i < 50; i++) s = applyEngagement(s, "recovery", "like");
    expect(s.affinity.recovery).toBeLessThanOrEqual(1);
    let t = EMPTY;
    for (let i = 0; i < 50; i++) t = applyEngagement(t, "sleep", "scrollPast");
    expect(t.affinity.sleep).toBeGreaterThanOrEqual(-1);
  });

  it("dwell nudges affinity positively but less than an explicit like", () => {
    const dwell = applyEngagement(EMPTY, "cardio", "dwellLong").affinity.cardio ?? 0;
    const like = applyEngagement(EMPTY, "cardio", "like").affinity.cardio ?? 0;
    expect(dwell).toBeGreaterThan(0);
    expect(dwell).toBeLessThan(like);
  });

  it("bounds the seen list and de-dupes to most-recent", () => {
    let s = EMPTY;
    for (let i = 0; i < 250; i++) s = recordSeen(s, `c-${i}`);
    expect(s.seen.length).toBeLessThanOrEqual(200);
    expect(s.seen).toContain("c-249");
    // re-seeing moves it to the end without duplicating
    s = recordSeen(s, "c-249");
    expect(s.seen.filter((x) => x === "c-249")).toHaveLength(1);
  });

  it("parse tolerates corrupt or foreign storage", () => {
    expect(parsePulseStore(null)).toEqual(EMPTY);
    expect(parsePulseStore("not json")).toEqual(EMPTY);
    expect(parsePulseStore(JSON.stringify({ version: 99 }))).toEqual(EMPTY);
  });

  it("round-trips a valid store and clamps stored affinity", () => {
    const raw = JSON.stringify({
      version: 1,
      likes: ["a"],
      saves: ["b"],
      seen: ["c"],
      affinity: { recovery: 5, bogus: 0.2 },
    });
    const s = parsePulseStore(raw);
    expect(s.likes).toEqual(["a"]);
    expect(s.affinity.recovery).toBe(1); // clamped from 5
    expect("bogus" in s.affinity).toBe(false); // invalid category dropped
  });
});
