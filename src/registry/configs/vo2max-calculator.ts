import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  VO2MAX_DEFAULTS,
  VO2MAX_LIMITS,
  VO2MAX_SLUG,
} from "@/registry/configs/vo2max-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const vo2maxInputsSchema = z.object({
  method: z.enum(["cooper", "rockport", "hr-ratio"]),
  sex: z.enum(["male", "female"]),
  cooperDistanceM: limit(VO2MAX_LIMITS.cooperDistanceM),
  ageYears: limit(VO2MAX_LIMITS.ageYears),
  weightKg: limit(VO2MAX_LIMITS.weightKg),
  walkTimeMin: limit(VO2MAX_LIMITS.walkTimeMin),
  walkHeartRateBpm: limit(VO2MAX_LIMITS.walkHeartRateBpm),
  hrMaxBpm: limit(VO2MAX_LIMITS.hrMaxBpm),
  hrRestBpm: limit(VO2MAX_LIMITS.hrRestBpm),
});

export const vo2maxConfig: ToolConfig = {
  slug: VO2MAX_SLUG,
  title: "VO2max Calculator — Cooper, Rockport & Heart-Rate Methods",
  valueLine:
    "Estimate your VO2max without a lab: 12-minute run, 1-mile walk, or your resting and maximum heart rate.",
  metaDescription:
    "Free VO2max calculator using three published field methods: the Cooper 12-minute run (JAMA 1968), the Rockport 1-mile walk (Kline 1987) and the heart-rate ratio method (Uth 2004).",
  hub: "recovery",
  tier: 2,
  inputsSchema: vo2maxInputsSchema,
  defaults: { ...VO2MAX_DEFAULTS },
  faq: [
    {
      q: "What is VO2max?",
      a: "The maximum rate at which your body can take up and use oxygen, in ml per kg of body weight per minute. It's the standard laboratory measure of aerobic fitness, and higher values associate strongly with better endurance performance and health outcomes.",
    },
    {
      q: "How accurate are field estimates of VO2max?",
      a: "Good but not lab-grade. The Cooper test correlated ~0.90 with treadmill-measured VO2max in the original study, and the Rockport walk about 0.88 — expect an uncertainty of a few ml/kg/min either way, and treat changes over time as more informative than any single number.",
    },
    {
      q: "How do I run the Cooper test?",
      a: "After a warm-up, run (or run-walk) as far as you can in exactly 12 minutes on a flat course or track, and enter the distance covered in metres. Pace it like a hard, even effort — starting too fast is the classic error.",
    },
    {
      q: "What is the heart-rate ratio method?",
      a: "Uth and colleagues showed VO2max ≈ 15.3 × (maximum heart rate ÷ resting heart rate). It needs no exercise test at all, just honest values for both heart rates — a true measured maximum works far better than an age formula.",
    },
    {
      q: "What's a good VO2max?",
      a: "It's strongly age- and sex-dependent: mid-30s to mid-40s ml/kg/min is typical for healthy adults, while trained endurance athletes commonly exceed 60. The trend in your own number matters more than any table.",
    },
  ],
  related: [
    "heart-rate-zone-calculator",
    "running-pace-calculator",
    "race-time-predictor",
  ],
  monetization: { ads: true, affiliates: false },
  lastReviewed: "2026-07-23",
  sources: [
    {
      label: "Cooper KH. A means of assessing maximal oxygen intake: correlation between field and treadmill testing. JAMA 1968;203:201–204",
      url: "https://pubmed.ncbi.nlm.nih.gov/5694044/",
    },
    {
      label: "Kline GM, et al. Estimation of VO2max from a one-mile track walk, gender, age, and body weight. Med Sci Sports Exerc 1987;19:253–259",
      url: "https://pubmed.ncbi.nlm.nih.gov/3600239/",
    },
    {
      label: "Uth N, Sørensen H, Overgaard K, Pedersen PK. Estimation of VO2max from the ratio between HRmax and HRrest — the Heart Rate Ratio Method. Eur J Appl Physiol 2004;91:111–115",
      url: "https://pubmed.ncbi.nlm.nih.gov/14624296/",
    },
  ],
};
