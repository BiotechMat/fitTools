/**
 * Macro split (SPEC §7). Protein set in g/kg bodyweight (slider 1.6–2.2,
 * default 1.8; source: Morton et al., Br J Sports Med 2018); fat as a
 * percentage of the kcal target (20–35%, default 25%); carbohydrate is the
 * remainder. Energy densities are the Atwater general factors.
 */

export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_FAT = 9;
export const KCAL_PER_G_CARB = 4;

export interface MacroInput {
  kcalTarget: number;
  weightKg: number;
  proteinGPerKg: number;
  fatPercent: number;
}

export interface MacroAmount {
  grams: number;
  kcal: number;
}

export interface MacroSplit {
  protein: MacroAmount;
  fat: MacroAmount;
  carbs: MacroAmount;
  /** False when protein + fat already exceed the kcal target (carbs < 0). */
  feasible: boolean;
}

export function macroSplit({
  kcalTarget,
  weightKg,
  proteinGPerKg,
  fatPercent,
}: MacroInput): MacroSplit {
  const proteinGrams = weightKg * proteinGPerKg;
  const proteinKcal = proteinGrams * KCAL_PER_G_PROTEIN;
  const fatKcal = kcalTarget * (fatPercent / 100);
  const fatGrams = fatKcal / KCAL_PER_G_FAT;
  const carbsKcal = kcalTarget - proteinKcal - fatKcal;
  return {
    protein: { grams: proteinGrams, kcal: proteinKcal },
    fat: { grams: fatGrams, kcal: fatKcal },
    carbs: { grams: carbsKcal / KCAL_PER_G_CARB, kcal: carbsKcal },
    feasible: carbsKcal >= 0,
  };
}
