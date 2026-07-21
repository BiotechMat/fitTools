import { describe, expect, it } from "vitest";
import { classifyLift, thresholdsFor } from "@/lib/formulas/strength-standards";
import standards from "@/data/strength-standards.json";

/**
 * Strength standards classification against the Kilgore 2023 tables
 * (src/data/strength-standards.json, age band 20–29, kg). Linear
 * interpolation between bodyweight rows; clamped at the table edges.
 */

describe("data file", () => {
  it("covers three lifts, both sexes, with sources", () => {
    expect(Object.keys(standards.lifts).sort()).toEqual([
      "backSquat",
      "benchPress",
      "deadlift",
    ]);
    expect(standards.sources.length).toBeGreaterThan(0);
    for (const lift of Object.values(standards.lifts)) {
      expect(lift.male.length).toBe(7);
      expect(lift.female.length).toBe(7);
      for (const row of [...lift.male, ...lift.female]) {
        // Thresholds must ascend across levels.
        for (let i = 1; i < row.values.length; i++) {
          expect(row.values[i]).toBeGreaterThan(row.values[i - 1]);
        }
      }
    }
  });
});

describe("thresholdsFor", () => {
  it("returns exact table rows at listed bodyweights (male squat, 91 kg)", () => {
    expect(thresholdsFor("backSquat", "male", 91)).toEqual([57, 98, 130, 179, 236]);
  });

  it("interpolates between bodyweight rows", () => {
    // Male squat elite: 236 at 91 kg, 232 at 102 kg → 100 kg ≈ 232.73.
    const thresholds = thresholdsFor("backSquat", "male", 100);
    expect(thresholds[4]).toBeCloseTo(236 + ((232 - 236) * 9) / 11, 6);
  });

  it("clamps below and above the table range", () => {
    expect(thresholdsFor("backSquat", "male", 40)).toEqual([38, 65, 87, 120, 153]);
    expect(thresholdsFor("backSquat", "male", 200)).toEqual([72, 123, 164, 226, 282]);
  });
});

describe("classifyLift", () => {
  it.each([
    [30, "untrained"],
    [57, "physicallyActive"],
    [97, "physicallyActive"],
    [98, "beginner"],
    [150, "intermediate"],
    [179, "advanced"],
    [235, "advanced"],
    [236, "elite"],
    [300, "elite"],
  ] as const)("male squat at 91 kg bodyweight, 1RM %s kg → %s", (oneRm, expected) => {
    expect(classifyLift("backSquat", "male", 91, oneRm).level).toBe(expected);
  });

  it("reports the next threshold when below elite", () => {
    const result = classifyLift("backSquat", "male", 91, 150);
    expect(result.level).toBe("intermediate");
    expect(result.nextLevel).toBe("advanced");
    expect(result.nextThresholdKg).toBeCloseTo(179, 6);
  });

  it("female deadlift at 68 kg bodyweight, 1RM 110 → advanced", () => {
    expect(classifyLift("deadlift", "female", 68, 110).level).toBe("advanced");
  });
});
