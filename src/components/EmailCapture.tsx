"use client";

import { useId, useState } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Email capture (SPEC §10): provider-agnostic POST to an env-configured
 * endpoint, double-opt-in compatible (the provider sends the confirmation
 * email), max one placement per page. Renders nothing until
 * NEXT_PUBLIC_EMAIL_ENDPOINT is set, so pages stay clean pre-launch.
 */
export function EmailCapture() {
  const id = useId();
  const endpoint = process.env.NEXT_PUBLIC_EMAIL_ENDPOINT;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (!endpoint) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("done");
      trackEvent({ name: "email_signup", params: {} });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      aria-label="Email newsletter sign-up"
      className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
    >
      {status === "done" ? (
        <p className="text-sm font-medium">
          Nearly there — check your inbox and confirm your subscription.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor={`${id}-email`} className="block text-sm font-semibold">
              Get new calculators by email
            </label>
            <p className="text-xs text-muted">
              Occasional updates, double opt-in, unsubscribe any time.
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
            {status === "sending" ? "Signing up…" : "Sign up"}
          </button>
          {status === "error" ? (
            <p role="alert" className="w-full text-sm text-muted">
              Something went wrong — please try again in a moment.
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
