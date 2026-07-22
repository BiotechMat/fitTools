import { describe, expect, it } from "vitest";
import { planPlateLoad } from "@/lib/formulas/plates";
import plateData from "@/data/plates.json";

/**
 * Plate loading (SPEC §7): greedy per-side algorithm, bar default 20 kg
 * (options 10/15/20), inventory from /data (user-editable), nearest
 * achievable weight when the exact load is impossible.
 * Inventory pairs = plates available PER SIDE.
 */

const standardInventory = [
  { plateKg: 25, perSide: 4 },
  { plateKg: 20, perSide: 2 },
  { plateKg: 15, perSide: 2 },
  { plateKg: 10, perSide: 2 },
  { plateKg: 5, perSide: 2 },
  { plateKg: 2.5, perSide: 2 },
  { plateKg: 1.25, perSide: 2 },
];

describe("data file", () => {
  it("ships the standard metric inventory with a source", () => {
    expect(plateData.metric.barOptionsKg).toEqual([10, 15, 20]);
    expect(plateData.metric.defaultBarKg).toBe(20);
    expect(plateData.metric.plates.map((p) => p.plateKg)).toContain(25);
    expect(plateData.sources.length).toBeGreaterThan(0);
  });
});

describe("planPlateLoad — exact loads", () => {
  it("100 kg on a 20 kg bar → 25 + 15 per side (heaviest-first)", () => {
    const plan = planPlateLoad(100, 20, standardInventory);
    expect(plan.exact).toBe(true);
    expect(plan.achievedKg).toBeCloseTo(100, 9);
    expect(plan.perSide).toEqual([25, 15]);
  });

  it("102.5 kg on a 20 kg bar → 25 + 15 + 1.25 per side", () => {
    const plan = planPlateLoad(102.5, 20, standardInventory);
    expect(plan.exact).toBe(true);
    expect(plan.perSide).toEqual([25, 15, 1.25]);
  });

  it("60 kg on a 15 kg bar → 20 + 2.5 per side", () => {
    const plan = planPlateLoad(60, 15, standardInventory);
    expect(plan.exact).toBe(true);
    expect(plan.perSide).toEqual([20, 2.5]);
  });

  it("bar-only load", () => {
    const plan = planPlateLoad(20, 20, standardInventory);
    expect(plan.exact).toBe(true);
    expect(plan.perSide).toEqual([]);
  });
});

describe("planPlateLoad — impossible loads resolve to the nearest achievable", () => {
  it("101 kg on a 20 kg bar → nearest is 100 kg (below)", () => {
    const plan = planPlateLoad(101, 20, standardInventory);
    expect(plan.exact).toBe(false);
    expect(plan.achievedKg).toBeCloseTo(100, 9);
    expect(plan.perSide).toEqual([25, 15]);
  });

  it("74 kg on a 20 kg bar with a sparse rack → nearest is 75 kg (above)", () => {
    const sparse = [
      { plateKg: 20, perSide: 1 },
      { plateKg: 5, perSide: 1 },
      { plateKg: 2.5, perSide: 1 },
    ];
    const plan = planPlateLoad(74, 20, sparse);
    expect(plan.exact).toBe(false);
    expect(plan.achievedKg).toBeCloseTo(75, 9);
    expect(plan.perSide).toEqual([20, 5, 2.5]);
  });

  it("ties resolve to the lower weight", () => {
    const sparse = [
      { plateKg: 20, perSide: 1 },
      { plateKg: 5, perSide: 1 },
      { plateKg: 2.5, perSide: 1 },
    ];
    // Per-side target 26.25 sits exactly between 25 and 27.5.
    const plan = planPlateLoad(72.5, 20, sparse);
    expect(plan.exact).toBe(false);
    expect(plan.achievedKg).toBeCloseTo(70, 9);
  });

  it("target below the bar weight loads the empty bar", () => {
    const plan = planPlateLoad(15, 20, standardInventory);
    expect(plan.exact).toBe(false);
    expect(plan.achievedKg).toBeCloseTo(20, 9);
    expect(plan.perSide).toEqual([]);
  });

  it("respects limited inventory counts", () => {
    const oneOfEach = [
      { plateKg: 25, perSide: 1 },
      { plateKg: 10, perSide: 1 },
    ];
    // Per-side target 60 exceeds total per-side inventory of 35.
    const plan = planPlateLoad(140, 20, oneOfEach);
    expect(plan.exact).toBe(false);
    expect(plan.achievedKg).toBeCloseTo(90, 9);
    expect(plan.perSide).toEqual([25, 10]);
  });
});
