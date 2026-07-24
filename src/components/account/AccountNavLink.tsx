"use client";

/**
 * The nav account entry (ACCOUNTS.md §8.3). Signed out it renders NOTHING —
 * the nav is byte-identical to today and no request is made (the probe only
 * fires when this device carries the sign-in hint). Signed in, a quiet
 * "Account" link appears. Hand-written on the session probe; the auth
 * client never loads here (§4.5 JS-budget rule).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ACCOUNT_CHANGE_EVENT,
  hasAccountHint,
  probeSession,
} from "@/lib/auth/session-probe";

export function AccountNavLink(): React.ReactElement | null {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = (): void => {
      if (!hasAccountHint()) {
        setSignedIn(false);
        return;
      }
      void probeSession().then((state) => {
        if (!cancelled) setSignedIn(state.status === "signed-in");
      });
    };
    check();
    window.addEventListener(ACCOUNT_CHANGE_EVENT, check);
    return () => {
      cancelled = true;
      window.removeEventListener(ACCOUNT_CHANGE_EVENT, check);
    };
  }, []);

  if (!signedIn) return null;
  return (
    <Link
      href="/account"
      className="hidden rounded-full border-2 border-foreground bg-surface px-3 py-1 text-sm font-bold shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] lg:inline-block"
    >
      Account
    </Link>
  );
}
