"use client";

import { useId, useMemo, useState } from "react";
import { adjustedFfmi, ffmi } from "@/lib/formulas/body-composition";
import { fatFreeMassKg } from "@/lib/formulas/energy";
import { FFMI_DEFAULTS, FFMI_LIMITS } from "@/registry/configs/ffmi-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HeightField, UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function FfmiCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [weightKg, setWeightKg] = useState<number>(FFMI_DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState<number>(FFMI_DEFAULTS.heightCm);
  const [bodyFatText, setBodyFatText] = useState(String(FFMI_DEFAULTS.bodyFatPercent));

  const result = useMemo(() => {
    const bodyFatPercent = Number(bodyFatText);
    const valid =
      inRange(weightKg, FFMI_LIMITS.weightKg) &&
      inRange(heightCm, FFMI_LIMITS.heightCm) &&
      inRange(bodyFatPercent, FFMI_LIMITS.bodyFatPercent);
    if (!valid) return null;
    const ffm = fatFreeMassKg(weightKg, bodyFatPercent);
    return { ffm, ffmi: ffmi(ffm, heightCm), adjusted: adjustedFfmi(ffm, heightCm) };
  }, [weightKg, heightCm, bodyFatText]);

  return (
    <CalculatorShell>
      <form aria-label="FFMI inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-end">
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
          <HeightField valueCm={heightCm} onChange={setHeightCm} system={system} />
          <div>
            <label htmlFor={`${id}-bf`} className={labelClass}>Body fat (%)</label>
            <input
              id={`${id}-bf`}
              type="number"
              inputMode="decimal"
              min={5}
              max={60}
              step="0.1"
              className={inputClass}
              value={bodyFatText}
              onChange={(e) => setBodyFatText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your fat-free mass index
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="ffmi-value">
              {formatNumber(result.ffmi, 1)}
            </p>
            <p className="mt-1 text-sm">
              Height-adjusted:{" "}
              <span className="font-semibold" data-testid="ffmi-adjusted">
                {formatNumber(result.adjusted, 1)}
              </span>{" "}
              · fat-free mass {formatNumber(result.ffm, 1)} kg
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Typical untrained men sit around 18 to 20; values above ~25 were
              rare among drug-free athletes in the original research. Accuracy
              depends entirely on your body-fat estimate.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter weight, height and body-fat percentage to see your FFMI.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
