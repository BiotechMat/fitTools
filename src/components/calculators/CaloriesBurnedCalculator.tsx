"use client";

import { useId, useMemo, useState } from "react";
import { kcalBurned } from "@/lib/formulas/calories-burned";
import mets from "@/data/mets.json";
import {
  CALORIES_BURNED_DEFAULTS,
  CALORIES_BURNED_LIMITS,
} from "@/registry/configs/calories-burned-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function CaloriesBurnedCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [weightKg, setWeightKg] = useState<number>(CALORIES_BURNED_DEFAULTS.weightKg);
  const [minutesText, setMinutesText] = useState(String(CALORIES_BURNED_DEFAULTS.minutes));
  const [activityCode, setActivityCode] = useState<string>(
    CALORIES_BURNED_DEFAULTS.activityCode,
  );

  const activity = mets.activities.find((a) => a.code === activityCode) ?? mets.activities[0];

  const result = useMemo(() => {
    const minutes = Number(minutesText);
    const valid =
      inRange(weightKg, CALORIES_BURNED_LIMITS.weightKg) &&
      inRange(minutes, CALORIES_BURNED_LIMITS.minutes);
    if (!valid) return null;
    return { kcal: kcalBurned(activity.met, weightKg, minutes), minutes };
  }, [weightKg, minutesText, activity]);

  return (
    <CalculatorShell>
      <form aria-label="Calories burned inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end">
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label htmlFor={`${id}-activity`} className={labelClass}>Activity</label>
            <select
              id={`${id}-activity`}
              className={inputClass}
              value={activityCode}
              onChange={(e) => setActivityCode(e.target.value)}
            >
              {mets.activities.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.label} — {a.met} MET
                </option>
              ))}
            </select>
          </div>
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
          <div>
            <label htmlFor={`${id}-minutes`} className={labelClass}>Duration (minutes)</label>
            <input
              id={`${id}-minutes`}
              type="number"
              inputMode="numeric"
              min={1}
              max={600}
              className={inputClass}
              value={minutesText}
              onChange={(e) => setMinutesText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Estimated energy burned
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="burn-value">
              {formatNumber(result.kcal)}{" "}
              <span className="text-lg font-medium text-muted">kcal</span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              {activity.label} (Compendium code {activity.code}, {activity.met}{" "}
              MET) for {formatNumber(result.minutes)} minutes at your weight.
              This includes resting metabolism and describes the average
              person — treat it as an estimate, not a measurement.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter a valid weight and duration to see the estimate.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
