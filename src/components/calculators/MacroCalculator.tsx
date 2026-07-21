"use client";

import { useId, useMemo, useState } from "react";
import { macroSplit } from "@/lib/formulas/nutrition";
import {
  MACRO_DEFAULTS,
  MACRO_LIMITS,
} from "@/registry/configs/macro-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass, warningClass } from "@/components/calculators/styles";

export function MacroCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [kcalText, setKcalText] = useState(String(MACRO_DEFAULTS.kcalTarget));
  const [weightKg, setWeightKg] = useState<number>(MACRO_DEFAULTS.weightKg);
  const [proteinGPerKg, setProteinGPerKg] = useState<number>(
    MACRO_DEFAULTS.proteinGPerKg,
  );
  const [fatPercent, setFatPercent] = useState<number>(MACRO_DEFAULTS.fatPercent);

  const result = useMemo(() => {
    const kcalTarget = Number(kcalText);
    const valid =
      inRange(kcalTarget, MACRO_LIMITS.kcalTarget) &&
      inRange(weightKg, MACRO_LIMITS.weightKg) &&
      inRange(proteinGPerKg, MACRO_LIMITS.proteinGPerKg) &&
      inRange(fatPercent, MACRO_LIMITS.fatPercent);
    if (!valid) return null;
    return macroSplit({ kcalTarget, weightKg, proteinGPerKg, fatPercent });
  }, [kcalText, weightKg, proteinGPerKg, fatPercent]);

  return (
    <CalculatorShell>
      <form aria-label="Macro calculator inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end">
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-kcal`} className={labelClass}>
              Daily calorie target (kcal)
            </label>
            <input
              id={`${id}-kcal`}
              type="number"
              inputMode="numeric"
              min={MACRO_LIMITS.kcalTarget.min}
              max={MACRO_LIMITS.kcalTarget.max}
              step="10"
              className={inputClass}
              value={kcalText}
              onChange={(e) => setKcalText(e.target.value)}
            />
          </div>
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
          <div>
            <label htmlFor={`${id}-protein`} className={labelClass}>
              Protein: {proteinGPerKg.toFixed(2)} g/kg
            </label>
            <input
              id={`${id}-protein`}
              type="range"
              min={MACRO_LIMITS.proteinGPerKg.min}
              max={MACRO_LIMITS.proteinGPerKg.max}
              step="0.05"
              className="mt-3 w-full accent-[var(--primary)]"
              value={proteinGPerKg}
              onChange={(e) => setProteinGPerKg(Number(e.target.value))}
            />
            <p className="text-xs text-muted">Evidence-based range 1.6–2.2 g/kg</p>
          </div>
          <div>
            <label htmlFor={`${id}-fat`} className={labelClass}>
              Fat: {fatPercent}% of calories
            </label>
            <input
              id={`${id}-fat`}
              type="range"
              min={MACRO_LIMITS.fatPercent.min}
              max={MACRO_LIMITS.fatPercent.max}
              step="1"
              className="mt-3 w-full accent-[var(--primary)]"
              value={fatPercent}
              onChange={(e) => setFatPercent(Number(e.target.value))}
            />
            <p className="text-xs text-muted">Guideline range 20–35%</p>
          </div>
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated daily macros
            </h2>
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">Macro targets in grams and calories</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 font-semibold">Macro</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Grams/day</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">kcal/day</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2 font-medium">Protein</td>
                  <td className="py-2 text-right tabular-nums" data-testid="protein-g">
                    {formatNumber(result.protein.grams)} g
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatNumber(result.protein.kcal)}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 font-medium">Fat</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatNumber(result.fat.grams)} g
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatNumber(result.fat.kcal)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">Carbohydrate</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatNumber(Math.max(0, result.carbs.grams))} g
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatNumber(Math.max(0, result.carbs.kcal))}
                  </td>
                </tr>
              </tbody>
            </table>
            {result.feasible ? (
              <p className="mt-3 max-w-prose text-sm text-muted">
                These are estimated planning targets, not prescriptions —
                staying within 5–10 g of each is plenty accurate for most
                goals.
              </p>
            ) : (
              <p className={warningClass} role="alert">
                Protein and fat alone exceed this calorie target. Raise the
                calorie target, or reduce the protein or fat settings, to
                leave room for carbohydrate.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter a calorie target ({formatNumber(MACRO_LIMITS.kcalTarget.min)}–
            {formatNumber(MACRO_LIMITS.kcalTarget.max)} kcal) and bodyweight to
            see your macro split.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
