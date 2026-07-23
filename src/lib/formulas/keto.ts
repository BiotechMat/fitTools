/**
 * Ketogenic macro split (SPEC §7 extension, 2026-07-23). Arithmetic on
 * top of the existing energy formulas — no new physiology:
 * energy target = TDEE × goal factor; net carbs are a fixed low gramme
 * allowance (the defining feature of the diet); protein is g/kg from the
 * evidence-based range (Morton et al. 2018); fat supplies every remaining
 * kilocalorie. 4 kcal/g for carbohydrate and protein, 9 kcal/g for fat.
 */

export type KetoGoal = "lose" | "maintain" | "gain";

/** Modest cut / surplus factors, matching the deficit calculator's framing. */
export const KETO_GOAL_FACTORS: Record<KetoGoal, number> = {
  lose: 0.8,
  maintain: 1,
  gain: 1.1,
};

export interface KetoInput {
  tdeeKcal: number;
  goal: KetoGoal;
  netCarbsG: number;
  proteinGPerKg: number;
  weightKg: number;
}

export interface KetoMacros {
  kcalTarget: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
}

export function ketoMacros({
  tdeeKcal,
  goal,
  netCarbsG,
  proteinGPerKg,
  weightKg,
}: KetoInput): KetoMacros {
  const kcalTarget = tdeeKcal * KETO_GOAL_FACTORS[goal];
  const proteinG = weightKg * proteinGPerKg;
  const remainingKcal = Math.max(0, kcalTarget - netCarbsG * 4 - proteinG * 4);
  return {
    kcalTarget,
    carbsG: netCarbsG,
    proteinG,
    fatG: remainingKcal / 9,
  };
}
