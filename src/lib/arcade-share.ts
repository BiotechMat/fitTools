/**
 * Arcade + daily-games share payloads (STATUS.md Phase 2 — the share loop
 * beyond tools; LIFELINE.md §6, DAILY-GAMES.md §7). A finished run is encoded
 * as bounded query params on the game's own URL, so the link a player pastes
 * into a chat unfurls as a score card (rendered by `/api/arcade-card` from the
 * same params) instead of the generic site image.
 *
 * Same forgery posture as `share-card.ts`: params are numbers, fixed ids or
 * tier letters — never free text — so a crafted URL can only ever present a
 * genuine-looking game score, not arbitrary words in the brand frame. Cause
 * strings are looked up server-side from the games' own fixed rosters.
 */

import { OBSTACLE_KINDS } from "@/lib/lifeline";
import { MISS_CAUSES } from "@/lib/maxout";
import { ZONES, zoneName } from "@/lib/powerhouse";
import type { ClosenessTier } from "@/lib/daily/types";
import { reactionPercentile, reactionTier } from "@/lib/lab/reaction";
import { recallTier } from "@/lib/lab/recall";
import { trackTier } from "@/lib/lab/track";

export type LifelineCauseId = (typeof OBSTACLE_KINDS)[number]["id"] | "gravity";

/** Validate an id from a URL without a cast — the registry is the truth. */
function lifelineCauseId(raw: string | undefined): LifelineCauseId | undefined {
  if (raw === undefined) return undefined;
  if (raw === "gravity") return "gravity";
  return OBSTACLE_KINDS.find((kind) => kind.id === raw)?.id;
}

/** Death-card label for a cause id ("allnighters" → "ALL-NIGHTERS"). */
export function lifelineCauseLabel(id: LifelineCauseId): string {
  if (id === "gravity") return "GRAVITY";
  return OBSTACLE_KINDS.find((kind) => kind.id === id)?.label ?? "GRAVITY";
}

/** "ZONE 4 · THRESHOLD" / "REDLINE" — same phrasing as the game's card. */
export function powerhouseZonePhrase(zoneIndex: number): string {
  return zoneIndex < ZONES.length
    ? `ZONE ${zoneIndex + 1} · ${zoneName(zoneIndex)}`
    : "REDLINE";
}

/** Tier ↔ single-letter code for the Ballpark form row (b/h/w/c). */
const TIER_LETTERS: Record<ClosenessTier, string> = {
  bullseye: "b",
  hot: "h",
  warm: "w",
  cold: "c",
};
const LETTER_TIERS: Record<string, ClosenessTier> = {
  b: "bullseye",
  h: "hot",
  w: "warm",
  c: "cold",
};

/* ---------------------------------------------------------------- payloads */

export interface LifelineResult {
  game: "lifeline";
  /** The age reached — the score to beat. */
  beat: number;
  /** Course seed; present on challenge links so the mate replays the course. */
  seed?: number;
  cause?: LifelineCauseId;
}

export interface MaxOutResult {
  game: "max-out";
  /** kg on the bar when form failed (0.5 kg steps). */
  kg: number;
  /** Index into MISS_CAUSES — the form-break gag. */
  cause?: number;
}

export interface FiveADayResult {
  game: "five-a-day";
  /** Produce portions sliced. */
  portions: number;
  /** Different plants in the run (the variety bonus). */
  plants: number;
}

export interface PowerhouseResult {
  game: "powerhouse";
  atp: number;
  zone: number;
}

/* Performance Lab results (PERFORMANCE-LAB.md §6): the score plus derived
   presentation only — tiers are recomputed server-side from the number, so
   a crafted URL can claim a time, never a title. */

export interface LabReactionResult {
  game: "lab-reaction";
  /** Average of the scored taps, whole ms. */
  avg: number;
  /** Per-tap speed row, one letter per tap (g/y/r), oldest first, ≤5. */
  row?: string;
}

