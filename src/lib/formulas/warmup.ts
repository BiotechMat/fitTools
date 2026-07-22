import { type PlateStock, planPlateLoad } from "@/lib/formulas/plates";

/**
 * Warm-up generator (SPEC §7): default ramp bar×10, 40%×5, 60%×3, 80%×1
 * of the first work set, each rounded to a plate-loadable weight via the
 * plate module — but never above the work weight itself.
 */

export interface WarmupSet {
  targetKg: number;
  achievedKg: number;
  perSide: number[];
  reps: number;
}

const DEFAULT_RAMP: { fraction: number; reps: number }[] = [
  { fraction: 0.4, reps: 5 },
  { fraction: 0.6, reps: 3 },
  { fraction: 0.8, reps: 1 },
];

export function warmupSets(
  workSetKg: number,
  barKg: number,
  inventory: PlateStock[],
): WarmupSet[] {
  const sets: WarmupSet[] = [
    { targetKg: barKg, achievedKg: barKg, perSide: [], reps: 10 },
  ];
  for (const { fraction, reps } of DEFAULT_RAMP) {
    const targetKg = workSetKg * fraction;
    const plan = planPlateLoad(targetKg, barKg, inventory);
    // The nearest loadable weight may round above the work set for very
    // light work weights; cap by re-planning at the work weight's floor.
    const achieved =
      plan.achievedKg > workSetKg
        ? planPlateLoad(workSetKg, barKg, inventory)
        : plan;
    sets.push({
      targetKg,
      achievedKg: Math.min(achieved.achievedKg, workSetKg),
      perSide: achieved.perSide,
      reps,
    });
  }
  return sets;
}
