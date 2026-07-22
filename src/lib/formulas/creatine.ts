/**
 * Creatine dosing (SPEC §7), per the ISSN position stand (Kreider RB, et
 * al. J Int Soc Sports Nutr 2017): optional loading of 0.3 g/kg/day for
 * 5–7 days (typically split into 4 doses), then 3–5 g/day maintenance.
 */

export const CREATINE_LOADING_G_PER_KG = 0.3;
export const CREATINE_LOADING_DAYS = { min: 5, max: 7 };
export const CREATINE_MAINTENANCE_G = { min: 3, max: 5 };

export function creatineLoadingGramsPerDay(weightKg: number): number {
  return CREATINE_LOADING_G_PER_KG * weightKg;
}
