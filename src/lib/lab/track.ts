import type { LabTier } from "./reaction";
import { formatMs } from "./reaction";

/**
 * Track station logic v2 (PERFORMANCE-LAB.md §4.6) — the range.
 *
 * v1 was hit-or-miss on shrinking targets, which made it a different
 * game per device: tiny discs, finger occlusion and the miss-plus-stray
 * double punishment stacked against touch. v2 keeps the aim identity —
 * free-position targets, real hand travel — and fixes the judging
 * instead: every target is a full-size archery board and every tap
 * scores by the ring it lands in, then advances. No binary miss exists,
 * so a thumb's few pixels of occlusion error cost ring points
 * proportionally, exactly like a sloppy cursor flick. Precision becomes
 * a continuous grouping measure and the test reads the same on every
 * device. (A light-board redesign was considered and rejected the same
 * day — it collapsed into a second Reaction test.)
 */

export const TRACK = {
  /** Targets per run — quick enough to retry, long enough to mean it. */
  targets: 25,
  /** Logical arena, portrait like the arcade canvases. */
  width: 420,
  height: 480,
  /**
   * The board: fixed size, generous — the outer ring alone is bigger
   * than v1's launch target, so there is nothing small to fat-finger.
   */
  rings: [
    { radius: 12, points: 10 }, // bullseye
    { radius: 26, points: 7 },
    { radius: 44, points: 4 },
  ],
  /** Keep boards clear of arena edges and browser gesture zones. */
  margin: 56,
  /** Force real travel between consecutive boards (logical px). */
  minJump: 110,
} as const;

/** The outer edge of the drawn board. */
export const BOARD_RADIUS: number = TRACK.rings[TRACK.rings.length - 1].radius;

/** A perfect run: every arrow in the bullseye. */
export const MAX_POINTS: number = TRACK.targets * TRACK.rings[0].points;

export interface TargetPos {
  x: number;
  y: number;
}

/**
 * Next board position: inside the margins, at least `minJump` from the
 * previous board so every arrow involves actual hand travel.
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

/** Ring points for a tap this far (logical px) from the board's centre. */
export function ringPointsFor(distance: number): number {
  for (const ring of TRACK.rings) {
    if (distance <= ring.radius) return ring.points;
  }
  return 0;
}

/** Total ring points as a 0–1 ratio of the perfect run. */
export function pointsRatio(points: number): number {
  return MAX_POINTS === 0 ? 0 : Math.max(0, Math.min(1, points / MAX_POINTS));
}

/** Mean time-to-target, whole ms. */
export function averageHitMs(times: number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
}

/**
 * The tier ladder. Spraying wide caps at Stormtrooper no matter how fast
 * — grouping is half the skill — then speed sorts the rest.
 */
export function trackTier(avgMs: number, ratio: number): LabTier {
  if (avgMs <= 0) return { name: "UNRATED", blurb: "the range stayed quiet." };
  if (ratio < 0.55)
    return { name: "STORMTROOPER", blurb: "all that firepower, none of the rings." };
  if (avgMs < 340) return { name: "AIMBOT", blurb: "someone check this hardware." };
  if (avgMs < 430) return { name: "SNIPER", blurb: "one tap, one target." };
  if (avgMs < 530) return { name: "SHARPSHOOTER", blurb: "the crosshair is a formality." };
  if (avgMs < 650) return { name: "HUMAN", blurb: "hands doing their honest best." };
  if (avgMs < 850) return { name: "CASUAL", blurb: "aiming with the heart, not the wrist." };
  return { name: "BUTTER FINGERS", blurb: "the targets died of old age." };
}

/** The screenshot-in-text share block (PERFORMANCE-LAB.md §6). */
export function trackShareText(points: number, avgMs: number): string {
  return [
    "🎯 THE LAB · TRACK",
    `${points}/${MAX_POINTS} · ${formatMs(avgMs)} a target · ${trackTier(avgMs, pointsRatio(points)).name}`,
    `${TRACK.targets} targets down.`,
    "Grouping tells the truth.",
  ].join("\n");
}
