import { RecommendationCard } from "@/components/RecommendationCard";

/**
 * Tool-page affiliate placement (SPEC §10). Kept under its SPEC name; the
 * rendering — disclosure line, rel="sponsored nofollow", affiliate_click
 * events, hidden-until-live behaviour — lives in the shared
 * RecommendationCard, keyed by the tool:<slug> surface.
 */
export function AffiliateBlock({ slug }: { slug: string }) {
  return <RecommendationCard surface={`tool:${slug}`} />;
}
