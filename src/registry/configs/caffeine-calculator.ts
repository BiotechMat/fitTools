import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  CAFFEINE_DEFAULTS,
  CAFFEINE_LIMITS,
  CAFFEINE_SLUG,
} from "@/registry/configs/caffeine-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const caffeineInputsSchema = z.object({
  doseMg: limit(CAFFEINE_LIMITS.doseMg),
  halfLifeH: limit(CAFFEINE_LIMITS.halfLifeH),
  thresholdMg: limit(CAFFEINE_LIMITS.thresholdMg),
});

export const caffeineConfig: ToolConfig = {
  slug: CAFFEINE_SLUG,
  title: "Caffeine Half-Life Calculator",
  valueLine:
    "See how much caffeine is still in your system tonight — and when it falls below your sleep threshold.",
  metaDescription:
    "Free caffeine half-life calculator: chart how a dose decays over 24 hours (C(t) = dose × 0.5^(t/t½)) and when it drops below your chosen sleep threshold.",
  hub: "recovery",
  tier: 2,
  inputsSchema: caffeineInputsSchema,
  defaults: { ...CAFFEINE_DEFAULTS },
  faq: [
    {
      q: "How long does caffeine stay in your system?",
      a: "The average half-life is about five hours, so a 200 mg coffee still leaves ~50 mg twelve to fifteen hours later. Genetics, pregnancy, smoking and some medications swing individual half-lives from under two to over nine hours.",
    },
    {
      q: "How much caffeine is in a coffee?",
      a: "Typically 80–120 mg per single espresso-based drink and 60–100 mg per instant cup, with large brewed coffees often exceeding 200 mg. Energy drinks usually carry 80–160 mg per can.",
    },
    {
      q: "When should I stop drinking caffeine before bed?",
      a: "With a 5-hour half-life, a 2 pm coffee still leaves a meaningful dose at 11 pm. Set your own threshold in the calculator — many people sleep noticeably better keeping evening levels below ~50 mg.",
    },
    {
      q: "Is caffeine bad for me?",
      a: "Moderate intake (up to ~400 mg/day for healthy adults, per EFSA's assessment) is considered safe for most people. Pregnancy and heart conditions change that calculus — ask your doctor.",
    },
  ],
  related: ["sleep-calculator", "heart-rate-zone-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Institute of Medicine. Caffeine for the Sustainment of Mental Task Performance (2001) — pharmacokinetics, ~5 h average half-life",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK223808/",
    },
    {
      label: "EFSA Panel on Dietetic Products. Scientific Opinion on the safety of caffeine. EFSA Journal 2015;13(5):4102",
      url: "https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2015.4102",
    },
  ],
};
