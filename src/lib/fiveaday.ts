/**
 * Five a Day game logic (FIVEADAY.md §4) — pure, testable tuning.
 * The canvas component consumes these; nothing here touches the DOM.
 *
 * The pivot record: this game shipped first as "Snake Oil" (slice the myth
 * slogans, spare the facts) and playtesting killed it the same day — text
 * cannot be read at toss speed, so the discrimination has to be VISUAL
 * (Mat, 2026-07-23). Produce good, junk bad, zero reading. The myth/fact
 * education lives where reading has time: Myth or Fact? on /daily.
 * Tuning targets: first runs compost in the 20–50 portion band inside
 * ~75 s; 100+ portions with 20+ different plants is a flex.
 */

export const FIVEADAY = {
  width: 420,
  height: 560,
  /** Hearts; dropped produce costs one. Junk ends the run outright. */
  maxHearts: 3,
  /** Projectile gravity, px/s². */
  gravity: 620,
  /** Bonus portions the first time each plant kind is sliced in a run. */
  newPlantBonus: 2,
  /** Seconds after the last slice that still count into a combo. */
  comboWindow: 0.35,
  /** Blade-vs-item collision radius (matches the ~45 px sprite scale-up). */
  sliceRadius: 30,
  /** Seconds per difficulty wave. */
  waveSeconds: 10,
} as const;

export interface Produce {
  id: string;
  /** Lowercase display name for toasts and gags ("the broccoli got away"). */
  label: string;
  /** Culinary sense, for the combo label — not botany. */
  kind: "fruit" | "veg";
}

export interface Junk {
  id: string;
  label: string;
  /** Run-over gag. Targets the junk and the cartoon, never the player. */
  cause: string;
}

/**
 * The produce roster. Order = unlock order (`unlockedProduceCount`): the
 * openers are the icons everyone clocks instantly; the exotic tail keeps
 * later waves surprising. Every slice is +1 portion.
 */
export const PRODUCE: Produce[] = [
  { id: "apple", label: "apple", kind: "fruit" },
  { id: "banana", label: "banana", kind: "fruit" },
  { id: "orange", label: "orange", kind: "fruit" },
  { id: "broccoli", label: "broccoli", kind: "veg" },
  { id: "strawberry", label: "strawberry", kind: "fruit" },
  { id: "carrot", label: "carrot", kind: "veg" },
  { id: "watermelon", label: "watermelon", kind: "fruit" },
  { id: "tomato", label: "tomato", kind: "veg" },
  { id: "blueberry", label: "blueberry", kind: "fruit" },
  { id: "pineapple", label: "pineapple", kind: "fruit" },
  { id: "kiwi", label: "kiwi", kind: "fruit" },
  { id: "avocado", label: "avocado", kind: "veg" },
  { id: "pepper", label: "red pepper", kind: "veg" },
  { id: "grapes", label: "grapes", kind: "fruit" },
  { id: "cherries", label: "cherries", kind: "fruit" },
  { id: "pomegranate", label: "pomegranate", kind: "fruit" },
];

/**
 * The junk roster — the arcade's existing villains, instantly readable as
 * "do not slice". All in play from wave one; gags echo the sibling games.
 */
export const JUNK: Junk[] = [
  { id: "cigarette", label: "cigarette", cause: "the cigarette. It was never food." },
  { id: "fizzy", label: "fizzy can", cause: "death by fizzy pop. The bubbles won again." },
  { id: "crash", label: "energy drink", cause: "The Crash. It always comes after the can." },
  { id: "phone", label: "doomscroll phone", cause: "sliced the doomscroll. The blue light won." },
  { id: "nugget", label: "nugget", cause: "the nugget. Ultra-processed, ultra-victorious." },
];

