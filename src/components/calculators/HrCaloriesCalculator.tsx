"use client";

import { useId, useMemo, useState } from "react";
import { type Sex } from "@/lib/formulas/energy";
import { kcalPerMinute, sessionKcal } from "@/lib/formulas/hr-calories";
import {
  HR_CALORIES_DEFAULTS,
  HR_CALORIES_LIMITS,
  HR_MODEL_FLOOR_BPM,
} from "@/registry/configs/calories-burned-by-heart-rate.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import {
  formatNumber,
  inputClass,
  labelClass,
  warningClass,
} from "@/components/calculators/styles";

export function HrCaloriesCalculator() {
  const id = useId();
  const [sex, setSex] = useState<Sex>(HR_CALORIES_DEFAULTS.sex);
  const [hrText, setHrText] = useState(String(HR_CALORIES_DEFAULTS.heartRateBpm));
  const [weightText, setWeightText] = useState(String(HR_CALORIES_DEFAULTS.weightKg));
  const [ageText, setAgeText] = useState(String(HR_CALORIES_DEFAULTS.ageYears));
  const [durationText, setDurationText] = useState(String(HR_CALORIES_DEFAULTS.durationMin));

  const result = useMemo(() => {
    const heartRateBpm = Number(hrText);
    const weightKg = Number(weightText);
    const ageYears = Number(ageText);
    const durationMin = Number(durationText);
    const valid =
      inRange(heartRateBpm, HR_CALORIES_LIMITS.heartRateBpm) &&
      inRange(weightKg, HR_CALORIES_LIMITS.weightKg) &&
      inRange(ageYears, HR_CALORIES_LIMITS.ageYears) &&
      inRange(durationMin, HR_CALORIES_LIMITS.durationMin);
    if (!valid) return null;
    const input = { sex, heartRateBpm, weightKg, ageYears };
    return {
      heartRateBpm,
      perMinute: kcalPerMinute(input),
      total: sessionKcal(input, durationMin),
      belowModel: heartRateBpm < HR_MODEL_FLOOR_BPM,
    };
  }, [sex, hrText, weightText, ageText, durationText]);

  return (
    <CalculatorShell>
      <form aria-label="Heart-rate calorie inputs" onSubmit={(e) => e.preventDefault()}>
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
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-hr`} className={labelClass}>Average heart rate (bpm)</label>
            <input
              id={`${id}-hr`}
              type="number"
              inputMode="numeric"
              min={HR_CALORIES_LIMITS.heartRateBpm.min}
              max={HR_CALORIES_LIMITS.heartRateBpm.max}
              className={inputClass}
              value={hrText}
              onChange={(e) => setHrText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-duration`} className={labelClass}>Duration (minutes)</label>
            <input
              id={`${id}-duration`}
              type="number"
              inputMode="numeric"
              min={HR_CALORIES_LIMITS.durationMin.min}
              max={HR_CALORIES_LIMITS.durationMin.max}
              className={inputClass}
              value={durationText}
              onChange={(e) => setDurationText(e.target.value)}
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
            <label htmlFor={`${id}-age`} className={labelClass}>Age (years)</label>
            <input
              id={`${id}-age`}
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={ageText}
              onChange={(e) => setAgeText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Estimated session burn
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="hr-burn-total">
              {formatNumber(result.total)}{" "}
              <span className="text-lg font-medium text-muted">kcal</span>
            </p>
            <p className="mt-2 text-sm text-muted">
              ≈ <span className="font-semibold" data-testid="hr-burn-rate">{formatNumber(result.perMinute, 1)}</span>{" "}
              kcal per minute at {formatNumber(result.heartRateBpm)} bpm
            </p>
            {result.belowModel ? (
              <p className={warningClass} role="note">
                The Keytel equations were developed on steady exercise at
                roughly {HR_MODEL_FLOOR_BPM} bpm and above, below that the
                estimate isn&rsquo;t meaningful.
              </p>
            ) : (
              <p className="mt-3 max-w-prose text-sm text-muted">
                Built for steady aerobic work, use your session-average heart
                rate, and prefer the MET-based calculator for lifting.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">Enter your session details to see the estimate.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
