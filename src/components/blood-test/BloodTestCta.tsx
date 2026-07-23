"use client";

import { useId, useState } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Pre-launch call-to-action for the blood test (blood-test page). Honest dual
 * state so there's never a dead "buy" button while the lab partner is being
 * integrated:
 *
 *  - endpoint configured  → an early-access waitlist form (real capture, reusing
 *    the SPEC §10 email endpoint / double-opt-in pattern from EmailCapture);
 *  - endpoint absent (now) → a clear "launching soon" card whose button scrolls
 *    to the panel, so the CTA still does something useful.
 *
 * No checkout exists yet — buying is deliberately not wired here.
 */
export function BloodTestCta({ panelHref = "#panel" }: { panelHref?: string }) {
  const id = useId();
  const endpoint = process.env.NEXT_PUBLIC_EMAIL_ENDPOINT;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  // Pre-launch: no email endpoint yet → honest "coming soon" + a working link.
  if (!endpoint) {
    return (
      <div className="rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[3px_3px_0_0_var(--color-foreground)]">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          Launching soon
        </p>
        <p className="mt-2 text-sm text-muted">
          We&rsquo;re finalising our accredited testing partner. Early access opens
          shortly — for now, see exactly what the panel measures.
        </p>
        <a
          href={panelHref}
          className="mt-4 inline-block rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 font-bold text-foreground shadow-[3px_3px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]"
        >
          See the full panel &darr;
        </a>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, list: "blood-test-early-access" }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("done");
      trackEvent({ name: "email_signup", params: {} });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[3px_3px_0_0_var(--color-foreground)]">
      {status === "done" ? (
        <p className="text-sm font-medium">
          You&rsquo;re on the list — check your inbox to confirm, and we&rsquo;ll email you
          the moment it launches.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor={`${id}-email`} className="block text-sm font-semibold">
              Get early access
            </label>
            <p className="text-xs text-muted">
              We&rsquo;ll email you when the test goes live. Double opt-in, unsubscribe any time.
            </p>
            <input
              id={`${id}-email`}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base focus:outline-2 focus:outline-offset-2 focus:outline-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 font-bold text-foreground shadow-[3px_3px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] disabled:opacity-60"
          >
            {status === "sending" ? "Joining…" : "Notify me"}
          </button>
          {status === "error" ? (
            <p role="alert" className="w-full text-sm text-muted">
              Something went wrong — please try again in a moment.
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
