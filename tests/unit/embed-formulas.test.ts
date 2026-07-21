import { describe, expect, it } from "vitest";
import {
  embedBmi,
  embedBmiCategory,
  embedEpley,
  embedMifflin,
} from "@/lib/embed/formulas";
import { bmi, bmiCategory } from "@/lib/formulas/bmi";
import { mifflinStJeor } from "@/lib/formulas/energy";
import { oneRepMax } from "@/lib/formulas/one-rep-max";

/**
 * Embed formulas are self-contained (no imports/closures) so they can be
 * serialised via Function.prototype.toString into the React-free embed
 * pages. These tests lock them to the canonical library implementations —
 * any drift fails the build.
 */

describe("embed formulas match canonical implementations", () => {
  it("Mifflin–St Jeor", () => {
    for (const [sex, w, h, a] of [
      ["male", 80, 175, 30],
      ["female", 60, 165, 45],
      ["male", 100, 190, 55],
    ] as const) {
      expect(embedMifflin(sex, w, h, a)).toBeCloseTo(
        mifflinStJeor({ sex, weightKg: w, heightCm: h, ageYears: a }),
        9,
      );
    }
  });

  it("BMI + category", () => {
    for (const [w, h] of [[80, 175], [58, 160], [120, 180]] as const) {
      expect(embedBmi(w, h)).toBeCloseTo(bmi(w, h), 9);
      expect(embedBmiCategory(embedBmi(w, h))).toBe(bmiCategory(bmi(w, h)));
    }
  });

  it("Epley 1RM", () => {
    for (const [w, r] of [[100, 5], [60, 10], [140, 1]] as const) {
      expect(embedEpley(w, r)).toBeCloseTo(oneRepMax("epley", w, r), 9);
    }
  });

  it("functions serialise to standalone JS (no external references)", () => {
    for (const fn of [embedMifflin, embedBmi, embedBmiCategory, embedEpley]) {
      const source = fn.toString();
      // A serialised embed formula must not reference imported symbols.
      expect(source).not.toMatch(/require|import|_lib|__webpack/);
    }
  });
});
