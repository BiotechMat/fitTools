/**
 * Composite-index engine (METHODOLOGY.md §4). The shared machinery behind
 * every Layer 2 open index: sub-score normalisation, weighted aggregation,
 * missing-data renormalisation, and evidence-tier discipline checks.
 *
 * House rules encoded here:
 * - §4.2 sub-scores are 0–100, higher = more favourable.
 * - §4.3 weights sum to 100, no single input > 30%, weight tracks evidence
 *   tier (a T3 input may never outweigh a T1 input).
 * - §4.4 aggregation is a weighted arithmetic mean.
 * - §4.5 missing inputs renormalise weights across what's present and flag
 *   reduced confidence; below a minimum input count the index is withheld.
 */

export type EvidenceTierLevel = "T1" | "T2" | "T3";

/** Map a value to a 0–100 sub-score via a clamped linear ramp (§4.2). */
export function clampedLinear(
  value: number,
  anchors: { best: number; worst: number },
): number {
  const { best, worst } = anchors;
  const t = (value - worst) / (best - worst);
  return Math.max(0, Math.min(100, t * 100));
}

/**
 * Map a z-score (vs personal baseline, §5.3) to a 0–100 sub-score. A z of 0
 * (at baseline) is 50; ±1 SD moves ~20 points; clamped. `higherIsBetter`
 * flips the direction for metrics where lower is favourable (e.g. resting HR).
 */
export function zScoreToSubScore(
  z: number,
  { higherIsBetter = true }: { higherIsBetter?: boolean } = {},
): number {
  const directed = higherIsBetter ? z : -z;
  return Math.max(0, Math.min(100, 50 + directed * 20));
}

export interface SubScoreInput {
  key: string;
  label: string;
  /** 0–100 sub-score, or null when the input is missing. */
  score: number | null;
  weight: number;
  tier: EvidenceTierLevel;
}

export interface SubScoreResult {
  key: string;
  label: string;
  score: number;
  /** Weight after renormalising across present inputs (§4.5). */
  effectiveWeight: number;
  tier: EvidenceTierLevel;
}

export interface IndexResult {
  index: number;
  subScores: SubScoreResult[];
  reducedConfidence: boolean;
  usedWeightTotal: number;
}

export function computeIndex(
  inputs: SubScoreInput[],
  minRequired: number,
): IndexResult | null {
  const present = inputs.filter(
    (i): i is SubScoreInput & { score: number } => i.score !== null,
  );
  if (present.length < minRequired) return null;

  const usedWeightTotal = present.reduce((s, i) => s + i.weight, 0);
  const index =
    present.reduce((s, i) => s + i.score * i.weight, 0) / usedWeightTotal;

  return {
    index,
    subScores: present.map((i) => ({
      key: i.key,
      label: i.label,
      score: i.score,
      effectiveWeight: (i.weight / usedWeightTotal) * 100,
      tier: i.tier,
    })),
    reducedConfidence: present.length < inputs.length,
    usedWeightTotal,
  };
}

export interface IndexDefinitionEntry {
  key: string;
  label: string;
  weight: number;
  tier: EvidenceTierLevel;
}

/**
 * Validate an index definition against the §4.3 discipline. Run as a unit
 * test per index so weight/tier drift can never ship silently. The explicit
 * rule in §4.3 is: weights sum to 100, no single input exceeds ~30%, and a
 * T3 (mechanistic) input may never carry more weight than a T1
 * (strong-evidence) input. (T2 may outweigh T1 — the doc's own §5.2 weights
 * do exactly that with time-in-range vs waist-to-height.)
 */
export function validateIndexDefinition(
  entries: IndexDefinitionEntry[],
): { valid: boolean; problems: string[] } {
  const problems: string[] = [];
  const total = entries.reduce((s, e) => s + e.weight, 0);
  if (Math.abs(total - 100) > 1e-6) {
    problems.push(`weights must sum to 100 (got ${total})`);
  }
  for (const e of entries) {
    if (e.weight > 30 + 1e-6) {
      problems.push(`input "${e.key}" weight ${e.weight}% exceeds the 30% cap`);
    }
  }
  const t1Weights = entries.filter((e) => e.tier === "T1").map((e) => e.weight);
  const minT1 = t1Weights.length > 0 ? Math.min(...t1Weights) : Infinity;
  for (const e of entries) {
    if (e.tier === "T3" && e.weight > minT1 + 1e-6) {
      problems.push(
        `tier discipline: T3 input "${e.key}" (${e.weight}%) outweighs a T1 input (${minT1}%)`,
      );
    }
  }
  return { valid: problems.length === 0, problems };
}
