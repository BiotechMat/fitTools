/** Site-wide constants. */

export const SITE_NAME = "FitTools";

/**
 * Canonical origin. Set NEXT_PUBLIC_SITE_URL in production (see README);
 * the localhost fallback keeps dev and CI builds self-consistent.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const AUTHOR = {
  name: "Mathew Beale",
  /** Real credentials only (SPEC §11) — no inflated claims. */
  credentials: "MSc Biotechnology, University of Reading",
  path: "/author/mathew-beale",
} as const;
