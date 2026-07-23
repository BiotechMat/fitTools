/**
 * Snake Oil game logic (SNAKEOIL.md §4) — pure, testable tuning.
 * The canvas component consumes these; nothing here touches the DOM.
 *
 * Content discipline: every claim on the roster derives from an item in the
 * daily-games registry (src/registry/daily.ts), which is itself sourced from
 * content vetted elsewhere in the repo — myths as the slogan circulating in
 * the wild, facts as the cited correction. No claim ships without a registry
 * item behind it (`validateClaims` runs as a unit test), so the death-card
 * receipt always carries a real source. Tuning targets: first runs get
 * snake-oiled in the 10–25 busts band inside ~75 s; 50+ busts is a flex.
 */

import { ballparkById, mythById } from "@/registry/daily";

export const SNAKEOIL = {
  width: 420,
  height: 560,
  /** Hearts; the fail state. A myth that escapes, spreads. */
  maxHearts: 3,
  /** Projectile gravity, px/s². */
  gravity: 620,
  /** Points per busted myth; combo bonus on top (`comboBonusFor`). */
  mythPoints: 10,
  /** Points for correctly letting a fact fall untouched. */
  sparePoints: 5,
  /** Seconds after the last slice that still count into a combo. */
  comboWindow: 0.35,
  /** Blade-vs-claim collision radius (generous — the label is the target). */
  sliceRadius: 30,
  /** Seconds per difficulty wave. */
  waveSeconds: 10,
} as const;

export interface Claim {
  /** Unique claim id (kebab-case). */
  id: string;
  /** The daily-registry item this claim derives from. */
  registryId: string;
  registry: "myth" | "ballpark";
  /**
   * True when a fact claim restates the cited CORRECTION carried by a myth
   * registry item's explanation (e.g. the "10k was a marketing slogan" fact
   * inside the "10k steps is science" myth item).
   */
  correction?: boolean;
  /** Short slogan as it flies — instantly judgeable, ≤26 chars. */
  label: string;
  verdict: "myth" | "fact";
}

/**
 * The roster. Order = unlock order (`unlockedClaimCount`): the openers are
 * gimmes, the tail needs the site's actual evidence chops. Myths and facts
 * both appear from wave one — the whole game is telling them apart.
 */
export const CLAIMS: Claim[] = [
  { id: "eight-glasses", registryId: "myth-eight-glasses", registry: "myth", label: "8 GLASSES A DAY", verdict: "myth" },
  { id: "sweat-toxins", registryId: "myth-sauna-detox", registry: "myth", label: "SWEAT OUT THE TOXINS", verdict: "myth" },
  { id: "sleep-7-9", registryId: "adult-sleep-minimum", registry: "ballpark", label: "ADULTS NEED 7 to 9 HOURS", verdict: "fact" },
  { id: "creatine-works", registryId: "creatine-maintenance", registry: "ballpark", label: "3 to 5 G CREATINE WORKS", verdict: "fact" },
  { id: "steps-science", registryId: "myth-10000-steps", registry: "myth", label: "10K STEPS = SCIENCE", verdict: "myth" },
  { id: "food-water", registryId: "efsa-water-men", registry: "ballpark", label: "FOOD COUNTS AS WATER", verdict: "fact" },
  { id: "ice-bath-gains", registryId: "myth-ice-bath-growth", registry: "myth", label: "ICE BATHS = GAINS", verdict: "myth" },
  { id: "protein-range", registryId: "protein-upper-target", registry: "ballpark", label: "PROTEIN: 1.6 to 2.2 G/KG", verdict: "fact" },
  { id: "creatine-loading", registryId: "myth-creatine-loading", registry: "myth", label: "MUST LOAD CREATINE", verdict: "myth" },
  { id: "caffeine-half-life", registryId: "caffeine-half-life", registry: "ballpark", label: "CAFFEINE HALF-LIFE ≈ 5 H", verdict: "fact" },
  { id: "plunge-mood", registryId: "myth-cwi-mood", registry: "myth", label: "PLUNGES FIX YOUR MOOD", verdict: "myth" },
  { id: "plunge-blunts", registryId: "myth-ice-bath-growth", registry: "myth", correction: true, label: "PLUNGES CAN BLUNT GAINS", verdict: "fact" },
  { id: "220-age", registryId: "myth-220-age", registry: "myth", label: "220 − AGE = GOSPEL", verdict: "myth" },
  { id: "tanaka", registryId: "max-hr-at-40", registry: "ballpark", label: "MAX HR ≈ 208 − 0.7 × AGE", verdict: "fact" },
  { id: "steps-marketing", registryId: "myth-10000-steps", registry: "myth", correction: true, label: "10K WAS A MARKETING PLOY", verdict: "fact" },
  { id: "sauna-longevity", registryId: "sauna-sessions-benefit", registry: "ballpark", label: "SAUNAS LINK TO LONG LIFE", verdict: "fact" },
  { id: "infrared-same", registryId: "myth-infrared-equivalent", registry: "myth", label: "INFRARED = SAME EVIDENCE", verdict: "myth" },
  { id: "lpa-diet", registryId: "myth-lpa-lifestyle", registry: "myth", label: "DIET LOWERS Lp(a)", verdict: "myth" },
  { id: "lpa-genetic", registryId: "myth-lpa-lifestyle", registry: "myth", correction: true, label: "Lp(a) IS MOSTLY GENETIC", verdict: "fact" },
];

/**
 * Structural validation (runs as a unit test, same posture as
 * `validateDailyRegistry`). Empty list = valid.
 */
