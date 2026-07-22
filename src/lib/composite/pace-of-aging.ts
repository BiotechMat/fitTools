import type { Sex } from "@/lib/formulas/energy";
import {
  type IndexResult,
  type SubScoreInput,
  clampedLinear,
  computeIndex,
} from "@/lib/composite/index-engine";

/**
 * "Pace of Aging" open composite index (METHODOLOGY.md §5.1). A
 * self-relative lifestyle-trajectory score — explicitly NOT a biological
 * age. Version-controlled, radar-first, §4.6 presentation.
 *
 * Note: §5.1 weights cardiorespiratory fitness (VO₂max / fitness age) at
 * 25%, but the Fitness Age tool (§3.2) is blocked on a paywalled source, so
 * VO₂max is an OPTIONAL input here (enter it only if you know it from a
 * test). Grip strength and HRV are optional too — many people lack a
 * dynamometer or HRV reading. Missing optional inputs renormalise the
 * weights (§4.5) and flag reduced confidence, rather than being guessed.
 */

export const PACE_OF_AGING_VERSION = "v1.0.0";

export const PACE_OF_AGING_DEFINITION = [
  { key: "vo2max", label: "Cardio fitness", weight: 25, tier: "T1" as const },
  { key: "whtr", label: "Waist-to-height", weight: 12, tier: "T1" as const },
  { key: "grip", label: "Grip strength", weight: 12, tier: "T1" as const },
  { key: "mvpa", label: "Activity volume", weight: 12, tier: "T1" as const },
  { key: "sleep", label: "Sleep", weight: 12, tier: "T2" as const },
  { key: "rhr", label: "Resting HR", weight: 10, tier: "T2" as const },
  { key: "hrv", label: "HRV", weight: 10, tier: "T2" as const },
  { key: "smoking", label: "Smoking", weight: 5, tier: "T1" as const },
  { key: "alcohol", label: "Alcohol", weight: 2, tier: "T2" as const },
];

/** Sleep sub-score: peaks around 7.75 h, loses ~25 points per hour off. */
export function sleepScore(hours: number): number {
  return Math.max(0, Math.min(100, 100 - Math.abs(hours - 7.75) * 25));
}

export interface PaceOfAgingInput {
  sex: Sex;
  waistToHeight: number;
  mvpaMinPerWeek: number;
  sleepHours: number;
  restingHr: number;
  currentSmoker: boolean;
  alcoholUnitsPerWeek: number;
  /** Optional (§4.5): omit if unknown. */
  vo2max?: number | null;
  gripKg?: number | null;
  hrvMs?: number | null;
}

export function paceOfAgingSubScores(input: PaceOfAgingInput): SubScoreInput[] {
  const def = Object.fromEntries(PACE_OF_AGING_DEFINITION.map((d) => [d.key, d]));
  const gripAnchors =
    input.sex === "male" ? { best: 55, worst: 25 } : { best: 33, worst: 15 };
  return [
    {
      ...def.vo2max,
      score: input.vo2max == null ? null : clampedLinear(input.vo2max, { best: 50, worst: 25 }),
    },
    { ...def.whtr, score: clampedLinear(input.waistToHeight, { best: 0.4, worst: 0.6 }) },
    {
      ...def.grip,
      score: input.gripKg == null ? null : clampedLinear(input.gripKg, gripAnchors),
    },
    { ...def.mvpa, score: clampedLinear(input.mvpaMinPerWeek, { best: 300, worst: 0 }) },
    { ...def.sleep, score: sleepScore(input.sleepHours) },
    { ...def.rhr, score: clampedLinear(input.restingHr, { best: 50, worst: 90 }) },
    {
      ...def.hrv,
      score: input.hrvMs == null ? null : clampedLinear(input.hrvMs, { best: 70, worst: 15 }),
    },
    { ...def.smoking, score: input.currentSmoker ? 0 : 100 },
    { ...def.alcohol, score: clampedLinear(input.alcoholUnitsPerWeek, { best: 0, worst: 35 }) },
  ];
}

export interface PaceResult extends IndexResult {
  /** Centred display transform (§4.4): ~0.8 (younger) to ~1.2 (older). */
  pace: number;
}

export function paceOfAgingIndex(input: PaceOfAgingInput): PaceResult | null {
  // Six always-present inputs; the three optional ones may be absent.
  const result = computeIndex(paceOfAgingSubScores(input), 6);
  if (!result) return null;
  return { ...result, pace: 1.2 - (result.index / 100) * 0.4 };
}
