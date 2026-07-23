import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  WHTR_DEFAULTS,
  WHTR_LIMITS,
  WHTR_SLUG,
} from "@/registry/configs/waist-to-height-ratio-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const whtrInputsSchema = z.object({
  waistCm: limit(WHTR_LIMITS.waistCm),
  heightCm: limit(WHTR_LIMITS.heightCm),
});

export const whtrConfig: ToolConfig = {
  slug: WHTR_SLUG,
  title: "Waist-to-Height Ratio Calculator",
  valueLine:
    "Keep your waist to less than half your height, the screening rule the evidence keeps landing on.",
  metaDescription:
    "Free waist-to-height ratio calculator with the evidence-based 0.5 boundary (Browning, Hsieh & Ashwell 2010). A simple central-adiposity screen that often outperforms BMI.",
  hub: "nutrition",
  tier: 2,
  inputsSchema: whtrInputsSchema,
  defaults: { ...WHTR_DEFAULTS },
  faq: [
    {
      q: "What should my waist-to-height ratio be?",
      a: "Below 0.5, the systematic-review evidence across fourteen countries converged on 0.5 as a suitable global boundary for predicting cardiometabolic risk, which is where the rule 'keep your waist to less than half your height' comes from.",
    },
    {
      q: "How do I measure my waist correctly?",
      a: "Measure at the midpoint between the top of your hip bone and your lowest rib, roughly navel height for most people, at the end of a normal breath out, with the tape snug but not compressing the skin.",
    },
    {
      q: "Is waist-to-height ratio better than BMI?",
      a: "As a screen for cardiometabolic risk, often yes: it captures central (abdominal) fat, which BMI cannot see, and the 0.5 boundary works across sexes and ethnic groups without adjustment. The two measures answer slightly different questions, so we show both.",
    },
    {
      q: "Does the 0.5 rule apply to children?",
      a: "The evidence review found it broadly useful from age five upwards, but paediatric screening belongs with a clinician, this tool is calibrated for adults.",
    },
  ],
  related: [
    "waist-to-hip-ratio-calculator",
    "bmi-calculator",
    "body-fat-calculator",
  ],
  monetization: { ads: true, affiliates: false },
  lastReviewed: "2026-07-23",
  sources: [
    {
      label: "Browning LM, Hsieh SD, Ashwell M. A systematic review of waist-to-height ratio as a screening tool: 0.5 could be a suitable global boundary value. Nutr Res Rev 2010;23:247-269",
      url: "https://www.cambridge.org/core/journals/nutrition-research-reviews/article/systematic-review-of-waisttoheight-ratio-as-a-screening-tool-for-the-prediction-of-cardiovascular-disease-and-diabetes-05-could-be-a-suitable-global-boundary-value/A65EC8CCE2A120C247F82C5074C24C7D",
    },
    {
      label: "NCBI DARE quality-assessed summary of the Browning 2010 review",
      url: "https://www.ncbi.nlm.nih.gov/books/NBK78973/",
    },
  ],
};
