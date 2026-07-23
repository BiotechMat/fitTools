import { describe, expect, it } from "vitest";
import {
  scoreGuess,
  valueFromPosition,
  positionFromValue,
  defaultGuess,
  sliderStep,
} from "@/lib/daily/score";
import type { BallparkItem } from "@/lib/daily/types";

const item = { answer: 50, sliderMin: 0, sliderMax: 100 };

describe("scoreGuess — closeness tiers by span-relative error", () => {
  it("bullseye within 5% of span", () => {
    expect(scoreGuess(item, 50)).toBe("bullseye");
    expect(scoreGuess(item, 54)).toBe("bullseye"); // 4% of 100
    expect(scoreGuess(item, 46)).toBe("bullseye");
  });

  it("hot within 15%", () => {
    expect(scoreGuess(item, 60)).toBe("hot"); // 10%
    expect(scoreGuess(item, 65)).toBe("hot"); // 15% edge
  });

  it("warm within 30%", () => {
    expect(scoreGuess(item, 75)).toBe("warm"); // 25%
    expect(scoreGuess(item, 80)).toBe("warm"); // 30% edge
  });

  it("cold beyond 30%", () => {
    expect(scoreGuess(item, 90)).toBe("cold"); // 40%
    expect(scoreGuess(item, 0)).toBe("cold");
  });

  it("uses the span, not the answer (so near-zero answers still score sanely)", () => {
    const nearZero = { answer: 2, sliderMin: 0, sliderMax: 100 };
    // 5 away is 3% of span -> bullseye, even though it's 150% of the answer.
    expect(scoreGuess(nearZero, 5)).toBe("bullseye");
  });
});

describe("slider value <-> position mapping", () => {
  it("linear mapping round-trips", () => {
    const b = { sliderMin: 10, sliderMax: 20 };
    expect(valueFromPosition(b, 0)).toBe(10);
    expect(valueFromPosition(b, 1)).toBe(20);
    expect(valueFromPosition(b, 0.5)).toBe(15);
    expect(positionFromValue(b, 15)).toBeCloseTo(0.5);
  });

  it("log mapping round-trips and is monotonic", () => {
    const b = { sliderMin: 1, sliderMax: 1000, logScale: true };
    expect(valueFromPosition(b, 0)).toBeCloseTo(1);
    expect(valueFromPosition(b, 1)).toBeCloseTo(1000);
    expect(valueFromPosition(b, 0.5)).toBeCloseTo(Math.sqrt(1000), 5); // geometric midpoint
    const round = positionFromValue(b, valueFromPosition(b, 0.33));
    expect(round).toBeCloseTo(0.33, 5);
  });

  it("clamps out-of-range positions", () => {
    const b = { sliderMin: 0, sliderMax: 10 };
    expect(valueFromPosition(b, -1)).toBe(0);
    expect(valueFromPosition(b, 2)).toBe(10);
  });
});

describe("defaultGuess", () => {
  const full: BallparkItem = {
    id: "x",
    question: "q",
    answer: 50,
    unit: "%",
    sliderMin: 0,
    sliderMax: 100,
    context: "c",
    tier: "well-supported",
    source: { label: "l", url: "https://example.com" },
    lastReviewed: "2026-07-23",
  };

  it("is deterministic for a given seed and stays within the interior band", () => {
    const a = defaultGuess(full, 1234);
    const b = defaultGuess(full, 1234);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(20);
    expect(a).toBeLessThanOrEqual(80);
  });

  it("varies with the seed", () => {
    const seeds = [1, 2, 3, 4, 5].map((s) => defaultGuess(full, s));
    expect(new Set(seeds).size).toBeGreaterThan(1);
  });
});

describe("sliderStep", () => {
  it("scales the step to the span", () => {
    expect(sliderStep({ sliderMin: 0, sliderMax: 3 })).toBe(0.1);
    expect(sliderStep({ sliderMin: 0, sliderMax: 40 })).toBe(1);
    expect(sliderStep({ sliderMin: 0, sliderMax: 200 })).toBe(5);
    expect(sliderStep({ sliderMin: 0, sliderMax: 800 })).toBe(10);
  });
});
