import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  JUMP_DEFAULTS,
  JUMP_LIMITS,
  JUMP_SLUG,
} from "@/registry/configs/vertical-jump-calculator.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const jumpInputsSchema = z.object({
  jumpCm: limit(JUMP_LIMITS.jumpCm),
  massKg: limit(JUMP_LIMITS.massKg),
});

export const verticalJumpConfig: ToolConfig = {
  slug: JUMP_SLUG,
  title: "Vertical Jump Power Calculator: Sayers & Lewis",
  valueLine:
    "Turn your jump height into watts: peak power from the Sayers equation, average power from the classic Lewis formula.",
  metaDescription:
    "Free vertical jump power calculator: peak power in watts from the cross-validated Sayers squat-jump equation (60.7 × jump + 45.3 × mass − 2055) and average power from the Lewis formula.",
  hub: "strength",
  tier: 2,
  inputsSchema: jumpInputsSchema,
  defaults: { ...JUMP_DEFAULTS },
  faq: [
    {
      q: "How do I measure my vertical jump?",
      a: "The jump-and-reach method: mark your standing reach against a wall, then jump and mark the highest point you touch, the difference is your jump height. Take the best of three attempts, fully warmed up.",
    },
    {
      q: "What's the difference between peak and average power?",
      a: "Peak power is the highest instantaneous output during the jump (the Sayers estimate); average power is the mean over the whole propulsive phase (the Lewis estimate). Peak is always substantially larger, they are different quantities, not competing answers.",
    },
    {
      q: "What is a good vertical jump?",
      a: "Recreational adults commonly jump 30 to 50 cm; well-trained athletes in jumping sports commonly exceed 60 cm, and elite jumpers 75 cm+. Power output also rewards body mass, a heavier athlete produces more watts at the same jump height.",
    },
    {
      q: "Why estimate power instead of just tracking jump height?",
      a: "Jump height alone penalises heavier athletes. Converting to watts with body mass in the equation lets you compare athletes fairly and track whether force production is improving even while body weight changes.",
    },
  ],
  related: [
    "one-rep-max-calculator",
    "strength-standards",
    "training-volume-calculator",
  ],
  monetization: { ads: true, affiliates: false },
  lastReviewed: "2026-07-23",
  sources: [
    {
      label: "Sayers SP, et al. Cross-validation of three jump power equations. Med Sci Sports Exerc 1999;31:572-577",
      url: "https://pubmed.ncbi.nlm.nih.gov/10211854/",
    },
    {
      label: "Full text of the Sayers 1999 cross-validation study (MSSE)",
      url: "https://journals.lww.com/acsm-msse/fulltext/1999/04000/cross_validation_of_three_jump_power_equations.13.aspx",
    },
  ],
};
