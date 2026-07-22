import { describe, expect, it } from "vitest";
import {
  LIFE_EXPECTANCY_ANCHORS,
  LOW_RISK_FACTOR_KEYS,
  countLowRiskFactors,
  lifeExpectancyContext,
} from "@/lib/formulas/life-expectancy";

/**
 * Lifestyle life-expectancy (METHODOLOGY.md §3.4). Li et al., Circulation
 * 2018 (PMC6207481). Population-level association, NOT a personal
 * prediction. The paper publishes projected life expectancy at age 50 only
 * for the endpoints (0 and 5 low-risk factors); it does not tabulate the
 * intermediate counts, so this tool reports the verified anchors and the
 * count — never an invented per-count figure.
 */

describe("anchors (verified from the primary source)", () => {
  it("women: 29.0 remaining years at 50 with 0 factors, 43.1 with 5; +14.0", () => {
    expect(LIFE_EXPECTANCY_ANCHORS.female).toEqual({
      zeroFactorsRemainingYears: 29.0,
      fiveFactorsRemainingYears: 43.1,
      reportedGainYears: 14.0,
    });
  });

  it("men: 25.5 remaining years at 50 with 0 factors, 37.6 with 5; +12.2", () => {
    expect(LIFE_EXPECTANCY_ANCHORS.male).toEqual({
      zeroFactorsRemainingYears: 25.5,
      fiveFactorsRemainingYears: 37.6,
      reportedGainYears: 12.2,
    });
  });

  it("exposes exactly the five low-risk factors", () => {
    expect([...LOW_RISK_FACTOR_KEYS].sort()).toEqual([
      "alcohol",
      "bmi",
      "diet",
      "physicalActivity",
      "smoking",
    ]);
  });
});

describe("countLowRiskFactors", () => {
  it("counts the met factors", () => {
    expect(
      countLowRiskFactors({
        smoking: true,
        bmi: true,
        physicalActivity: false,
        alcohol: true,
        diet: false,
      }),
    ).toBe(3);
  });

  it("all met → 5, none met → 0", () => {
    const all = { smoking: true, bmi: true, physicalActivity: true, alcohol: true, diet: true };
    const none = { smoking: false, bmi: false, physicalActivity: false, alcohol: false, diet: false };
    expect(countLowRiskFactors(all)).toBe(5);
    expect(countLowRiskFactors(none)).toBe(0);
  });
});

describe("lifeExpectancyContext", () => {
  it("returns the sex-specific anchors with the user's count", () => {
    const ctx = lifeExpectancyContext("female", {
      smoking: true,
      bmi: true,
      physicalActivity: true,
      alcohol: false,
      diet: true,
    });
    expect(ctx.count).toBe(4);
    expect(ctx.anchors.fiveFactorsRemainingYears).toBe(43.1);
    // Projected total age at the endpoints (50 + remaining).
    expect(ctx.allFactorsProjectedAge).toBeCloseTo(93.1, 6);
    expect(ctx.zeroFactorsProjectedAge).toBeCloseTo(79.0, 6);
  });

  it("flags the endpoints (0 and 5) as the only published exact figures", () => {
    expect(lifeExpectancyContext("male", allFalse()).isPublishedExactCount).toBe(true); // 0
    expect(lifeExpectancyContext("male", allTrue()).isPublishedExactCount).toBe(true); // 5
    expect(
      lifeExpectancyContext("male", { ...allFalse(), smoking: true }).isPublishedExactCount,
    ).toBe(false); // 1 — intermediate, not published
  });
});

function allFalse() {
  return { smoking: false, bmi: false, physicalActivity: false, alcohol: false, diet: false };
}
function allTrue() {
  return { smoking: true, bmi: true, physicalActivity: true, alcohol: true, diet: true };
}
