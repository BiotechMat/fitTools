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

/**
 * The tier ladder — the shareable bit. Meme-calibrated, not a norm table:
 * the names are the point ("NPC" travels further than a percentile ever will).
 */
export function reactionTier(avg: number): LabTier {
  if (avg <= 0) return { name: "UNRATED", blurb: "the pad remains untapped." };
  if (avg < 190) return { name: "LIGHTNING", blurb: "the screen is the slow one." };
  if (avg < 230) return { name: "LOCKED IN", blurb: "the group chat can wait." };
  if (avg < 270) return { name: "CAFFEINATED", blurb: "the espresso is pulling its weight." };
  if (avg < 320) return { name: "HUMAN", blurb: "solidly mid, biologically speaking." };
  if (avg < 380) return { name: "NPC", blurb: "dialogue loads on a delay." };
  if (avg < 450) return { name: "BUFFERING", blurb: "the wifi checks out. the sleep might not." };
  return { name: "PING 999", blurb: "blame the lag. always blame the lag." };
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
    reactionBlocks(times),
    "Blink and you'll miss it.",
  ].join("\n");
}
