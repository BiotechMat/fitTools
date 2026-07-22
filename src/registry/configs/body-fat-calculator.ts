import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  BODY_FAT_DEFAULTS,
  BODY_FAT_LIMITS,
  BODY_FAT_SLUG,
} from "@/registry/configs/body-fat-calculator.shared";

const limit = (range: { min: number; max: number }) =>
  z.number().min(range.min).max(range.max);

export const bodyFatInputsSchema = z
  .object({
    sex: z.enum(["male", "female"]),
    heightCm: limit(BODY_FAT_LIMITS.heightCm),
    neckCm: limit(BODY_FAT_LIMITS.neckCm),
    waistCm: limit(BODY_FAT_LIMITS.waistCm),
    hipCm: limit(BODY_FAT_LIMITS.hipCm).optional(),
  })
  .refine((v) => v.sex === "male" || v.hipCm !== undefined, {
    message: "Hip circumference is required for women",
  });

export const bodyFatConfig: ToolConfig = {
  slug: BODY_FAT_SLUG,
  title: "Body Fat Calculator — US Navy Circumference Method",
  valueLine:
    "Estimate your body-fat percentage from tape measurements using the published US Navy equations.",
  metaDescription:
    "Free body fat calculator using the US Navy circumference method (Hodgdon & Beckett 1984). Tape-measure inputs, metric and imperial, with the ±3–4 point error band shown honestly.",
  hub: "nutrition",
  tier: 1,
  inputsSchema: bodyFatInputsSchema,
  defaults: { ...BODY_FAT_DEFAULTS },
  faq: [
    {
      q: "How accurate is the Navy body fat method?",
      a: "In the original validation it correlated about r = 0.90 with underwater weighing, with a standard error of roughly 3 to 4 percentage points. Treat your result as the centre of a band, not an exact figure — we show that band with every estimate.",
    },
    {
      q: "How do I take the measurements?",
      a: "Use a flexible tape, snug but not compressing the skin. Measure the neck just below the larynx, the waist at the navel for men or the narrowest point for women, and (for women) the hips at the widest point. Average two or three readings for each site.",
    },
    {
      q: "What is a healthy body-fat percentage?",
      a: "Typical healthy ranges are roughly 10–20% for men and 18–28% for women, varying with age and athletic goals. Essential fat sits around 3–5% for men and 10–13% for women; going near those floors is neither necessary nor advisable for most people.",
    },
    {
      q: "Why does the formula only use a few measurements?",
      a: "The Navy method was designed to estimate body density from quick field measurements that anyone can take with a tape. It trades some accuracy for practicality — laboratory methods such as DEXA are more precise but far less accessible.",
    },
    {
      q: "Why does my result differ from my smart scale?",
      a: "Bio-impedance scales estimate body fat from electrical conductivity, which swings with hydration, food and skin temperature. Neither method is exact; what matters most is tracking the trend using the same method under the same conditions.",
    },
  ],
  related: ["bmi-calculator", "ffmi-calculator", "lean-body-mass-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-21",
  sources: [
    {
      label:
        "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy men from body circumferences and height. Naval Health Research Center, Report No. 84-11, 1984",
      url: "https://apps.dtic.mil/sti/citations/ADA143890",
    },
    {
      label:
        "Hodgdon JA, Beckett MB. Prediction of percent body fat for U.S. Navy women from body circumferences and height. Naval Health Research Center, Report No. 84-29, 1984",
      url: "https://www.semanticscholar.org/paper/Prediction-of-Percent-Body-Fat-for-U.S.-Navy-Women-Hodgdon-Beckett/2a72508459785921ea3aaabb2127c3541d4c1d1a",
    },
  ],
};