export interface LabRecallResult {
  game: "lab-recall";
  /** Longest sequence completed. */
  span: number;
}

export interface LabTrackResult {
  game: "lab-track";
  /** Average time-to-target, whole ms. */
  ms: number;
  /** Accuracy percentage, 0–100. */
  acc: number;
}

export type LabResult = LabReactionResult | LabRecallResult | LabTrackResult;

export interface BallparkResult {
  game: "ballpark";
  puzzle: number;
  /** Up to the last 7 daily tiers, oldest first — the form row. */
  tiers: readonly ClosenessTier[];
}

export interface MythResult {
  game: "myth";
  puzzle: number;
  correct: number;
  total: number;
}

export type ArcadeResult =
  | LifelineResult
  | MaxOutResult
  | FiveADayResult
  | PowerhouseResult;

export type DailyResult = BallparkResult | MythResult;

export type ShareResultPayload = ArcadeResult | DailyResult | LabResult;

/** Hero (no-score) card ids — the default OG image of each game page. */
export type HeroCard =
  | "lifeline"
  | "max-out"
  | "five-a-day"
  | "powerhouse"
  | "daily"
  | "lab-reaction"
  | "lab-recall"
  | "lab-track";

export type ArcadeCardPayload =
  | { kind: "hero"; game: HeroCard }
  | { kind: "result"; result: ShareResultPayload };

/* ------------------------------------------------------------------ bounds */

const BOUNDS = {
  beat: { min: 1, max: 199 },
  seed: { min: 1, max: 99_999_999 },
  kg: { min: 20, max: 1000 },
  portions: { min: 0, max: 999 },
  plants: { min: 0, max: 99 },
  atp: { min: 0, max: 9_999_999 },
  zone: { min: 0, max: 19 },
  puzzle: { min: 1, max: 99_999 },
  mythTotal: { min: 1, max: 9 },
  /* Lab stations: generous but implausibility-capped. */
  labAvg: { min: 50, max: 2000 },
  labSpan: { min: 1, max: 40 },
  labMs: { min: 50, max: 5000 },
  labAcc: { min: 0, max: 100 },
} as const;

function firstString(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" ? s : undefined;
}

function intIn(
  v: string | string[] | undefined,
  bounds: { min: number; max: number },
): number | undefined {
  const s = firstString(v);
  if (!s || !/^\d{1,8}$/.test(s)) return undefined;
  const n = Number(s);
  return n >= bounds.min && n <= bounds.max ? n : undefined;
}

/** kg in 0.5 steps, e.g. "142.5" or "180". */
function kgIn(v: string | string[] | undefined): number | undefined {
  const s = firstString(v);
  if (!s || !/^\d{1,4}(\.5)?$/.test(s)) return undefined;
  const n = Number(s);
  return n >= BOUNDS.kg.min && n <= BOUNDS.kg.max ? n : undefined;
}

export type SearchParams = Record<string, string | string[] | undefined>;

/* ------------------------------------------------- share URL construction */

/** Challenge link a Lifeline share carries — replays the same course. */
export function lifelineSharePath(r: Omit<LifelineResult, "game">): string {
  const q = new URLSearchParams();
  if (r.seed !== undefined) q.set("seed", String(r.seed));
  q.set("beat", String(r.beat));
  if (r.cause) q.set("cause", r.cause);
  return `/lifeline?${q.toString()}`;
}

export function maxOutSharePath(r: Omit<MaxOutResult, "game">): string {
  const q = new URLSearchParams({ kg: String(r.kg) });
  if (r.cause !== undefined && r.cause >= 0 && r.cause < MISS_CAUSES.length) {
    q.set("cause", String(r.cause));
  }
  return `/max-out?${q.toString()}`;
}

export function fiveADaySharePath(r: Omit<FiveADayResult, "game">): string {
  const q = new URLSearchParams({
    portions: String(r.portions),
    plants: String(r.plants),
  });
  return `/five-a-day?${q.toString()}`;
}

