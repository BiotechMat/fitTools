import { describe, expect, it } from "vitest";
import { doubleProgression } from "@/lib/formulas/progression";
import { totalTonnage, weeklySetsPerMuscle } from "@/lib/formulas/volume";
import { warmupSets } from "@/lib/formulas/warmup";

/**
 * Warm-up generator (SPEC §7): default ramp bar×10, 40%×5, 60%×3, 80%×1 of
 * the first work set, rounded to plate-loadable weights via the plate
 * module. Double progression and volume per SPEC §7.
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

describe("warmupSets", () => {
  it("100 kg work set on a 20 kg bar → bar×10, 40×5, 60×3, 80×1", () => {
    const sets = warmupSets(100, 20, standardInventory);
    expect(sets.map((s) => ({ kg: s.achievedKg, reps: s.reps }))).toEqual([
      { kg: 20, reps: 10 },
      { kg: 40, reps: 5 },
      { kg: 60, reps: 3 },
      { kg: 80, reps: 1 },
    ]);
  });

  it("rounds unloadable percentages to the nearest plate-loadable weight", () => {
    // 90 kg work set: 40% = 36 → nearest loadable 35 or 37.5 (1.25s);
    // per-side 8 → 5+2.5+... exact 36 needs per-side 8 = 5+2.5+0.5? No:
    // 5+2.5=7.5 or +1.25=8.75 → nearest to 8 is 7.5 (35 kg) vs 8.75
    // (37.5) — 7.5 is closer (0.5 vs 0.75).
    const sets = warmupSets(90, 20, standardInventory);
    expect(sets[1].achievedKg).toBeCloseTo(35, 9);
    // 60% = 54 → per-side 17: 15+2.5=17.5 (55 kg) vs 15+1.25=16.25
    // (52.5) — 17.5 closer (0.5 vs 0.75).
    expect(sets[2].achievedKg).toBeCloseTo(55, 9);
    // 80% = 72 → per-side 26: 25+1.25=26.25 (72.5) closer than 25 (70).
    expect(sets[3].achievedKg).toBeCloseTo(72.5, 9);
  });

  it("never prescribes a warm-up above the work weight", () => {
    for (const set of warmupSets(42.5, 20, standardInventory)) {
      expect(set.achievedKg).toBeLessThanOrEqual(42.5);
    }
  });
});

describe("doubleProgression", () => {
  it("all sets at the top of the range → add load, reset reps", () => {
    const next = doubleProgression({
      repRangeMin: 6,
      repRangeMax: 8,
      currentLoadKg: 50,
      incrementKg: 2.5,
      achievedReps: [8, 8, 8],
    });
    expect(next).toEqual({
      loadKg: 52.5,
      targetReps: 6,
      progressed: true,
    });
  });

  it("any set below the top → same load, aim for more reps", () => {
    const next = doubleProgression({
      repRangeMin: 6,
      repRangeMax: 8,
      currentLoadKg: 50,
      incrementKg: 2.5,
      achievedReps: [8, 8, 7],
    });
    expect(next).toEqual({ loadKg: 50, targetReps: 8, progressed: false });
  });

  it("holds the load when reps fall below the bottom of the range", () => {
    const next = doubleProgression({
      repRangeMin: 6,
      repRangeMax: 8,
      currentLoadKg: 50,
      incrementKg: 2.5,
      achievedReps: [6, 5, 5],
    });
    expect(next.loadKg).toBe(50);
    expect(next.progressed).toBe(false);
  });
});

describe("volume", () => {
  it("sums tonnage across exercises", () => {
    expect(
      totalTonnage([
        { sets: 3, reps: 8, loadKg: 100 },
        { sets: 5, reps: 5, loadKg: 140 },
      ]),
    ).toBeCloseTo(3 * 8 * 100 + 5 * 5 * 140, 9);
  });

  it("counts weekly hard sets per muscle group", () => {
    const totals = weeklySetsPerMuscle([
      { muscle: "chest", sets: 4 },
      { muscle: "back", sets: 6 },
      { muscle: "chest", sets: 5 },
    ]);
    expect(totals.get("chest")).toBe(9);
    expect(totals.get("back")).toBe(6);
  });

  it("zero sets contribute nothing", () => {
    expect(totalTonnage([{ sets: 0, reps: 10, loadKg: 100 }])).toBe(0);
  });
});
