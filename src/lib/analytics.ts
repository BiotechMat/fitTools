/**
 * Typed analytics event helpers (SPEC §12). GA4 itself is wired up in M3
 * behind Consent Mode v2; until then events are dropped silently. Components
 * call these helpers now so instrumentation is complete when tags activate.
 */

export type AnalyticsEvent =
  | { name: "calc_completed"; params: { tool: string } }
  | { name: "unit_toggled"; params: { system: "metric" | "imperial" } }
  | { name: "affiliate_click"; params: { slug: string; offer: string } }
  | { name: "email_signup"; params: Record<string, never> }
  | { name: "embed_copied"; params: { tool: string } }
  // Pulse feed (PULSE.md §10). NB: there is deliberately no dwell event — dwell
  // is aggregated on-device into local affinity and never transmitted (§5.1).
  | { name: "pulse_card_viewed"; params: { id: string; category: string } }
  | { name: "pulse_card_liked"; params: { id: string } }
  | { name: "pulse_card_saved"; params: { id: string } }
  | { name: "pulse_card_shared"; params: { id: string } }
  | { name: "pulse_source_click"; params: { id: string } }
  | { name: "pulse_filter_applied"; params: { categories: string } }
  | { name: "pulse_related_click"; params: { id: string; target: string } }
  // Daily ritual games (DAILY-GAMES.md §10). No timing signals, and no guess
  // values — a guess is the player's own business; `result` is a tier or "n/m".
  | { name: "daily_game_played"; params: { game: "ballpark" | "myth"; result: string } }
  | { name: "daily_game_shared"; params: { game: "ballpark" | "myth" } }
  | { name: "daily_streak_freeze_used"; params: Record<string, never> }
  | { name: "daily_related_click"; params: { id: string; target: string } }
  // The /today surface (TODAY.md §7). Which due-a-re-run chip converts is the
  // one signal the page needs; streak state itself is never transmitted.
  | { name: "today_rerun_click"; params: { tool: string } };

interface GtagWindow {
  gtag?: (command: "event", name: string, params: Record<string, unknown>) => void;
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  // Cast justification: window.gtag is injected at runtime by the
  // consent-gated GA4 script (M3) and is absent from lib.dom types; the
  // optional call makes the pre-M3 absence safe.
  (window as unknown as GtagWindow).gtag?.("event", event.name, event.params);
}
