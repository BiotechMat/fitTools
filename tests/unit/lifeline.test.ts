import { describe, expect, it } from "vitest";
import {
  LIFELINE,
  ageAt,
  dailyPuzzleNumber,
  dailySeed,
  gapAt,
  hitsColumn,
  medalFor,
  mulberry32,
  spawnIntervalAt,
  speedAt,
} from "@/lib/lifeline";

describe("lifeline tuning (LIFELINE.md §4)", () => {
  it("age starts at 18 and climbs 1.5/yr plus bonuses", () => {
    expect(ageAt(0, 0)).toBe(18);
    expect(ageAt(10, 0)).toBe(33);
    expect(ageAt(10, 3)).toBe(36);
  });

  it("speed and difficulty rise monotonically with age", () => {
    expect(speedAt(18)).toBe(150);
    expect(speedAt(60)).toBeGreaterThan(speedAt(40));
    expect(gapAt(60)).toBeLessThan(gapAt(40));
    expect(spawnIntervalAt(60)).toBeLessThan(spawnIntervalAt(30));
  });

  it("gap and spawn interval floor so age 100 stays physically possible", () => {
    expect(gapAt(500)).toBe(66);
    expect(spawnIntervalAt(500)).toBe(0.9);
    expect(gapAt(500)).toBeGreaterThan(LIFELINE.playerRadius * 2 + 20);
  });

  it("medals at 40/60/80/100", () => {
    expect(medalFor(39)).toBe("none");
    expect(medalFor(40)).toBe("bronze");
    expect(medalFor(60)).toBe("silver");
    expect(medalFor(80)).toBe("gold");
    expect(medalFor(100)).toBe("centenarian");
  });
});

describe("collision", () => {
  const column = { x: 200, gapY: 280, gapH: 100 };

  it("misses when horizontally clear of the column", () => {
    expect(hitsColumn(280, 9, 100, column)).toBe(false);
    expect(hitsColumn(280, 9, 300, column)).toBe(false);
  });

  it("passes cleanly through the middle of the gap", () => {
    expect(hitsColumn(280, 9, 200, column)).toBe(false);
  });

  it("hits the top and bottom pipe edges", () => {
    expect(hitsColumn(280 - 50, 9, 200, column)).toBe(true);
    expect(hitsColumn(280 + 50, 9, 200, column)).toBe(true);
  });
});

describe("daily run", () => {
  it("numbers puzzles from the launch date and seeds deterministically", () => {
    expect(dailyPuzzleNumber("2026-07-23")).toBe(1);
    expect(dailyPuzzleNumber("2026-08-01")).toBe(10);
    expect(dailySeed("2026-07-23")).toBe(20260723);
    expect(mulberry32(dailySeed("2026-07-23"))()).toBe(
      mulberry32(dailySeed("2026-07-23"))(),
    );
  });
});

describe("seeded rng", () => {
  it("is deterministic per seed and uniform-ish in [0,1)", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(mulberry32(43)()).not.toBe(mulberry32(42)());
  });
});
