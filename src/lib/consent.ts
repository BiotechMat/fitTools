"use client";

import { useSyncExternalStore } from "react";

/**
 * Consent state (SPEC §2, §10). Consent Mode v2 semantics with a hard
 * default of DENIED: no ad or analytics tag loads before an explicit
 * grant. The choice persists in localStorage; granting fires a
 * gtag('consent','update') when tags are present. A Google-certified CMP
 * can replace the built-in banner by setting NEXT_PUBLIC_CMP_SCRIPT_URL —
 * the store still gates our own script loading.
 */

export type ConsentChoice = "granted" | "denied" | null;

const STORAGE_KEY = "fittools:consent";
const CHANGE_EVENT = "fittools:consent-change";
const OPEN_EVENT = "fittools:consent-open";

interface GtagWindow {
  gtag?: (...args: unknown[]) => void;
}

function readChoice(): ConsentChoice {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw === "granted" || raw === "denied" ? raw : null;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function setConsentChoice(choice: Exclude<ConsentChoice, null>): void {
  window.localStorage.setItem(STORAGE_KEY, choice);
  window.dispatchEvent(new Event(CHANGE_EVENT));
  const granted = choice === "granted" ? "granted" : "denied";
  // Cast justification: gtag is injected at runtime by the consent-gated
  // GA4 loader and is absent from lib.dom types.
  (window as unknown as GtagWindow).gtag?.("consent", "update", {
    ad_storage: granted,
    ad_user_data: granted,
    ad_personalization: granted,
    analytics_storage: granted,
  });
}

/** Current stored choice (client only). */
export function useConsentChoice(): ConsentChoice {
  return useSyncExternalStore(subscribe, readChoice, () => null);
}

/** True only after an explicit grant. */
export function useAdConsent(): boolean {
  return useConsentChoice() === "granted";
}

/** Footer "Cookie settings" → reopen the banner. */
export function requestConsentBanner(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function subscribeToConsentOpen(onOpen: () => void): () => void {
  window.addEventListener(OPEN_EVENT, onOpen);
  return () => window.removeEventListener(OPEN_EVENT, onOpen);
}

/** Any tag configured → consent UI and default-denied bootstrap are needed. */
export const CONSENT_INFRA_ENABLED =
  Boolean(process.env.NEXT_PUBLIC_GA4_ID) ||
  Boolean(process.env.NEXT_PUBLIC_ADS_SCRIPT_URL) ||
  process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