export function validateClaims(claims: Claim[] = CLAIMS): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  let earlyMyths = 0;
  let earlyFacts = 0;

  claims.forEach((c, i) => {
    if (seen.has(c.id)) problems.push(`duplicate id: ${c.id}`);
    seen.add(c.id);
    if (!c.label.trim()) problems.push(`${c.id}: empty label`);
    if (c.label.length > 26) problems.push(`${c.id}: label over 26 chars`);
    if (c.registry === "myth") {
      const item = mythById.get(c.registryId);
      if (!item) {
        problems.push(`${c.id}: unknown myth registry id ${c.registryId}`);
      } else if (c.correction) {
        if (c.verdict !== "fact") {
          problems.push(`${c.id}: a correction claim must be a fact`);
        }
      } else if (c.verdict !== item.verdict) {
        problems.push(`${c.id}: verdict disagrees with registry item`);
      }
    } else {
      if (!ballparkById.get(c.registryId)) {
        problems.push(`${c.id}: unknown ballpark registry id ${c.registryId}`);
      }
      // A cited stat IS a fact; a ballpark-derived myth would be a bug.
      if (c.verdict !== "fact") problems.push(`${c.id}: ballpark claims are facts`);
    }
    if (i < 8) {
      if (c.verdict === "myth") earlyMyths++;
      else earlyFacts++;
    }
  });

  // Wave one must already demand discrimination, or the game is a mash.
  if (earlyMyths < 3) problems.push("fewer than 3 myths in the opening eight");
  if (earlyFacts < 3) problems.push("fewer than 3 facts in the opening eight");
  return problems;
}

/** Claims in play at this wave — the roster unlocks front to back. */
export function unlockedClaimCount(wave: number): number {
  return Math.min(CLAIMS.length, 8 + wave * 2);
}

/** Seconds between tosses; tightens with the wave, floored. */
export function spawnIntervalFor(wave: number): number {
  return Math.max(0.55, 1.5 - wave * 0.12);
}

/** How many claims a single toss throws (bursts arrive with later waves). */
export function burstSizeFor(wave: number, rng: () => number): number {
  const p3 = wave >= 3 ? Math.min(0.3, (wave - 2) * 0.06) : 0;
  const p2 = Math.min(0.6, 0.18 + wave * 0.07);
  const roll = rng();
  if (roll < p3) return 3;
  if (roll < p3 + p2) return 2;
  return 1;
}

/**
 * Chance a tossed claim is a fact. Rises with the wave (capped): later waves
 * pressure the reading, not just the wrist.
 */
export function factChanceFor(wave: number): number {
  return Math.min(0.45, 0.28 + wave * 0.02);
}

/** Pick the next claim to toss: verdict first, then uniform among unlocked. */
export function pickClaim(rng: () => number, wave: number): Claim {
  const unlocked = CLAIMS.slice(0, unlockedClaimCount(wave));
  const wantFact = rng() < factChanceFor(wave);
  const pool = unlocked.filter((c) =>
    wantFact ? c.verdict === "fact" : c.verdict === "myth",
  );
  const from = pool.length > 0 ? pool : unlocked;
  return from[Math.floor(rng() * from.length)];
}

export interface Launch {
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  /** Radians/s of lazy container spin (the label chip stays level). */
  spin: number;
}

/** Toss a claim from below the fold on an arc that hangs readably. */
export function launch(rng: () => number): Launch {
  const x0 = 60 + rng() * (SNAKEOIL.width - 120);
  return {
    x0,
    y0: SNAKEOIL.height + 30,
    vx: ((SNAKEOIL.width / 2 - x0) / SNAKEOIL.width) * 140 + (rng() - 0.5) * 70,
    vy: -(700 + rng() * 60),
    spin: (rng() - 0.5) * 3,
  };
}

/** Blade-segment-vs-claim collision: point-to-segment distance. */
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

/** Bonus points when one swipe busts n myths together. */
export function comboBonusFor(n: number): number {
  return n >= 2 ? (n - 1) * 15 : 0;
}

/* Fail gags. Target the myths and the cartoon, never the player (§3). */
export function escapedCause(label: string): string {
  return `'${label}' got away. It's loose in the group chat.`;
}

export function slicedTruthCause(label: string): string {
  return `Cut '${label}' clean in half. It was true.`;
}

/** The receipt on the death card: the registry item behind a claim. */
export interface Receipt {
  kicker: "MYTH" | "FACT";
  label: string;
  body: string;
  sourceLabel: string;
  sourceUrl: string;
  /** A related tool/content route from the registry item, if it has one. */
  link: string | null;
}

export function receiptFor(claim: Claim): Receipt {
  const kicker = claim.verdict === "myth" ? "MYTH" : "FACT";
  if (claim.registry === "myth") {
    const item = mythById.get(claim.registryId);
    if (item) {
      return {
        kicker,
        label: claim.label,
        body: item.explanation,
        sourceLabel: item.source.label,
        sourceUrl: item.source.url,
        link: item.relatedContent ?? item.relatedTool ?? null,
      };
    }
  } else {
    const item = ballparkById.get(claim.registryId);
    if (item) {
      return {
        kicker,
        label: claim.label,
        body: item.context,
        sourceLabel: item.source.label,
        sourceUrl: item.source.url,
        link: item.relatedContent ?? item.relatedTool ?? null,
      };
    }
  }
  /* Unreachable for a validated roster; a safe blank beats a crash. */
  return {
    kicker,
    label: claim.label,
    body: "",
    sourceLabel: "",
    sourceUrl: "",
    link: null,
  };
}

/** The screenshot-in-text share line (SNAKEOIL.md §2). */
export function shareText(busted: number, points: number, cause: string): string {
  return [
    "🐍 SNAKE OIL",
    `${busted} myth${busted === 1 ? "" : "s"} busted · ${points.toLocaleString("en-GB")} pts`,
    cause,
    "Slice the myths. Spare the truth.",
  ].join("\n");
}