export function powerhouseSharePath(r: Omit<PowerhouseResult, "game">): string {
  const q = new URLSearchParams({ atp: String(r.atp), zone: String(r.zone) });
  return `/powerhouse?${q.toString()}`;
}

export function ballparkSharePath(r: Omit<BallparkResult, "game">): string {
  const q = new URLSearchParams({ g: "bp", p: String(r.puzzle) });
  const row = r.tiers
    .slice(-7)
    .map((tier) => TIER_LETTERS[tier])
    .join("");
  if (row) q.set("r", row);
  return `/daily?${q.toString()}`;
}

export function mythSharePath(r: Omit<MythResult, "game">): string {
  const q = new URLSearchParams({
    g: "mf",
    p: String(r.puzzle),
    c: String(r.correct),
    t: String(r.total),
  });
  return `/daily?${q.toString()}`;
}

export function labReactionSharePath(r: Omit<LabReactionResult, "game">): string {
  const q = new URLSearchParams({ avg: String(r.avg) });
  if (r.row && /^[gyr]{1,5}$/.test(r.row)) q.set("row", r.row);
  return `/performance-lab/reaction?${q.toString()}`;
}

export function labRecallSharePath(r: Omit<LabRecallResult, "game">): string {
  return `/performance-lab/recall?${new URLSearchParams({ span: String(r.span) })}`;
}

export function labTrackSharePath(r: Omit<LabTrackResult, "game">): string {
  const q = new URLSearchParams({ ms: String(r.ms), acc: String(r.acc) });
  return `/performance-lab/track?${q.toString()}`;
}

/* ------------------------------------------------------- URL param parsing */

/** Parse a game page's own query params into a validated result, else null. */
export function parseArcadeResult(
  game: ArcadeResult["game"],
  sp: SearchParams,
): ArcadeResult | null {
  switch (game) {
    case "lifeline": {
      const beat = intIn(sp.beat, BOUNDS.beat);
      if (beat === undefined) return null;
      const seed = intIn(sp.seed, BOUNDS.seed);
      const cause = lifelineCauseId(firstString(sp.cause));
      return {
        game,
        beat,
        ...(seed !== undefined ? { seed } : {}),
        ...(cause ? { cause } : {}),
      };
    }
    case "max-out": {
      const kg = kgIn(sp.kg);
      if (kg === undefined) return null;
      const cause = intIn(sp.cause, { min: 0, max: MISS_CAUSES.length - 1 });
      return { game, kg, ...(cause !== undefined ? { cause } : {}) };
    }
    case "five-a-day": {
      const portions = intIn(sp.portions, BOUNDS.portions);
      const plants = intIn(sp.plants, BOUNDS.plants);
      if (portions === undefined || plants === undefined) return null;
      return { game, portions, plants };
    }
    case "powerhouse": {
      const atp = intIn(sp.atp, BOUNDS.atp);
      const zone = intIn(sp.zone, BOUNDS.zone);
      if (atp === undefined || zone === undefined) return null;
      return { game, atp, zone };
    }
  }
}

/** Parse a Lab station page's query params into a validated result, else null. */
export function parseLabResult(
  station: LabResult["game"],
  sp: SearchParams,
): LabResult | null {
  switch (station) {
    case "lab-reaction": {
      const avg = intIn(sp.avg, BOUNDS.labAvg);
      if (avg === undefined) return null;
      const row = firstString(sp.row);
      return {
        game: station,
        avg,
        ...(row && /^[gyr]{1,5}$/.test(row) ? { row } : {}),
      };
    }
    case "lab-recall": {
      const span = intIn(sp.span, BOUNDS.labSpan);
      if (span === undefined) return null;
      return { game: station, span };
    }
    case "lab-track": {
      const ms = intIn(sp.ms, BOUNDS.labMs);
      const acc = intIn(sp.acc, BOUNDS.labAcc);
      if (ms === undefined || acc === undefined) return null;
      return { game: station, ms, acc };
    }
  }
}

