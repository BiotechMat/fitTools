"use client";

import { useId, useMemo, useState } from "react";
import { doubleProgression } from "@/lib/formulas/progression";
import {
  PROGRESSION_DEFAULTS,
  PROGRESSION_LIMITS,
} from "@/registry/configs/double-progression-planner.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function ProgressionCalculator() {
  const id = useId();
  const [minText, setMinText] = useState(String(PROGRESSION_DEFAULTS.repRangeMin));
  const [maxText, setMaxText] = useState(String(PROGRESSION_DEFAULTS.repRangeMax));
  const [loadText, setLoadText] = useState(String(PROGRESSION_DEFAULTS.currentLoadKg));
  const [incText, setIncText] = useState(String(PROGRESSION_DEFAULTS.incrementKg));
  const [repsText, setRepsText] = useState("8, 8, 8");

  const result = useMemo(() => {
    const repRangeMin = Number(minText);
    const repRangeMax = Number(maxText);
    const currentLoadKg = Number(loadText);
    const incrementKg = Number(incText);
    const achievedReps = repsText
      .split(/[,\s]+/)
      .filter(Boolean)
      .map(Number);
    const valid =
      inRange(repRangeMin, PROGRESSION_LIMITS.repRangeMin) &&
      inRange(repRangeMax, PROGRESSION_LIMITS.repRangeMax) &&
      repRangeMax > repRangeMin &&
      inRange(currentLoadKg, PROGRESSION_LIMITS.currentLoadKg) &&
      inRange(incrementKg, PROGRESSION_LIMITS.incrementKg) &&
      achievedReps.length > 0 &&
      achievedReps.every((r) => Number.isInteger(r) && r >= 0 && r <= 50);
    if (!valid) return null;
    return doubleProgression({ repRangeMin, repRangeMax, currentLoadKg, incrementKg, achievedReps });
  }, [minText, maxText, loadText, incText, repsText]);

  return (
    <CalculatorShell>
      <form aria-label="Double progression inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label htmlFor={`${id}-min`} className={labelClass}>Rep range from</label>
            <input id={`${id}-min`} type="number" inputMode="numeric" min={1} max={20} className={inputClass} value={minText} onChange={(e) => setMinText(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-max`} className={labelClass}>to</label>
            <input id={`${id}-max`} type="number" inputMode="numeric" min={2} max={30} className={inputClass} value={maxText} onChange={(e) => setMaxText(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-load`} className={labelClass}>Current load (kg)</label>
            <input id={`${id}-load`} type="number" inputMode="decimal" step="0.5" className={inputClass} value={loadText} onChange={(e) => setLoadText(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-inc`} className={labelClass}>Increment (kg)</label>
            <input id={`${id}-inc`} type="number" inputMode="decimal" step="0.5" className={inputClass} value={incText} onChange={(e) => setIncText(e.target.value)} />
          </div>
          <div className="col-span-2">
            <label htmlFor={`${id}-reps`} className={labelClass}>
              Reps achieved last session (per set, comma-separated)
            </label>
            <input
              id={`${id}-reps`}
              type="text"
              inputMode="numeric"
              placeholder="e.g. 8, 8, 7"
              className={inputClass}
              value={repsText}
              onChange={(e) => setRepsText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Next session
            </h2>
            <p className="mt-1 text-3xl font-bold text-primary-strong" data-testid="progression-next">
              {formatNumber(result.loadKg, 1)} kg × {result.targetReps}
              {result.progressed ? "" : "+"}
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              {result.progressed
                ? "Every set hit the top of the range. Add the increment and rebuild reps from the bottom."
                : "Repeat the load and chase the top of the range on every set. The weight goes up only when all sets get there."}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter your rep range, load, increment and last session&rsquo;s
            reps (e.g. &ldquo;8, 8, 7&rdquo;).
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
