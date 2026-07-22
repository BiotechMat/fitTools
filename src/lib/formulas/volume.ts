/**
 * Training volume (SPEC §7): per-exercise sets × reps × load tonnage plus
 * weekly hard-set counts per muscle group.
 */

export interface ExerciseVolume {
  sets: number;
  reps: number;
  loadKg: number;
}

export function totalTonnage(exercises: ExerciseVolume[]): number {
  return exercises.reduce(
    (sum, { sets, reps, loadKg }) => sum + sets * reps * loadKg,
    0,
  );
}

export function weeklySetsPerMuscle(
  entries: { muscle: string; sets: number }[],
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const { muscle, sets } of entries) {
    totals.set(muscle, (totals.get(muscle) ?? 0) + sets);
  }
  return totals;
}
