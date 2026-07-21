"use client";

import { useId, useMemo, useState } from "react";
import {
  maxRecommendedDeficit,
  weeklyLossKg,
  weeksToTarget,
} from "@/lib/formulas/deficit";
import { kgToLb, lbToKg } from "@/lib/units";
import {
  DEFICIT_DEFAULTS,
  DEFICIT_LIMITS,
} from "@/registry/configs/calorie-deficit-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UnitSystemToggle, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass, warningClass } from "@/components/calculators/styles";

export function DeficitCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [tdeeText, setTdeeText] = useState(String(DEFICIT_DEFAULTS.tdeeKcal));
  const [deficitText, setDeficitText] = useState(
    String(DEFICIT_DEFAULTS.dailyDeficitKcal),
  );
  const [lossText, setLossText] = useState(() =>
    system === "imperial"
      ? String(Math.round(kgToLb(DEFICIT_DEFAULTS.targetLossKg)))
      : String(DEFICIT_DEFAULTS.targetLossKg),
  );

  // Re-derive the loss display when the unit system flips.
  const [lastSystem, setLastSystem] = useState(system);
  if (lastSystem !== system) {
    setLastSystem(system);
    const kg =
      lastSystem === "imperial" ? lbToKg(Number(lossText) || 0) : Number(lossText) || 0;
    setLossText(
      system === "imperial" ? (kgToLb(kg)).toFixed(0) : kg.toFixed(1).replace(/\.0$/, ""),
    );
  }

  const result = useMemo(() => {
    const tdeeKcal = Number(tdeeText);
    const dailyDeficitKcal = Number(deficitText);
    const targetLossKg =
      system === "imperial" ? lbToKg(Number(lossText)) : Number(lossText);
    const valid =
      inRange(tdeeKcal, DEFICIT_LIMITS.tdeeKcal) &&
      inRange(dailyDeficitKcal, DEFICIT_LIMITS.dailyDeficitKcal) &&
      inRange(targetLossKg, DEFICIT_LIMITS.targetLossKg);
    if (!valid) return null;
    const cap = maxRecommendedDeficit(tdeeKcal);
    return {
      tdeeKcal,
      dailyDeficitKcal,
      targetLossKg,
      weekly: weeklyLossKg(dailyDeficitKcal),
      weeks: weeksToTarget(targetLossKg, dailyDeficitKcal),
      overCap: dailyDeficitKcal > cap,
      cap,
    };
  }, [tdeeText, deficitText, lossText, system]);

  return (
    <CalculatorShell>
      <form aria-label="Calorie deficit inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end">
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-tdee`} className={labelClass}>
              Your TDEE (kcal/day)
            </label>
            <input
              id={`${id}-tdee`}
              type="number"
              inputMode="numeric"
              min={DEFICIT_LIMITS.tdeeKcal.min}
              max={DEFICIT_LIMITS.tdeeKcal.max}
              step="10"
              className={inputClass}
              value={tdeeText}
              onChange={(e) => setTdeeText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-deficit`} className={labelClass}>
              Daily deficit (kcal)
            </label>
            <input
              id={`${id}-deficit`}
              type="number"
              inputMode="numeric"
              min={DEFICIT_LIMITS.dailyDeficitKcal.min}
              max={DEFICIT_LIMITS.dailyDeficitKcal.max}
              step="50"
              className={inputClass}
              value={deficitText}
              onChange={(e) => setDeficitText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-loss`} className={labelClass}>
              Weight to lose ({system === "imperial" ? "lb" : "kg"})
            </label>
            <input
              id={`${id}-loss`}
              type="number"
              inputMode="decimal"
              min={1}
              step={system === "imperial" ? "1" : "0.5"}
              className={inputClass}
              value={lossText}
              onChange={(e) => setLossText(e.target.value)}
            />
          </div>
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated timeline
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="deficit-weeks">
              {Number.isFinite(result.weeks) ? formatNumber(result.weeks) : "—"}{" "}
              <span className="text-lg font-medium text-muted">weeks</span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              At a {formatNumber(result.dailyDeficitKcal)} kcal daily deficit we
              estimate around{" "}
              {system === "imperial"
                ? `${formatNumber(kgToLb(result.weekly), 1)} lb`
                : `${formatNumber(result.weekly, 2)} kg`}{" "}
              lost per week, reaching your{" "}
              {system === "imperial"
                ? `${formatNumber(kgToLb(result.targetLossKg))} lb`
                : `${formatNumber(result.targetLossKg, 1)} kg`}{" "}
              goal in roughly {formatNumber(result.weeks)} weeks. This uses the
              7,700 kcal ≈ 1 kg heuristic, which becomes optimistic over long
              periods as your body adapts — treat later weeks as a best case
              and recalculate as you go.
            </p>
            {result.overCap ? (
              <p className={warningClass} role="alert">
                This deficit is more than 25% of your TDEE — beyond what we
                recommend. Consider {formatNumber(result.cap)} kcal/day or
                less: slower, but far more sustainable and muscle-sparing.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter your TDEE, a daily deficit (100–2,000 kcal) and a goal to see
            an estimated timeline. If you don&rsquo;t know your TDEE, start
            with our TDEE calculator.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
