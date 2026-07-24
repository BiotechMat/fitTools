"use client";

/**
 * The sign-in card (ACCOUNTS.md §8.1): age band first (13+ floor — §7.7),
 * then magic link or Google/Apple. The chosen band is remembered locally and
 * written to the account after the first sign-in completes (/account picks
 * it up), because a magic link round-trips through email before any user
 * record can carry it. Degrades honestly: accounts not configured → says so.
 */

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { AGE_BANDS, type AgeBand } from "@/lib/auth/shared";

export const PENDING_BAND_KEY = "fittools.account.pending-band";

const BAND_LABELS: Record<AgeBand, string> = {
  "13-15": "13–15",
  "16-17": "16–17",
  "18-plus": "18 or over",
};

type Phase = "form" | "sending" | "sent" | "unavailable";

export function SignInCard(): React.ReactElement {
  const [band, setBand] = useState<AgeBand | "under-13" | null>(null);
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState<string | null>(null);

  /** Post-auth destination: /account completes sign-in, then forwards here. */
  const callbackURL = (): string => {
    let next = "/dashboard";
    try {
      const requested = new URLSearchParams(window.location.search).get("next");
      if (requested !== null && requested.startsWith("/") && !requested.startsWith("//")) {
        next = requested;
      }
    } catch {
      // default stands
    }
    return `/account?next=${encodeURIComponent(next)}`;
  };

  const rememberBand = (): void => {
    if (band !== null && band !== "under-13") {
      try {
        window.sessionStorage.setItem(PENDING_BAND_KEY, band);
      } catch {
        // storage unavailable — /account will ask instead
      }
    }
  };

  const sendMagicLink = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setError(null);
    setPhase("sending");
    rememberBand();
    const { error: sendError } = await authClient.signIn.magicLink({
      email,
      callbackURL: callbackURL(),
    });
    if (sendError) {
      if (sendError.status === 503) {
        setPhase("unavailable");
      } else {
        setPhase("form");
        setError("That didn't send. Check the address and try again.");
      }
      return;
    }
    setPhase("sent");
  };

  const socialSignIn = async (provider: "google" | "apple"): Promise<void> => {
    setError(null);
    rememberBand();
    const { error: socialError } = await authClient.signIn.social({
      provider,
      callbackURL: callbackURL(),
    });
    if (socialError) {
      setError(
        socialError.status === 503
          ? "Accounts aren't switched on yet."
          : `${provider === "google" ? "Google" : "Apple"} sign-in isn't available yet.`,
      );
    }
  };

  if (phase === "sent") {
    return (
      <section
        aria-live="polite"
        className="mt-6 rounded-2xl border-2 border-foreground bg-surface p-6 shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        <h2 className="font-display text-2xl uppercase">Check your email</h2>
        <p className="mt-2 text-muted">
          We&apos;ve sent a sign-in link to <strong className="text-foreground">{email}</strong>.
          It works once and expires in 15 minutes. You can close this tab.
        </p>
      </section>
    );
  }

  if (phase === "unavailable") {
    return (
      <section
        aria-live="polite"
        className="mt-6 rounded-2xl border-2 border-foreground bg-surface p-6 shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        <h2 className="font-display text-2xl uppercase">Not switched on yet</h2>
        <p className="mt-2 text-muted">
          Accounts aren&apos;t live on this deployment yet. Everything else works
          without one — your saves stay on this device.
        </p>
      </section>
    );
  }

  const bandChosen = band !== null && band !== "under-13";

  return (
    <section className="mt-6 rounded-2xl border-2 border-foreground bg-surface p-6 shadow-[4px_4px_0_0_var(--color-foreground)]">
      <fieldset>
        <legend className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
          First: how old are you?
        </legend>
        <p className="mt-1 text-sm text-muted">
          Accounts are for ages 13 and over. We store the band you pick, never
          a date of birth.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AGE_BANDS.map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={band === b}
              onClick={() => setBand(b)}
              className={`rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_0_var(--color-foreground)] ${
                band === b ? "bg-primary-strong" : "bg-background"
              }`}
            >
              {BAND_LABELS[b]}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={band === "under-13"}
            onClick={() => setBand("under-13")}
            className={`rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_0_var(--color-foreground)] ${
              band === "under-13" ? "bg-primary-strong" : "bg-background"
            }`}
          >
            Under 13
          </button>
        </div>
      </fieldset>

      {band === "under-13" ? (
        <p className="mt-4 rounded-xl border-2 border-foreground bg-surface-deep p-4 text-sm">
          Accounts are for ages 13 and over — but you don&apos;t need one. Every
          calculator and game works without signing in, and your bests save on
          this device.
        </p>
      ) : null}

      {bandChosen ? (
        <>
          <form onSubmit={sendMagicLink} className="mt-6">
            <label
              htmlFor="signin-email"
              className="font-mono text-xs font-bold uppercase tracking-[0.14em]"
            >
              Email — we&apos;ll send a sign-in link
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="signin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-foreground bg-background px-3 py-2"
              />
              <button
                type="submit"
                disabled={phase === "sending"}
                className="shrink-0 rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 font-bold text-foreground shadow-[3px_3px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] disabled:opacity-60"
              >
                {phase === "sending" ? "Sending…" : "Send link"}
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">
              No password — the link is the sign-in. It works once and expires
              in 15 minutes.
            </p>
          </form>

          <div className="mt-6 border-t-2 border-dashed border-foreground/30 pt-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Or continue with
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void socialSignIn("google")}
                className="rounded-full border-2 border-foreground bg-background px-5 py-2 font-bold shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => void socialSignIn("apple")}
                className="rounded-full border-2 border-foreground bg-background px-5 py-2 font-bold shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]"
              >
                Apple
              </button>
            </div>
          </div>
        </>
      ) : null}

      {error !== null ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-primary">
          {error}
        </p>
      ) : null}
    </section>
  );
}
