import type { LabTier } from "./reaction";

/**
 * Steady station logic (PERFORMANCE-LAB.md §4.4) — pure, testable tuning.
 * Fine motor control in the buzz-wire lineage: drag the probe along the
 * corridor without touching the walls. Track's device lesson applied at
 * design time: no binary fail and no shrinking anything — the corridor
 * is thumb-wide throughout, every run completes, and the score is the
 * SPARK count (wall contacts, debounced), which costs a wobbly thumb and
 * a wobbly cursor identically. Lifting off just pauses; the clock runs.
 */

export const STEADY = {
  /** Logical arena, portrait like the sibling stations. */
  width: 420,
  height: 480,
  /** Corridor width — generous for a thumb, constant end to end. */
  corridor: 52,
  /** Beyond centre + this, the probe is fully off the wire: progress pauses. */
  offWire: 40,
  /** Re-arm distance: a new spark can only fire after coming back this close. */
  rearm: 20,
  /** Progress can never jump more than this fraction at once (no wall-cutting). */
  maxHop: 0.08,
  /** The run ends when progress reaches this fraction of the wire. */
  finishAt: 0.985,
  /** Start pad radius around the wire's first point. */
  startRadius: 34,
} as const;

/**
 * The wire: a serpentine with three hairpins, drawn inside the margins.
 * Authored, not generated — the course IS the tuning.
 */
export const WIRE: readonly { x: number; y: number }[] = [
  { x: 64, y: 420 },
  { x: 356, y: 420 },
  { x: 356, y: 300 },
  { x: 64, y: 300 },
  { x: 64, y: 180 },
  { x: 356, y: 180 },
  { x: 356, y: 60 },
] as const;

/** Total wire length (logical px). */
export function wireLength(): number {
  let length = 0;
  for (let i = 1; i < WIRE.length; i++) {
    length += Math.hypot(WIRE[i].x - WIRE[i - 1].x, WIRE[i].y - WIRE[i - 1].y);
  }
  return length;
}

export interface WireFix {
  /** Distance from the point to the wire's centre line (logical px). */
  distance: number;
  /** Progress along the wire at the nearest point, 0..1. */
  t: number;
}

/** Nearest point on the wire: segment-projected, exact. */
export function nearestOnWire(x: number, y: number): WireFix {
  const total = wireLength();
  let best: WireFix = { distance: Infinity, t: 0 };
  let run = 0;
  for (let i = 1; i < WIRE.length; i++) {
    const a = WIRE[i - 1];
    const b = WIRE[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const u =
      len === 0
        ? 0
        : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (len * len)));
    const px = a.x + u * dx;
    const py = a.y + u * dy;
    const distance = Math.hypot(x - px, y - py);
    if (distance < best.distance) {
      best = { distance, t: (run + u * len) / total };
    }
    run += len;
  }
  return best;
}

/** Point on the wire at progress t (0..1) — for drawing the trail head. */
export function wirePointAt(t: number): { x: number; y: number } {
  const target = Math.max(0, Math.min(1, t)) * wireLength();
  let run = 0;
  for (let i = 1; i < WIRE.length; i++) {
    const a = WIRE[i - 1];
    const b = WIRE[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (run + len >= target) {
      const u = len === 0 ? 0 : (target - run) / len;
      return { x: a.x + u * (b.x - a.x), y: a.y + u * (b.y - a.y) };
    }
    run += len;
  }
  return { ...WIRE[WIRE.length - 1] };
}

/** Touching the wall? (centre-line distance past half the corridor). */
export function isSparking(distance: number): boolean {
  return distance > STEADY.corridor / 2;
}

/** The steadiness ladder — sparks over the full course. */
export function steadyTier(sparks: number, completed: boolean): LabTier {
  if (!completed) return { name: "UNRATED", blurb: "the wire waits." };
  if (sparks === 0) return { name: "SURGEON", blurb: "hands of a watchmaker." };
  if (sparks <= 2) return { name: "STEADY EDDIE", blurb: "barely a tremble." };
  if (sparks <= 5) return { name: "HUMAN", blurb: "a wobble here, a wobble there." };
  if (sparks <= 9) return { name: "JITTERBUG", blurb: "dancing when it should be walking." };
  if (sparks <= 14) return { name: "ESPRESSO OVERDOSE", blurb: "decaf. please. we're begging." };
  return { name: "JACKHAMMER", blurb: "the wall knows your name." };
}

/** "41.2 s" — course time for copy. */
export function formatSeconds(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

/** The screenshot-in-text share block (PERFORMANCE-LAB.md §6). */
export function steadyShareText(sparks: number, ms: number): string {
  return [
    "🖐 THE LAB · STEADY",
    `${sparks} spark${sparks === 1 ? "" : "s"} · ${formatSeconds(ms)} · ${steadyTier(sparks, true).name}`,
    "The wire always knows.",
  ].join("\n");
}
