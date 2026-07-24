/**
 * Lifeline game logic (LIFELINE.md §4) — pure, testable tuning functions.
 * The canvas component consumes these; nothing here touches the DOM.
 * Tuning targets: first runs die in the 30s–60s band (ages ~40–75), and
 * age 100 (the centenarian club) is rare enough to brag about.
 */

export const LIFELINE = {
  width: 420,
  height: 560,
  playerX: 110,
  playerRadius: 9,
  /** Collision circle is 2px inside the drawn heart — overlap without death
      feels generous; death without overlap kills the game. */
  hitboxRadius: 7,
  gravity: 1500,
  flapImpulse: -420,
  terminalFall: 520,
  startAge: 18,
  yearsPerSecond: 1.5,
  columnHalfWidth: 17,
  groundHeight: 34,
} as const;

export interface ObstacleKind {
  id: "sugar" | "smokes" | "allnighters" | "stress" | "sofa";
  label: string;
  /** Game-over gag. Targets the cartoon, never the player (LIFELINE.md §3). */
  cause: string;
}

export const OBSTACLE_KINDS: ObstacleKind[] = [
  { id: "sugar", label: "SUGAR", cause: "Death by fizzy pop. The bubbles won." },
  { id: "smokes", label: "SMOKES", cause: "The one habit with no safe dose." },
  {
    id: "allnighters",
    label: "ALL-NIGHTERS",
    cause: "Sleep is a performance enhancer. Was.",
  },
  { id: "stress", label: "STRESS", cause: "Cortisol 1, heart 0." },
  { id: "sofa", label: "SOFA", cause: "Sitting is not a sport." },
];

export const EDGE_CAUSE = "Flew off the chart. Ambition.";

export function ageAt(seconds: number, bonusYears: number): number {
  return LIFELINE.startAge + seconds * LIFELINE.yearsPerSecond + bonusYears;
}

/** Scroll speed in px/s — the game's BPM. Rises ~1.4 px/s per year. */
export function speedAt(age: number): number {
  return 150 + (age - LIFELINE.startAge) * 1.4;
}

/** Gap height in px. Narrows with age, floored so 90+ stays possible. */
export function gapAt(age: number): number {
  return Math.max(66, 118 - (age - LIFELINE.startAge) * 0.55);
}

/** Seconds between column spawns; floored so the field stays readable. */
export function spawnIntervalAt(age: number): number {
  return Math.max(0.9, 1.45 - (age - LIFELINE.startAge) * 0.008);
}

export type Medal = "none" | "bronze" | "silver" | "gold" | "centenarian";

export function medalFor(age: number): Medal {
  if (age >= 100) return "centenarian";
  if (age >= 80) return "gold";
  if (age >= 60) return "silver";
  if (age >= 40) return "bronze";
  return "none";
}

export interface ColumnGeometry {
  x: number;
  gapY: number;
  gapH: number;
}

/** Circle-vs-column collision (both pipe halves), pure geometry. */
export function hitsColumn(
  py: number,
  radius: number,
  px: number,
  column: ColumnGeometry,
): boolean {
  const halfW = LIFELINE.columnHalfWidth;
  if (px + radius <= column.x - halfW || px - radius >= column.x + halfW) {
    return false;
  }
  return (
    py - radius < column.gapY - column.gapH / 2 ||
    py + radius > column.gapY + column.gapH / 2
  );
}

/** Daily run numbering — puzzle #1 on the launch date. */
const DAILY_EPOCH_UTC = Date.UTC(2026, 6, 23);

export function dailyPuzzleNumber(dateISO: string): number {
  const [y, m, d] = dateISO.split("-").map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - DAILY_EPOCH_UTC) / 86_400_000) + 1;
}

/** Seed for the daily course: the date digits (deterministic for everyone). */
export function dailySeed(dateISO: string): number {
  return Number(dateISO.replace(/-/g, ""));
}

/** Deterministic RNG (mulberry32) so a daily-seeded mode can ship later. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
