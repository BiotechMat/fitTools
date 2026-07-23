/**
 * Daily ritual games — shared types (DAILY-GAMES.md §4). Two games over one
 * typed registry: **Ballpark** (daily guess-the-stat) and **Myth or Fact?**
 * (weekly quiz). Deliberately the opposite of Pulse: hand-authored and
 * deterministic, no runtime LLM (§2.5) — a scored game with a wrong answer is
 * a trust incident, so every item is vetted and primary-sourced up front.
 *
 * Evidence vocabulary is reused from the peptides registry, exactly as Pulse
 * does, so the existing <EvidenceTier /> renders reveals unchanged.
 */

import type { Source } from "@/registry/types";
import type { EvidenceBasis, EvidenceTier } from "@/registry/peptides";

export type { EvidenceBasis, EvidenceTier } from "@/registry/peptides";

/** Closeness tiers for a Ballpark guess (DAILY-GAMES.md §3.1). */
export type ClosenessTier = "bullseye" | "hot" | "warm" | "cold";

/**
 * A daily guess-the-stat item. `answer` and every bound is a real, cited
 * figure — the value or a value the cited source directly supports (never
 * authored from memory, CLAUDE.md).
 */
export interface BallparkItem {
  /** Stable kebab-case id — drives the seeded schedule, results and shares. */
  id: string;
  /** The prompt. British English, self-contained, no clickbait. */
  question: string;
  /** The cited value. Must satisfy sliderMin < answer < sliderMax. */
  answer: number;
  /** Unit shown by the slider readout and reveal ("%", "mg", "bpm", "hours"…). */
  unit: string;
  sliderMin: number;
  sliderMax: number;
  /** Log-mapped slider travel for wide spans (mg, steps). Default linear. */
  logScale?: boolean;
  /** One-sentence reveal context. */
  context: string;
  tier: EvidenceTier;
  basis?: EvidenceBasis;
  /** Mandatory — no item without a verified source (§2.1). */
  source: Source;
  /** Optional deep-link into a calculator (validated to be an absolute route). */
  relatedTool?: string;
  /** Optional deep-link to an article/reference (validated to be absolute). */
  relatedContent?: string;
  /** ISO date of last editorial/source review — registry convention. */
  lastReviewed: string;
}

/** A Myth-or-Fact statement, phrased as it circulates in the wild. */
export interface MythItem {
  id: string;
  statement: string;
  verdict: "myth" | "fact";
  /** The honest, cited resolution — nuance lives here. British English. */
  explanation: string;
  tier: EvidenceTier;
  basis?: EvidenceBasis;
  source: Source;
  relatedTool?: string;
  relatedContent?: string;
  lastReviewed: string;
}

/** A stored result for one played day/round (DAILY-GAMES.md §8). */
export interface BallparkResult {
  game: "ballpark";
  /** Puzzle number played (DAILY-GAMES.md §5). */
  puzzle: number;
  tier: ClosenessTier;
}

export interface MythResult {
  game: "myth";
  /** ISO-week puzzle number. */
  puzzle: number;
  /** Rounds correct out of total. */
  correct: number;
  total: number;
}

export type DailyResult = BallparkResult | MythResult;

/** Emoji + label for each closeness tier (DAILY-GAMES.md §3.1). */
export const TIER_META: Record<ClosenessTier, { emoji: string; label: string }> = {
  bullseye: { emoji: "🎯", label: "Bullseye" },
  hot: { emoji: "🔥", label: "Hot" },
  warm: { emoji: "👍", label: "Warm" },
  cold: { emoji: "❄️", label: "Cold" },
};
