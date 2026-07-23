/**
 * Powerhouse game logic (POWERHOUSE.md §4) — pure, testable tuning.
 * The canvas component consumes these; nothing here touches the DOM.
 * Tuning targets: first runs bonk in Zone 2–3 inside ~90 s, Zone 5 is a
 * flex, and REDLINE (beyond Zone 5) is rare enough to screenshot.
 */

export const POWERHOUSE = {
  width: 420,
  height: 560,
  wallHeight: 26,
  playerRadius: 11,
  playerMinX: 24,
  /** The mito stays in the left 60% — the right is enemy airspace. */
  playerMaxX: 252,
  /** Exponential pointer-follow rate (1/s). */
  playerFollow: 10,
  keySpeed: 330,
  fireInterval: 0.3,
  rapidInterval: 0.15,
  bulletSpeed: 470,
  enemyBulletSpeed: 165,
  maxHearts: 3,
  invulnSeconds: 1.2,
  buffSeconds: 8,
  /** Seconds into a zone before THE CRASH turns up. */
  bossAt: 22,
  dropRate: 0.09,
  sparkAtp: 5,
} as const;

/** One heart-rate training zone of difficulty (POWERHOUSE.md §4). */
export interface Zone {
  name: string;
  /** Heartbeat soundtrack tempo. */
  bpm: number;
  /** Seconds between enemy spawns. */
  spawnInterval: number;
  /** Enemy speed multiplier. */
  speedMul: number;
  /** HP of this zone's boss can. */
  bossHp: number;
  /** How many ENEMY_KINDS are in the pool. */
  unlocked: number;
}

export const ZONES: Zone[] = [
  { name: "WARM-UP", bpm: 70, spawnInterval: 1.35, speedMul: 1, bossHp: 26, unlocked: 2 },
  { name: "ENDURANCE", bpm: 95, spawnInterval: 1.15, speedMul: 1.12, bossHp: 34, unlocked: 3 },
  { name: "TEMPO", bpm: 120, spawnInterval: 0.98, speedMul: 1.24, bossHp: 44, unlocked: 4 },
  { name: "THRESHOLD", bpm: 145, spawnInterval: 0.84, speedMul: 1.38, bossHp: 56, unlocked: 5 },
  { name: "VO₂ MAX", bpm: 170, spawnInterval: 0.72, speedMul: 1.5, bossHp: 70, unlocked: 5 },
];

export function zoneName(zoneIndex: number): string {
  return zoneIndex < ZONES.length ? ZONES[zoneIndex].name : "REDLINE";
}

export function bpmFor(zoneIndex: number): number {
  return zoneIndex < ZONES.length ? ZONES[zoneIndex].bpm : 185;
}

/** Falls forever in REDLINE, floored so the field stays readable. */
export function spawnIntervalFor(zoneIndex: number): number {
  if (zoneIndex < ZONES.length) return ZONES[zoneIndex].spawnInterval;
  return Math.max(0.45, 0.62 - (zoneIndex - ZONES.length) * 0.05);
}

/** Rises forever in REDLINE, capped so dodging stays physically possible. */
export function speedMulFor(zoneIndex: number): number {
  if (zoneIndex < ZONES.length) return ZONES[zoneIndex].speedMul;
  return Math.min(2, 1.58 + (zoneIndex - ZONES.length) * 0.08);
}

/** Every can is tougher than the last, including repeat REDLINE cans. */
export function bossHpFor(zoneIndex: number): number {
  if (zoneIndex < ZONES.length) return ZONES[zoneIndex].bossHp;
  return 88 + (zoneIndex - ZONES.length) * 14;
}

export function unlockedKinds(zoneIndex: number): number {
  const unlocked =
    zoneIndex < ZONES.length ? ZONES[zoneIndex].unlocked : ENEMY_KINDS.length;
  return Math.min(ENEMY_KINDS.length, unlocked);
}

