import type { EvidenceBasis, EvidenceTier as Tier } from "@/registry/peptides";
import { type EvidenceGrade, evidenceGrade, GRADE_LABELS } from "@/registry/peptides";

/**
 * Evidence-strength badge (CONTENT.md §1, CONTENT-peptides.md §3.5). The house
 * style grades every health claim on the medal ladder — Gold / Silver / Bronze
 * for genuine evidence (the medal shows its strength) — while oversold
 * ("Unproven") and contradicted ("Not supported") claims are deliberately
 * un-medalled: a medal always means real evidence, so hype never wears one. The
 * grade is derived from the claim's tier + human/animal basis (`evidenceGrade`);
 * the badge always spells the grade out and flags human / animal / in-vitro,
 * never colour alone.
 */

// The medal ladder (DESIGN.md §3): gold shines (the one badge that does),
// silver = warm pewter, bronze = warm copper — all warm-biased, never clinical
// grey. `unproven` keeps amber caution; `not-supported` keeps ember (active
// caution / the CONTENT-looksmaxxing §4 debunk tier).
const GRADE_STYLES: Record<EvidenceGrade, string> = {
  gold: "tier-shine border-gold bg-gold-soft text-foreground",
  silver: "border-silver bg-silver-soft text-foreground",
  bronze: "border-bronze bg-bronze-soft text-foreground",
  unproven: "border-warning-border bg-warning-bg text-foreground",
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
  const grade = evidenceGrade(tier, basis);
  return (
    <span
      data-testid="evidence-tier"
      data-tier={tier}
      data-grade={grade}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${GRADE_STYLES[grade]}`}
    >
      {GRADE_LABELS[grade]}
      {basis ? (
        <span className="font-normal opacity-80">· {BASIS_LABELS[basis]}</span>
      ) : null}
    </span>
  );
}
