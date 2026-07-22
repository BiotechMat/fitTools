"use client";

import { useId, useMemo, useState } from "react";
import {
  ONE_RM_FORMULAS,
  type OneRmFormula,
  REP_VALIDITY_LIMIT,
  oneRepMax,
  percentTable,
} from "@/lib/formulas/one-rep-max";
import { kgToLb, lbToKg } from "@/lib/units";
import {
  ONE_RM_DEFAULTS,
  ONE_RM_LIMITS,
  ONE_RM_SLUG,
} from "@/registry/configs/one-rep-max-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultHistory } from "@/components/ResultHistory";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ScoreCard } from "@/components/ScoreCard";
import { UnitSystemToggle, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass, warningClass } from "@/components/calculators/styles";

export function OneRmCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [weightText, setWeightText] = useState(String(ONE_RM_DEFAULTS.weight));
  const [repsText, setRepsText] = useState(String(ONE_RM_DEFAULTS.reps));
  const [formula, setFormula] = useState<OneRmFormula>(ONE_RM_DEFAULTS.formula);

  // The lifted-weight field is unit-aware: canonical kg, displayed as-is on
  // toggle (people re-enter the number they lift in their gym's units).
  const [lastSystem, setLastSystem] = useState(system);
  if (lastSystem !== system) {
    setLastSystem(system);
    const kg =
      lastSystem === "imperial" ? lbToKg(Number(weightText) || 0) : Number(weightText) || 0;
    setWeightText(
      system === "imperial" ? kgToLb(kg).toFixed(1).replace(/\.0$/, "") : kg.toFixed(1).replace(/\.0$/, ""),
    );
  }

  const result = useMemo(() => {
    const displayWeight = Number(weightText);
    const weightKg =
      system === "imperial" ? lbToKg(displayWeight) : displayWeight;
    const reps = Number(repsText);
    const valid =
      inRange(weightKg, ONE_RM_LIMITS.weight) &&
      Number.isInteger(reps) &&
      inRange(reps, ONE_RM_LIMITS.reps);
    if (!valid) return null;
    const max = oneRepMax(formula, weightKg, reps);
    return { maxKg: max, reps, table: percentTable(max) };
  }, [weightText, repsText, formula, system]);

  const display = (kg: number) =>
    system === "imperial"
      ? `${formatNumber(kgToLb(kg), 1)} lb`
      : `${formatNumber(kg, 1)} kg`;

  return (
    <CalculatorShell>
      <form aria-label="One rep max inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end">
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-weight`} className={labelClass}>
              Weight lifted ({system === "imperial" ? "lb" : "kg"})
            </label>
            <input
              id={`${id}-weight`}
              type="number"
              inputMode="decimal"
              min={1}
              step="0.5"
              className={inputClass}
              value={weightText}
              onChange={(e) => setWeightText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-reps`} className={labelClass}>
              Reps completed
            </label>
            <input
              id={`${id}-reps`}
              type="number"
              inputMode="numeric"
              min={ONE_RM_LIMITS.reps.min}
              max={ONE_RM_LIMITS.reps.max}
              className={inputClass}
              value={repsText}
              onChange={(e) => setRepsText(e.target.value)}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor={`${id}-formula`} className={labelClass}>
              Formula
            </label>
            <select
              id={`${id}-formula`}
              className={inputClass}
              value={formula}
              onChange={(e) => {
                const value = e.target.value;
                if (value in ONE_RM_FORMULAS) {
                  setFormula(value as OneRmFormula); // narrowed by the `in` guard
                }
              }}
            >
              {Object.entries(ONE_RM_FORMULAS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                  {key === "epley" ? " (default)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <ScoreCard
              label="Your estimated one-rep max"
              value={display(result.maxKg)}
              valueTestId="one-rm-value"
            />
            {result.reps > REP_VALIDITY_LIMIT ? (
              <p className={warningClass} role="alert">
                Estimates lose accuracy beyond {REP_VALIDITY_LIMIT} reps —
                treat this number as a rough guide only, or test with a
                heavier set of 10 or fewer.
              </p>
            ) : (
              <p className="mt-2 max-w-prose text-sm text-muted">
                An estimate, not a guarantee — individual rep-to-max
                relationships vary by lift and lifter. Use it to set training
                percentages rather than to attempt a true max.
              </p>
            )}
            <ResultHistory
              tool={ONE_RM_SLUG}
              value={result.maxKg}
              direction="up"
              epsilon={0.25}
              formatDelta={display}
            />
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Working weights as a percentage of 1RM</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 font-semibold">% of 1RM</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Weight</th>
                </tr>
              </thead>
              <tbody>
                {result.table.map((row) => (
                  <tr key={row.percent} className="border-b border-border last:border-0">
                    <td className="py-1">{row.percent}%</td>
                    <td className="py-1 text-right tabular-nums">{display(row.weight)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter the weight you lifted and the reps completed (1–20) to
            estimate your one-rep max.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
