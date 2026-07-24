import { describe, expect, it } from "vitest";
import {
  SWITCH,
  correctAnswer,
  switchSchedule,
  switchScore,
  switchShareText,
  switchTier,
} from "@/lib/lab/switch";
import { mulberry32 } from "@/lib/lifeline";

describe("the schedule (PERFORMANCE-LAB.md §4.5)", () => {
  it("deals warmup + scored trials in rule runs of 2–4", () => {
    for (const seed of [1, 7, 42]) {
      const trials = switchSchedule(mulberry32(seed));
      expect(trials).toHaveLength(SWITCH.warmup + SWITCH.trials);
      let run = 1;
      for (let i = 1; i < trials.length; i++) {
        if (trials[i].rule === trials[i - 1].rule) {
          run += 1;
          expect(trials[i].isSwitch).toBe(false);
        } else {
          expect(run).toBeGreaterThanOrEqual(SWITCH.minRun);
          expect(run).toBeLessThanOrEqual(SWITCH.maxRun);
          expect(trials[i].isSwitch).toBe(true);
          run = 1;
        }
      }
      /* Both kinds of trial exist in every deal — the cost needs both. */
      const scored = trials.slice(SWITCH.warmup);
      expect(scored.some((t) => t.isSwitch)).toBe(true);
      expect(scored.some((t) => !t.isSwitch)).toBe(true);
    }
  });

  it("keys the correct answer off the ACTIVE rule only", () => {
    expect(
      correctAnswer({ rule: "colour", colour: 1, shape: 0, isSwitch: false }),
    ).toBe(1);
    expect(
      correctAnswer({ rule: "shape", colour: 1, shape: 0, isSwitch: false }),
    ).toBe(0);
  });

  it("is deterministic for a given seed", () => {
    expect(switchSchedule(mulberry32(5))).toEqual(switchSchedule(mulberry32(5)));
  });
});

describe("scoring", () => {
  it("costs the switch trials against the repeats, medians of corrects only", () => {
    const score = switchScore([
      { isSwitch: false, correct: true, ms: 600 },
      { isSwitch: false, correct: true, ms: 640 },
      { isSwitch: false, correct: true, ms: 620 },
      { isSwitch: false, correct: false, ms: 100 }, // error — excluded from medians
      { isSwitch: true, correct: true, ms: 800 },
      { isSwitch: true, correct: true, ms: 840 },
      { isSwitch: true, correct: true, ms: 820 },
    ]);
    expect(score.repeatMs).toBe(620);
    expect(score.switchMs).toBe(820);
    expect(score.cost).toBe(200);
    expect(score.errors).toBe(1);
    expect(score.errorRate).toBeCloseTo(1 / 7);
  });

  it("survives an all-error run without dividing by zero", () => {
    const score = switchScore([
      { isSwitch: false, correct: false, ms: 500 },
      { isSwitch: true, correct: false, ms: 500 },
    ]);
    expect(score.repeatMs).toBe(0);
    expect(score.switchMs).toBe(0);
    expect(score.errorRate).toBe(1);
  });
});

describe("the flexibility ladder", () => {
  it("caps mashing at BUTTON MASHER regardless of the cost", () => {
    expect(switchTier(50, 0.3).name).toBe("BUTTON MASHER");
    expect(switchTier(50, 0.1).name).toBe("GYMNAST");
  });

  it("runs SHAPESHIFTER → BSOD as the cost climbs", () => {
    expect(switchTier(-20, 0).name).toBe("SHAPESHIFTER");
    expect(switchTier(50, 0).name).toBe("GYMNAST");
    expect(switchTier(120, 0).name).toBe("JUGGLER");
    expect(switchTier(200, 0).name).toBe("HUMAN");
    expect(switchTier(300, 0).name).toBe("ONE-TRACK MIND");
    expect(switchTier(450, 0).name).toBe("HANDBRAKE TURN");
    expect(switchTier(900, 0).name).toBe("BSOD");
    for (let cost = -100; cost <= 1000; cost += 17) {
      expect(switchTier(cost, 0).blurb.length).toBeGreaterThan(4);
    }
  });
});

describe("the share block", () => {
  it("carries the cost, both medians, the tier and the kicker", () => {
    const text = switchShareText({
      repeatMs: 620,
      switchMs: 800,
      cost: 180,
      errors: 1,
      errorRate: 0.03,
    });
    expect(text).toContain("THE LAB · SWITCH");
    expect(text).toContain("180 ms");
    expect(text).toContain("620 ms");
    expect(text).toContain("800 ms");
    expect(text).toContain("HUMAN");
    expect(text).toContain("Did the brain?");
  });
});
