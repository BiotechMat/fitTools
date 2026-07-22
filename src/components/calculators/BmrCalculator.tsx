"use client";

import { useId, useMemo, useState } from "react";
import {
  type Sex,
  fatFreeMassKg,
  harrisBenedictRevised,
  katchMcArdle,
  mifflinStJeor,
} from "@/lib/formulas/energy";
import { BMR_CALC_DEFAULTS, BMR_CALC_LIMITS } from "@/registry/configs/bmr-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HeightField, UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

type Formula = "mifflin" | "katch" | "harris";

const FORMULA_LABELS: Record<Formula, string> = {
  mifflin: "Mifflin–St Jeor (recommended)",
  katch: "Katch–McArdle (requires body-fat %)",
  harris: "Revised Harris–Benedict",
};

export function BmrCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [sex, setSex] = useState<Sex>("male");
  const [ageText, setAgeText] = useState(String(BMR_CALC_DEFAULTS.ageYears));
  const [weightKg, setWeightKg] = useState<number>(BMR_CALC_DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState<number>(BMR_CALC_DEFAULTS.heightCm);
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [bodyFatText, setBodyFatText] = useState("");

  const result = useMemo(() => {
    const ageYears = Number(ageText);
    const bodyFatPercent = bodyFatText.trim() === "" ? undefined : Number(bodyFatText);
    const valid =
      inRange(ageYears, BMR_CALC_LIMITS.ageYears) &&
      inRange(weightKg, BMR_CALC_LIMITS.weightKg) &&
      inRange(heightCm, BMR_CALC_LIMITS.heightCm) &&
      (bodyFatPercent === undefined || inRange(bodyFatPercent, BMR_CALC_LIMITS.bodyFatPercent));
    if (!valid) return null;
    if (formula === "katch") {
      if (bodyFatPercent === undefined) return null;
      return { bmr: katchMcArdle(fatFreeMassKg(weightKg, bodyFatPercent)) };
    }
    if (formula === "harris") {
      return { bmr: harrisBenedictRevised({ sex, weightKg, heightCm, ageYears }) };
    }
    return { bmr: mifflinStJeor({ sex, weightKg, heightCm, ageYears }) };
  }, [sex, ageText, weightKg, heightCm, formula, bodyFatText]);

  return (
    <CalculatorShell>
      <form aria-label="BMR inputs" onSubmit={(e) => e.preventDefault()}>
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
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-age`} className={labelClass}>Age (years)</label>
            <input
              id={`${id}-age`}
              type="number"
              inputMode="numeric"
              min={13}
              max={100}
              className={inputClass}
              value={ageText}
              onChange={(e) => setAgeText(e.target.value)}
            />
          </div>
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
          <HeightField valueCm={heightCm} onChange={setHeightCm} system={system} />
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor={`${id}-formula`} className={labelClass}>Formula</label>
            <select
              id={`${id}-formula`}
              className={inputClass}
              value={formula}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "mifflin" || value === "katch" || value === "harris") setFormula(value);
              }}
            >
              {Object.entries(FORMULA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {formula === "katch" ? (
            <div>
              <label htmlFor={`${id}-bf`} className={labelClass}>Body fat (%)</label>
              <input
                id={`${id}-bf`}
                type="number"
                inputMode="decimal"
                min={5}
                max={60}
                step="0.1"
                className={inputClass}
                value={bodyFatText}
                onChange={(e) => setBodyFatText(e.target.value)}
              />
            </div>
          ) : null}
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated basal metabolic rate
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="bmr-value">
              {formatNumber(result.bmr)}{" "}
              <span className="text-lg font-medium text-muted">kcal/day</span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              This estimates the energy your body uses at complete rest. Your
              full daily burn is higher — see the TDEE calculator to include
              activity. Estimates commonly sit within about 10% of measured
              values.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {formula === "katch"
              ? "Enter your body-fat percentage (5–60%) to use Katch–McArdle."
              : "Enter a valid age, weight and height to see your BMR."}
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
