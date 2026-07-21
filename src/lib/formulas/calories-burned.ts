/**
 * MET method (SPEC §7): kcal/min = MET × 3.5 × weight(kg) / 200. MET
 * values come from the Compendium subset in src/data/mets.json.
 */

export function kcalPerMinute(met: number, weightKg: number): number {
  return (met * 3.5 * weightKg) / 200;
}

export function kcalBurned(met: number, weightKg: number, minutes: number): number {
  return kcalPerMinute(met, weightKg) * minutes;
}
