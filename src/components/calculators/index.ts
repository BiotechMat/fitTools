import type { ComponentType } from "react";
import dynamic from "next/dynamic";

/**
 * Slug → interactive calculator component. The tool page template looks the
 * calculator up here; registering a new tool means adding one entry (this
 * counts as part of the tool's registry import, SPEC §5).
 *
 * Calculators are dynamically imported so each tool page ships only its own
 * calculator chunk — eager imports would merge every calculator into the
 * shared bundle on every page and blow the SPEC §13 JS budget as the
 * catalogue grows. Server rendering still emits the full HTML (no CLS).
 */
export const calculators: Readonly<Record<string, ComponentType>> = {
  "tdee-calculator": dynamic(() =>
    import("@/components/calculators/TdeeCalculator").then((m) => m.TdeeCalculator),
  ),
  "macro-calculator": dynamic(() =>
    import("@/components/calculators/MacroCalculator").then((m) => m.MacroCalculator),
  ),
  "calorie-deficit-calculator": dynamic(() =>
    import("@/components/calculators/DeficitCalculator").then((m) => m.DeficitCalculator),
  ),
  "bmi-calculator": dynamic(() =>
    import("@/components/calculators/BmiCalculator").then((m) => m.BmiCalculator),
  ),
  "body-fat-calculator": dynamic(() =>
    import("@/components/calculators/BodyFatCalculator").then((m) => m.BodyFatCalculator),
  ),
  "ideal-weight-calculator": dynamic(() =>
    import("@/components/calculators/IdealWeightCalculator").then(
      (m) => m.IdealWeightCalculator,
    ),
  ),
  "one-rep-max-calculator": dynamic(() =>
    import("@/components/calculators/OneRmCalculator").then((m) => m.OneRmCalculator),
  ),
  "plate-calculator": dynamic(() =>
    import("@/components/calculators/PlateCalculator").then((m) => m.PlateCalculator),
  ),
  "heart-rate-zone-calculator": dynamic(() =>
    import("@/components/calculators/HrZoneCalculator").then((m) => m.HrZoneCalculator),
  ),
  "sleep-calculator": dynamic(() =>
    import("@/components/calculators/SleepCalculator").then((m) => m.SleepCalculator),
  ),
  "bmr-calculator": dynamic(() =>
    import("@/components/calculators/BmrCalculator").then((m) => m.BmrCalculator),
  ),
  "lean-body-mass-calculator": dynamic(() =>
    import("@/components/calculators/LbmCalculator").then((m) => m.LbmCalculator),
  ),
  "ffmi-calculator": dynamic(() =>
    import("@/components/calculators/FfmiCalculator").then((m) => m.FfmiCalculator),
  ),
  "water-intake-calculator": dynamic(() =>
    import("@/components/calculators/WaterCalculator").then((m) => m.WaterCalculator),
  ),
  "calories-burned-calculator": dynamic(() =>
    import("@/components/calculators/CaloriesBurnedCalculator").then(
      (m) => m.CaloriesBurnedCalculator,
    ),
  ),
  "steps-to-calories-calculator": dynamic(() =>
    import("@/components/calculators/StepsCalculator").then((m) => m.StepsCalculator),
  ),
  "creatine-calculator": dynamic(() =>
    import("@/components/calculators/CreatineCalculator").then((m) => m.CreatineCalculator),
  ),
  "warmup-calculator": dynamic(() =>
    import("@/components/calculators/WarmupCalculator").then((m) => m.WarmupCalculator),
  ),
  "double-progression-planner": dynamic(() =>
    import("@/components/calculators/ProgressionCalculator").then(
      (m) => m.ProgressionCalculator,
    ),
  ),
  "training-volume-calculator": dynamic(() =>
    import("@/components/calculators/VolumeCalculator").then((m) => m.VolumeCalculator),
  ),
  "strength-standards": dynamic(() =>
    import("@/components/calculators/StandardsCalculator").then((m) => m.StandardsCalculator),
  ),
  "dots-calculator": dynamic(() =>
    import("@/components/calculators/DotsCalculator").then((m) => m.DotsCalculator),
  ),
  "running-pace-calculator": dynamic(() =>
    import("@/components/calculators/PaceCalculator").then((m) => m.PaceCalculator),
  ),
  "race-time-predictor": dynamic(() =>
    import("@/components/calculators/RacePredictorCalculator").then(
      (m) => m.RacePredictorCalculator,
    ),
  ),
  "caffeine-calculator": dynamic(() =>
    import("@/components/calculators/CaffeineCalculator").then((m) => m.CaffeineCalculator),
  ),
  "peptide-reconstitution": dynamic(() =>
    import("@/components/calculators/PeptideCalculator").then((m) => m.PeptideCalculator),
  ),
  "phenotypic-age-calculator": dynamic(() =>
    import("@/components/calculators/PhenotypicAgeCalculator").then(
      (m) => m.PhenotypicAgeCalculator,
    ),
  ),
  "cgm-metrics-calculator": dynamic(() =>
    import("@/components/calculators/CgmCalculator").then((m) => m.CgmCalculator),
  ),
  "lifestyle-life-expectancy": dynamic(() =>
    import("@/components/calculators/LifeExpectancyCalculator").then(
      (m) => m.LifeExpectancyCalculator,
    ),
  ),
  "metabolic-fitness-index": dynamic(() =>
    import("@/components/calculators/MetabolicFitnessCalculator").then(
      (m) => m.MetabolicFitnessCalculator,
    ),
  ),
};
