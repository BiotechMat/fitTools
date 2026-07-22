import type { PeptidePage } from "@/registry/peptides";

export const mk677Page: PeptidePage = {
  slug: "mk-677",
  name: "MK-677 (Ibutamoren)",
  aka: ["ibutamoren", "MK-0677"],
  category: "gh-secretagogue",
  title: "MK-677 (Ibutamoren) — What It Is and What the Evidence Shows",
  metaDescription:
    "An evidence-tiered explainer on MK-677 (ibutamoren): an oral ghrelin-receptor agonist — technically not a peptide — that raises GH and IGF-1, with real but modest human trial data and no approval.",
  valueLine:
    "An orally-active GH secretagogue with genuine trial data — that raised hormones and lean mass but not function, and was never approved.",
  headlineTier: "preliminary",
  headlineBasis: "human",
  wadaProhibited: true,
  faq: [
    {
      q: "Is MK-677 a peptide?",
      a: "No — this is an important distinction. MK-677 (ibutamoren) is a small, orally-active molecule that mimics the hormone ghrelin at its receptor. It is grouped with GH secretagogues because it raises growth hormone, but it is not itself a peptide.",
    },
    {
      q: "Does MK-677 actually work?",
      a: "It reliably raises GH and IGF-1 to more youthful levels, and a two-year trial in healthy older adults increased fat-free mass by about 1.1 kg. But that same trial found no improvement in strength or function, and it is not an approved medicine — the hormone changes did not translate into the benefits people assume.",
    },
    {
      q: "What are the risks?",
      a: "Reported effects include increased appetite, water retention, raised blood glucose and reduced insulin sensitivity. Long-term safety in healthy people using it for physique goals is not established.",
    },
    {
      q: "Is MK-677 banned in sport?",
      a: "Yes. It is on the WADA prohibited list as a growth-hormone secretagogue and is banned in and out of competition.",
    },
  ],
  related: ["tesamorelin", "fragment-176-191"],
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Nass R, et al. Effects of an oral ghrelin mimetic on body composition and clinical outcomes in healthy older adults: a randomized trial. Ann Intern Med 2008;149:601–611",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Nass+oral+ghrelin+mimetic+body+composition+older+adults+2008",
    },
    {
      label:
        "US Anti-Doping Agency / OPSS — MK-677 (ibutamoren) performance-enhancing substance profile",
      url: "https://www.opss.org/article/performance-enhancing-substance-mk-677-ibutamoren",
    },
  ],
};
