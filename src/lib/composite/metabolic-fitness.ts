import {
  type IndexResult,
  type SubScoreInput,
  clampedLinear,
  computeIndex,
} from "@/lib/composite/index-engine";

/**
 * "Metabolic Fitness" open composite index (METHODOLOGY.md §5.2). Transparent,
 * versioned, radar-first. Uses the CGM consensus metrics (§3.5) plus
 * waist-to-height and resting heart rate.
 *
 * Sub-score breakpoints (§4.2 documented clamped-linear mappings, §4.9
 * provenance): time-in-range anchored on the Battelino 2019 consensus
 * (≥70% target); %CV on the <36% stability target; GMI on ADA A1C bands
 * (~5.7% / 6.5%); waist-to-height on the 0.5 boundary (Ashwell); resting HR
 * on typical adult vs athletic ranges. These are self-tracking anchors, not
 * diagnostic thresholds.
 */

export const METABOLIC_FITNESS_VERSION = "v1.0.0";

export const METABOLIC_FITNESS_DEFINITION = [
  { key: "tir", label: "Time in range", weight: 30, tier: "T2" as const },
  { key: "cv", label: "Glucose stability", weight: 20, tier: "T2" as const },
  { key: "gmi", label: "Average glucose (GMI)", weight: 20, tier: "T2" as const },
  { key: "whtr", label: "Waist-to-height", weight: 15, tier: "T1" as const },
  { key: "rhr", label: "Resting heart rate", weight: 15, tier: "T2" as const },
];

export interface MetabolicFitnessInput {
  timeInRangePercent: number;
  cvPercent: number;
  gmiPercent: number;
  waistToHeight: number;
  restingHr: number;
}

export function metabolicFitnessSubScores(input: MetabolicFitnessInput): SubScoreInput[] {
  const def = Object.fromEntries(METABOLIC_FITNESS_DEFINITION.map((d) => [d.key, d]));
  return [
    { ...def.tir, score: clampedLinear(input.timeInRangePercent, { best: 90, worst: 50 }) },
    { ...def.cv, score: clampedLinear(input.cvPercent, { best: 20, worst: 45 }) },
    { ...def.gmi, score: clampedLinear(input.gmiPercent, { best: 5.0, worst: 7.5 }) },
    { ...def.whtr, score: clampedLinear(input.waistToHeight, { best: 0.4, worst: 0.6 }) },
    { ...def.rhr, score: clampedLinear(input.restingHr, { best: 50, worst: 90 }) },
  ];
}

export function metabolicFitnessIndex(input: MetabolicFitnessInput): IndexResult {
  // All five inputs required for this index.
  return computeIndex(metabolicFitnessSubScores(input), 5)!;
}
