/**
 * Double progression planner (SPEC §7): all sets at the top of the rep
 * range → next session adds the increment and resets reps to the bottom
 * of the range; otherwise repeat the load and add reps.
 */

export interface DoubleProgressionInput {
  repRangeMin: number;
  repRangeMax: number;
  currentLoadKg: number;
  incrementKg: number;
  /** Reps achieved on each set of the last session. */
  achievedReps: number[];
}

export interface NextPrescription {
  loadKg: number;
  targetReps: number;
  progressed: boolean;
}

export function doubleProgression({
  repRangeMin,
  repRangeMax,
  currentLoadKg,
  incrementKg,
  achievedReps,
}: DoubleProgressionInput): NextPrescription {
  const allAtTop =
    achievedReps.length > 0 &&
    achievedReps.every((reps) => reps >= repRangeMax);
  if (allAtTop) {
    return {
      loadKg: currentLoadKg + incrementKg,
      targetReps: repRangeMin,
      progressed: true,
    };
  }
  return { loadKg: currentLoadKg, targetReps: repRangeMax, progressed: false };
}
