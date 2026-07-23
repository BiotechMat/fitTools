/**
 * Share-card params (ROADMAP.md E1 — the achievement/share loop; DESIGN.md §6
 * achievement card). A shareable result is encoded as query params on `/share`,
 * whose OG image is rendered by `/api/share-card` from the same params.
 *
 * Cards are tied to a real tool slug (validated against the registry by the
 * server) so a card can only ever present a genuine FitTools metric and links
 * back to the tool — the internal-linking payoff, and it blocks arbitrary-text
 * cards impersonating the brand. Values/labels are format- and length-bounded.
 * No personal data: only the presentation strings the user chose to share.
 */

export interface ShareCardParams {
  /** Registry tool slug — the card's metric identity + back-link. */
  tool: string;
  /** Display value, e.g. "72" or "55". */
  value: string;
  /** Optional unit, e.g. "/ 100" or "years". */
  unit?: string;
  /** Optional flattering subtitle, e.g. "On track" or "Top tier". */
  label?: string;
}

const LIMITS = { value: 16, unit: 16, label: 60 } as const;
const SLUG_RE = /^[a-z0-9-]{1,64}$/;
// Digits and the punctuation that appears in tool outputs (%, /, ., -, comma, space, +).
const VALUE_RE = /^[0-9.,\-\s/%+]{1,16}$/;

function firstString(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" ? s.trim() : undefined;
}

function clip(s: string | undefined, max: number): string | undefined {
  if (!s) return undefined;
  const t = s.replace(/\s+/g, " ").slice(0, max).trim();
  return t.length > 0 ? t : undefined;
}

/** Build the `/share?…` URL a share button links to. */
export function shareUrl(p: ShareCardParams): string {
  const q = new URLSearchParams({ tool: p.tool, value: p.value });
  if (p.unit) q.set("unit", p.unit);
  if (p.label) q.set("label", p.label);
  return `/share?${q.toString()}`;
}

/** Path of the dynamic OG image for these params. */
export function shareImagePath(p: ShareCardParams): string {
  const q = new URLSearchParams({ tool: p.tool, value: p.value });
  if (p.unit) q.set("unit", p.unit);
  if (p.label) q.set("label", p.label);
  return `/api/share-card?${q.toString()}`;
}

/**
 * Parse + validate query params into ShareCardParams. Returns null on anything
 * malformed. Does NOT check the slug exists — the caller resolves it against the
 * tool registry (server-only) so this stays pure and unit-testable.
 */
export function parseShareCardParams(
  sp: Record<string, string | string[] | undefined>,
): ShareCardParams | null {
  const tool = firstString(sp.tool);
  const value = firstString(sp.value);
  if (!tool || !SLUG_RE.test(tool)) return null;
  if (!value || !VALUE_RE.test(value)) return null;
  const unit = clip(firstString(sp.unit), LIMITS.unit);
  const label = clip(firstString(sp.label), LIMITS.label);
  return {
    tool,
    value,
    ...(unit ? { unit } : {}),
    ...(label ? { label } : {}),
  };
}