/** Parse /daily query params into a validated daily result, else null. */
export function parseDailyResult(sp: SearchParams): DailyResult | null {
  const g = firstString(sp.g);
  if (g === "bp") {
    const puzzle = intIn(sp.p, BOUNDS.puzzle);
    if (puzzle === undefined) return null;
    const row = firstString(sp.r) ?? "";
    if (!/^[bhwc]{0,7}$/.test(row)) return null;
    const tiers = [...row].map((letter) => LETTER_TIERS[letter]);
    return { game: "ballpark", puzzle, tiers };
  }
  if (g === "mf") {
    const puzzle = intIn(sp.p, BOUNDS.puzzle);
    const total = intIn(sp.t, BOUNDS.mythTotal);
    if (puzzle === undefined || total === undefined) return null;
    const correct = intIn(sp.c, { min: 0, max: total });
    if (correct === undefined) return null;
    return { game: "myth", puzzle, correct, total };
  }
  return null;
}

/* -------------------------------------------------------- card image URLs */

/** `/api/arcade-card?...` URL for a result card. */
export function arcadeCardPath(payload: ArcadeCardPayload): string {
  if (payload.kind === "hero") {
    return `/api/arcade-card?${new URLSearchParams({ game: payload.game })}`;
  }
  const r = payload.result;
  const q = new URLSearchParams({ game: r.game });
  switch (r.game) {
    case "lifeline":
      q.set("beat", String(r.beat));
      if (r.seed !== undefined) q.set("challenge", "1");
      if (r.cause) q.set("cause", r.cause);
      break;
    case "max-out":
      q.set("kg", String(r.kg));
      if (r.cause !== undefined) q.set("cause", String(r.cause));
      break;
    case "five-a-day":
      q.set("portions", String(r.portions));
      q.set("plants", String(r.plants));
      break;
    case "powerhouse":
      q.set("atp", String(r.atp));
      q.set("zone", String(r.zone));
      break;
    case "ballpark":
      q.set("p", String(r.puzzle));
      if (r.tiers.length > 0) {
        q.set("r", r.tiers.slice(-7).map((tier) => TIER_LETTERS[tier]).join(""));
      }
      break;
    case "myth":
      q.set("p", String(r.puzzle));
      q.set("c", String(r.correct));
      q.set("t", String(r.total));
      break;
    case "lab-reaction":
      q.set("avg", String(r.avg));
      if (r.row) q.set("row", r.row);
      break;
    case "lab-recall":
      q.set("span", String(r.span));
      break;
    case "lab-track":
      q.set("ms", String(r.ms));
      q.set("acc", String(r.acc));
      break;
  }
  return `/api/arcade-card?${q.toString()}`;
}

/** Parse the card API's own params (the inverse of `arcadeCardPath`). */
export function parseCardParams(sp: SearchParams): ArcadeCardPayload | null {
  const game = firstString(sp.game);
  if (!game) return null;

  if (game === "ballpark" || game === "myth") {
    const daily = parseDailyResult(
      game === "ballpark"
        ? { g: "bp", p: sp.p, r: sp.r }
        : { g: "mf", p: sp.p, c: sp.c, t: sp.t },
    );
    return daily ? { kind: "result", result: daily } : null;
  }

  if (
    game === "lifeline" ||
    game === "max-out" ||
    game === "five-a-day" ||
    game === "powerhouse"
  ) {
    // A bare game id is the page's hero card; result params make a score card.
    const hasResultParams =
      sp.beat !== undefined ||
      sp.kg !== undefined ||
      sp.portions !== undefined ||
      sp.atp !== undefined;
    if (!hasResultParams) return { kind: "hero", game };
    const result = parseArcadeResult(game, {
      ...sp,
      // The card URL carries a challenge flag instead of leaking the seed.
      seed: firstString(sp.challenge) === "1" ? "1" : undefined,
    });
    return result ? { kind: "result", result } : null;
  }

  if (game === "lab-reaction" || game === "lab-recall" || game === "lab-track") {
    const hasResultParams =
      sp.avg !== undefined || sp.span !== undefined || sp.ms !== undefined;
    if (!hasResultParams) return { kind: "hero", game };
    const result = parseLabResult(game, sp);
    return result ? { kind: "result", result } : null;
  }

  if (game === "daily") return { kind: "hero", game };
  return null;
}

