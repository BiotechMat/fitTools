/**
 * Max Out game logic (MAXOUT.md §4) — pure, testable tuning.
 * The canvas component consumes these; nothing here touches the DOM.
 * Tuning targets: first runs fail in the 140–220 kg band inside ~60 s,
 * five plates (220 kg) is a flex, and seven plates a side (300 kg) is
 * rare enough to screenshot.
 */

export const MAXOUT = {
  width: 420,
  height: 560,
  /** The empty bar. */
  barWeight: 20,
  /** One plate a side — where every attempt starts. */
  startWeight: 60,
  /** Form points; the fail state. Three breaks and the lift is over. */
  maxForm: 3,
  /** Inner fraction of the window that judges PERFECT. */
  perfectCore: 0.4,
  /** Seconds of set-up between reps (re-chalk, breathe, needle resets). */
  setupSeconds: 0.55,
  /** Seconds the lockout celebration holds before the next set-up. */
  lockedSeconds: 0.6,
  /** Seconds the form-break wobble holds. */
  failedSeconds: 0.7,
  /** The spotter wanders over at three plates a side (kg). */
  spotterAt: 140,
  /** Chalk (earned at a 3-perfect streak) slows the needle for one rep. */
  chalkSlow: 0.75,
  /** Belt (earned at a 5-perfect streak) widens the window for one rep. */
  beltWiden: 1.4,
} as const;

/**
 * Weight added per locked rep, heaviest jumps first — warm-up singles,
 * then the grind. Past the ladder every rep is a 2.5 kg microload.
 * 60 → 100 → 140 → 180 → 200 → 220 → 240 → 250 → 260 → 270 → 275 → 280
 * → 285 → +2.5…  (seven plates a side, 300 kg, lands at rep 18.)
 */
export const INCREMENT_LADDER = [40, 40, 40, 20, 20, 20, 10, 10, 10, 5, 5, 5] as const;

export function incrementFor(lockedReps: number): number {
  return lockedReps < INCREMENT_LADDER.length ? INCREMENT_LADDER[lockedReps] : 2.5;
}

/** Bar weight after n locked reps. */
export function weightAfter(lockedReps: number): number {
  let weight: number = MAXOUT.startWeight;
  for (let i = 0; i < lockedReps; i++) weight += incrementFor(i);
  return weight;
}

/** Whole 20 kg plates a side at this bar weight (the bragging unit). */
export function platesPerSide(weight: number): number {
  return Math.max(0, Math.floor((weight - MAXOUT.barWeight) / 40));
}

const PLATE_WORDS = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
] as const;

/** "four plates a side" — the flex phrase for share lines and milestones. */
export function platesPhrase(weight: number): string {
  const n = platesPerSide(weight);
  if (n < 1) return "just the bar";
  const word = n < PLATE_WORDS.length ? PLATE_WORDS[n] : String(n);
  return `${word} plate${n === 1 ? "" : "s"} a side`;
}

/**
 * Milestone banner when a locked rep crosses a whole-plate boundary
 * (two plates and up), else null.
 */
export function milestoneFor(prevWeight: number, weight: number): string | null {
  const plates = platesPerSide(weight);
  if (plates < 2 || plates <= platesPerSide(prevWeight)) return null;
  return platesPhrase(weight).toUpperCase();
}

/** Needle sweeps per second — the bar gets heavier, the needle gets twitchier. */
export function needleSpeedFor(weight: number): number {
  return Math.min(1.6, 0.55 + (weight - MAXOUT.startWeight) * 0.0042);
}

/** Window width as a fraction of the track. Narrows with weight, floored. */
export function windowWidthFor(weight: number): number {
  return Math.max(0.09, 0.26 - (weight - MAXOUT.startWeight) * 0.00062);
}

/** Window centre for a rep, kept clear of the track ends. */
export function windowCentreFor(rng: () => number): number {
  return 0.14 + rng() * 0.72;
}

/**
 * Needle position on the track at time t: a linear ping-pong 0 → 1 → 0,
 * `speed` full one-way traverses per second.
 */
export function needleAt(t: number, speed: number): number {
  const phase = (t * speed) % 2;
  return phase < 1 ? phase : 2 - phase;
}

export type RepJudgement = "perfect" | "good" | "miss";

/** Judge a lock-out attempt against this rep's window. */
export function judge(
  needle: number,
  centre: number,
  width: number,
): RepJudgement {
  const off = Math.abs(needle - centre);
  if (off <= (width * MAXOUT.perfectCore) / 2) return "perfect";
  if (off <= width / 2) return "good";
  return "miss";
}

export type Aid = "chalk" | "belt";

/**
 * Earned aids: a 3-perfect streak chalks up (slower needle next rep), a
 * 5-perfect streak adds the belt (wider window next rep). One at a time.
 */
export function aidFor(perfectStreak: number): Aid | null {
  if (perfectStreak > 0 && perfectStreak % 5 === 0) return "belt";
  if (perfectStreak > 0 && perfectStreak % 3 === 0) return "chalk";
  return null;
}

/** Form-break gags. Target the cartoon and the bar, never the player (§3). */
export const MISS_CAUSES = [
  "ego lifting",
  "hips shot up first",
  "the chalk was decorative",
  "lockout was a rumour",
  "the bar said no",
  "gravity filed a complaint",
  "grip left the chat",
] as const;

export function causeFor(rng: () => number): string {
  return MISS_CAUSES[Math.floor(rng() * MISS_CAUSES.length)];
}

/** "247.5" → "247.5", "240" → "240" — kg without a trailing .0. */
export function formatKg(weight: number): string {
  return Number.isInteger(weight)
    ? weight.toLocaleString("en-GB")
    : weight.toLocaleString("en-GB", { minimumFractionDigits: 1 });
}

/** The screenshot-in-text share line (MAXOUT.md §2). */
export function shareText(kg: number, cause: string): string {
  return [
    "🏋️ MAX OUT",
    `Form failed at ${formatKg(kg)} kg · ${platesPhrase(kg)} · cause: ${cause}`,
    "The bar always wins eventually.",
  ].join("\n");
}
