"use client";

import Link from "next/link";
import { isLivePick, recommendationsFor } from "@/registry/affiliates";
import { trackEvent } from "@/lib/analytics";

/**
 * "Our recommendation" card — the shared affiliate placement for every
 * surface where a product can be sold (SPEC §10; CONTENT.md §4.2/§6).
 * Picks render as editorial content straight away; the "View at" button and
 * the affiliate disclosure appear only for picks whose affiliate URL is live
 * in registry/affiliates.ts, so no dead or placeholder links ever ship.
 * Live links are rel="sponsored nofollow" and clicks emit affiliate_click
 * events keyed by the surface.
 */
export function RecommendationCard({ surface }: { surface: string }) {
  const picks = recommendationsFor(surface);
  if (picks.length === 0) return null;

  const anyLive = picks.some(isLivePick);

  return (
    <aside
      aria-label="Our recommendation"
      data-testid="recommendation-card"
      className="rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[3px_3px_0_0_var(--color-foreground)]"
    >
      <p className="mb-4">
        <span className="inline-block -rotate-1 rounded-full border-2 border-foreground bg-primary-soft px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em] shadow-[2px_2px_0_0_var(--color-foreground)]">
          Our recommendation
        </span>
      </p>
      <ul className="space-y-4">
        {picks.map((pick) => (
          <li
            key={pick.offerId}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
          >
            <div className="min-w-56 max-w-prose flex-1">
              <p className="font-semibold">{pick.name}</p>
              <p className="mt-0.5 text-sm text-muted">{pick.why}</p>
              {pick.priceNote ? (
                <p className="mt-1 font-mono text-xs uppercase tracking-wide text-muted">
                  {pick.priceNote}
                </p>
              ) : null}
            </div>
            {isLivePick(pick) ? (
              <a
                href={pick.url}
                rel="sponsored nofollow noopener"
                target="_blank"
                className="rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-foreground shadow-[3px_3px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]"
                onClick={() =>
                  trackEvent({
                    name: "affiliate_click",
                    params: { slug: surface, offer: pick.offerId },
                  })
                }
              >
                {pick.merchant ? `View at ${pick.merchant}` : "View product"}
                <span aria-hidden="true"> ↗</span>
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      {anyLive ? (
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
          Affiliate disclosure: we may earn a commission if you buy through this
          link, at no extra cost to you. It never changes our evidence
          assessments or what the calculators report.{" "}
          <Link
            href="/legal/affiliate-disclosure"
            className="text-primary underline underline-offset-2"
          >
            How affiliate links work
          </Link>
        </p>
      ) : null}
    </aside>
  );
}