/* ----------------------------------------------- unfurl title/description */

/** og:title for a shared result URL — the score, readable in one line. */
export function resultTitle(result: ShareResultPayload): string {
  switch (result.game) {
    case "lifeline":
      return result.seed !== undefined
        ? `Lifeline: beat ${result.beat}`
        : `Lifeline: flatlined at ${result.beat}`;
    case "max-out":
      return `Max Out: ${formatNumber(result.kg)} kg on the bar`;
    case "five-a-day":
      return `Five a Day: ${result.portions} portion${result.portions === 1 ? "" : "s"}`;
    case "powerhouse":
      return `Powerhouse: ${formatNumber(result.atp)} ATP`;
    case "ballpark":
      return `Ballpark #${result.puzzle}`;
    case "myth":
      return `Myth or Fact? #${result.puzzle}: ${result.correct}/${result.total}`;
    case "lab-reaction":
      return `Reaction: ${result.avg} ms · ${reactionTier(result.avg).name}`;
    case "lab-recall":
      return `Recall: span ${result.span} · ${recallTier(result.span).name}`;
    case "lab-track":
      return `Track: ${result.ms} ms to target · ${trackTier(result.ms, result.acc / 100).name}`;
  }
}

/** og:description for a shared result URL — the hook to play it yourself. */
export function resultDescription(result: ShareResultPayload): string {
  switch (result.game) {
    case "lifeline": {
      const cause = result.cause
        ? ` Cause of death: ${lifelineCauseLabel(result.cause).toLowerCase()}.`
        : "";
      return result.seed !== undefined
        ? `They flatlined at ${result.beat}.${cause} Same course, one button. Outlive them, then check your real heart age.`
        : `They flatlined at ${result.beat}.${cause} One button, your score is the age you reach. Then check your real heart age.`;
    }
    case "max-out":
      return "Stop the needle in the green, load the bar, chase plates. How much can you lock out?";
    case "five-a-day":
      return `${result.portions} portions sliced, ${result.plants} different plant${result.plants === 1 ? "" : "s"}. Slice the produce, never the junk. Beat it.`;
    case "powerhouse":
      return `Bonked in ${titleCase(powerhouseZonePhrase(result.zone))}. You are the mitochondrion. Make more ATP than them.`;
    case "ballpark":
      return "One guess-the-stat a day, every answer cited. Play today's and compare.";
    case "myth":
      return "The weekly myth-buster quiz, every verdict backed by a study. Can you do better?";
    case "lab-reaction":
      return `${result.avg} ms average over five taps — faster than ${reactionPercentile(result.avg)}% of people. Wait for the flash, tap, find your tier. Beat it on your own screen.`;
    case "lab-track":
      return `${result.ms} ms to target at ${result.acc}% accuracy across 25 shrinking targets. Sniper or Stormtrooper — find out.`;
    case "lab-recall":
      return `The grid lit a pattern and they tapped it back to span ${result.span}. Goldfish to mainframe — where do you land on the animal ladder?`;
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-GB");
}

/** "ZONE 4 · THRESHOLD" → "Zone 4 · Threshold" for sentence contexts. */
function titleCase(phrase: string): string {
  return phrase
    .toLowerCase()
    .replace(/(^|[\s·(])(\S)/g, (m, lead: string, ch: string) => lead + ch.toUpperCase());
}
