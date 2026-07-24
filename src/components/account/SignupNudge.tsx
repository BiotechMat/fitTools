"use client";

/**
 * The quiet signup nudge (DESIGN §5 upsell style; Mat 2026-07-24: prompt
 * sign-up at the moment of a signed-out save). An inline chip, never a
 * modal: plain benefit, a Sign up link, and "Not now" which snoozes every
 * nudge site-wide for a fortnight. Renders nothing when signed in, snoozed,
 * or before hydration. Small enough to sit inside the existing flex rows.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ACCOUNT_CHANGE_EVENT } from "@/lib/auth/session-probe";
import { shouldShowSignupPrompt, snoozeSignupPrompt } from "@/lib/account/signup-prompt";

export function SignupNudge({
  copy = "On this device only",
}: {
  /** Lead-in describing where the save just went. */
  copy?: string;
}): React.ReactElement | null {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = (): void => setVisible(shouldShowSignupPrompt());
    check();
    window.addEventListener(ACCOUNT_CHANGE_EVENT, check);
    return () => window.removeEventListener(ACCOUNT_CHANGE_EVENT, check);
  }, []);

  if (!visible) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-foreground bg-good-soft px-2.5 py-0.5 text-xs">
      <span>
        {copy} —{" "}
        <Link href="/signin" className="font-bold underline underline-offset-2">
          a free account keeps it everywhere
        </Link>
      </span>
      <button
        type="button"
        onClick={snoozeSignupPrompt}
        className="text-muted underline underline-offset-2 hover:text-foreground"
      >
        Not now
      </button>
    </span>
  );
}
