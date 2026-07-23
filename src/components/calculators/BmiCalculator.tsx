"use client";

import { useMemo, useState } from "react";
import { bmi, bmiCategory } from "@/lib/formulas/bmi";
import { BMI_DEFAULTS, BMI_LIMITS } from "@/registry/configs/bmi-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import {
  HeightField,
  UnitSystemToggle,
  WeightField,
  useUnitSystem,
} from "@/components/UnitInput";
import { formatNumber, warningClass } from "@/components/calculators/styles";

export function BmiCalculator() {
  const [system, setSystem] = useUnitSystem();
  const [weightKg, setWeightKg] = useState<number>(BMI_DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState<number>(BMI_DEFAULTS.heightCm);

  const result = useMemo(() => {
    const valid =
      inRange(weightKg, BMI_LIMITS.weightKg) &&
      inRange(heightCm, BMI_LIMITS.heightCm);
    if (!valid) return null;
    const value = bmi(weightKg, heightCm);
    return { value, category: bmiCategory(value) };
  }, [weightKg, heightCm]);

  return (
    <CalculatorShell>
      <form aria-label="BMI inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end">
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
          <HeightField valueCm={heightCm} onChange={setHeightCm} system={system} />
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated BMI
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="bmi-value">
              {formatNumber(result.value, 1)}
            </p>
            <p className="mt-1 text-lg">
              WHO category:{" "}
              <span className="font-semibold" data-testid="bmi-category">
                {result.category}
              </span>
            </p>
            <p className={warningClass}>
              BMI cannot tell muscle from fat. Muscular and athletic people are
              routinely classed as overweight despite low body fat, if that
              might be you, a body-fat estimate is a much better guide than
              BMI.
            </p>
            <p className="mt-3 max-w-prose text-sm text-muted">
              BMI is a population screening estimate, not a diagnosis. Discuss
              what your number means for you with a health professional.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter a weight (30 to 300 kg) and height (120 to 250 cm) to see your BMI
            and WHO category.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
