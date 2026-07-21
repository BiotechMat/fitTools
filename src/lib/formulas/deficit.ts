/**
 * Calorie deficit / weight-loss timeline (SPEC §7). Uses the 7700 kcal ≈
 * 1 kg heuristic (Wishnofsky 1958 origin); the editorial content must name
 * adaptive thermogenesis and the heuristic's weakness over long durations.
 * Recommended deficit is capped at 25% of TDEE.
 */

export const KCAL_PER_KG = 7700;
export const MAX_DEFICIT_FRACTION = 0.25;

/** Estimated weekly loss in kg for a constant daily deficit. */
export function weeklyLossKg(dailyDeficitKcal: number): number {
  return (dailyDeficitKcal * 7) / KCAL_PER_KG;
}

/** Estimated weeks to lose targetKg at a constant daily deficit. */
export function weeksToTarget(targetKg: number, dailyDeficitKcal: number): number {
  if (dailyDeficitKcal <= 0) return Infinity;
  return (targetKg * KCAL_PER_KG) / (dailyDeficitKcal * 7);
}

/** Largest recommended daily deficit: 25% of TDEE. */
export function maxRecommendedDeficit(tdeeKcal: number): number {
  return tdeeKcal * MAX_DEFICIT_FRACTION;
}
