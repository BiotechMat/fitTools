/**
 * Energy expenditure from heart rate (SPEC §7 extension, 2026-07-23).
 * Keytel et al. 2005 (J Sports Sci 23:289–297) mixed-model equations
 * without VO2max, developed on steady-state aerobic exercise:
 *
 * men:   EE(kJ/min) = −55.0969 + 0.6309·HR + 0.1988·weight(kg) + 0.2017·age
 * women: EE(kJ/min) = −20.4022 + 0.4472·HR − 0.1263·weight(kg) + 0.074·age
 *
 * Converted to kcal/min by ÷ 4.184. The model was built on submaximal
 * steady-state exercise — roughly 90–150+ bpm; at low heart rates the
 * linear fit can go negative, which we clamp to zero (callers should warn
 * instead of showing a number in that region).
 */

import type { Sex } from "@/lib/formulas/energy";

export const KJ_PER_KCAL = 4.184;

export interface HrCaloriesInput {
  sex: Sex;
  heartRateBpm: number;
  weightKg: number;
  ageYears: number;
}

/** kcal per minute at a steady heart rate (clamped at zero). */
export function kcalPerMinute({
  sex,
  heartRateBpm,
  weightKg,
  ageYears,
}: HrCaloriesInput): number {
  const kjPerMin =
    sex === "male"
      ? -55.0969 + 0.6309 * heartRateBpm + 0.1988 * weightKg + 0.2017 * ageYears
      : -20.4022 + 0.4472 * heartRateBpm - 0.1263 * weightKg + 0.074 * ageYears;
  return Math.max(0, kjPerMin / KJ_PER_KCAL);
}

/** Total kcal for a session at a steady average heart rate. */
export function sessionKcal(input: HrCaloriesInput, durationMin: number): number {
  return kcalPerMinute(input) * durationMin;
}
