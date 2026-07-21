"use client";

import { CONSENT_INFRA_ENABLED, requestConsentBanner } from "@/lib/consent";

/** Footer link reopening the consent banner (SPEC §10 — settings re-openable). */
export function CookieSettingsButton() {
  if (!CONSENT_INFRA_ENABLED) return null;
  return (
    <button
      type="button"
      onClick={requestConsentBanner}
      className="hover:text-foreground underline-offset-2 hover:underline"
    >
      Cookie settings
    </button>
  );
}
