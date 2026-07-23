/**
 * Spoiler-free share payloads (DAILY-GAMES.md §7). Pure and testable. The text
 * NEVER contains the question, the answer or the player's guess — only the
 * game, puzzle number, tier/score and a recent-form emoji row. The link
 * carries the same score as bounded params, so it unfurls as the day's result
 * card (`/daily` metadata + `/api/arcade-card` — the E1/Phase 2 share hook).
 */

import { TIER_META, type ClosenessTier } from "@/lib/daily/types";
import { ballparkSharePath, mythSharePath } from "@/lib/arcade-share";
import { SITE_URL } from "@/lib/site";

/** Ballpark share: puzzle number, today's tier emoji, and a 7-day form row. */
export function ballparkShareText(puzzle: number, recentTiers: ClosenessTier[]): string {
  const todays = recentTiers.length > 0 ? TIER_META[recentTiers[recentTiers.length - 1]].emoji : "";
  const row = recentTiers.map((t) => TIER_META[t].emoji).join("");
  const url = SITE_URL + ballparkSharePath({ puzzle, tiers: recentTiers });
  return `Ballpark #${puzzle} ${todays}\n${row}\n${url}`;
}

/** Myth-or-Fact share: puzzle number and score, no statements revealed. */
export function mythShareText(puzzle: number, correct: number, total: number): string {
  const hearts = "💚".repeat(correct) + "🖤".repeat(Math.max(0, total - correct));
  const url = SITE_URL + mythSharePath({ puzzle, correct, total });
  return `Myth or Fact? #${puzzle} — ${correct}/${total}\n${hearts}\n${url}`;
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
