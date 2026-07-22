import type { PeptidePage } from "@/registry/peptides";

export const pt141Page: PeptidePage = {
  slug: "pt-141",
  name: "PT-141 (Bremelanotide)",
  aka: ["Vyleesi", "bremelanotide"],
  category: "melanocortin",
  title: "PT-141 (Bremelanotide) — What It Is and What the Evidence Shows",
  metaDescription:
    "An evidence-tiered explainer on PT-141 (bremelanotide, Vyleesi): a melanocortin agonist with FDA approval for a specific sexual-health condition — a useful contrast to the unapproved peptides.",
  valueLine:
    "A melanocortin peptide that cleared trials and won approval — for one specific condition, not general 'libido enhancement'.",
  headlineTier: "well-supported",
  headlineBasis: "human",
  approvedUse:
    "FDA-approved (as Vyleesi) for hypoactive sexual desire disorder (HSDD) in premenopausal women.",
  wadaProhibited: false,
  faq: [
    {
      q: "What is PT-141 approved for?",
      a: "As Vyleesi, bremelanotide is FDA-approved for hypoactive sexual desire disorder (HSDD) in premenopausal women, based on two large Phase 3 trials (the RECONNECT studies). Uses beyond that — including in men, or for general 'libido enhancement' — are outside the approved indication.",
    },
    {
      q: "How does it work?",
      a: "It is a synthetic melanocortin-receptor agonist, structurally related to alpha-MSH. It acts on melanocortin receptors (notably MC4R) in the brain, which are involved in the neural circuitry of sexual desire — a different mechanism from erectile-function drugs that act on blood flow.",
    },
    {
      q: "Is grey-market PT-141 the same as Vyleesi?",
      a: "The molecule may be nominally the same, but a 'research chemical' vial is not a quality-controlled medicine. Purity, dose and sterility cannot be assumed, and the approved product comes with a specific label, warnings and dosing that grey-market use ignores.",
    },
    {
      q: "What are the known side effects?",
      a: "In the trials, nausea, flushing and headache were common, and transient blood-pressure increases and (with repeated use) skin darkening were noted. It is contraindicated in uncontrolled high blood pressure or known cardiovascular disease.",
    },
  ],
  related: ["melanotan-2"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Kingsberg SA, et al. Bremelanotide for the treatment of hypoactive sexual desire disorder (RECONNECT Phase 3). Obstet Gynecol 2019;134:899–908",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Kingsberg+bremelanotide+hypoactive+sexual+desire+2019",
    },
    {
      label: "US FDA — Drugs@FDA record for Vyleesi (bremelanotide)",
      url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=BasicSearch.process&searchTerm=bremelanotide",
    },
  ],
};
