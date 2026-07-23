"use client";

import { useMemo } from "react";
import { useState } from "react";
import {
  CREATINE_LOADING_DAYS,
  CREATINE_MAINTENANCE_G,
  creatineLoadingGramsPerDay,
} from "@/lib/formulas/creatine";
import { CREATINE_CALC_DEFAULTS, CREATINE_CALC_LIMITS } from "@/registry/configs/creatine-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber } from "@/components/calculators/styles";

export function CreatineCalculator() {
  const [system, setSystem] = useUnitSystem();
  const [weightKg, setWeightKg] = useState<number>(CREATINE_CALC_DEFAULTS.weightKg);

  const result = useMemo(() => {
    if (!inRange(weightKg, CREATINE_CALC_LIMITS.weightKg)) return null;
    return { loading: creatineLoadingGramsPerDay(weightKg) };
  }, [weightKg]);

  return (
    <CalculatorShell>
      <form aria-label="Creatine inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end">
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your creatine doses (ISSN position stand)
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="creatine-loading">
              {formatNumber(result.loading)}{" "}
              <span className="text-lg font-medium text-muted">
                g/day loading (optional)
              </span>
            </p>
            <p className="mt-1 text-lg">
              Maintenance:{" "}
              <span className="font-semibold" data-testid="creatine-maintenance">
                {CREATINE_MAINTENANCE_G.min} to {CREATINE_MAINTENANCE_G.max} g/day
              </span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Loading (0.3 g/kg/day for {CREATINE_LOADING_DAYS.min} to{" "}
              {CREATINE_LOADING_DAYS.max} days, split into ~4 doses)
              saturates muscle stores in about a week; skipping it and taking
              the maintenance dose gets there in three to four weeks with the
              same end result. These are the published sports-nutrition
              guidelines, not personal medical advice.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter a valid bodyweight (30 to 300 kg).</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
