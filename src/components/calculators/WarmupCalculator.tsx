"use client";

import { useId, useMemo, useState } from "react";
import { warmupSets } from "@/lib/formulas/warmup";
import plateData from "@/data/plates.json";
import { WARMUP_DEFAULTS, WARMUP_LIMITS } from "@/registry/configs/warmup-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function WarmupCalculator() {
  const id = useId();
  const [workText, setWorkText] = useState(String(WARMUP_DEFAULTS.workSetKg));
  const [barKg, setBarKg] = useState<number>(WARMUP_DEFAULTS.barKg);

  const result = useMemo(() => {
    const workSetKg = Number(workText);
    if (!inRange(workSetKg, WARMUP_LIMITS.workSetKg) || workSetKg < barKg) return null;
    return warmupSets(workSetKg, barKg, plateData.metric.plates);
  }, [workText, barKg]);

  return (
    <CalculatorShell>
      <form aria-label="Warm-up inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-work`} className={labelClass}>First work set (kg)</label>
            <input
              id={`${id}-work`}
              type="number"
              inputMode="decimal"
              min={WARMUP_LIMITS.workSetKg.min}
              max={WARMUP_LIMITS.workSetKg.max}
              step="2.5"
              className={inputClass}
              value={workText}
              onChange={(e) => setWorkText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-bar`} className={labelClass}>Bar weight</label>
            <select
              id={`${id}-bar`}
              className={inputClass}
              value={barKg}
              onChange={(e) => setBarKg(Number(e.target.value))}
            >
              {plateData.metric.barOptionsKg.map((option) => (
                <option key={option} value={option}>{option} kg</option>
              ))}
            </select>
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your warm-up ramp
            </h2>
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">Warm-up sets</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 font-semibold">Set</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Weight</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Reps</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Per side</th>
                </tr>
              </thead>
              <tbody>
                {result.map((set, i) => (
                  <tr key={i} className="border-b border-border last:border-0" data-testid={`warmup-row-${i}`}>
                    <td className="py-1.5">{i === 0 ? "Bar" : `${i}`}</td>
                    <td className="py-1.5 text-right tabular-nums font-medium">
                      {formatNumber(set.achievedKg, 1)} kg
                    </td>
                    <td className="py-1.5 text-right tabular-nums">×{set.reps}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {set.perSide.length > 0 ? set.perSide.join(" + ") : "bar only"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Percentages are rounded to weights your plates can actually
              make. Strong lifters may want an extra single around 90% before
              the first work set.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter a work-set weight of at least the bar weight.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
