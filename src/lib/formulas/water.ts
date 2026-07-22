import type { Sex } from "@/lib/formulas/energy";

/**
 * Daily water guideline (SPEC §7). Anchored on the EFSA adequate intakes
 * for TOTAL water — 2.0 L/day (women) and 2.5 L/day (men), which include
 * water from food (roughly 20–30%). Exercise adds sweat-rate × duration;
 * typical sweat rates span ~0.5–2.0 L/h (ACSM position stand, Sawka
 * 2007). Presented as a guideline, never a prescription.
 */

export const EFSA_TOTAL_WATER_L: Record<Sex, number> = {
  female: 2.0,
  male: 2.5,
};

export const SWEAT_RATE_RANGE_L_PER_H = { min: 0.3, max: 2.0 };

export function dailyWaterLitres({
  sex,
  exerciseHours,
  sweatRateLPerHour,
}: {
  sex: Sex;
  exerciseHours: number;
  sweatRateLPerHour: number;
}): number {
  return EFSA_TOTAL_WATER_L[sex] + exerciseHours * sweatRateLPerHour;
}