/** Structural validation (runs as a unit test). Empty list = valid. */
export function validateRoster(
  produce: Produce[] = PRODUCE,
  junk: Junk[] = JUNK,
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  let earlyFruit = 0;
  let earlyVeg = 0;

  produce.forEach((p, i) => {
    if (seen.has(p.id)) problems.push(`duplicate id: ${p.id}`);
    seen.add(p.id);
    if (!p.label.trim()) problems.push(`${p.id}: empty label`);
    if (p.label !== p.label.toLowerCase()) {
      problems.push(`${p.id}: label must be lowercase (it lands mid-sentence)`);
    }
    if (i < 8) {
      if (p.kind === "fruit") earlyFruit++;
      else earlyVeg++;
    }
  });
  for (const j of junk) {
    if (seen.has(j.id)) problems.push(`duplicate id: ${j.id}`);
    seen.add(j.id);
    if (!j.label.trim()) problems.push(`${j.id}: empty label`);
    if (j.cause.trim().length < 10) problems.push(`${j.id}: cause gag too thin`);
    if (/\byour?\b/i.test(j.cause)) {
      problems.push(`${j.id}: cause targets the player`);
    }
  }
  if (produce.length < 12) problems.push("fewer than 12 produce kinds");
  if (junk.length < 3) problems.push("fewer than 3 junk kinds");
  // The opening eight must serve fruit AND veg, or salads never happen.
  if (earlyFruit < 3) problems.push("fewer than 3 fruits in the opening eight");
  if (earlyVeg < 2) problems.push("fewer than 2 veg in the opening eight");
  return problems;
}

/** Produce kinds in play at this wave — the roster unlocks front to back. */
export function unlockedProduceCount(wave: number): number {
  return Math.min(PRODUCE.length, 8 + wave * 2);
}

/** Seconds between tosses; tightens with the wave, floored. */
export function spawnIntervalFor(wave: number): number {
  return Math.max(0.55, 1.5 - wave * 0.12);
}

/** How many items a single toss throws (bursts arrive with later waves). */
export function burstSizeFor(wave: number, rng: () => number): number {
  const p3 = wave >= 3 ? Math.min(0.3, (wave - 2) * 0.06) : 0;
  const p2 = Math.min(0.6, 0.18 + wave * 0.07);
  const roll = rng();
  if (roll < p3) return 3;
  if (roll < p3 + p2) return 2;
  return 1;
}

/**
 * Chance a tossed item is junk. Rare early (learn the shapes in peace),
 * rising with the wave, capped well below half — the game is a harvest
 * with hazards, not a minefield.
 */
export function junkChanceFor(wave: number): number {
  return Math.min(0.3, 0.1 + wave * 0.03);
}

/** Pick the next produce to toss, uniform among unlocked kinds. */
export function pickProduce(rng: () => number, wave: number): Produce {
  const unlocked = PRODUCE.slice(0, unlockedProduceCount(wave));
  return unlocked[Math.floor(rng() * unlocked.length)];
}

export function pickJunk(rng: () => number): Junk {
  return JUNK[Math.floor(rng() * JUNK.length)];
}

export interface Launch {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  /** Radians/s of tumble. */
  spin: number;
}

/** Toss an item from below the fold on an arc that hangs sliceably. */
export function launch(rng: () => number): Launch {
  const x0 = 60 + rng() * (FIVEADAY.width - 120);
  return {
    x0,
    y0: FIVEADAY.height + 30,
    vx: ((FIVEADAY.width / 2 - x0) / FIVEADAY.width) * 140 + (rng() - 0.5) * 70,
    vy: -(700 + rng() * 60),
    spin: (rng() - 0.5) * 5,
  };
}

/** Blade-segment-vs-item collision: point-to-segment distance. */
export function segmentHitsCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number,
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  const t =
    lenSq === 0
      ? 0
      : Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq));
  const px = x1 + t * dx - cx;
  const py = y1 + t * dy - cy;
  return px * px + py * py < r * r;
}

/** Bonus portions when one swipe takes n produce: one extra per extra. */
export function comboBonusFor(n: number): number {
  return n >= 2 ? n - 1 : 0;
}

/** What a multi-slice is called: all-veg swipes are a salad, the rest blend. */
export function comboLabelFor(kinds: Produce["kind"][]): string {
  return kinds.length > 0 && kinds.every((k) => k === "veg")
    ? "CHOPPED SALAD"
    : "SMOOTHIE";
}

/** Dropped-produce gag — also the cause line when the third one drops. */
export function escapedCause(label: string): string {
  return `the ${label} got away`;
}

/** The screenshot-in-text share line (FIVEADAY.md §2). */
export function shareText(portions: number, plants: number, cause: string): string {
  return [
    "🥦 FIVE A DAY",
    `${portions} portion${portions === 1 ? "" : "s"} · ${plants} different plant${plants === 1 ? "" : "s"}`,
    `cause: ${cause}`,
    "Slice the produce. Never the junk.",
  ].join("\n");
}
