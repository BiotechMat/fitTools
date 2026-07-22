import type { Sex } from "@/lib/formulas/energy";
import { kcalPerMinute } from "@/lib/formulas/calories-burned";
import mets from "@/data/mets.json";

/**
 * Steps → calories (SPEC §7): stride ≈ 0.415 × height (men) / 0.413 ×
 * height (women); distance = steps × stride; energy via the walking MET
 * for the chosen pace. Clearly labelled a rough estimate on-page.
 */

export type WalkingPace = keyof typeof mets.walkingByPace;

export function strideLengthM(sex: Sex, heightCm: number): number {
  const factor = sex === "male" ? 0.415 : 0.413;
  return (factor * heightCm) / 100;
}

export interface StepsResult {
  distanceM: number;
  durationMinutes: number;
  kcal: number;
  met: number;
}

export function stepsToCalories({
  sex,
  heightCm,
  weightKg,
  steps,
  pace,
}: {
  sex: Sex;
  heightCm: number;
  weightKg: number;
  steps: number;
  pace: WalkingPace;
}): StepsResult {
  const { met, kmh } = mets.walkingByPace[pace];
  const distanceM = steps * strideLengthM(sex, heightCm);
  const durationMinutes = distanceM === 0 ? 0 : (distanceM / 1000 / kmh) * 60;
  return {
    distanceM,
    durationMinutes,
    kcal: kcalPerMinute(met, weightKg) * durationMinutes,
    met,
  };
}
