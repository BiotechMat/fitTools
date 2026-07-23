/**
 * Spoiler-free share payloads (DAILY-GAMES.md §7). Pure and testable. The text
 * NEVER contains the question, the answer or the player's guess — only the
 * game, puzzle number, tier/score and a recent-form emoji row. v1 ships this as
 * Web Share / clipboard text; the branded OG-image card lands with the E1
 * pipeline (§7, §14).
 */

import { TIER_META, type ClosenessTier } from "@/lib/daily/types";

const SITE = "fittools.example/daily";

/** Ballpark share: puzzle number, today's tier emoji, and a 7-day form row. */
export function ballparkShareText(puzzle: number, recentTiers: ClosenessTier[]): string {
  const todays = recentTiers.length > 0 ? TIER_META[recentTiers[recentTiers.length - 1]].emoji : "";
  const row = recentTiers.map((t) => TIER_META[t].emoji).join("");
  return `Ballpark #${puzzle} ${todays}\n${row}\n${SITE}`;
}

/** Myth-or-Fact share: puzzle number and score, no statements revealed. */
export function mythShareText(puzzle: number, correct: number, total: number): string {
  const hearts = "💚".repeat(correct) + "🖤".repeat(Math.max(0, total - correct));
  return `Myth or Fact? #${puzzle} — ${correct}/${total}\n${hearts}\n${SITE}`;
}

/** Fire the native share sheet, falling back to clipboard. Returns quietly. */
export async function shareText(text: string): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ text });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  } catch {
    // user dismissed the sheet, or clipboard blocked — no-op, never throws
  }
}
