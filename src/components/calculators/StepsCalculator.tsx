"use client";

import { useId, useMemo, useState } from "react";
import { type Sex } from "@/lib/formulas/energy";
import { type WalkingPace, stepsToCalories } from "@/lib/formulas/steps";
import { STEPS_DEFAULTS, STEPS_LIMITS } from "@/registry/configs/steps-to-calories-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HeightField, UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const PACE_LABELS: Record<WalkingPace, string> = {
  casual: "Casual (~4.0 km/h)",
  moderate: "Moderate (~4.8 km/h)",
  brisk: "Brisk (~5.6 km/h)",
};

export function StepsCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState<number>(STEPS_DEFAULTS.heightCm);
  const [weightKg, setWeightKg] = useState<number>(STEPS_DEFAULTS.weightKg);
  const [stepsText, setStepsText] = useState(String(STEPS_DEFAULTS.steps));
  const [pace, setPace] = useState<WalkingPace>("moderate");

  const result = useMemo(() => {
    const steps = Number(stepsText);
    const valid =
      inRange(heightCm, STEPS_LIMITS.heightCm) &&
      inRange(weightKg, STEPS_LIMITS.weightKg) &&
      Number.isInteger(steps) &&
      inRange(steps, STEPS_LIMITS.steps);
    if (!valid) return null;
    return stepsToCalories({ sex, heightCm, weightKg, steps, pace });
  }, [sex, heightCm, weightKg, stepsText, pace]);

  return (
    <CalculatorShell>
      <form aria-label="Steps to calories inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between gap-3">
          <fieldset className="flex gap-4">
            <legend className="sr-only">Sex</legend>
            {(["male", "female"] as const).map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm font-medium">
                <input
                  type="radio"
                  name={`${id}-sex`}
                  value={option}
                  checked={sex === option}
                  onChange={() => setSex(option)}
                  className="accent-[var(--primary)]"
                />
                {option === "male" ? "Male" : "Female"}
              </label>
            ))}
          </fieldset>
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-steps`} className={labelClass}>Steps</label>
            <input
              id={`${id}-steps`}
              type="number"
              inputMode="numeric"
              min={0}
              max={100000}
              step="100"
              className={inputClass}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-pace`} className={labelClass}>Walking pace</label>
            <select
              id={`${id}-pace`}
              className={inputClass}
              value={pace}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "casual" || value === "moderate" || value === "brisk") setPace(value);
              }}
            >
              {Object.entries(PACE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <HeightField valueCm={heightCm} onChange={setHeightCm} system={system} />
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Rough estimate from your steps
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="steps-kcal">
              {formatNumber(result.kcal)}{" "}
              <span className="text-lg font-medium text-muted">kcal</span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              About {formatNumber(result.distanceM / 1000, 1)} km of walking
              (Compendium MET {result.met}). Stride length is estimated from
              height, so treat this as a rough estimate — the trend across
              days matters more than any single figure.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter your steps and stats to see the estimate.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
