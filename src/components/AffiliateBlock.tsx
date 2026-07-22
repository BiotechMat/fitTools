"use client";

import { offersForTool } from "@/registry/affiliates";
import { trackEvent } from "@/lib/analytics";

/**
 * Affiliate placements (SPEC §10). Renders nothing when a tool has no
 * offers. Every render carries the disclosure line; links are
 * rel="sponsored nofollow"; clicks emit affiliate_click events.
 */
export function AffiliateBlock({ slug }: { slug: string }) {
  const offers = offersForTool(slug);
  if (offers.length === 0) return null;

  return (
    <section
      aria-label="Recommended products"
      className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
    >
      <p className="text-xs text-muted">
        Affiliate disclosure: we may earn a commission if you buy through the
        links below, at no extra cost to you. This never affects which tools
        we build or what the calculators report.
      </p>
      <ul className="mt-3 space-y-2">
        {offers.map((offer) => (
          <li key={offer.offerId}>
            <a
              href={offer.url}
              rel="sponsored nofollow"
              target="_blank"
              className="font-medium text-primary underline underline-offset-2"
              onClick={() =>
                trackEvent({
                  name: "affiliate_click",
                  params: { slug, offer: offer.offerId },
                })
              }
            >
              {offer.label}
            </a>
            <p className="text-sm text-muted">{offer.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
