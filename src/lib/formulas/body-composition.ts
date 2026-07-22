import type { Sex } from "@/lib/formulas/energy";

/**
 * Lean body mass and FFMI (SPEC §7). SI units. Sources cited on-page:
 * Boer P. Am J Physiol 1984 (LBM formulas); Kouri EM, et al. Clin J Sport
 * Med 1995 (FFMI and the height adjustment).
 */

/** Boer LBM: men 0.407W + 0.267H − 19.2; women 0.252W + 0.473H − 48.3. */
export function boerLeanBodyMass({
  sex,
  weightKg,
  heightCm,
}: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
}): number {
  return sex === "male"
    ? 0.407 * weightKg + 0.267 * heightCm - 19.2
    : 0.252 * weightKg + 0.473 * heightCm - 48.3;
}

/** FFMI = FFM(kg) / height(m)². */
export function ffmi(fatFreeMassKilograms: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return fatFreeMassKilograms / (heightM * heightM);
}

/** Height-adjusted FFMI (Kouri): FFMI + 6.1 × (1.8 − height in m). */
export function adjustedFfmi(fatFreeMassKilograms: number, heightCm: number): number {
  return ffmi(fatFreeMassKilograms, heightCm) + 6.1 * (1.8 - heightCm / 100);
}
