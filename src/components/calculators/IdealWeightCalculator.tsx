"use client";

import { useId, useMemo, useState } from "react";
import type { Sex } from "@/lib/formulas/energy";
import { idealWeightRange, idealWeights } from "@/lib/formulas/ideal-weight";
import { kgToLb } from "@/lib/units";
import {
  IDEAL_WEIGHT_DEFAULTS,
  IDEAL_WEIGHT_LIMITS,
} from "@/registry/configs/ideal-weight-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HeightField, UnitSystemToggle, useUnitSystem } from "@/components/UnitInput";
import { formatNumber } from "@/components/calculators/styles";

const FORMULA_LABELS = [
  ["devine", "Devine (1974)"],
  ["robinson", "Robinson (1983, original coefficients)"],
  ["miller", "Miller (1983)"],
  ["hamwi", "Hamwi (1964)"],
] as const;

export function IdealWeightCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState<number>(IDEAL_WEIGHT_DEFAULTS.heightCm);

  const result = useMemo(() => {
    if (!inRange(heightCm, IDEAL_WEIGHT_LIMITS.heightCm)) return null;
    return {
      weights: idealWeights({ sex, heightCm }),
      range: idealWeightRange({ sex, heightCm }),
    };
  }, [sex, heightCm]);

  const display = (kg: number) =>
    system === "imperial"
      ? `${formatNumber(kgToLb(kg))} lb`
      : `${formatNumber(kg, 1)} kg`;

  return (
    <CalculatorShell>
      <form aria-label="Ideal weight inputs" onSubmit={(e) => e.preventDefault()}>
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
          <HeightField valueCm={heightCm} onChange={setHeightCm} system={system} />
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Historical formula range
            </h2>
            <p className="mt-1 text-3xl font-bold text-primary-strong" data-testid="ideal-weight-range">
              {display(result.range.minKg)} – {display(result.range.maxKg)}
            </p>
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Ideal weight by formula</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 font-semibold">Formula</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Estimate</th>
                </tr>
              </thead>
              <tbody>
                {FORMULA_LABELS.map(([key, label]) => (
                  <tr key={key} className="border-b border-border last:border-0">
                    <td className="py-1.5">{label}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {display(result.weights[key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 max-w-prose text-sm text-muted">
              These are historical estimating formulas — most were built for
              drug dosing, not health advice. The spread between them is the
              honest takeaway: there is no single ideal weight for a height.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter a height of at least 152.4 cm (5 ft) — the formulas are
            undefined below that.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
