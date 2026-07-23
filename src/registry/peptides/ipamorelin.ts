import type { PeptidePage } from "@/registry/peptides";

export const ipamorelinPage: PeptidePage = {
  slug: "ipamorelin",
  name: "Ipamorelin",
  aka: ["Growth-hormone secretagogue"],
  category: "gh-secretagogue",
  title: "Ipamorelin: What It Is and What the Evidence Actually Shows",
  metaDescription:
    "An evidence-tiered explainer on ipamorelin: a synthetic growth-hormone secretagogue marketed for muscle, fat loss and anti-ageing, whose real-world fitness benefits in healthy people are unproven.",
  valueLine:
    "Prompts a short-lived rise in growth hormone, but whether that translates into muscle, fat loss or anti-ageing benefits in healthy people is unproven.",
  headlineTier: "marketing-claim",
  headlineBasis: "mixed",
  wadaProhibited: true,
  faq: [
    {
      q: "What is ipamorelin?",
      a: "It is a synthetic peptide that mimics the hunger hormone ghrelin, prompting the pituitary to release a pulse of growth hormone. It is often marketed as a 'cleaner' secretagogue because, unlike some older peptides in its class, it has little effect on appetite or the stress hormone cortisol.",
    },
    {
      q: "Does ipamorelin build muscle or burn fat?",
      a: "Raising growth hormone is real pharmacology, but that does not automatically produce meaningful muscle gain or fat loss in healthy adults. There are no good long-term human trials showing the physique or anti-ageing benefits it is sold for, so those claims are not supported.",
    },
    {
      q: "Is ipamorelin safe?",
      a: "Its long-term safety in healthy people is not established, and products sold as 'research chemicals' carry additional purity and contamination risks. It is not an approved medicine for muscle-building or anti-ageing use.",
    },
    {
      q: "Is ipamorelin banned in sport?",
      a: "Yes. Growth-hormone secretagogues are explicitly named on the WADA Prohibited List and are banned at all times, in and out of competition.",
    },
  ],
  related: ["cjc-1295", "ghrp-6", "mk-677", "tesamorelin"],
  lastReviewed: "2026-07-23",
  sources: [
    {
      label:
        "WADA Prohibited List, S2 Peptide Hormones, Growth Factors: growth-hormone secretagogues (including ghrelin mimetics) prohibited at all times",
      url: "https://www.wada-ama.org/en/prohibited-list",
    },
    {
      label:
        "PubMed: ipamorelin, growth-hormone secretagogue pharmacology (studies and reviews)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=ipamorelin+growth+hormone+secretagogue",
    },
  ],
};
