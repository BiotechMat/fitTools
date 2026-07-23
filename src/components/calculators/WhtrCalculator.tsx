"use client";

import { useId, useMemo, useState } from "react";
import { type WhtrBand, waistToHeightRatio, whtrBand } from "@/lib/formulas/body-ratios";
import {
  WHTR_DEFAULTS,
  WHTR_LIMITS,
} from "@/registry/configs/waist-to-height-ratio-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const BAND_LABELS: Record<WhtrBand, string> = {
  low: "Below the typical range",
  healthy: "Healthy, waist under half your height",
  increased: "Increased risk, above the 0.5 boundary",
  high: "High risk, well above the boundary",
};

export function WhtrCalculator() {
  const id = useId();
  const [waistText, setWaistText] = useState(String(WHTR_DEFAULTS.waistCm));
  const [heightText, setHeightText] = useState(String(WHTR_DEFAULTS.heightCm));

  const result = useMemo(() => {
    const waistCm = Number(waistText);
    const heightCm = Number(heightText);
    const valid =
      inRange(waistCm, WHTR_LIMITS.waistCm) && inRange(heightCm, WHTR_LIMITS.heightCm);
    if (!valid) return null;
    const ratio = waistToHeightRatio(waistCm, heightCm);
    return { ratio, band: whtrBand(ratio) };
  }, [waistText, heightText]);

  return (
    <CalculatorShell>
      <form aria-label="Waist-to-height inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-waist`} className={labelClass}>Waist (cm)</label>
            <input
              id={`${id}-waist`}
              type="number"
              inputMode="decimal"
              min={WHTR_LIMITS.waistCm.min}
              max={WHTR_LIMITS.waistCm.max}
              step="0.5"
              className={inputClass}
              value={waistText}
              onChange={(e) => setWaistText(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">Midway between lowest rib and hip bone.</p>
          </div>
          <div>
            <label htmlFor={`${id}-height`} className={labelClass}>Height (cm)</label>
            <input
              id={`${id}-height`}
              type="number"
              inputMode="decimal"
              min={WHTR_LIMITS.heightCm.min}
              max={WHTR_LIMITS.heightCm.max}
              step="0.5"
              className={inputClass}
              value={heightText}
              onChange={(e) => setHeightText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Waist-to-height ratio
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="whtr-value">
              {formatNumber(result.ratio, 2)}
            </p>
            <p className="mt-2 font-semibold" data-testid="whtr-band">
              {BAND_LABELS[result.band]}
            </p>
            <p className="mt-3 max-w-prose text-sm text-muted">
              The evidence-based boundary is 0.5, keep your waist to less
              than half your height. This is a screening estimate, not a
              diagnosis.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter waist and height to see your ratio.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
