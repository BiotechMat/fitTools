/** Site-wide constants. */

export const SITE_NAME = "FitTools";

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in production (see README);
 * the localhost fallback keeps dev and CI builds self-consistent.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Until the production domain is configured via NEXT_PUBLIC_SITE_URL,
 * every page emits a noindex robots meta tag: preview deployments must
 * never enter the index with localhost canonicals. Pages stay crawlable
 * (robots.txt allows) so Google's Rich Results test can validate JSON-LD.
 */
export const SITE_CONFIGURED = process.env.NEXT_PUBLIC_SITE_URL !== undefined;

export const AUTHOR = {
  name: "Mathew Beale",
  /** Real credentials only (SPEC §11) — no inflated claims. */
  credentials: "MSc Biotechnology, University of Reading",
  path: "/author/mathew-beale",
} as const;
