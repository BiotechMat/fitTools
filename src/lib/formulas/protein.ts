/**
 * Daily protein targets (SPEC §7 extension, 2026-07-23). Pure functions,
 * SI units (kg). Bands are g/kg/day ranges taken directly from the cited
 * literature — never invented:
 * - General training: 1.4–2.0 (ISSN position stand, Jäger et al. 2017).
 * - Muscle gain: 1.6–2.2 (Morton et al. 2018 meta-regression: ~1.6 g/kg
 *   breakpoint, 2.2 upper confidence bound).
 * - Fat loss in a deficit (training): 1.8–2.0 (Phillips & Van Loon 2011).
 * - Older adults (65+): 1.2–1.5 for the active (PROT-AGE minimum 1.0–1.2,
 *   Bauer et al. 2013).
 * - RDA baseline for reference: 0.8 g/kg.
 * Per-meal guidance: ~0.4 g/kg across ≥4 meals (Schoenfeld & Aragon 2018).
 */

export type ProteinGoal = "general" | "build" | "cut" | "older";

export const PROTEIN_BANDS_G_PER_KG: Record<
  ProteinGoal,
  { min: number; max: number }
> = {
  general: { min: 1.4, max: 2.0 },
  build: { min: 1.6, max: 2.2 },
  cut: { min: 1.8, max: 2.0 },
  older: { min: 1.2, max: 1.5 },
};

export const RDA_G_PER_KG = 0.8;

export const PER_MEAL_G_PER_KG = 0.4;

export interface ProteinRange {
  minG: number;
  maxG: number;
}

/** Daily protein range in grams for a body weight and goal. */
export function proteinRangeG(weightKg: number, goal: ProteinGoal): ProteinRange {
  const band = PROTEIN_BANDS_G_PER_KG[goal];
  return { minG: weightKg * band.min, maxG: weightKg * band.max };
}

/** Per-meal dose in grams (0.4 g/kg, Schoenfeld & Aragon 2018). */
export function perMealG(weightKg: number): number {
  return weightKg * PER_MEAL_G_PER_KG;
}

/** RDA baseline in grams — the sedentary minimum, shown for contrast. */
export function rdaG(weightKg: number): number {
  return weightKg * RDA_G_PER_KG;
}
