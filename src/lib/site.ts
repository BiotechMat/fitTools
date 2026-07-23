/** Site-wide constants. */

export const SITE_NAME = "FitTools";

/**
 * Canonical origin. On Vercel *production* we default to the live domain so the
 * site is indexable with no manual env var; `NEXT_PUBLIC_SITE_URL` still wins if
 * set (e.g. to move to a different domain). It's a plain literal so it's also
 * available client-side (EmbedCode builds absolute iframe URLs). Dev/CI/preview
 * render this origin in their (noindex) metadata, which is harmless.
 */
const PRODUCTION_SITE_URL = "https://tools.fit";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? PRODUCTION_SITE_URL;

/**
 * Pages are indexable ONLY on the production deployment (or when
 * NEXT_PUBLIC_SITE_URL is explicitly set). Local dev, CI and Vercel Preview all
 * emit a noindex robots meta tag so previews never enter the search index.
 * robots.txt stays Allow so Google's Rich Results test can validate JSON-LD.
 * `VERCEL_ENV` is a server-only build var (Vercel sets it automatically); this
 * flag is read only in server metadata, never shipped to the client.
 */
export const SITE_CONFIGURED =
  process.env.NEXT_PUBLIC_SITE_URL !== undefined ||
  process.env.VERCEL_ENV === "production";

export const AUTHOR = {
  name: "Mathew Beale",
  /** Real credentials only (SPEC §11) — no inflated claims. */
  credentials: "MSc Biotechnology, University of Reading",
  path: "/author/mathew-beale",
} as const;
