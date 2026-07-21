/**
 * BMR / TDEE formulas (SPEC §7). Pure functions, SI units only
 * (kg, cm, years). Values are returned unrounded; round at display time.
 *
 * Sources (cited on-page in each tool's Methodology section):
 * - Mifflin MD, St Jeor ST, et al. Am J Clin Nutr 1990;51:241–247.
 * - Roza AM, Shizgal HM. Am J Clin Nutr 1984;40:168–182 (revised
 *   Harris–Benedict).
 * - Katch–McArdle: 370 + 21.6 × FFM(kg).
 */

export type Sex = "male" | "female";

export interface BmrInput {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}

/**
 * Mifflin–St Jeor resting metabolic rate (kcal/day), simplified form as
 * proposed for practice in the 1990 paper:
 * men 10W + 6.25H − 5A + 5; women 10W + 6.25H − 5A − 161.
 */
export function mifflinStJeor({ sex, weightKg, heightCm, ageYears }: BmrInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === "male" ? base + 5 : base - 161;
}

/** Katch–McArdle BMR (kcal/day) from fat-free mass in kg. */
export function katchMcArdle(fatFreeMassKilograms: number): number {
  return 370 + 21.6 * fatFreeMassKilograms;
}

/** Fat-free mass in kg from total weight and body-fat percentage (0–100). */
export function fatFreeMassKg(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - bodyFatPercent / 100);
}

/**
 * Revised Harris–Benedict BMR (kcal/day), Roza & Shizgal 1984:
 * men 88.362 + 13.397W + 4.799H − 5.677A;
 * women 447.593 + 9.247W + 3.098H − 4.330A.
 */
export function harrisBenedictRevised({ sex, weightKg, heightCm, ageYears }: BmrInput): number {
  return sex === "male"
    ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears
    : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * ageYears;
}

/** Standard activity multipliers (SPEC §7), labelled plainly in the UI. */
export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
} as const;

export type ActivityLevel = keyof typeof ACTIVITY_FACTORS;

/** Total daily energy expenditure: BMR × activity factor. */
export function tdee(bmrKcal: number, activityFactor: number): number {
  return bmrKcal * activityFactor;
}
