/**
 * VO2max estimation from field tests (SPEC §7 extension, 2026-07-23).
 * Pure functions, SI units in, ml·kg⁻¹·min⁻¹ out; round at display time.
 *
 * - Cooper 12-minute run: VO2max = (distance m − 504.9) ÷ 44.73
 *   (Cooper 1968, JAMA 203:201–204).
 * - Rockport 1-mile walk: VO2max = 132.853 − 0.0769·weight(lb)
 *   − 0.3877·age + 6.315·sex(m=1) − 3.2649·time(min) − 0.1565·HR
 *   (Kline et al. 1987, Med Sci Sports Exerc 19:253–259).
 * - Heart-rate ratio method: VO2max = 15.3 × HRmax ÷ HRrest
 *   (Uth et al. 2004, Eur J Appl Physiol 91:111–115).
 */

import type { Sex } from "@/lib/formulas/energy";

export const LB_PER_KG = 1 / 0.45359237;

/** Cooper 12-minute run test — distance covered in metres. */
export function cooperVo2max(distanceM: number): number {
  return (distanceM - 504.9) / 44.73;
}

export interface RockportInput {
  sex: Sex;
  ageYears: number;
  weightKg: number;
  /** Time to walk one mile as fast as possible, in minutes. */
  walkTimeMin: number;
  /** Heart rate at the end of the walk, bpm. */
  heartRateBpm: number;
}

/** Rockport 1-mile walk test (weight converted to lb internally). */
export function rockportVo2max({
  sex,
  ageYears,
  weightKg,
  walkTimeMin,
  heartRateBpm,
}: RockportInput): number {
  const weightLb = weightKg * LB_PER_KG;
  return (
    132.853 -
    0.0769 * weightLb -
    0.3877 * ageYears +
    6.315 * (sex === "male" ? 1 : 0) -
    3.2649 * walkTimeMin -
    0.1565 * heartRateBpm
  );
}

/** Heart-rate ratio method: 15.3 × HRmax ÷ HRrest (Uth et al. 2004). */
export function heartRateRatioVo2max(hrMaxBpm: number, hrRestBpm: number): number {
  if (hrRestBpm <= 0) throw new RangeError("Resting heart rate must be positive");
  return 15.3 * (hrMaxBpm / hrRestBpm);
}
