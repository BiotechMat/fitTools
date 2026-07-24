/**
 * Pixel-art sprites for the share/OG cards, in the arcade games' house style:
 * uppercase letter = palette colour, "." = transparent. The emblems mirror the
 * in-game sprites (LifelineGame HEART_REST, PowerhouseGame MITO_A,
 * the games' own frames, MaxOutGame LIFTER_LOCKOUT) — the games keep their own
 * copies next to their animation frames, same as the little UI hearts that
 * already repeat per game; update together if a sprite is redrawn.
 */

/** Union of the games' palettes (identical letter→colour across all four). */
export const PIXEL_PALETTE: Record<string, string> = {
  K: "#1c130d", // ink
  B: "#ff531a", // blaze
  E: "#c63d08", // ember
  P: "#fbf4ec", // paper
  W: "#fffdf9", // white
  M: "#8fbf3f", // matcha
  F: "#1f5c3d", // forest
  A: "#e8c33c", // amber
  S: "#f3e7d8", // soft
  L: "#a3e635", // lime
};

/** Lifeline's heart at rest — the death card's emblem. */
export const LIFELINE_HEART = [
  "..KK....KK..",
  ".KBBK..KBBK.",
  "KBWBBKKBBBBK",
  "KBWBBBBBBBBK",
  "KBBBBBBBBBBK",
  ".KBBBBBBBBK.",
  "..KBBBBBBK..",
  "...KBBBBK...",
  "....KBBK....",
  ".....KK.....",
];

/** Powerhouse's mitochondrion (frame A, engine flame at rest). */
export const POWERHOUSE_MITO = [
  "...KKKKKKKK...",
  "..KBBBBBBBBK..",
  ".KBABBABBABBK.",
  "LKBBAABBAWKBK.",
  "AKBABBABBWKBK.",
  "LKBBAABBABBBK.",
  ".KBABBABBABBK.",
  "..KBBBBBBBBK..",
  "...KKKKKKKK...",
];

/** Five a Day's apple (FiveADayGame PRODUCE_MAPS.apple). */
export const FIVEADAY_APPLE = [
  "....K.....",
  "....K.FF..",
  "..KKKKK...",
  ".KBBWBBK..",
  "KBBBWBBBK.",
  "KBBBBBBBK.",
  "KEBBBBBEK.",
  ".KEBBBEK..",
  "..KKKKK...",
];

/** Max Out's lifter at lockout. */
export const MAXOUT_LIFTER = [
  "....KKKK....",
  "...KBBBBK...",
  "...KSSSSK...",
  "...KSWWSK...",
  "...KSSSSK...",
  "..KKFFFFKK..",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKKFFKKSK.",
  ".KSKFSSFKSK.",
  ".KSSKSSKSSK.",
  "..KKKKKKKK..",
];

/** Ballpark's dartboard — drawn for the card, same palette rules. */
export const BALLPARK_TARGET = [
  "...KKKK...",
  "..KBBBBK..",
  ".KBPPPPBK.",
  "KBPPKKPPBK",
  "KBPKWWKPBK",
  "KBPKWWKPBK",
  "KBPPKKPPBK",
  ".KBPPPPBK.",
  "..KBBBBK..",
  "...KKKK...",
];

/** The games' little life hearts (full / spent) — the Myth or Fact row. */
export const MINI_HEART_FULL = [
  ".KK.KK.",
  "KBBKBBK",
  "KBBBBBK",
  ".KBBBK.",
  "..KBK..",
  "...K...",
];

export const MINI_HEART_EMPTY = [
  ".KK.KK.",
  "KSSKSSK",
  "KSSSSSK",
  ".KSSSK.",
  "..KSK..",
  "...K...",
];

/** The Lab's Reaction bolt — the flash you're waiting for. */
export const LAB_BOLT = [
  "......KKKK.",
  ".....KBBBK.",
  "....KBBBK..",
  "...KBBBK...",
  "..KBBBBKKK.",
  ".KBBBBBBBK.",
  "KKKKABBBK..",
  "...KABBK...",
  "..KABBK....",
  "..KABK.....",
  ".KABK......",
  ".KAK.......",
  ".KK........",
];

/** The Lab's Recall grid mid-pattern — two pads lit. */
export const LAB_GRID = [
  "KKKK.KKKK.KKKK",
  "KBBK.KSSK.KSSK",
  "KBBK.KSSK.KSSK",
  "KKKK.KKKK.KKKK",
  "..............",
  "KKKK.KKKK.KKKK",
  "KSSK.KBBK.KSSK",
  "KSSK.KBBK.KSSK",
  "KKKK.KKKK.KKKK",
  "..............",
  "KKKK.KKKK.KKKK",
  "KSSK.KSSK.KBBK",
  "KSSK.KSSK.KBBK",
  "KKKK.KKKK.KKKK",
];
