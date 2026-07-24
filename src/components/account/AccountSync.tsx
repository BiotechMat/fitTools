"use client";

/**
 * Mounts the account sync engine — but only on devices that carry the
 * sign-in hint (ACCOUNTS.md §4.5): anonymous visitors load zero extra bytes
 * (the engine and every store module stay in their own lazy chunk) and make
 * zero extra requests. Listens for the account-change event so signing in
 * starts sync in the same pagelife, and signing out stops it.
 */

import { useEffect } from "react";
import { ACCOUNT_CHANGE_EVENT, hasAccountHint } from "@/lib/auth/session-probe";

export default function AccountSync(): null {
  useEffect(() => {
    let cancelled = false;
    const sync = (): void => {
      if (cancelled) return;
      if (hasAccountHint()) {
        void import("@/lib/account/sync").then((engine) => {
          if (!cancelled) engine.startAccountSync();
        });
      } else {
        // Signed out mid-session — stop the engine if it was ever loaded.
        void import("@/lib/account/sync").then((engine) => engine.stopAccountSync());
      }
    };
    if (hasAccountHint()) sync();
    window.addEventListener(ACCOUNT_CHANGE_EVENT, sync);
    return () => {
      cancelled = true;
      window.removeEventListener(ACCOUNT_CHANGE_EVENT, sync);
    };
  }, []);
  return null;
}
