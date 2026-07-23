"use client";

import { useId, useMemo, useState } from "react";
import { type Sex } from "@/lib/formulas/energy";
import { waistToHipRatio, whrBand } from "@/lib/formulas/body-ratios";
import {
  WHR_DEFAULTS,
  WHR_LIMITS,
} from "@/registry/configs/waist-to-hip-ratio-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function WhrCalculator() {
  const id = useId();
  const [sex, setSex] = useState<Sex>(WHR_DEFAULTS.sex);
  const [waistText, setWaistText] = useState(String(WHR_DEFAULTS.waistCm));
  const [hipText, setHipText] = useState(String(WHR_DEFAULTS.hipCm));

  const result = useMemo(() => {
    const waistCm = Number(waistText);
    const hipCm = Number(hipText);
    const valid =
      inRange(waistCm, WHR_LIMITS.waistCm) && inRange(hipCm, WHR_LIMITS.hipCm);
    if (!valid) return null;
    const ratio = waistToHipRatio(waistCm, hipCm);
    return { ratio, band: whrBand(ratio, sex), cutoff: sex === "male" ? 0.9 : 0.85 };
  }, [sex, waistText, hipText]);

  return (
    <CalculatorShell>
      <form aria-label="Waist-to-hip inputs" onSubmit={(e) => e.preventDefault()}>
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
            <label htmlFor={`${id}-waist`} className={labelClass}>Waist (cm)</label>
            <input
              id={`${id}-waist`}
              type="number"
              inputMode="decimal"
              min={WHR_LIMITS.waistCm.min}
              max={WHR_LIMITS.waistCm.max}
              step="0.5"
              className={inputClass}
              value={waistText}
              onChange={(e) => setWaistText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-hip`} className={labelClass}>Hips (cm)</label>
            <input
              id={`${id}-hip`}
              type="number"
              inputMode="decimal"
              min={WHR_LIMITS.hipCm.min}
              max={WHR_LIMITS.hipCm.max}
              step="0.5"
              className={inputClass}
              value={hipText}
              onChange={(e) => setHipText(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">Widest point around the buttocks.</p>
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Waist-to-hip ratio
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="whr-value">
              {formatNumber(result.ratio, 2)}
            </p>
            <p className="mt-2 font-semibold" data-testid="whr-band">
              {result.band === "raised"
                ? `At or above the WHO cut-off (${result.cutoff.toFixed(2)}) — substantially increased metabolic risk`
                : `Below the WHO cut-off (${result.cutoff.toFixed(2)}) — lower risk from fat distribution`}
            </p>
            <p className="mt-3 max-w-prose text-sm text-muted">
              WHO cut-offs: ≥ 0.90 for men, ≥ 0.85 for women. A screening
              estimate of fat distribution, not a diagnosis.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter waist and hip measurements to see your ratio.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
