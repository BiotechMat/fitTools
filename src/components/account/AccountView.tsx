"use client";

/**
 * The signed-in account view (ACCOUNTS.md §8.2) — and the home of the §7.3
 * data controls: consent state + toggle, export, delete everything. Also
 * completes first sign-in: sets the device hint (which wakes the sync
 * engine), and writes the age band chosen on /signin to the account.
 *
 * Consent copy rule (§7.2): plain language, shown as its own step, never
 * fine print. Deleting is typed-confirmation, immediate, and honest about
 * what it does and doesn't touch (server copies vs this device's local
 * data).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth/client";
import { bandAllowsHealthStorage, isAgeBand, AGE_BANDS, type AgeBand } from "@/lib/auth/shared";
import { hasAccountHint, setAccountHint, resetProbe } from "@/lib/auth/session-probe";
import { PENDING_BAND_KEY } from "@/components/account/SignInCard";
import { trackEvent } from "@/lib/analytics";

const BAND_LABELS: Record<AgeBand, string> = {
  "13-15": "13–15",
  "16-17": "16–17",
  "18-plus": "18 or over",
};

interface ConsentState {
  state: "never-asked" | "granted" | "revoked";
  eligible: boolean;
}

const cardClass =
  "mt-6 rounded-2xl border-2 border-foreground bg-surface p-6 shadow-[4px_4px_0_0_var(--color-foreground)]";
const buttonClass =
  "rounded-full border-2 border-foreground px-5 py-2 font-bold shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] disabled:opacity-60";

export function AccountView(): React.ReactElement {
  const { data: session, isPending } = useSession();
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [deleteText, setDeleteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [bandSaving, setBandSaving] = useState(false);
  const bandAdoptedRef = useRef(false);

  const user = session?.user as (typeof session extends null | undefined
    ? never
    : NonNullable<typeof session>["user"] & { ageBand?: unknown }) | undefined;
  const ageBand = isAgeBand(user?.ageBand) ? user.ageBand : null;

  const refreshConsent = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch("/api/account/consent");
      if (!response.ok) return;
      const body = (await response.json()) as {
        eligibleForHealthStorage?: boolean;
        healthStorage?: { state?: string };
      };
      const state = body.healthStorage?.state;
      setConsent({
        state: state === "granted" ? "granted" : state === "revoked" ? "revoked" : "never-asked",
        eligible: body.eligibleForHealthStorage === true,
      });
    } catch {
      // transient — the card shows a retry
    }
  }, []);

  // First sign-in completion: set the device hint (wakes sync), adopt the
  // band chosen on /signin if the account doesn't carry one yet.
  useEffect(() => {
    if (!session) return;
    if (!hasAccountHint()) {
      // First arrival on this device this sign-in — the closest honest
      // proxy for a completed sign-in event (no method detail here).
      trackEvent({ name: "account_signin", params: {} });
    }
    setAccountHint(true);
    resetProbe();
    void refreshConsent();
    if (ageBand === null && !bandAdoptedRef.current) {
      let pending: string | null = null;
      try {
        pending = window.sessionStorage.getItem(PENDING_BAND_KEY);
      } catch {
        pending = null;
      }
      if (isAgeBand(pending)) {
        bandAdoptedRef.current = true;
        void authClient.updateUser({ ageBand: pending }).then(() => {
          try {
            window.sessionStorage.removeItem(PENDING_BAND_KEY);
          } catch {
            // fine
          }
          resetProbe();
          window.location.reload();
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on session arrival
  }, [session === null || session === undefined]);

  const saveBand = async (band: AgeBand): Promise<void> => {
    setBandSaving(true);
    await authClient.updateUser({ ageBand: band });
    setBandSaving(false);
    resetProbe();
    window.location.reload();
  };

  const setHealthConsent = async (granted: boolean): Promise<void> => {
    setBusy(true);
    try {
      const response = await fetch("/api/account/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "health-storage", granted }),
      });
      if (response.ok) {
        trackEvent({ name: "account_consent", params: { kind: "health-storage", granted } });
        await refreshConsent();
        const engine = await import("@/lib/account/sync");
        engine.resyncAccount();
      }
    } finally {
      setBusy(false);
    }
  };

  const signOut = async (everywhere: boolean): Promise<void> => {
    setBusy(true);
    try {
      if (everywhere) await authClient.revokeSessions();
      await authClient.signOut();
    } finally {
      setAccountHint(false);
      resetProbe();
      window.location.href = "/";
    }
  };

  const deleteEverything = async (): Promise<void> => {
    setBusy(true);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (response.ok) {
        trackEvent({ name: "account_deleted", params: {} });
        setAccountHint(false);
        resetProbe();
        setDeleted(true);
      }
    } finally {
      setBusy(false);
    }
  };

  if (deleted) {
    return (
      <section aria-live="polite" className={cardClass}>
        <h2 className="font-display text-2xl uppercase">Deleted</h2>
        <p className="mt-2 text-muted">
          Your account and everything stored in it are gone from our servers.
          The data saved on this device is still yours — it stays in your
          browser unless you clear it. Thanks for trying FitTools.
        </p>
        <Link href="/" className={`${buttonClass} mt-4 inline-block bg-primary-strong`}>
          Back to the tools
        </Link>
      </section>
    );
  }

  if (isPending) {
    // Reserved space — no layout shift when the session resolves (SPEC §13).
    return <div aria-hidden="true" className="mt-6 h-64 rounded-2xl border-2 border-dashed border-foreground/20" />;
  }

  if (!session) {
    return (
      <section className={cardClass}>
        <h2 className="font-display text-2xl uppercase">Signed out</h2>
        <p className="mt-2 text-muted">
          Sign in to see what your account holds, export it, or delete it.
        </p>
        <Link href="/signin" className={`${buttonClass} mt-4 inline-block bg-primary-strong`}>
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <>
      <section className={cardClass}>
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted">
          Signed in as
        </h2>
        <p className="mt-1 text-lg font-bold">{session.user.email}</p>
        <p className="mt-1 text-sm text-muted">
          Age band: {ageBand !== null ? BAND_LABELS[ageBand] : "not set"} · stored as the band
          only, never a date of birth.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void signOut(false)} className={`${buttonClass} bg-background`}>
            Sign out
          </button>
          <button type="button" disabled={busy} onClick={() => void signOut(true)} className={`${buttonClass} bg-background`}>
            Sign out everywhere
          </button>
        </div>
      </section>

      {ageBand === null ? (
        <section className={cardClass}>
          <h2 className="font-display text-2xl uppercase">How old are you?</h2>
          <p className="mt-2 text-sm text-muted">
            Pick your age band to finish setting up. We store the band, never a
            date of birth.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {AGE_BANDS.map((b) => (
              <button
                key={b}
                type="button"
                disabled={bandSaving}
                onClick={() => void saveBand(b)}
                className={`${buttonClass} bg-background`}
              >
                {BAND_LABELS[b]}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className={cardClass}>
        <h2 className="font-display text-2xl uppercase">Your health numbers</h2>
        {ageBand !== null && !bandAllowsHealthStorage(ageBand) ? (
          <p className="mt-2 text-sm text-muted">
            Game streaks, arcade bests, saved exercises and bookmarks sync to
            your account. Storing health-related numbers (calculator results,
            vitals, your supplement stack) needs an account aged 16+ — until
            then those stay right here on your device, and every tool keeps
            working exactly the same.
          </p>
        ) : consent === null ? (
          <p className="mt-2 text-sm text-muted">
            Checking your consent state…{" "}
            <button type="button" onClick={() => void refreshConsent()} className="underline">
              retry
            </button>
          </p>
        ) : consent.state === "granted" ? (
          <>
            <p className="mt-2 text-sm text-muted">
              You&apos;ve chosen to store your health-related numbers (calculator
              results, vitals, your supplement stack) in your account so they
              follow you across devices. You can turn this off any time —
              we&apos;ll delete the copies on our servers and leave this
              device&apos;s data untouched.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void setHealthConsent(false)}
              className={`${buttonClass} mt-4 bg-background`}
            >
              Stop storing — delete server copies
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted">
              Want your calculator results, vitals and supplement stack to
              follow you across devices? That means storing health-related
              numbers in your account, in our UK/EU database, until you delete
              them. They&apos;re never sold, never shared, never used to train
              anything — and one click below deletes every server copy, any
              time. Say no and everything still works; your numbers just stay
              on this device.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void setHealthConsent(true)}
              className={`${buttonClass} mt-4 bg-primary-strong`}
            >
              Yes — store my numbers in my account
            </button>
          </>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="font-display text-2xl uppercase">Your data, your controls</h2>
        <p className="mt-2 text-sm text-muted">
          Export everything we hold as one JSON file, or delete the lot. No
          waiting period, no retention tricks — deletion is immediate (backup
          copies age out within days and are never restored).
        </p>
        <a
          href="/api/account/export"
          download
          className={`${buttonClass} mt-4 inline-block bg-background`}
        >
          Export everything (JSON)
        </a>
        <div className="mt-6 border-t-2 border-dashed border-foreground/30 pt-4">
          <label htmlFor="delete-confirm" className="text-sm font-semibold">
            Delete everything — type <span className="font-mono">DELETE</span> to confirm:
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="delete-confirm"
              type="text"
              value={deleteText}
              onChange={(event) => setDeleteText(event.target.value)}
              className="w-40 rounded-xl border-2 border-foreground bg-background px-3 py-2 font-mono"
            />
            <button
              type="button"
              disabled={busy || deleteText !== "DELETE"}
              onClick={() => void deleteEverything()}
              className={`${buttonClass} bg-primary-soft`}
            >
              Delete my account
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Removes your account, consents and every stored document from our
            servers. Data saved on this device stays on this device.
          </p>
        </div>
      </section>
    </>
  );
}
