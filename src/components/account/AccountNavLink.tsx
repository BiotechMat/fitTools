"use client";

/**
 * The nav account entry (ACCOUNTS.md §8.3; Mat 2026-07-24: always present
 * top-right beside the CTA). Signed out — including before hydration — it's
 * a person icon linking to /signin (no probe, no requests: the hint check
 * is local). Signed in it becomes the avatar chip — the account email's
 * first letter in a riso circle — linking to /account. Hand-written on the
 * session probe; the auth client never loads here (§4.5 JS-budget rule).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ACCOUNT_CHANGE_EVENT,
  hasAccountHint,
  probeSession,
} from "@/lib/auth/session-probe";

const chipClass =
  "ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] lg:ml-2";

function PersonIcon(): React.ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.8 19.4c1.6-3.1 4.1-4.6 7.2-4.6s5.6 1.5 7.2 4.6" />
    </svg>
  );
}

export function AccountNavLink(): React.ReactElement {
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

  if (email === null) {
    return (
      <Link
        href="/signin"
        aria-label="Sign in"
        title="Sign in"
        className={`${chipClass} bg-surface`}
      >
        <PersonIcon />
      </Link>
    );
  }
  return (
    <Link
      href="/account"
      aria-label={`Account — ${email}`}
      title={email}
      className={`${chipClass} bg-primary-soft font-display text-base`}
    >
      <span aria-hidden="true">{email.slice(0, 1).toUpperCase()}</span>
    </Link>
  );
}
