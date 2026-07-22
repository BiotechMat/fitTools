/**
 * Ballpark scoring & slider mapping (DAILY-GAMES.md §3.1). Pure and
 * node-testable — mirrors the pure-core discipline in `pulse/rank.ts`.
 *
 * Closeness is scored by **relative error against the slider span**, not
 * against the answer: it's the fair measure for a guess-the-stat game (being
 * 3 bpm off a heart rate and 3 g off a protein target aren't the same thing),
 * and it sidesteps division-by-near-zero when an answer sits close to 0.
 */

import type { BallparkItem, ClosenessTier } from "./types";

/** Tier cut-offs as a fraction of the slider span (DAILY-GAMES.md §3.1, §12). */
export const TIER_THRESHOLDS: Record<Exclude<ClosenessTier, "cold">, number> = {
  bullseye: 0.05,
  hot: 0.15,
  warm: 0.3,
};

/** Score a guess against an item: closeness tier by span-relative error. */
export function scoreGuess(item: Pick<BallparkItem, "answer" | "sliderMin" | "sliderMax">, guess: number): ClosenessTier {
  const span = item.sliderMax - item.sliderMin;
  if (span <= 0) return "cold";
  const error = Math.abs(guess - item.answer) / span;
  if (error <= TIER_THRESHOLDS.bullseye) return "bullseye";
  if (error <= TIER_THRESHOLDS.hot) return "hot";
  if (error <= TIER_THRESHOLDS.warm) return "warm";
  return "cold";
}

/* ------------------------------------------------------------------ */
/* Slider position <-> value mapping. Position is always in [0, 1];    */
/* value is in [sliderMin, sliderMax], linear or log-mapped.           */
/* ------------------------------------------------------------------ */

type Bounds = Pick<BallparkItem, "sliderMin" | "sliderMax" | "logScale">;

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Map a slider position in [0,1] to a value in [min,max] (log-aware). */
export function valueFromPosition(bounds: Bounds, position: number): number {
  const p = clamp01(position);
  if (bounds.logScale && bounds.sliderMin > 0) {
    const lo = Math.log(bounds.sliderMin);
    const hi = Math.log(bounds.sliderMax);
    return Math.exp(lo + (hi - lo) * p);
  }
  return bounds.sliderMin + (bounds.sliderMax - bounds.sliderMin) * p;
}

/** Inverse of `valueFromPosition` — value → position in [0,1] (log-aware). */
export function positionFromValue(bounds: Bounds, value: number): number {
  if (bounds.logScale && bounds.sliderMin > 0) {
    const lo = Math.log(bounds.sliderMin);
    const hi = Math.log(bounds.sliderMax);
    if (hi === lo) return 0;
    return clamp01((Math.log(Math.max(value, bounds.sliderMin)) - lo) / (hi - lo));
  }
  const span = bounds.sliderMax - bounds.sliderMin;
  if (span === 0) return 0;
  return clamp01((value - bounds.sliderMin) / span);
}

/**
 * A sensible starting value for the slider that is NOT the answer and not a
 * fixed anchor: a deterministic, per-item, per-day position derived from the
 * seed so every visitor sees the same non-revealing default (DAILY-GAMES.md
 * §3.1 "starting position is randomised so the default isn't an anchor").
 */
export function defaultGuess(item: BallparkItem, seed: number): number {
  // A stable pseudo-position in [0.2, 0.8] from the seed; avoids the extremes
  // and the midpoint (which would often sit on round-number answers).
  const frac = ((Math.abs(seed) * 2654435761) % 1000) / 1000; // 0..1, stable
  const position = 0.2 + 0.6 * frac;
  const raw = valueFromPosition(item, position);
  return roundToStep(item, raw);
}

/** Round a value to a display step appropriate to the item's span. */
export function roundToStep(item: Pick<BallparkItem, "sliderMin" | "sliderMax">, value: number): number {
  const step = sliderStep(item);
  return Math.round(value / step) * step;
}

/** Display/interaction step: whole numbers for wide spans, decimals for tight. */
export function sliderStep(item: Pick<BallparkItem, "sliderMin" | "sliderMax">): number {
  const span = item.sliderMax - item.sliderMin;
  if (span <= 5) return 0.1;
  if (span <= 50) return 1;
  if (span <= 300) return 5;
  return 10;
}
