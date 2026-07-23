import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  PROTEIN_DEFAULTS,
  PROTEIN_LIMITS,
  PROTEIN_SLUG,
} from "@/registry/configs/protein-intake-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const proteinInputsSchema = z.object({
  weightKg: limit(PROTEIN_LIMITS.weightKg),
  goal: z.enum(["general", "build", "cut", "older"]),
});

export const proteinIntakeConfig: ToolConfig = {
  slug: PROTEIN_SLUG,
  title: "Protein Intake Calculator — Daily Target by Goal",
  valueLine:
    "Your daily protein range in grams — from the published evidence for your goal, not a guess.",
  metaDescription:
    "Free protein intake calculator: daily grams from the evidence-based g/kg ranges — 1.6–2.2 for building muscle (Morton 2018), 1.8–2.0 in a cut, 1.2–1.5 for older adults — plus a per-meal split.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: proteinInputsSchema,
  defaults: { ...PROTEIN_DEFAULTS },
  faq: [
    {
      q: "How much protein do I need a day?",
      a: "It depends on the goal. The RDA of 0.8 g per kg of body weight is a sedentary minimum. For people who train, the ISSN position stand recommends 1.4–2.0 g/kg; for maximising muscle gain the meta-analytic estimate is about 1.6 g/kg with an upper confidence bound of 2.2 g/kg.",
    },
    {
      q: "Do I need more protein when cutting?",
      a: "Usually yes. During an energy deficit, higher intakes of roughly 1.8–2.0 g/kg help preserve lean mass while fat is lost — protein is the last macro to cut.",
    },
    {
      q: "How much protein per meal?",
      a: "A practical evidence-based target is about 0.4 g/kg per meal across at least four meals — for an 80 kg person that's roughly 32 g, four times a day. More in one sitting isn't wasted, but distribution helps hit the daily total.",
    },
    {
      q: "Is a high protein intake safe?",
      a: "For healthy people, intakes in these ranges show no evidence of harm to kidney or bone health in the research reviewed by the ISSN. Anyone with kidney disease should follow their clinician's advice instead.",
    },
    {
      q: "Should older adults eat more protein?",
      a: "Yes — the PROT-AGE group recommends at least 1.0–1.2 g/kg daily for people over 65, and 1.2–1.5 g/kg for those who are active or recovering from illness, to counter age-related muscle loss.",
    },
  ],
  related: ["macro-calculator", "tdee-calculator", "creatine-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-23",
  sources: [
    {
      label: "Morton RW, et al. A systematic review, meta-analysis and meta-regression of protein supplementation on resistance training–induced gains. Br J Sports Med 2018;52:376–384",
      url: "https://pubmed.ncbi.nlm.nih.gov/28698222/",
    },
    {
      label: "Jäger R, et al. International Society of Sports Nutrition Position Stand: protein and exercise. J Int Soc Sports Nutr 2017;14:20",
      url: "https://link.springer.com/article/10.1186/s12970-017-0177-8",
    },
    {
      label: "Phillips SM, Van Loon LJC. Dietary protein for athletes: from requirements to optimum adaptation. J Sports Sci 2011;29(S1):S29–S38",
      url: "https://pubmed.ncbi.nlm.nih.gov/22150425/",
    },
    {
      label: "Bauer J, et al. Evidence-based recommendations for optimal dietary protein intake in older people (PROT-AGE). J Am Med Dir Assoc 2013;14:542–559",
      url: "https://www.sciencedirect.com/science/article/pii/S1525861013003265",
    },
    {
      label: "Schoenfeld BJ, Aragon AA. How much protein can the body use in a single meal for muscle-building? J Int Soc Sports Nutr 2018;15:10",
      url: "https://www.tandfonline.com/doi/full/10.1186/s12970-018-0215-1",
    },
  ],
};
