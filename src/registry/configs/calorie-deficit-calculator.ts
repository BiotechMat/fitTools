import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  DEFICIT_DEFAULTS,
  DEFICIT_LIMITS,
  DEFICIT_SLUG,
} from "@/registry/configs/calorie-deficit-calculator.shared";

const limit = (range: { min: number; max: number }) =>
  z.number().min(range.min).max(range.max);

export const deficitInputsSchema = z.object({
  tdeeKcal: limit(DEFICIT_LIMITS.tdeeKcal),
  dailyDeficitKcal: limit(DEFICIT_LIMITS.dailyDeficitKcal),
  targetLossKg: limit(DEFICIT_LIMITS.targetLossKg),
});

export const deficitConfig: ToolConfig = {
  slug: DEFICIT_SLUG,
  title: "Calorie Deficit Calculator — Weight-Loss Timeline",
  valueLine:
    "Estimate how long a weight-loss goal could take at a given daily calorie deficit — with the caveats made clear.",
  metaDescription:
    "Free calorie deficit calculator: estimate weekly weight loss and a timeline to your goal using the 7,700 kcal/kg heuristic, with a safety cap at 25% of your TDEE.",
  hub: "nutrition",
  tier: 1,
  inputsSchema: deficitInputsSchema,
  defaults: { ...DEFICIT_DEFAULTS },
  faq: [
    {
      q: "How many calories are in 1 kg of body fat?",
      a: "The traditional heuristic is roughly 7,700 kcal per kilogram, which traces back to Wishnofsky's 1958 paper. It is a useful planning approximation for the first weeks of a diet, but real-world loss slows over time as your body adapts.",
    },
    {
      q: "What is a safe calorie deficit?",
      a: "This tool caps its recommendation at 25% below your estimated TDEE. Larger deficits are harder to sustain, cost more muscle, and increase the metabolic slow-down that makes further loss harder.",
    },
    {
      q: "Why am I losing weight slower than the calculator predicted?",
      a: "The 7,700 kcal heuristic assumes your energy expenditure stays constant, but it falls as you lose weight — both because a smaller body burns less and because of adaptive thermogenesis. Expect the estimate to be optimistic over longer timelines and recalculate as your weight changes.",
    },
    {
      q: "Should I eat back exercise calories?",
      a: "If your TDEE estimate already includes your activity level, no — counting exercise again would double-count it. Keep the deficit against your all-in daily expenditure and judge progress by the scale trend over two to four weeks.",
    },
    {
      q: "Is a bigger deficit always faster?",
      a: "On paper, yes; in practice, very large deficits are strongly associated with rebound and muscle loss. An estimate between 10% and 25% of TDEE is where most people balance speed against sustainability.",
    },
  ],
  related: ["tdee-calculator", "macro-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "Wishnofsky M. Caloric equivalents of gained or lost weight. Am J Clin Nutr 1958;6:542–546",
      url: "https://pubmed.ncbi.nlm.nih.gov/13594881/",
    },
    {
      label: "Hall KD. What is the required energy deficit per unit weight loss? Int J Obes 2008;32:573–576",
      url: "https://pubmed.ncbi.nlm.nih.gov/17848938/",
    },
    {
      label: "Rosenbaum M, Leibel RL. Adaptive thermogenesis in humans. Int J Obes 2010;34:S47–S55",
      url: "https://pubmed.ncbi.nlm.nih.gov/20935667/",
    },
  ],
};
