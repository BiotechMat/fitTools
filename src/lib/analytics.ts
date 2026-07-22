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
  | { name: "embed_copied"; params: { tool: string } };

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
