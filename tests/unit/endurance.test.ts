import { describe, expect, it } from "vitest";
import {
  paceSecPerKm,
  riegelPredict,
  splitTimes,
  timeForDistance,
} from "@/lib/formulas/running";

/**
 * Running pace arithmetic and Riegel race prediction (SPEC §7):
 * T₂ = T₁ × (D₂/D₁)^1.06.
 */

describe("paceSecPerKm", () => {
  it("10 km in 50:00 → 300 s/km", () => {
    expect(paceSecPerKm(10000, 3000)).toBeCloseTo(300, 9);
  });
  it("5 km in 25:00 → 300 s/km", () => {
    expect(paceSecPerKm(5000, 1500)).toBeCloseTo(300, 9);
  });
  it("marathon (42195 m) in 3:30:00 → 298.6 s/km", () => {
    expect(paceSecPerKm(42195, 12600)).toBeCloseTo(12600 / 42.195, 6);
  });
});

describe("timeForDistance", () => {
  it("300 s/km over 21097.5 m → 6329.25 s", () => {
    expect(timeForDistance(300, 21097.5)).toBeCloseTo(6329.25, 9);
  });
});

describe("splitTimes", () => {
  it("even 5 km splits for a 10 km at 300 s/km", () => {
    const splits = splitTimes(10000, 3000, 5000);
    expect(splits).toEqual([
      { distanceM: 5000, cumulativeSeconds: 1500 },
      { distanceM: 10000, cumulativeSeconds: 3000 },
    ]);
  });

  it("includes the final partial split", () => {
    const splits = splitTimes(10000, 3000, 3000);
    expect(splits).toHaveLength(4);
    expect(splits[3]).toEqual({ distanceM: 10000, cumulativeSeconds: 3000 });
  });
});

describe("riegelPredict", () => {
  it("50:00 10 km → half marathon ≈ 1:50:19", () => {
    const predicted = riegelPredict(3000, 10000, 21097.5);
    expect(predicted).toBeCloseTo(3000 * (21097.5 / 10000) ** 1.06, 6);
    expect(predicted).toBeGreaterThan(6600);
    expect(predicted).toBeLessThan(6640);
  });

  it("40:00 10 km → 5 km ≈ 19:11", () => {
    expect(riegelPredict(2400, 10000, 5000)).toBeCloseTo(2400 * 0.5 ** 1.06, 6);
  });

  it("same distance returns the same time", () => {
    expect(riegelPredict(3000, 10000, 10000)).toBeCloseTo(3000, 9);
  });
});
