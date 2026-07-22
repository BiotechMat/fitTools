import { z } from "zod";
import type { ToolConfig } from "@/registry/types";
import {
  RECOVERY_READINESS_SLUG,
  RR_DEFAULTS,
  RR_LIMITS,
} from "@/registry/configs/recovery-readiness-index.shared";

const limit = (r: { min: number; max: number }) => z.number().min(r.min).max(r.max);

export const recoveryReadinessInputsSchema = z.object({
  hrvMs: limit(RR_LIMITS.hrvMs),
  hrvBaselineMs: limit(RR_LIMITS.hrvMs),
  restingHr: limit(RR_LIMITS.restingHr),
  restingHrBaseline: limit(RR_LIMITS.restingHr),
  sleepHours: limit(RR_LIMITS.sleepHours),
  sleepNeedHours: limit(RR_LIMITS.sleepHours),
  respRate: limit(RR_LIMITS.respRate),
  respRateBaseline: limit(RR_LIMITS.respRate),
});

export const recoveryReadinessConfig: ToolConfig = {
  slug: RECOVERY_READINESS_SLUG,
  title: "Recovery Readiness Index — Open, Self-Relative Score",
  valueLine:
    "A transparent daily readiness score comparing today's HRV, resting HR, sleep and breathing to your own baseline — the open version of proprietary readiness scores.",
  metaDescription:
    "Free open-methodology Recovery Readiness Index: a transparent daily 0–100 score comparing today's HRV, resting heart rate, sleep and breathing rate to your personal baseline. Self-relative, not a medical test.",
  hub: "recovery",
  tier: 3,
  inputsSchema: recoveryReadinessInputsSchema,
  defaults: { ...RR_DEFAULTS },
  faq: [
    {
      q: "What is the Recovery Readiness Index?",
      a: "It's an open, transparent version of the daily 'readiness' or 'recovery' scores built into wearables. It compares today's HRV, resting heart rate, sleep and breathing rate against your own recent baseline — and unlike the proprietary versions, it shows exactly how the number is calculated.",
    },
    {
      q: "Why does it compare to my own baseline?",
      a: "Because recovery is personal. A resting heart rate of 55 might be elevated for one person and low for another. The score is purely self-relative — there is no cross-user comparison and no clinical meaning.",
    },
    {
      q: "Where do I get baseline values?",
      a: "From your wearable's 7- or 30-day averages, or your own notes. Enter your usual (baseline) figure alongside today's reading for each metric.",
    },
    {
      q: "How are the inputs weighted?",
      a: "HRV 30%, resting heart rate 25%, sleep 25%, breathing rate 20%. The published methodology proposed HRV at 40%, but our house rule caps any single input at 30%, so we adjusted the weights — the change is recorded in the public changelog.",
    },
    {
      q: "Should I skip training if my score is low?",
      a: "It's a data point, not a prescription. A low score might reflect poor sleep, illness, alcohol or stress. Use it alongside how you actually feel — and remember it's a self-tracking tool, not a medical assessment.",
    },
  ],
  related: ["heart-rate-zone-calculator", "sleep-calculator", "caffeine-calculator"],
  monetization: { ads: true, affiliates: true },
  lastReviewed: "2026-07-22",
  sources: [
    {
      label:
        "Plews DJ, et al. Heart rate variability in elite athletes: training and overtraining monitoring (HRV-vs-baseline rationale)",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=Plews+heart+rate+variability+training+monitoring",
    },
    {
      label:
        "Task Force of the ESC/NASPE. Heart rate variability: standards of measurement and interpretation",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=heart+rate+variability+standards+measurement+interpretation+1996",
    },
  ],
};
