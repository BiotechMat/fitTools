/**
 * Reaction station logic (PERFORMANCE-LAB.md §4.1) — pure, testable tuning.
 * Simple visual reaction time in the psychomotor-vigilance lineage: wait for
 * the pad to go Blaze, tap, five scored taps, the average is the score and
 * the tier is the flex. The component consumes these; nothing touches the DOM.
 */

export const REACTION = {
  /** Scored taps per test. */
  rounds: 5,
  /** Random wait before the pad flips, ms — long enough to punish guessing. */
  minDelayMs: 1500,
  maxDelayMs: 3200,
  /** How long the per-round time lingers before the next round arms. */
  interRoundMs: 950,
} as const;

/** The random wait for one round, from the station's seeded rng. */
export function delayFor(rng: () => number): number {
  return REACTION.minDelayMs + rng() * (REACTION.maxDelayMs - REACTION.minDelayMs);
}

/** The score: mean of the scored taps, whole milliseconds. */
export function averageMs(times: number[]): number {
  if (times.length === 0) return 0;
  return Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
}

export interface LabTier {
  name: string;
  /** The flavour line under the tier sticker. Targets the vibe, not the user. */
  blurb: string;
}

export interface ReactionTierBand extends LabTier {
  /** Exclusive upper bound in ms; the last band is open-ended (Infinity). */
  max: number;
}

/**
 * The tier ladder — the shareable bit, and (since 2026-07-24) the on-page
 * comparison table. Meme-calibrated, not a norm table: the names are the
 * point ("NPC" travels further than a percentile ever will). Ordered
 * fastest first; `reactionTier` and the result screen's ladder both read
 * from here so they can never disagree.
 */
export const REACTION_TIERS: readonly ReactionTierBand[] = [
  { name: "LIGHTNING", max: 190, blurb: "the screen is the slow one." },
  { name: "LOCKED IN", max: 230, blurb: "the group chat can wait." },
  { name: "CAFFEINATED", max: 270, blurb: "the espresso is pulling its weight." },
  { name: "HUMAN", max: 320, blurb: "solidly mid, biologically speaking." },
  { name: "NPC", max: 380, blurb: "dialogue loads on a delay." },
  { name: "BUFFERING", max: 450, blurb: "the wifi checks out. the sleep might not." },
  { name: "PING 999", max: Infinity, blurb: "blame the lag. always blame the lag." },
] as const;

export function reactionTier(avg: number): LabTier {
  if (avg <= 0) return { name: "UNRATED", blurb: "the pad remains untapped." };
  const band = REACTION_TIERS.find((tier) => avg < tier.max);
  return band ?? REACTION_TIERS[REACTION_TIERS.length - 1];
}

/** "under 190 ms" / "190–229 ms" / "450 ms and up" — the ladder's range column. */
export function reactionTierRange(index: number): string {
  const band = REACTION_TIERS[index];
  const floor = index === 0 ? 0 : REACTION_TIERS[index - 1].max;
  if (floor === 0) return `under ${band.max} ms`;
  if (band.max === Infinity) return `${floor} ms and up`;
  return `${floor}–${band.max - 1} ms`;
}

/**
 * PLACEHOLDER population percentile (Mat, 2026-07-24): anchored on public
 * browser reaction-test aggregates until our own playerbase distribution
 * takes over. Primary anchor: Human Benchmark's published statistics —
 * median 273 ms, mean 284 ms over 81M+ clicks on the same average-of-5,
 * device-latency-included protocol as this station
 * (https://humanbenchmark.com/tests/reactiontime/statistics). Tails shaped
 * to the corroborating public tables (~200 ms ≈ top 12%, sub-150 ms ≈ top
 * 1%, long slow tail from mobile/hardware lag). Interpolated between
 * anchors, clamped to 1–99: this is a vibe-accurate comparison, not a
 * clinical claim, and the UI labels it as public-benchmark data.
 */
const PERCENTILE_ANCHORS: readonly [ms: number, fasterThan: number][] = [
  [140, 99],
  [160, 98],
  [180, 95],
  [200, 88],
  [220, 78],
  [240, 66],
  [260, 56],
  [273, 50], // the Human Benchmark median — the hard anchor
  [290, 42],
  [320, 30],
  [350, 20],
  [400, 10],
  [450, 5],
  [500, 3],
  [600, 1],
];

/** % of people this average beats (0 for a missing score). */
export function reactionPercentile(avg: number): number {
  if (avg <= 0) return 0;
  const first = PERCENTILE_ANCHORS[0];
  const last = PERCENTILE_ANCHORS[PERCENTILE_ANCHORS.length - 1];
  if (avg <= first[0]) return first[1];
  if (avg >= last[0]) return last[1];
  for (let i = 1; i < PERCENTILE_ANCHORS.length; i++) {
    const [ms, pct] = PERCENTILE_ANCHORS[i];
    if (avg <= ms) {
      const [prevMs, prevPct] = PERCENTILE_ANCHORS[i - 1];
      const t = (avg - prevMs) / (ms - prevMs);
      return Math.min(99, Math.max(1, Math.round(prevPct + (pct - prevPct) * t)));
    }
  }
  return last[1];
}

/** One letter per scored tap (g/y/r) — the compact form of the share grid,
 *  carried in share URLs so the unfurl card can redraw the row. */
export function reactionRow(times: number[]): string {
  return times
    .slice(0, REACTION.rounds)
    .map((t) => (t < 260 ? "g" : t < 350 ? "y" : "r"))
    .join("");
}

const ROW_EMOJI: Record<string, string> = { g: "🟩", y: "🟨", r: "🟥" };

/** One block per scored tap — the Wordle-grid share line. */
export function reactionBlocks(times: number[]): string {
  return [...reactionRow(times)].map((letter) => ROW_EMOJI[letter]).join("");
}

/** Whole-ms display — "231 ms". */
export function formatMs(ms: number): string {
  return `${Math.round(ms).toLocaleString("en-GB")} ms`;
}

/** The screenshot-in-text share block (PERFORMANCE-LAB.md §6). */
export function reactionShareText(avg: number, times: number[]): string {
  return [
    "⚡ THE LAB · REACTION",
    `${formatMs(avg)} · ${reactionTier(avg).name}`,
    `Faster than ${reactionPercentile(avg)}% of people`,
    reactionBlocks(times),
    "Blink and you'll miss it.",
  ].join("\n");
}
