import type { LabTier } from "./reaction";

/**
 * Recall station logic (PERFORMANCE-LAB.md §4.2) — pure, testable tuning.
 * Visuospatial span in the Corsi block-tapping lineage, run Simon-style:
 * the 3×3 grid lights a sequence, you tap it back, every clean round adds
 * one light. The score is the longest sequence completed — the span — and
 * the tier is an animal, because an animal ladder is a meme and a span
 * table is homework.
 */

export const RECALL = {
  /** 3×3 — nine pads. */
  pads: 9,
  /** The first sequence length. Everyone starts a goldfish. */
  startLength: 3,
  /** Strikes at a length before the run ends (the second wobble is fatal). */
  strikes: 2,
  /** Playback feel: how long a pad stays lit, and the gap between lights. */
  litMs: 420,
  gapMs: 220,
  /** Pause between "your turn" ending and the next, longer playback. */
  interRoundMs: 700,
} as const;

/** A fresh opening sequence — no pad twice in a row (a double reads as one). */
export function sequenceFor(rng: () => number, length: number): number[] {
  const seq: number[] = [];
  while (seq.length < length) {
    const pad = Math.floor(rng() * RECALL.pads);
    if (pad !== seq[seq.length - 1]) seq.push(pad);
  }
  return seq;
}

/** One more light on the end, never repeating the last. */
export function extendSequence(rng: () => number, seq: number[]): number[] {
  let pad = Math.floor(rng() * RECALL.pads);
  while (pad === seq[seq.length - 1]) pad = Math.floor(rng() * RECALL.pads);
  return [...seq, pad];
}

/**
 * The animal ladder. Loosely honours the actual literature's pecking order
 * (pigeons genuinely out-perform their reputation; crows are the meme they
 * deserve) without claiming to be it.
 */
export function recallTier(span: number): LabTier {
  if (span < 3) return { name: "PLANKTON", blurb: "drifting. beautifully." };
  if (span === 3) return { name: "GOLDFISH", blurb: "three seconds of fame." };
  if (span === 4) return { name: "HAMSTER", blurb: "it's all wheel up there." };
  if (span === 5) return { name: "PIGEON", blurb: "underrated. always has been." };
  if (span === 6) return { name: "HUMAN", blurb: "the textbook said this would happen." };
  if (span === 7) return { name: "CROW", blurb: "the crow remembers. apparently so do you." };
  if (span === 8) return { name: "DOLPHIN", blurb: "echolocating the answers." };
  if (span === 9) return { name: "ELEPHANT", blurb: "never forgets. never brags. you can brag." };
  if (span <= 11) return { name: "GRANDMASTER", blurb: "the grid fears you." };
  return { name: "MAINFRAME", blurb: "biological RAM upgrade detected." };
}

/** One block per level cleared past the start — the share grid. */
export function recallBlocks(span: number): string {
  const cleared = Math.max(0, span - RECALL.startLength + 1);
  return "🟩".repeat(Math.min(cleared, 12));
}

/** The screenshot-in-text share block (PERFORMANCE-LAB.md §6). */
export function recallShareText(span: number): string {
  const lines = [
    "🧠 THE LAB · RECALL",
    `Span ${span} · ${recallTier(span).name}`,
  ];
  const blocks = recallBlocks(span);
  if (blocks) lines.push(blocks);
  lines.push("Read it once.");
  return lines.join("\n");
}
