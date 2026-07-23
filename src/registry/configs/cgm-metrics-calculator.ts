import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { CGM_LIMITS, CGM_SLUG } from "@/registry/configs/cgm-metrics-calculator.shared";

export const cgmInputsSchema = z.object({
  unit: z.enum(["mmol", "mgdl"]),
  // Readings are pasted by the user, not a default; the calculator enforces
  // the ≥2 / plausible-range rules at runtime (CGM_LIMITS). Optional here so
  // the tool's UI-state defaults ({ unit }) validate.
  readings: z
    .array(z.number().min(CGM_LIMITS.glucoseMmol.min).max(CGM_LIMITS.glucoseMmol.max))
    .max(CGM_LIMITS.maxReadings)
    .optional(),
});

export const cgmConfig: ToolConfig = {
  slug: CGM_SLUG,
  title: "CGM Metrics Calculator: GMI, Time in Range & Variability",
  valueLine:
    "Paste your CGM glucose readings to get the standardised metabolic metrics: GMI, time in range and %CV.",
  metaDescription:
    "Free CGM metrics calculator: Glucose Management Indicator (GMI), time in range and glucose variability (%CV) from your own readings, using the international consensus definitions. Runs entirely in your browser.",
  hub: "recovery",
  tier: 2,
  inputsSchema: cgmInputsSchema,
  defaults: { unit: "mmol" },
  disclaimerLevel: "clinical-input",
  faq: [
    {
      q: "What is GMI?",
      a: "The Glucose Management Indicator estimates what your HbA1c would be, from your average CGM glucose. It uses the published formula GMI(%) = 3.31 + 0.02392 × mean glucose (mg/dL). It is an estimate from CGM data, not a lab HbA1c.",
    },
    {
      q: "What is a good time in range?",
      a: "The international consensus target for many people with diabetes is at least 70% of readings between 3.9 and 10.0 mmol/L (70 to 180 mg/dL). Targets are individual and set with your clinician; this tool reports the number, it doesn't prescribe a goal.",
    },
    {
      q: "What does %CV tell me?",
      a: "The coefficient of variation measures how much your glucose swings around its average. The consensus stability threshold is below 36%, and lower means steadier glucose. It is reported alongside the average because two people with the same average can have very different variability.",
    },
    {
      q: "I don't have diabetes: should I chase a flat line?",
      a: "Honestly, the evidence is thin. For people without diabetes, there's limited proof that flattening normal post-meal glucose rises improves health outcomes. These metrics were designed for diabetes management; treat them as interesting data, not a health verdict.",
    },
    {
      q: "Is my data private?",
      a: "Yes. Everything is computed in your browser. Your glucose readings are never uploaded or stored anywhere.",
    },
  ],
  related: ["phenotypic-age-calculator", "tdee-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Bergenstal RM, et al. Glucose Management Indicator (GMI): a new term for estimating A1C from CGM. Diabetes Care 2018;41:2275-2280",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Bergenstal+glucose+management+indicator+2018",
    },
    {
      label:
        "Battelino T, et al. Clinical targets for continuous glucose monitoring data interpretation: recommendations from the international consensus on time in range. Diabetes Care 2019;42:1593-1603",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Battelino+international+consensus+time+in+range+2019",
    },
  ],
};
