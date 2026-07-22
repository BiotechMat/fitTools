import type { Hub, ToolConfig } from "@/registry/types";
import { tdeeConfig } from "@/registry/configs/tdee";
import { macroConfig } from "@/registry/configs/macro-calculator";
import { deficitConfig } from "@/registry/configs/calorie-deficit-calculator";
import { bmiConfig } from "@/registry/configs/bmi-calculator";
import { bodyFatConfig } from "@/registry/configs/body-fat-calculator";
import { idealWeightConfig } from "@/registry/configs/ideal-weight-calculator";
import { oneRmConfig } from "@/registry/configs/one-rep-max-calculator";
import { plateConfig } from "@/registry/configs/plate-calculator";
import { hrConfig } from "@/registry/configs/heart-rate-zone-calculator";
import { sleepConfig } from "@/registry/configs/sleep-calculator";
import { bmrConfig } from "@/registry/configs/bmr-calculator";
import { lbmConfig } from "@/registry/configs/lean-body-mass-calculator";
import { ffmiConfig } from "@/registry/configs/ffmi-calculator";
import { waterConfig } from "@/registry/configs/water-intake-calculator";
import { caloriesBurnedConfig } from "@/registry/configs/calories-burned-calculator";
import { stepsConfig } from "@/registry/configs/steps-to-calories-calculator";
import { creatineConfig } from "@/registry/configs/creatine-calculator";
import { warmupConfig } from "@/registry/configs/warmup-calculator";
import { progressionConfig } from "@/registry/configs/double-progression-planner";
import { volumeConfig } from "@/registry/configs/training-volume-calculator";
import { standardsConfig } from "@/registry/configs/strength-standards";
import { dotsConfig } from "@/registry/configs/dots-calculator";
import { paceConfig } from "@/registry/configs/running-pace-calculator";
import { raceConfig } from "@/registry/configs/race-time-predictor";
import { caffeineConfig } from "@/registry/configs/caffeine-calculator";
import { peptideConfig } from "@/registry/configs/peptide-reconstitution";
import { phenoAgeConfig } from "@/registry/configs/phenotypic-age-calculator";
import { cgmConfig } from "@/registry/configs/cgm-metrics-calculator";

/**
 * Single source of truth (SPEC §5). Every tool config is imported here once;
 * routing, sitemap, hub listings, related links and JSON-LD all derive from
 * this list.
 */
export const allTools: ToolConfig[] = [
  tdeeConfig,
  macroConfig,
  deficitConfig,
  bmiConfig,
  bodyFatConfig,
  idealWeightConfig,
  oneRmConfig,
  plateConfig,
  hrConfig,
  sleepConfig,
  bmrConfig,
  lbmConfig,
  ffmiConfig,
  waterConfig,
  caloriesBurnedConfig,
  stepsConfig,
  creatineConfig,
  warmupConfig,
  progressionConfig,
  volumeConfig,
  standardsConfig,
  dotsConfig,
  paceConfig,
  raceConfig,
  caffeineConfig,
  phenoAgeConfig,
  cgmConfig,
  peptideConfig,
];

export const toolsBySlug: ReadonlyMap<string, ToolConfig> = new Map(
  allTools.map((tool) => [tool.slug, tool]),
);

export function getTool(slug: string): ToolConfig | undefined {
  return toolsBySlug.get(slug);
}

/** Tools rendered under /(tools)/[slug] — everything except tier 4 (/labs/). */
export function standardTools(): ToolConfig[] {
  return allTools.filter((tool) => tool.tier !== 4);
}

/** Tier 4 tools rendered under /labs/[slug] with ads disabled. */
export function labsTools(): ToolConfig[] {
  return allTools.filter((tool) => tool.tier === 4);
}

export function toolsForHub(hub: Hub): ToolConfig[] {
  // Tier 4 tools live under /labs and never appear in hub listings.
  return allTools.filter((tool) => tool.hub === hub && tool.tier !== 4);
}

/** Related tools that actually exist in the registry — never a dead link. */
export function relatedTools(tool: ToolConfig): ToolConfig[] {
  return tool.related.flatMap((slug) => {
    const found = getTool(slug);
    return found ? [found] : [];
  });
}
