/**
 * The signed-out signup prompt policy (Mat, 2026-07-24: saving or
 * bookmarking while signed out should prompt sign-up). One shared rule so
 * every surface behaves identically, inside the DESIGN §5 / Children's
 * Code guardrails: never blocking, never a modal, and "Not now" snoozes
 * every prompt site-wide for a fortnight — a prompt, not a nag.
 */

import { ACCOUNT_CHANGE_EVENT, hasAccountHint } from "@/lib/auth/session-probe";

export const SIGNUP_PROMPT_SNOOZE_KEY = "fittools.account.prompt-snooze";
const SNOOZE_DAYS = 14;

export function shouldShowSignupPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (hasAccountHint()) return false; // signed in on this device
  try {
    const snoozedAt = window.localStorage.getItem(SIGNUP_PROMPT_SNOOZE_KEY);
    if (snoozedAt !== null) {
      const elapsed = Date.now() - Date.parse(snoozedAt);
      if (Number.isFinite(elapsed) && elapsed < SNOOZE_DAYS * 24 * 60 * 60 * 1000) {
        return false;
      }
    }
  } catch {
    // storage unavailable — show; dismissal just won't persist
  }
  return true;
}

/** Snooze everywhere for a fortnight and tell mounted nudges to hide. */
export function snoozeSignupPrompt(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIGNUP_PROMPT_SNOOZE_KEY, new Date().toISOString());
  } catch {
    // fine — session-only dismissal
  }
  window.dispatchEvent(new Event(ACCOUNT_CHANGE_EVENT));
}
