import type { PeptidePage } from "@/registry/peptides";

export const glp1Page: PeptidePage = {
  slug: "glp-1-agonists",
  name: "GLP-1 receptor agonists",
  aka: ["semaglutide", "Ozempic", "Wegovy", "tirzepatide", "Mounjaro", "Zepbound"],
  category: "metabolic",
  title: "GLP-1 Receptor Agonists — Approved Peptides, and Why They're Different",
  metaDescription:
    "How GLP-1 receptor agonists (semaglutide, tirzepatide) differ from the unregulated 'research peptides': real large-scale trials, regulatory approval, and prescription-only status.",
  valueLine:
    "Prescription medicines with large clinical trials behind them — the benchmark the research chemicals are measured against.",
  headlineTier: "well-supported",
  headlineBasis: "human",
  approvedUse:
    "Approved for type 2 diabetes and, at higher doses, chronic weight management — prescription-only, under medical supervision.",
  wadaProhibited: false,
  faq: [
    {
      q: "Are GLP-1 drugs peptides?",
      a: "Yes — semaglutide and tirzepatide are peptide-based medicines. We include them here to contrast a rigorously-evidenced, regulated, prescription peptide with the unregulated 'research chemicals' that make up most of this section.",
    },
    {
      q: "How strong is the evidence for GLP-1 agonists?",
      a: "Strong, by the standards of this section: large randomised placebo-controlled trials (the STEP programme for semaglutide, SURMOUNT for tirzepatide) with thousands of participants and clinically meaningful weight and metabolic outcomes, reviewed and approved by regulators.",
    },
    {
      q: "Can I buy GLP-1 peptides as 'research chemicals'?",
      a: "Grey-market 'research' semaglutide and tirzepatide are sold, but they carry the same quality, purity and dosing risks as any unregulated peptide. The whole point of the approval process is that a licensed product is what it says it is — which grey-market vials are not.",
    },
    {
      q: "Are GLP-1 agonists banned in sport?",
      a: "They are not currently on the WADA prohibited list. That said, anyone competing should always check the current list, which is updated annually.",
    },
  ],
  related: ["tesamorelin", "fragment-176-191"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Wilding JPH, et al. Once-weekly semaglutide in adults with overweight or obesity (STEP 1). N Engl J Med 2021;384:989–1002",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
    },
    {
      label:
        "Jastreboff AM, et al. Tirzepatide once weekly for the treatment of obesity (SURMOUNT-1). N Engl J Med 2022;387:205–216",
      url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038",
    },
  ],
};
