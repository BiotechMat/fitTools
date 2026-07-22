import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  HEART_AGE_DEFAULTS,
  HEART_AGE_LIMITS,
  HEART_AGE_SLUG,
} from "@/registry/configs/heart-age-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const heartAgeInputsSchema = z.object({
  sex: z.enum(["female", "male"]),
  ageYears: limit(HEART_AGE_LIMITS.ageYears),
  totalCholMmol: limit(HEART_AGE_LIMITS.totalCholMmol),
  hdlMmol: limit(HEART_AGE_LIMITS.hdlMmol),
  systolicBp: limit(HEART_AGE_LIMITS.systolicBp),
  onBpMeds: z.boolean(),
  onStatin: z.boolean(),
  diabetes: z.boolean(),
  currentSmoker: z.boolean(),
  egfr: limit(HEART_AGE_LIMITS.egfr),
  // Context only — shown alongside the result, never in the risk maths.
  apoBmgDl: limit(HEART_AGE_LIMITS.apoBmgDl).optional(),
  lpaNmol: limit(HEART_AGE_LIMITS.lpaNmol).optional(),
});

export const heartAgeConfig: ToolConfig = {
  slug: HEART_AGE_SLUG,
  title: "Heart Age Calculator — Your Cardiovascular Age from PREVENT",
  valueLine:
    "Estimate your heart's age from your cardiovascular risk factors, using the American Heart Association's PREVENT equations.",
  metaDescription:
    "Free Heart Age calculator built on the AHA PREVENT equations (2024). Enter your blood pressure, cholesterol and health history to see your 10-year cardiovascular risk and heart age, with ApoB and Lp(a) shown as context.",
  hub: "recovery",
  tier: 2,
  inputsSchema: heartAgeInputsSchema,
  defaults: { ...HEART_AGE_DEFAULTS },
  disclaimerLevel: "clinical-input",
  faq: [
    {
      q: "What is heart age?",
      a: "Heart age is your predicted 10-year cardiovascular risk expressed as an age: it is the age at which someone with ideal risk factors would carry the same risk you do. If your heart age is higher than your real age, your risk factors are ageing your cardiovascular system faster than the calendar.",
    },
    {
      q: "Which model does this use?",
      a: "The American Heart Association's PREVENT equations (2024) — the current standard for cardiovascular risk in US adults aged 30–79. We use the base model for 10-year total cardiovascular disease risk, with the exact published sex-specific coefficients, and validate our output against the AHA's own calculator.",
    },
    {
      q: "What values do I need?",
      a: "Your age and sex, systolic (top number) blood pressure, whether you take blood-pressure or statin medication, total and HDL cholesterol, whether you have diabetes, whether you smoke, and your kidney function (eGFR) if you know it. Cholesterol can be entered in mmol/L or mg/dL.",
    },
    {
      q: "Where do ApoB and Lp(a) come in?",
      a: "They don't enter the PREVENT risk maths — the equations were not built with them as inputs, so folding them in would be inventing a number. Instead, if you know your ApoB or Lp(a) we show them separately against general reference thresholds, as useful context to raise with your doctor.",
    },
    {
      q: "Is this a diagnosis?",
      a: "No. It is a population-level risk estimate from a published model, not a personal prediction or a medical test. Two people with the same heart age can have very different outcomes. Treat it as a prompt for a conversation with a clinician, not a verdict — and never start, stop or change medication based on it.",
    },
    {
      q: "Is my data private?",
      a: "Yes. Everything is calculated in your browser. Your values are never sent to us or stored anywhere.",
    },
  ],
  related: ["phenotypic-age-calculator", "lifestyle-life-expectancy", "bmi-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Khan SS, et al. Development and Validation of the American Heart Association's PREVENT Equations. Circulation 2024;149:430–449",
      url: "https://www.ahajournals.org/doi/10.1161/CIRCULATIONAHA.123.067626",
    },
    {
      label:
        "Mayer M. preventr — open-source implementation of the PREVENT equations (source of the exact coefficients used here; validated against the AHA calculator)",
      url: "https://github.com/martingmayer/preventr",
    },
    {
      label:
        "Koschinsky ML, et al. A focused update to the 2019 NLA scientific statement on use of lipoprotein(a) in clinical practice. J Clin Lipidol 2024 (Lp(a) risk thresholds)",
      url: "https://www.lipidjournal.com/article/S1933-2874(24)00033-3/fulltext",
    },
    {
      label:
        "American College of Cardiology. An Update on Lipoprotein(a): Testing, Treatment, and Guideline Recommendations, 2023 (Lp(a) and ApoB context)",
      url: "https://www.acc.org/Latest-in-Cardiology/Articles/2023/09/19/10/54/An-Update-on-Lipoprotein-a",
    },
  ],
};
