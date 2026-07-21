/**
 * 1RM estimation (SPEC §7): Epley (default), Brzycki, Lombardi, O'Conner.
 * Estimates are considered valid for r ≤ 10; the UI warns above that.
 */

export type OneRmFormula = "epley" | "brzycki" | "lombardi" | "oconner";

export const REP_VALIDITY_LIMIT = 10;

export const ONE_RM_FORMULAS: Record<
  OneRmFormula,
  { label: string; estimate: (weight: number, reps: number) => number }
> = {
  epley: {
    label: "Epley",
    estimate: (weight, reps) => weight * (1 + reps / 30),
  },
  brzycki: {
    label: "Brzycki",
    estimate: (weight, reps) => (weight * 36) / (37 - reps),
  },
  lombardi: {
    label: "Lombardi",
    estimate: (weight, reps) => weight * reps ** 0.1,
  },
  oconner: {
    label: "O'Conner",
    estimate: (weight, reps) => weight * (1 + 0.025 * reps),
  },
};

export function oneRepMax(
  formula: OneRmFormula,
  weight: number,
  reps: number,
): number {
  return ONE_RM_FORMULAS[formula].estimate(weight, reps);
}

/** %1RM working-weight table, 50–95% in 5% steps (SPEC §7). */
export function percentTable(
  oneRm: number,
): { percent: number; weight: number }[] {
  const rows: { percent: number; weight: number }[] = [];
  for (let percent = 50; percent <= 95; percent += 5) {
    rows.push({ percent, weight: (oneRm * percent) / 100 });
  }
  return rows;
}