export interface EnemyKind {
  id: "radical" | "sugar" | "cortisol" | "screen" | "ultra";
  label: string;
  hp: number;
  /** ATP paid on the kill, before the streak multiplier. */
  atp: number;
  /** Base leftward speed in px/s, scaled by the zone multiplier. */
  speed: number;
  radius: number;
  /** Bonk gag. Targets the cartoon organelle, never the player (§3). */
  cause: string;
}

/** Unlock order is roster order (see Zone.unlocked). */
export const ENEMY_KINDS: EnemyKind[] = [
  {
    id: "radical",
    label: "FREE RADICAL",
    hp: 1,
    atp: 25,
    speed: 120,
    radius: 11,
    cause: "Oxidised by a free radical. The blueberries were RIGHT THERE.",
  },
  {
    id: "sugar",
    label: "SUGAR SPIKE",
    hp: 1,
    atp: 30,
    speed: 195,
    radius: 10,
    cause: "Glucose spike 1, powerhouse 0.",
  },
  {
    id: "cortisol",
    label: "CORTISOL",
    hp: 2,
    atp: 40,
    speed: 90,
    radius: 14,
    cause: "Cortisol. The quiet mitochondria killer.",
  },
  {
    id: "screen",
    label: "DOOMSCROLL",
    hp: 1,
    atp: 45,
    speed: 130,
    radius: 12,
    cause: "Doomscrolled at 2am. The blue light won.",
  },
  {
    id: "ultra",
    label: "ULTRA-PROCESSED",
    hp: 3,
    atp: 50,
    speed: 78,
    radius: 14,
    cause: "Ultra-processed, ultra-victorious.",
  },
];

/** The zone-gate boss: a giant energy-drink can. */
export const BOSS = {
  label: "THE CRASH",
  atp: 500,
  radius: 26,
  cause: "The Crash. It always comes after the can.",
} as const;

export interface PowerupKind {
  id: "protein" | "creatine" | "caffeine" | "sleep" | "berry" | "water";
  label: string;
  /** Toast shown on pickup. */
  blurb: string;
}

export const POWERUP_KINDS: PowerupKind[] = [
  { id: "protein", label: "PROTEIN", blurb: "TRIPLE SHOT" },
  { id: "creatine", label: "CREATINE", blurb: "SWOLE SHOTS" },
  { id: "caffeine", label: "CAFFEINE", blurb: "RAPID FIRE" },
  { id: "sleep", label: "SLEEP", blurb: "SHIELD UP" },
  { id: "berry", label: "BLUEBERRY", blurb: "ANTIOXIDANT BURST" },
  { id: "water", label: "WATER", blurb: "+1 HEART" },
];

/** Kill-streak multiplier: the greed loop. Steps every 8, caps ×5. */
export function multiplierFor(streak: number): number {
  return Math.min(5, 1 + Math.floor(streak / 8));
}

/**
 * Post-kill drop roll. Water only rolls while a heart is missing; at full
 * health its slot goes to the blueberry (the fun one).
 */
export function rollDrop(
  rng: () => number,
  hearts: number,
): PowerupKind["id"] | null {
  if (rng() >= POWERHOUSE.dropRate) return null;
  const pool: PowerupKind["id"][] = [
    "protein",
    "caffeine",
    "creatine",
    "sleep",
    "berry",
    hearts < POWERHOUSE.maxHearts ? "water" : "berry",
  ];
  return pool[Math.floor(rng() * pool.length)];
}

/** Circle-vs-circle collision, pure geometry. */
export function hitsCircle(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const rr = ar + br;
  return dx * dx + dy * dy < rr * rr;
}

/** The screenshot-in-text share line (POWERHOUSE.md §2). */
export function shareText(atp: number, zoneIndex: number): string {
  const zone =
    zoneIndex < ZONES.length
      ? `ZONE ${zoneIndex + 1} · ${zoneName(zoneIndex)}`
      : "REDLINE";
  return [
    "⚡ POWERHOUSE",
    `Bonked in ${zone} · ${atp.toLocaleString("en-GB")} ATP`,
    "The mitochondria is the powerhouse of the cell. I was not.",
  ].join("\n");
}
