import type { ComponentType } from "react";
import { TdeeCalculator } from "@/components/calculators/TdeeCalculator";

/**
 * Slug → interactive calculator component. The tool page template looks the
 * calculator up here; registering a new tool means adding one entry (this
 * counts as part of the tool's registry import, SPEC §5).
 */
export const calculators: Readonly<Record<string, ComponentType>> = {
  "tdee-calculator": TdeeCalculator,
};
