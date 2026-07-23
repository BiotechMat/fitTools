import { describe, expect, it } from "vitest";
import { ketoMacros } from "@/lib/formulas/keto";
import { ACTIVITY_FACTORS, mifflinStJeor, tdee } from "@/lib/formulas/energy";

/**
 * Pure arithmetic on top of the energy formulas: carbs fixed in grams,
 * protein g/kg, fat = remaining kcal / 9.
 */

describe("ketoMacros", () => {
  it("male 30 y / 80 kg / 175 cm, moderate, losing → 2,168.8 kcal; fat 165.9 g", () => {
    const maintenance = tdee(
      mifflinStJeor({ sex: "male", weightKg: 80, heightCm: 175, ageYears: 30 }),
      ACTIVITY_FACTORS.moderate,
    );
    expect(maintenance).toBeCloseTo(2710.5625, 4);
    const macros = ketoMacros({
      tdeeKcal: maintenance,
      goal: "lose",
      netCarbsG: 25,
      proteinGPerKg: 1.8,
      weightKg: 80,
    });
    expect(macros.kcalTarget).toBeCloseTo(2168.45, 2);
    expect(macros.carbsG).toBe(25);
    expect(macros.proteinG).toBeCloseTo(144, 6);
    // Fat = (2168.45 − 100 − 576) / 9.
    expect(macros.fatG).toBeCloseTo((2168.45 - 100 - 576) / 9, 6);
    expect(macros.fatG).toBeCloseTo(165.83, 2);
  });

  it("maintain keeps the energy target at TDEE; gain adds 10%", () => {
    const base = ketoMacros({
      tdeeKcal: 2500,
      goal: "maintain",
      netCarbsG: 30,
      proteinGPerKg: 1.6,
      weightKg: 70,
    });
    expect(base.kcalTarget).toBe(2500);
    const gain = ketoMacros({
      tdeeKcal: 2500,
      goal: "gain",
      netCarbsG: 30,
      proteinGPerKg: 1.6,
      weightKg: 70,
    });
    expect(gain.kcalTarget).toBeCloseTo(2750, 6);
  });

  it("never returns negative fat when protein + carbs exceed the target", () => {
    const macros = ketoMacros({
      tdeeKcal: 1000,
      goal: "lose",
      netCarbsG: 50,
      proteinGPerKg: 2.2,
      weightKg: 120,
    });
    expect(macros.fatG).toBe(0);
  });
});
