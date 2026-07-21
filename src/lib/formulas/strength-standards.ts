import type { Sex } from "@/lib/formulas/energy";
import standards from "@/data/strength-standards.json";

/**
 * Strength standards classification (SPEC §7) against the Kilgore 2023
 * tables in src/data/strength-standards.json (kg, age band 20–29).
 * Thresholds interpolate linearly between bodyweight rows and clamp at
 * the table edges; the on-page editorial describes the derivation.
 */

export type LiftKey = keyof typeof standards.lifts;
export type StandardLevel =
  | "untrained"
  | "physicallyActive"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "elite";

const LEVELS: readonly StandardLevel[] = [
  "physicallyActive",
  "beginner",
  "intermediate",
  "advanced",
  "elite",
];

/** Interpolated [physicallyActive, beginner, intermediate, advanced, elite] thresholds. */
export function thresholdsFor(lift: LiftKey, sex: Sex, bodyweightKg: number): number[] {
  const rows = standards.lifts[lift][sex];
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (bodyweightKg <= first.bw) return [...first.values];
  if (bodyweightKg >= last.bw) return [...last.values];
  for (let i = 1; i < rows.length; i++) {
    if (bodyweightKg <= rows[i].bw) {
      const lower = rows[i - 1];
      const upper = rows[i];
      const t = (bodyweightKg - lower.bw) / (upper.bw - lower.bw);
      return lower.values.map((value, j) => value + (upper.values[j] - value) * t);
    }
  }
  return [...last.values];
}

export interface LiftClassification {
  level: StandardLevel;
  thresholds: number[];
  nextLevel: StandardLevel | null;
  nextThresholdKg: number | null;
}

export function classifyLift(
  lift: LiftKey,
  sex: Sex,
  bodyweightKg: number,
  oneRepMaxKg: number,
): LiftClassification {
  const thresholds = thresholdsFor(lift, sex, bodyweightKg);
  let level: StandardLevel = "untrained";
  for (let i = 0; i < thresholds.length; i++) {
    if (oneRepMaxKg >= thresholds[i]) level = LEVELS[i];
  }
  const levelIndex = LEVELS.indexOf(level as (typeof LEVELS)[number]);
  const nextIndex = level === "untrained" ? 0 : levelIndex + 1;
  const hasNext = nextIndex < LEVELS.length;
  return {
    level,
    thresholds,
    nextLevel: hasNext ? LEVELS[nextIndex] : null,
    nextThresholdKg: hasNext ? thresholds[nextIndex] : null,
  };
}
