"use client";

import { useId, useMemo, useState } from "react";
import {
  type ProteinGoal,
  perMealG,
  proteinRangeG,
  rdaG,
} from "@/lib/formulas/protein";
import {
  PROTEIN_DEFAULTS,
  PROTEIN_GOAL_LABELS,
  PROTEIN_LIMITS,
} from "@/registry/configs/protein-intake-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function ProteinCalculator() {
  const id = useId();
  const [weightText, setWeightText] = useState(String(PROTEIN_DEFAULTS.weightKg));
  const [goal, setGoal] = useState<ProteinGoal>(PROTEIN_DEFAULTS.goal);

  const result = useMemo(() => {
    const weightKg = Number(weightText);
    if (!inRange(weightKg, PROTEIN_LIMITS.weightKg)) return null;
    return {
      weightKg,
      range: proteinRangeG(weightKg, goal),
      perMeal: perMealG(weightKg),
      rda: rdaG(weightKg),
    };
  }, [weightText, goal]);

  return (
    <CalculatorShell>
      <form aria-label="Protein inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-weight`} className={labelClass}>Body weight (kg)</label>
            <input
              id={`${id}-weight`}
              type="number"
              inputMode="decimal"
              min={PROTEIN_LIMITS.weightKg.min}
              max={PROTEIN_LIMITS.weightKg.max}
              step="0.5"
              className={inputClass}
              value={weightText}
              onChange={(e) => setWeightText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-goal`} className={labelClass}>Goal</label>
            <select
              id={`${id}-goal`}
              className={inputClass}
              value={goal}
              onChange={(e) => setGoal(e.target.value as ProteinGoal)}
            >
              {(Object.keys(PROTEIN_GOAL_LABELS) as ProteinGoal[]).map((key) => (
                <option key={key} value={key}>
                  {PROTEIN_GOAL_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Daily protein target
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="protein-range">
              {formatNumber(result.range.minG)}–{formatNumber(result.range.maxG)}{" "}
              <span className="text-lg font-medium text-muted">g/day</span>
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Per meal (≥ 4 meals)</dt>
                <dd className="font-semibold" data-testid="protein-per-meal">
                  ~{formatNumber(result.perMeal)} g
                </dd>
              </div>
              <div>
                <dt className="text-muted">RDA baseline (0.8 g/kg)</dt>
                <dd className="font-semibold">{formatNumber(result.rda)} g</dd>
              </div>
            </dl>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Ranges come straight from the cited literature for your goal —
              anywhere inside the band works; consistency matters more than
              precision.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter your body weight to see your range.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
