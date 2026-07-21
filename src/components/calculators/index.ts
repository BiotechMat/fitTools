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
};
