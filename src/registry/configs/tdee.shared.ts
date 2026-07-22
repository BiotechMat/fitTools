/**
 * TDEE tool constants shared between the server-side config (which builds
 * the Zod schema from them) and the client calculator (which validates with
 * plain range checks). This file must stay dependency-free: importing Zod
 * here would pull ~68 kB gzipped into the client bundle and blow the
 * SPEC §13 JS budget.
 */

export const TDEE_SLUG = "tdee-calculator";

export interface Range {
  min: number;
  max: number;
}

/** Input ranges (SPEC §14). The Zod schema and the client UI both derive from these. */
export const TDEE_LIMITS = {
  ageYears: { min: 13, max: 100 },
  weightKg: { min: 30, max: 300 },
  heightCm: { min: 120, max: 250 },
  bodyFatPercent: { min: 5, max: 60 },
} as const satisfies Record<string, Range>;

export const TDEE_DEFAULTS = {
  sex: "male",
  ageYears: 30,
  weightKg: 80,
  heightCm: 175,
  activity: "moderate",
  formula: "mifflin",
} as const;

export function inRange(value: number, range: Range): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max;
}
