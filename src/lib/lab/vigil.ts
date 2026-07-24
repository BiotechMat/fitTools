import type { LabTier } from "./reaction";

/**
 * Vigil station logic (PERFORMANCE-LAB.md §4.8) — pure, testable tuning.
 * Sustained attention in the SART lineage (Robertson et al., 1997):
 * digits stream steadily, tap for every digit EXCEPT the 3 — the
 * withhold is the measure. The blueprint's 90-second short form, chosen
 * over the classic three minutes because a phone's attention span is
 * part of the apparatus. One big pad, one verb: device-agnostic.
 */

export const VIGIL = {
  /** Digits in a run — ~90 seconds at the step below. */
  trials: 72,
  /** How many of them are the forbidden 3. */
  threes: 9,
  /** The digit everyone must NOT tap. */
  noGo: 3,
  /** ms the digit shows, and the gap before the next. */
  litMs: 800,
  gapMs: 350,
} as const;

/** Run length in seconds, for copy ("Held 94% over 90 seconds"). */
export const VIGIL_SECONDS: number = Math.round(
  (VIGIL.trials * (VIGIL.litMs + VIGIL.gapMs)) / 1000,
);

/**
 * The digit stream: exactly `threes` 3s, never in the first three trials
 * (settle in first), never two in a row (back-to-back withholds read as
 * one), everything else uniform over the other digits.
 */
export function vigilSequence(rng: () => number): number[] {
  const goDigits = [1, 2, 4, 5, 6, 7, 8, 9];
  const seq: number[] = Array.from(
    { length: VIGIL.trials },
    () => goDigits[Math.floor(rng() * goDigits.length)],
  );
  let placed = 0;
  let guard = 0;
  while (placed < VIGIL.threes && guard < 1000) {
    guard += 1;
    const at = 3 + Math.floor(rng() * (VIGIL.trials - 3));
    if (
      seq[at] !== VIGIL.noGo &&
      seq[at - 1] !== VIGIL.noGo &&
      seq[at + 1] !== VIGIL.noGo
    ) {
      seq[at] = VIGIL.noGo;
      placed += 1;
    }
  }
  return seq;
}

export interface VigilScore {
  /** Taps on a 3 — the impulse got through. */
  commissions: number;
  /** Go digits that slipped past untapped. */
  omissions: number;
  /** Correct trials / all trials, whole percent. */
  pct: number;
}

/** Score a run from the stream and the per-trial tapped flags. */
export function vigilScore(seq: number[], tapped: boolean[]): VigilScore {
  let commissions = 0;
  let omissions = 0;
  seq.forEach((digit, i) => {
    const didTap = tapped[i] === true;
    if (digit === VIGIL.noGo && didTap) commissions += 1;
    if (digit !== VIGIL.noGo && !didTap) omissions += 1;
  });
  const correct = seq.length - commissions - omissions;
  const pct =
    seq.length === 0 ? 0 : Math.round((correct / seq.length) * 100);
  return { commissions, omissions, pct };
}

/** The focus ladder — meme-calibrated, like its siblings. */
export function vigilTier(pct: number): LabTier {
  if (pct <= 0) return { name: "UNRATED", blurb: "the digits went unwatched." };
  if (pct >= 100) return { name: "MONK MODE", blurb: "nothing gets through." };
  if (pct >= 96) return { name: "DEEP WORK", blurb: "the notifications wept, unread." };
  if (pct >= 90) return { name: "FOCUSED", blurb: "present and accounted for." };
  if (pct >= 82) return { name: "HUMAN", blurb: "minds wander. yours strolls." };
  if (pct >= 72) return { name: "SQUIRREL", blurb: "ooh — a thing!" };
  if (pct >= 60) return { name: "DOOMSCROLLER", blurb: "the thumb kept going on its own." };
  return { name: "TAB HOARDER", blurb: "47 tabs open. none of them this one." };
}

/** The screenshot-in-text share block (PERFORMANCE-LAB.md §6). */
export function vigilShareText(pct: number): string {
  return [
    "🧿 THE LAB · VIGIL",
    `Held ${pct}% over ${VIGIL_SECONDS} seconds · ${vigilTier(pct).name}`,
    "The 3 is always waiting.",
  ].join("\n");
}
