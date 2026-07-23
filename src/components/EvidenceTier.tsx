import type { EvidenceBasis, EvidenceTier as Tier } from "@/registry/peptides";
import { TIER_LABELS } from "@/registry/peptides";

/**
 * Evidence-strength label (CONTENT.md §1, CONTENT-peptides.md §3.5). The
 * house style: every health claim is tagged Well-supported / Preliminary /
 * Unproven, and flagged human / animal / in-vitro. Used inline in the
 * MDX "what the evidence shows" sections and on listing cards.
 */

// The medal ladder (DESIGN.md §3, re-ranked 2026-07-23): gold with a foil
// sheen for well-supported — the one badge allowed to shine; forest green for
// preliminary (promising reads positive, not cautionary); amber caution for
// the unproven tier (id `marketing-claim`); ember on soft orange for
// `not-supported` (CONTENT-looksmaxxing §4 debunk tier — actively
// contradicted). The tier is always spelled out, never colour alone.
const TIER_STYLES: Record<Tier, string> = {
  "well-supported": "tier-shine border-gold bg-gold-soft text-foreground",
  preliminary: "border-good bg-good-soft text-good",
  "marketing-claim": "border-warning-border bg-warning-bg text-foreground",
  "not-supported": "border-primary bg-primary-soft text-primary",
};

const BASIS_LABELS: Record<EvidenceBasis, string> = {
  human: "human data",
  animal: "animal data only",
  "in-vitro": "in-vitro only",
  mixed: "mixed evidence",
};

export function EvidenceTier({
  tier,
  basis,
}: {
  tier: Tier;
  basis?: EvidenceBasis;
}) {
  return (
    <span
      data-testid="evidence-tier"
      data-tier={tier}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${TIER_STYLES[tier]}`}
    >
      {TIER_LABELS[tier]}
      {basis ? (
        <span className="font-normal opacity-80">· {BASIS_LABELS[basis]}</span>
      ) : null}
    </span>
  );
}
