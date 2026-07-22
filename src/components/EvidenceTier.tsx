import type { EvidenceBasis, EvidenceTier as Tier } from "@/registry/peptides";
import { TIER_LABELS } from "@/registry/peptides";

/**
 * Evidence-strength label (CONTENT.md §1, CONTENT-peptides.md §3.5). The
 * house style: every health claim is tagged Well-supported / Preliminary /
 * Marketing claim, and flagged human / animal / in-vitro. Used inline in the
 * MDX "what the evidence shows" sections and on listing cards.
 */

// v2 (DESIGN.md §3): green = earned trust, fading to paper as evidence
// weakens; the tier is always spelled out, never colour alone.
const TIER_STYLES: Record<Tier, string> = {
  "well-supported": "border-good bg-good-soft text-good",
  preliminary: "border-warning-border bg-warning-bg text-foreground",
  "marketing-claim": "border-border bg-surface text-muted",
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
