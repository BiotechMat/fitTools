import { EvidenceTier } from "@/components/EvidenceTier";
import type { EvidenceBasis, EvidenceTier as Tier } from "@/registry/peptides";

/**
 * "Rated" verdict stamp for the debunk hub (CONTENT-looksmaxxing §5) — the
 * rotated evidence-tier stamp reused from the supplement page, so a myth's
 * verdict reads at a glance. Presentation only: it wraps the shared
 * `EvidenceTier` badge, which spells the tier out (never colour alone).
 */
export function VerdictStamp({ tier, basis }: { tier: Tier; basis?: EvidenceBasis }) {
  return (
    <span className="sticker-slap sticker-peel inline-block rotate-2 [&>span]:border-2 [&>span]:px-3 [&>span]:py-1 [&>span]:text-sm [&>span]:shadow-[3px_3px_0_0_var(--color-foreground)]">
      <EvidenceTier tier={tier} basis={basis} />
    </span>
  );
}
