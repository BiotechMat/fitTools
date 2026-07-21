import type { ComponentType } from "react";
import { TdeeCalculator } from "@/components/calculators/TdeeCalculator";
import { MacroCalculator } from "@/components/calculators/MacroCalculator";
import { DeficitCalculator } from "@/components/calculators/DeficitCalculator";
import { BmiCalculator } from "@/components/calculators/BmiCalculator";
import { BodyFatCalculator } from "@/components/calculators/BodyFatCalculator";
import { IdealWeightCalculator } from "@/components/calculators/IdealWeightCalculator";
import { OneRmCalculator } from "@/components/calculators/OneRmCalculator";
import { PlateCalculator } from "@/components/calculators/PlateCalculator";
import { HrZoneCalculator } from "@/components/calculators/HrZoneCalculator";
import { SleepCalculator } from "@/components/calculators/SleepCalculator";

/**
 * Slug → interactive calculator component. The tool page template looks the
 * calculator up here; registering a new tool means adding one entry (this
 * counts as part of the tool's registry import, SPEC §5).
 */
export const calculators: Readonly<Record<string, ComponentType>> = {
  "tdee-calculator": TdeeCalculator,
  "macro-calculator": MacroCalculator,
  "calorie-deficit-calculator": DeficitCalculator,
  "bmi-calculator": BmiCalculator,
  "body-fat-calculator": BodyFatCalculator,
  "ideal-weight-calculator": IdealWeightCalculator,
  "one-rep-max-calculator": OneRmCalculator,
  "plate-calculator": PlateCalculator,
  "heart-rate-zone-calculator": HrZoneCalculator,
  "sleep-calculator": SleepCalculator,
};
