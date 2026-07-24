import type { LabTier } from "./reaction";
import { formatMs } from "./reaction";

/**
 * Track station logic (PERFORMANCE-LAB.md §4.6) — pure, testable tuning.
 * Aimed tapping in the Fitts (1954) lineage: targets relocate around the
 * arena and shrink as the run goes; stray taps are misses. The score is
 * hit time + accuracy, and the tier ladder runs Stormtrooper → Aimbot,
 * because gamers already speak this language fluently.
 */

export const TRACK = {
  /** Targets per run — quick enough to retry, long enough to mean it. */
  targets: 25,
  /** Logical arena, portrait like the arcade canvases. */
  width: 420,
  height: 480,
  /** Target radius shrinks across the run (logical px). */
  startRadius: 34,
  minRadius: 18,
  /** Keep targets clear of the arena edges. */
  margin: 44,
  /** Force real travel between consecutive targets (logical px). */
  minJump: 110,
} as const;

/** Radius for the nth target (0-based) — a linear shrink, floored. */
export function radiusFor(index: number): number {
  const t = Math.min(1, index / (TRACK.targets - 1));
  return Math.round(
    TRACK.startRadius - (TRACK.startRadius - TRACK.minRadius) * t,
  );
}

export interface TargetPos {
  x: number;
  y: number;
}

/**
 * Next target position: inside the margins, at least `minJump` from the
 * previous target so every hit involves actual hand travel.
 */
export function positionFor(
  rng: () => number,
  prev: TargetPos | null,
): TargetPos {
  const minX = TRACK.margin;
  const maxX = TRACK.width - TRACK.margin;
  const minY = TRACK.margin;
  const maxY = TRACK.height - TRACK.margin;
  for (let attempt = 0; attempt < 40; attempt++) {
    const x = minX + rng() * (maxX - minX);
    const y = minY + rng() * (maxY - minY);
    if (!prev) return { x, y };
    const dx = x - prev.x;
    const dy = y - prev.y;
    if (Math.hypot(dx, dy) >= TRACK.minJump) return { x, y };
  }
  /* Degenerate rng — fall back to the far corner from prev. */
  return {
    x: prev && prev.x > TRACK.width / 2 ? minX : maxX,
    y: prev && prev.y > TRACK.height / 2 ? minY : maxY,
  };
}

/** Hits landed / taps thrown. */
export function accuracyFor(hits: number, misses: number): number {
  const taps = hits + misses;
  return taps === 0 ? 0 : hits / taps;
}

/** Mean time-to-target, whole ms. */
export function averageHitMs(times: number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
}

/**
 * The tier ladder. Spray-and-pray caps at Stormtrooper no matter how fast —
 * accuracy is half the skill — then speed sorts the rest.
 */
export function trackTier(avgMs: number, accuracy: number): LabTier {
  if (avgMs <= 0) return { name: "UNRATED", blurb: "the targets went untroubled." };
  if (accuracy < 0.7)
    return { name: "STORMTROOPER", blurb: "all that firepower, none of the hits." };
  if (avgMs < 340) return { name: "AIMBOT", blurb: "someone check this hardware." };
  if (avgMs < 430) return { name: "SNIPER", blurb: "one tap, one target." };
  if (avgMs < 530) return { name: "SHARPSHOOTER", blurb: "the crosshair is a formality." };
  if (avgMs < 650) return { name: "HUMAN", blurb: "hands doing their honest best." };
  if (avgMs < 850) return { name: "CASUAL", blurb: "aiming with the heart, not the wrist." };
  return { name: "BUTTER FINGERS", blurb: "the targets died of old age." };
}

/**
 * The screenshot-in-text share block (PERFORMANCE-LAB.md §6). A finished
 * run always lands all the targets (they wait to be hit) — the bragging
 * numbers are speed and how few strays it took.
 */
export function trackShareText(misses: number, avgMs: number): string {
  const accuracy = accuracyFor(TRACK.targets, misses);
  return [
    "🎯 THE LAB · TRACK",
    `${formatMs(avgMs)} to target · ${Math.round(accuracy * 100)}% accuracy · ${trackTier(avgMs, accuracy).name}`,
    `${TRACK.targets} targets down.`,
    "Every stray tap counts.",
  ].join("\n");
}
