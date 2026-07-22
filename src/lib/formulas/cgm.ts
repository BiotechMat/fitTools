/**
 * CGM metabolic metrics (METHODOLOGY.md §3.5). Pure functions, glucose in
 * SI (mmol/L) canonically; GMI converts to mg/dL internally because its
 * published coefficient expects mg/dL.
 *
 * Sources (cited on-page):
 * - Bergenstal RM, et al. Glucose Management Indicator (GMI). Diabetes Care
 *   2018 — GMI = 3.31 + 0.02392 × mean glucose (mg/dL).
 * - Battelino T, et al. International consensus on time in range. Diabetes
 *   Care 2019 — TIR 70–180 mg/dL, %CV target < 36%.
 *
 * Non-diabetic honesty note (§3.5) belongs in the on-page copy: for
 * non-diabetic users the evidence that flattening normal excursions helps
 * is limited.
 */

export const GMI_INTERCEPT = 3.31;
export const GMI_SLOPE = 0.02392;
export const CV_STABILITY_TARGET = 36; // %CV consensus target
export const TIR_LOW_MMOL = 3.9;
export const TIR_HIGH_MMOL = 10.0;
const MG_DL_PER_MMOL = 18.0182;

export const mmolToMgDl = (mmol: number): number => mmol * MG_DL_PER_MMOL;
export const mgDlToMmol = (mgDl: number): number => mgDl / MG_DL_PER_MMOL;

export function gmiFromMeanMgDl(meanMgDl: number): number {
  return GMI_INTERCEPT + GMI_SLOPE * meanMgDl;
}

export interface CgmResult {
  meanMmol: number;
  meanMgDl: number;
  gmi: number;
  /** Coefficient of variation (%). */
  cvPercent: number;
  /** True when %CV is below the consensus 36% stability target. */
  cvStable: boolean;
  timeInRangePercent: number;
  timeBelowPercent: number;
  timeAbovePercent: number;
  readingCount: number;
}

/** Compute all consensus metrics from a series of glucose readings (mmol/L). */
export function cgmMetrics(readingsMmol: number[]): CgmResult {
  if (readingsMmol.length < 2) {
    throw new RangeError("At least two readings are required to compute variability");
  }
  const n = readingsMmol.length;
  const meanMmol = readingsMmol.reduce((a, b) => a + b, 0) / n;
  // Sample standard deviation (n − 1), the convention for %CV reporting.
  const variance =
    readingsMmol.reduce((a, b) => a + (b - meanMmol) ** 2, 0) / (n - 1);
  const sd = Math.sqrt(variance);
  const cvPercent = (sd / meanMmol) * 100;

  const inRange = readingsMmol.filter(
    (g) => g >= TIR_LOW_MMOL && g <= TIR_HIGH_MMOL,
  ).length;
  const below = readingsMmol.filter((g) => g < TIR_LOW_MMOL).length;
  const above = readingsMmol.filter((g) => g > TIR_HIGH_MMOL).length;
  const meanMgDl = mmolToMgDl(meanMmol);

  return {
    meanMmol,
    meanMgDl,
    gmi: gmiFromMeanMgDl(meanMgDl),
    cvPercent,
    cvStable: cvPercent < CV_STABILITY_TARGET,
    timeInRangePercent: (inRange / n) * 100,
    timeBelowPercent: (below / n) * 100,
    timeAbovePercent: (above / n) * 100,
    readingCount: n,
  };
}
