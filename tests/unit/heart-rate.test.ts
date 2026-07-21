import { describe, expect, it } from "vitest";
import {
  hrMaxLegacy,
  hrMaxTanaka,
  hrZones,
  karvonenTargetHr,
} from "@/lib/formulas/heart-rate";

/**
 * Heart-rate zones (SPEC §7): HRmax via Tanaka 208 − 0.7·age (220 − age
 * noted as legacy); Karvonen THR = (HRmax − RHR)·intensity + RHR; 5-zone
 * table at 50–100% in 10% steps.
 */

describe("hrMaxTanaka", () => {
  it("age 30 → 187", () => {
    expect(hrMaxTanaka(30)).toBeCloseTo(187, 9);
  });
  it("age 40 → 180", () => {
    expect(hrMaxTanaka(40)).toBeCloseTo(180, 9);
  });
  it("age 55 → 169.5", () => {
    expect(hrMaxTanaka(55)).toBeCloseTo(169.5, 9);
  });
});

describe("hrMaxLegacy (220 − age)", () => {
  it("age 30 → 190", () => {
    expect(hrMaxLegacy(30)).toBe(190);
  });
});

describe("karvonenTargetHr", () => {
  it("HRmax 180, RHR 60, 70% → 144", () => {
    expect(karvonenTargetHr(180, 60, 0.7)).toBeCloseTo(144, 9);
  });
  it("at 100% intensity returns HRmax", () => {
    expect(karvonenTargetHr(180, 60, 1)).toBeCloseTo(180, 9);
  });
  it("at 0% intensity returns resting HR", () => {
    expect(karvonenTargetHr(180, 60, 0)).toBeCloseTo(60, 9);
  });
});

describe("hrZones", () => {
  it("builds five Karvonen zones from 50–100% when RHR is known", () => {
    const zones = hrZones(180, 60);
    expect(zones).toHaveLength(5);
    expect(zones[0]).toMatchObject({
      zone: 1,
      lowerBpm: 120,
      upperBpm: 132,
    });
    expect(zones[2]).toMatchObject({ zone: 3, lowerBpm: 144, upperBpm: 156 });
    expect(zones[4]).toMatchObject({ zone: 5, lowerBpm: 168, upperBpm: 180 });
  });

  it("falls back to %HRmax zones without a resting HR", () => {
    const zones = hrZones(180);
    expect(zones[0]).toMatchObject({ zone: 1, lowerBpm: 90, upperBpm: 108 });
    expect(zones[4]).toMatchObject({ zone: 5, lowerBpm: 162, upperBpm: 180 });
  });
});
