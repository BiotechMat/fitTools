/**
 * Tool-slug → affiliate offers mapping (SPEC §4, §10). Offers are added in
 * M3; the shape exists now so AffiliateBlock can be built against it. Every
 * rendered offer must carry the disclosure line and rel="sponsored nofollow".
 */

export interface AffiliateOffer {
  /** Stable identifier used in affiliate_click analytics events. */
  offerId: string;
  label: string;
  description: string;
  url: string;
}

export const affiliatesBySlug: Readonly<Record<string, AffiliateOffer[]>> = {};

export function offersForTool(slug: string): AffiliateOffer[] {
  return affiliatesBySlug[slug] ?? [];
}
