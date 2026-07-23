"use client";

import { useId, useMemo, useState } from "react";
import { type Sex } from "@/lib/formulas/energy";
import { dailyWaterLitres } from "@/lib/formulas/water";
import { WATER_DEFAULTS, WATER_LIMITS } from "@/registry/configs/water-intake-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function WaterCalculator() {
  const id = useId();
  const [sex, setSex] = useState<Sex>("male");
  const [hoursText, setHoursText] = useState(String(WATER_DEFAULTS.exerciseHours));
  const [sweatRate, setSweatRate] = useState<number>(WATER_DEFAULTS.sweatRateLPerHour);

  const result = useMemo(() => {
    const exerciseHours = Number(hoursText);
    if (!inRange(exerciseHours, WATER_LIMITS.exerciseHours)) return null;
    return {
      litres: dailyWaterLitres({ sex, exerciseHours, sweatRateLPerHour: sweatRate }),
      exerciseHours,
    };
  }, [sex, hoursText, sweatRate]);

  return (
    <CalculatorShell>
      <form aria-label="Water intake inputs" onSubmit={(e) => e.preventDefault()}>
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
            <label htmlFor={`${id}-hours`} className={labelClass}>Exercise today (hours)</label>
            <input
              id={`${id}-hours`}
              type="number"
              inputMode="decimal"
              min={0}
              max={6}
              step="0.25"
              className={inputClass}
              value={hoursText}
              onChange={(e) => setHoursText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-sweat`} className={labelClass}>
              Sweat rate: {sweatRate.toFixed(1)} L/h
            </label>
            <input
              id={`${id}-sweat`}
              type="range"
              min={WATER_LIMITS.sweatRateLPerHour.min}
              max={WATER_LIMITS.sweatRateLPerHour.max}
              step="0.1"
              className="mt-3 w-full accent-[var(--primary)]"
              value={sweatRate}
              onChange={(e) => setSweatRate(Number(e.target.value))}
            />
            <p className="text-xs text-muted">Typical range ~0.5 to 2.0 L/h (higher in heat)</p>
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your daily water guideline
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="water-value">
              {formatNumber(result.litres, 1)}{" "}
              <span className="text-lg font-medium text-muted">litres</span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              This is TOTAL water, food typically contributes 20 to 30% of it,
              so your drinks need to cover roughly{" "}
              {formatNumber(result.litres * 0.75, 1)} L. A guideline for
              temperate conditions, not a prescription: thirst, urine colour
              and common sense are legitimate instruments too.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter your exercise hours (0 to 6) to see the guideline.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
