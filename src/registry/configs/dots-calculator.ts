import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import { DOTS_DEFAULTS, DOTS_LIMITS, DOTS_SLUG } from "@/registry/configs/dots-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const dotsInputsSchema = z.object({
  sex: z.enum(["male", "female"]),
  bodyweightKg: limit(DOTS_LIMITS.bodyweightKg),
  totalKg: limit(DOTS_LIMITS.totalKg),
  event: z.enum(["sbd", "bench"]),
  equipment: z.enum(["raw", "equipped"]),
});

export const dotsConfig: ToolConfig = {
  slug: DOTS_SLUG,
  title: "DOTS Calculator — Wilks & IPF GL Points",
  valueLine:
    "Compare lifters across bodyweights with DOTS, Wilks and IPF GL points — using the official coefficients.",
  metaDescription:
    "Free DOTS calculator with Wilks and IPF GL points, using official coefficients from the OpenPowerlifting codebase and regression-tested against real meet results.",
  hub: "strength",
  tier: 2,
  inputsSchema: dotsInputsSchema,
  defaults: { ...DOTS_DEFAULTS },
  faq: [
    {
      q: "What is a DOTS score?",
      a: "DOTS scales your total by a bodyweight-based polynomial so lifters of different sizes can be compared. It has become the default ranking metric on OpenPowerlifting and at many raw meets.",
    },
    {
      q: "What is a good DOTS score?",
      a: "Roughly: 250–300 is a solid recreational lifter, 350–450 is competitive at local and national level, and 500+ is international class. The very best raw lifters in the world exceed 600.",
    },
    {
      q: "DOTS, Wilks or IPF GL — which should I use?",
      a: "Whichever your federation and friends use — they all answer the same question with different fitted curves. IPF competitions use GL points; most raw meets and OpenPowerlifting rankings use DOTS; Wilks is the historical standard.",
    },
    {
      q: "Are these the official formulas?",
      a: "Yes — the coefficients are taken verbatim from the OpenPowerlifting codebase and our implementation is regression-tested against OPL's own published scores for real meet entries.",
    },
  ],
  related: ["strength-standards", "one-rep-max-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label: "OpenPowerlifting coefficients (dots.rs, wilks.rs, goodlift.rs)",
      url: "https://github.com/sstangl/openpowerlifting/tree/main/crates/coefficients/src",
    },
    {
      label: "OpenPowerlifting — lifter database used for regression vectors",
      url: "https://www.openpowerlifting.org/",
    },
  ],
};
