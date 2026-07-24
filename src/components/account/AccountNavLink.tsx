"use client";

/**
 * The nav account entry (ACCOUNTS.md §8.3; Mat 2026-07-24: an account chip
 * top-right, beside the CTA on desktop). Signed out it renders NOTHING —
 * the nav is byte-identical to today and no request is made (the probe only
 * fires when this device carries the sign-in hint). Signed in, an
 * avatar-style chip appears — the account email's first letter in a riso
 * circle — linking to /account. Hand-written on the session probe; the
 * auth client never loads here (§4.5 JS-budget rule).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ACCOUNT_CHANGE_EVENT,
  hasAccountHint,
  probeSession,
} from "@/lib/auth/session-probe";

export function AccountNavLink(): React.ReactElement | null {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = (): void => {
      if (!hasAccountHint()) {
        setEmail(null);
        return;
      }
      void probeSession().then((state) => {
        if (!cancelled) {
          setEmail(state.status === "signed-in" ? state.session.email : null);
        }
      });
    };
    check();
    window.addEventListener(ACCOUNT_CHANGE_EVENT, check);
    return () => {
      cancelled = true;
      window.removeEventListener(ACCOUNT_CHANGE_EVENT, check);
    };
  }, []);

  if (email === null) return null;
  const initial = email.slice(0, 1).toUpperCase();
  return (
    <Link
      href="/account"
      aria-label={`Account — ${email}`}
      title={email}
      className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-primary-soft font-display text-base shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] lg:ml-2"
    >
      <span aria-hidden="true">{initial}</span>
    </Link>
  );
}
