import {
  type IndexResult,
  type SubScoreInput,
  computeIndex,
} from "@/lib/composite/index-engine";

/**
 * "Recovery Readiness" open composite index (METHODOLOGY.md §5.3). A daily,
 * purely self-relative score — the open version of proprietary readiness
 * scores. Every sub-score compares today's value against the user's own
 * personal baseline; there is NO cross-user comparison and no clinical
 * meaning.
 *
 * §5.3 proposed HRV at 40%, but §4.3 caps any single input at ~30%. We
 * follow the governing §4.3 rule and adjust: HRV 30, resting HR 25, sleep
 * 25, respiratory rate 20 (recorded in the changelog). All inputs are T2.
 */

export const RECOVERY_READINESS_VERSION = "v1.0.0";

export const RECOVERY_READINESS_DEFINITION = [
  { key: "hrv", label: "HRV vs baseline", weight: 30, tier: "T2" as const },
  { key: "rhr", label: "Resting HR vs baseline", weight: 25, tier: "T2" as const },
  { key: "sleep", label: "Sleep vs need", weight: 25, tier: "T2" as const },
  { key: "resp", label: "Breathing rate vs baseline", weight: 20, tier: "T2" as const },
];

/**
 * Sub-score from today-vs-baseline. `sensitivity` sets how many points a
 * proportional deviation moves the score; `higherIsBetter` flips direction
 * (HRV up is good; resting HR / breathing rate up is bad). Documented
 * simplification of a z-score for users who don't know their baseline SD.
 */
function deviationScore(
  today: number,
  baseline: number,
  { sensitivity, higherIsBetter }: { sensitivity: number; higherIsBetter: boolean },
): number {
  const rel = today / baseline - 1;
  const directed = higherIsBetter ? rel : -rel;
  return Math.max(0, Math.min(100, 50 + directed * sensitivity));
}

export interface RecoveryReadinessInput {
  hrvMs: number;
  hrvBaselineMs: number;
  restingHr: number;
  restingHrBaseline: number;
  sleepHours: number;
  sleepNeedHours: number;
  respRate: number;
  respRateBaseline: number;
}

export function recoveryReadinessSubScores(input: RecoveryReadinessInput): SubScoreInput[] {
  const def = Object.fromEntries(RECOVERY_READINESS_DEFINITION.map((d) => [d.key, d]));
  return [
    {
      ...def.hrv,
      score: deviationScore(input.hrvMs, input.hrvBaselineMs, {
        sensitivity: 250,
        higherIsBetter: true,
      }),
    },
    {
      ...def.rhr,
      score: deviationScore(input.restingHr, input.restingHrBaseline, {
        sensitivity: 500,
        higherIsBetter: false,
      }),
    },
    {
      ...def.sleep,
      score: deviationScore(input.sleepHours, input.sleepNeedHours, {
        sensitivity: 250,
        higherIsBetter: true,
      }),
    },
    {
      ...def.resp,
      score: deviationScore(input.respRate, input.respRateBaseline, {
        sensitivity: 500,
        higherIsBetter: false,
      }),
    },
  ];
}

export function recoveryReadinessIndex(input: RecoveryReadinessInput): IndexResult {
  return computeIndex(recoveryReadinessSubScores(input), 4)!;
}
