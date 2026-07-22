import type { Sex } from "@/lib/formulas/energy";

/**
 * Lifestyle life-expectancy (METHODOLOGY.md §3.4). Source: Li Y, et al.
 * "Impact of Healthy Lifestyle Factors on Life Expectancies in the US
 * Population." Circulation 2018;138:345–355 (PMC6207481), from the Nurses'
 * Health Study and Health Professionals Follow-up Study.
 *
 * CRITICAL FRAMING (§3.4): this is a POPULATION-LEVEL ASSOCIATION — "people
 * with these habits lived, on average, X years longer in this cohort" — and
 * is explicitly NOT a personal life-expectancy prediction. The paper
 * publishes projected life expectancy at age 50 only for the endpoints
 * (0 and 5 low-risk factors); it does not tabulate intermediate counts, so
 * this tool never invents a per-count figure.
 */

export const LOW_RISK_FACTOR_KEYS = [
  "smoking",
  "bmi",
  "physicalActivity",
  "alcohol",
  "diet",
] as const;

export type LowRiskFactorKey = (typeof LOW_RISK_FACTOR_KEYS)[number];
export type FactorSelections = Record<LowRiskFactorKey, boolean>;

/** Exact factor definitions (Li 2018), for on-page display. */
export const LOW_RISK_FACTOR_DEFINITIONS: Record<
  LowRiskFactorKey,
  { label: string; definition: string }
> = {
  smoking: { label: "Never smoked", definition: "Never a cigarette smoker." },
  bmi: { label: "Healthy BMI", definition: "Body mass index 18.5–24.9 kg/m²." },
  physicalActivity: {
    label: "Active",
    definition: "At least 30 minutes a day of moderate-to-vigorous activity.",
  },
  alcohol: {
    label: "Moderate alcohol",
    definition: "Moderate intake: 5–15 g/day (women) or 5–30 g/day (men).",
  },
  diet: {
    label: "High diet quality",
    definition: "Diet quality in the top 40% (Alternate Healthy Eating Index).",
  },
};

interface Anchor {
  /** Projected remaining years at age 50, 0 low-risk factors. */
  zeroFactorsRemainingYears: number;
  /** Projected remaining years at age 50, all 5 low-risk factors. */
  fiveFactorsRemainingYears: number;
  /** The paper's reported average difference (rounding differs slightly from the endpoint subtraction). */
  reportedGainYears: number;
}

export const LIFE_EXPECTANCY_ANCHORS: Record<Sex, Anchor> = {
  female: {
    zeroFactorsRemainingYears: 29.0,
    fiveFactorsRemainingYears: 43.1,
    reportedGainYears: 14.0,
  },
  male: {
    zeroFactorsRemainingYears: 25.5,
    fiveFactorsRemainingYears: 37.6,
    reportedGainYears: 12.2,
  },
};

const REFERENCE_AGE = 50;

export function countLowRiskFactors(selections: FactorSelections): number {
  return LOW_RISK_FACTOR_KEYS.reduce(
    (n, key) => n + (selections[key] ? 1 : 0),
    0,
  );
}

export interface LifeExpectancyContext {
  count: number;
  anchors: Anchor;
  zeroFactorsProjectedAge: number;
  allFactorsProjectedAge: number;
  /** True only for counts 0 and 5 — the exact figures the paper published. */
  isPublishedExactCount: boolean;
}

export function lifeExpectancyContext(
  sex: Sex,
  selections: FactorSelections,
): LifeExpectancyContext {
  const anchors = LIFE_EXPECTANCY_ANCHORS[sex];
  const count = countLowRiskFactors(selections);
  return {
    count,
    anchors,
    zeroFactorsProjectedAge: REFERENCE_AGE + anchors.zeroFactorsRemainingYears,
    allFactorsProjectedAge: REFERENCE_AGE + anchors.fiveFactorsRemainingYears,
    isPublishedExactCount: count === 0 || count === 5,
  };
}
