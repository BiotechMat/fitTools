"use client";

import { useId, useMemo, useState } from "react";
import {
  ACTIVITY_FACTORS,
  type ActivityLevel,
  type Sex,
  mifflinStJeor,
  tdee,
} from "@/lib/formulas/energy";
import { type KetoGoal, ketoMacros } from "@/lib/formulas/keto";
import {
  KETO_DEFAULTS,
  KETO_GOAL_LABELS,
  KETO_LIMITS,
} from "@/registry/configs/keto-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little exercise)",
  light: "Light (1–3 sessions/week)",
  moderate: "Moderate (3–5 sessions/week)",
  active: "Active (6–7 sessions/week)",
  veryActive: "Very active (physical job + training)",
};

export function KetoCalculator() {
  const id = useId();
  const [sex, setSex] = useState<Sex>(KETO_DEFAULTS.sex);
  const [ageText, setAgeText] = useState(String(KETO_DEFAULTS.ageYears));
  const [weightText, setWeightText] = useState(String(KETO_DEFAULTS.weightKg));
  const [heightText, setHeightText] = useState(String(KETO_DEFAULTS.heightCm));
  const [activity, setActivity] = useState<ActivityLevel>(KETO_DEFAULTS.activity);
  const [goal, setGoal] = useState<KetoGoal>(KETO_DEFAULTS.goal);
  const [carbsText, setCarbsText] = useState(String(KETO_DEFAULTS.netCarbsG));
  const [protein, setProtein] = useState<number>(KETO_DEFAULTS.proteinGPerKg);

  const result = useMemo(() => {
    const ageYears = Number(ageText);
    const weightKg = Number(weightText);
    const heightCm = Number(heightText);
    const netCarbsG = Number(carbsText);
    const valid =
      inRange(ageYears, KETO_LIMITS.ageYears) &&
      inRange(weightKg, KETO_LIMITS.weightKg) &&
      inRange(heightCm, KETO_LIMITS.heightCm) &&
      inRange(netCarbsG, KETO_LIMITS.netCarbsG) &&
      inRange(protein, KETO_LIMITS.proteinGPerKg);
    if (!valid) return null;
    const maintenance = tdee(
      mifflinStJeor({ sex, weightKg, heightCm, ageYears }),
      ACTIVITY_FACTORS[activity],
    );
    return ketoMacros({
      tdeeKcal: maintenance,
      goal,
      netCarbsG,
      proteinGPerKg: protein,
      weightKg,
    });
  }, [sex, ageText, weightText, heightText, activity, goal, carbsText, protein]);

  return (
    <CalculatorShell>
      <form aria-label="Keto inputs" onSubmit={(e) => e.preventDefault()}>
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
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-age`} className={labelClass}>Age</label>
            <input
              id={`${id}-age`}
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={ageText}
              onChange={(e) => setAgeText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-weight`} className={labelClass}>Weight (kg)</label>
            <input
              id={`${id}-weight`}
              type="number"
              inputMode="decimal"
              step="0.5"
              className={inputClass}
              value={weightText}
              onChange={(e) => setWeightText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-height`} className={labelClass}>Height (cm)</label>
            <input
              id={`${id}-height`}
              type="number"
              inputMode="decimal"
              step="0.5"
              className={inputClass}
              value={heightText}
              onChange={(e) => setHeightText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-activity`} className={labelClass}>Activity</label>
            <select
              id={`${id}-activity`}
              className={inputClass}
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            >
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => (
                <option key={key} value={key}>
                  {ACTIVITY_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-goal`} className={labelClass}>Goal</label>
            <select
              id={`${id}-goal`}
              className={inputClass}
              value={goal}
              onChange={(e) => setGoal(e.target.value as KetoGoal)}
            >
              {(Object.keys(KETO_GOAL_LABELS) as KetoGoal[]).map((key) => (
                <option key={key} value={key}>
                  {KETO_GOAL_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-carbs`} className={labelClass}>Net carbs (g)</label>
            <input
              id={`${id}-carbs`}
              type="number"
              inputMode="numeric"
              min={KETO_LIMITS.netCarbsG.min}
              max={KETO_LIMITS.netCarbsG.max}
              className={inputClass}
              value={carbsText}
              onChange={(e) => setCarbsText(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor={`${id}-protein`} className={labelClass}>
            Protein: {protein.toFixed(1)} g/kg
          </label>
          <input
            id={`${id}-protein`}
            type="range"
            min={KETO_LIMITS.proteinGPerKg.min}
            max={KETO_LIMITS.proteinGPerKg.max}
            step="0.1"
            className="mt-2 w-full accent-[var(--primary)]"
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
          />
          <p className="text-xs text-muted">Evidence-based range 1.6–2.2 g/kg (Morton 2018).</p>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Daily keto macros
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="keto-kcal">
              {formatNumber(result.kcalTarget)}{" "}
              <span className="text-lg font-medium text-muted">kcal</span>
            </p>
            <dl className="mt-4 text-sm">
              <div className="flex items-baseline justify-between gap-4 border-t border-border py-2">
                <dt className="text-muted">Net carbs</dt>
                <dd className="font-semibold" data-testid="keto-carbs">
                  {formatNumber(result.carbsG)} g
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-border py-2">
                <dt className="text-muted">Protein</dt>
                <dd className="font-semibold" data-testid="keto-protein">
                  {formatNumber(result.proteinG)} g
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-border py-2">
                <dt className="text-muted">Fat (remaining energy)</dt>
                <dd className="font-semibold" data-testid="keto-fat">
                  {formatNumber(result.fatG)} g
                </dd>
              </div>
            </dl>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Estimates for planning, not prescriptions — anyone on
              glucose-lowering medication should involve their clinician
              before carbohydrate restriction.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Fill in your details to see your macros.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
