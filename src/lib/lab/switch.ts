import type { LabTier } from "./reaction";

/**
 * Switch station logic (PERFORMANCE-LAB.md §4.5) — pure, testable tuning.
 * Task switching in the Rogers & Monsell (1995) lineage: each card is a
 * coloured shape, the active rule ("COLOUR?" / "SHAPE?") decides which
 * feature you answer, and the rule keeps flipping. The measured thing is
 * the SWITCH COST — how much slower the first trial after a rule change
 * runs than a repeat trial. Two big labelled answer pads: device-agnostic.
 */

export const SWITCH = {
  /** Scored trials; the first `warmup` are settle-in and never scored. */
  trials: 36,
  warmup: 4,
  /** Rule run lengths: switch after 2–4 trials of the same rule. */
  minRun: 2,
  maxRun: 4,
  /** Answer window per card, ms — dawdling scores as an error. */
  windowMs: 3000,
  /** Error-rate gate: above this the tier caps at BUTTON MASHER. */
  errorGate: 0.25,
} as const;

export type SwitchRule = "colour" | "shape";

export interface SwitchTrial {
  rule: SwitchRule;
  /** Feature indices: colour 0=orange 1=green; shape 0=circle 1=square. */
  colour: 0 | 1;
  shape: 0 | 1;
  /** First trial after a rule change (the costed kind). */
  isSwitch: boolean;
}

/** The correct answer pad (0 = orange/circle, 1 = green/square). */
export function correctAnswer(trial: SwitchTrial): 0 | 1 {
  return trial.rule === "colour" ? trial.colour : trial.shape;
}

/** A full seeded schedule: rules in runs of 2–4, features uniform. */
export function switchSchedule(rng: () => number): SwitchTrial[] {
  const total = SWITCH.warmup + SWITCH.trials;
  const trials: SwitchTrial[] = [];
  let rule: SwitchRule = rng() < 0.5 ? "colour" : "shape";
  let runLeft =
    SWITCH.minRun + Math.floor(rng() * (SWITCH.maxRun - SWITCH.minRun + 1));
  while (trials.length < total) {
    if (runLeft === 0) {
      rule = rule === "colour" ? "shape" : "colour";
      runLeft =
        SWITCH.minRun + Math.floor(rng() * (SWITCH.maxRun - SWITCH.minRun + 1));
    }
    const prev = trials[trials.length - 1];
    trials.push({
      rule,
      colour: rng() < 0.5 ? 0 : 1,
      shape: rng() < 0.5 ? 0 : 1,
      isSwitch: prev !== undefined && prev.rule !== rule,
    });
    runLeft -= 1;
  }
  return trials;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export interface SwitchScore {
  /** Median correct-trial RT on repeats and on switches, whole ms. */
  repeatMs: number;
  switchMs: number;
  /** switchMs − repeatMs. Negative happens (noise) and is reported as-is. */
  cost: number;
  errors: number;
  errorRate: number;
}

export interface ScoredSwitchTrial {
  isSwitch: boolean;
  correct: boolean;
  ms: number;
}

/** Score the run from the SCORED trials (warmup already dropped). */
export function switchScore(results: ScoredSwitchTrial[]): SwitchScore {
  const corrects = results.filter((r) => r.correct);
  const repeatMs = median(corrects.filter((r) => !r.isSwitch).map((r) => r.ms));
  const switchMs = median(corrects.filter((r) => r.isSwitch).map((r) => r.ms));
  const errors = results.length - corrects.length;
  return {
    repeatMs,
    switchMs,
    cost: switchMs - repeatMs,
    errors,
    errorRate: results.length === 0 ? 0 : errors / results.length,
  };
}

/** The flexibility ladder. Mashing caps at BUTTON MASHER whatever the cost. */
export function switchTier(cost: number, errorRate: number): LabTier {
  if (errorRate > SWITCH.errorGate)
    return { name: "BUTTON MASHER", blurb: "speed is easy when the answers are optional." };
  if (cost <= 0) return { name: "SHAPESHIFTER", blurb: "the rules fear you." };
  if (cost < 80) return { name: "GYMNAST", blurb: "sticks the landing every time." };
  if (cost < 160) return { name: "JUGGLER", blurb: "everything stays in the air." };
  if (cost < 260) return { name: "HUMAN", blurb: "gears change. slight clunk." };
  if (cost < 380) return { name: "ONE-TRACK MIND", blurb: "great train. one rail." };
  if (cost < 550) return { name: "HANDBRAKE TURN", blurb: "gets there. dramatically." };
  return { name: "BSOD", blurb: "blue screen of thought." };
}

/** The screenshot-in-text share block (PERFORMANCE-LAB.md §6). */
export function switchShareText(score: SwitchScore): string {
  return [
    "🔀 THE LAB · SWITCH",
    `Switch cost ${score.cost} ms · ${switchTier(score.cost, score.errorRate).name}`,
    `Repeat ${score.repeatMs} ms · switch ${score.switchMs} ms`,
    "The rules changed. Did the brain?",
  ].join("\n");
}
