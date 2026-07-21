"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_INFRA_ENABLED,
  setConsentChoice,
  subscribeToConsentOpen,
  useConsentChoice,
} from "@/lib/consent";

/**
 * First-party consent banner (SPEC §10). Fixed-position (zero CLS),
 * default DENIED — closing without a choice grants nothing. Reopenable
 * from the footer. When a Google-certified CMP is configured it manages
 * consent UI instead; this banner then stays hidden unless no choice has
 * been recorded.
 */
export function ConsentBanner() {
  const choice = useConsentChoice();
  const [reopened, setReopened] = useState(false);

  useEffect(() => subscribeToConsentOpen(() => setReopened(true)), []);

  if (!CONSENT_INFRA_ENABLED) return null;
  if (choice !== null && !reopened) return null;

  const decide = (value: "granted" | "denied") => {
    setConsentChoice(value);
    setReopened(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg"
      data-testid="consent-banner"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
        <p className="min-w-64 flex-1 text-sm text-muted">
          We use cookies for analytics and advertising only if you agree.
          Essential functionality never needs them.{" "}
          <Link href="/legal/cookie-policy" className="text-primary underline underline-offset-2">
            Cookie policy
          </Link>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => decide("denied")}
            data-testid="consent-reject"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            data-testid="consent-accept"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
