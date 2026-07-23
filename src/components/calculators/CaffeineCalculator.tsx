"use client";

import { useId, useMemo, useState } from "react";
import { caffeineRemaining, hoursToThreshold } from "@/lib/formulas/caffeine";
import {
  CAFFEINE_DEFAULTS,
  CAFFEINE_LIMITS,
} from "@/registry/configs/caffeine-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const CHART_W = 560;
const CHART_H = 180;
const HOURS = 24;

export function CaffeineCalculator() {
  const id = useId();
  const [doseText, setDoseText] = useState(String(CAFFEINE_DEFAULTS.doseMg));
  const [halfLife, setHalfLife] = useState<number>(CAFFEINE_DEFAULTS.halfLifeH);
  const [thresholdText, setThresholdText] = useState(String(CAFFEINE_DEFAULTS.thresholdMg));

  const result = useMemo(() => {
    const doseMg = Number(doseText);
    const thresholdMg = Number(thresholdText);
    const valid =
      inRange(doseMg, CAFFEINE_LIMITS.doseMg) &&
      inRange(halfLife, CAFFEINE_LIMITS.halfLifeH) &&
      inRange(thresholdMg, CAFFEINE_LIMITS.thresholdMg);
    if (!valid) return null;
    const points = Array.from({ length: HOURS * 2 + 1 }, (_, i) => {
      const t = i / 2;
      return { t, mg: caffeineRemaining(doseMg, t, halfLife) };
    });
    return {
      doseMg,
      thresholdMg,
      hours: hoursToThreshold(doseMg, thresholdMg, halfLife),
      points,
    };
  }, [doseText, halfLife, thresholdText]);

  return (
    <CalculatorShell>
      <form aria-label="Caffeine inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-dose`} className={labelClass}>Caffeine dose (mg)</label>
            <input
              id={`${id}-dose`}
              type="number"
              inputMode="numeric"
              min={10}
              max={1000}
              step="10"
              className={inputClass}
              value={doseText}
              onChange={(e) => setDoseText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-half`} className={labelClass}>
              Half-life: {halfLife.toFixed(1)} h
            </label>
            <input
              id={`${id}-half`}
              type="range"
              min={CAFFEINE_LIMITS.halfLifeH.min}
              max={CAFFEINE_LIMITS.halfLifeH.max}
              step="0.5"
              className="mt-3 w-full accent-[var(--primary)]"
              value={halfLife}
              onChange={(e) => setHalfLife(Number(e.target.value))}
            />
            <p className="text-xs text-muted">Average ≈ 5 h; varies 1.5 to 9.5 h</p>
          </div>
          <div>
            <label htmlFor={`${id}-threshold`} className={labelClass}>Sleep threshold (mg)</label>
            <input
              id={`${id}-threshold`}
              type="number"
              inputMode="numeric"
              min={10}
              max={200}
              step="5"
              className={inputClass}
              value={thresholdText}
              onChange={(e) => setThresholdText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Time until below your threshold
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="caffeine-threshold">
              {formatNumber(result.hours, 1)}{" "}
              <span className="text-lg font-medium text-muted">hours</span>
            </p>
            {/* Fixed-dimension inline SVG (zero CLS, no chart library). */}
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              role="img"
              aria-label={`Chart of caffeine remaining over ${HOURS} hours`}
              className="mt-4 h-auto w-full max-w-xl"
            >
              <line x1="36" y1={CHART_H - 20} x2={CHART_W - 8} y2={CHART_H - 20} stroke="var(--border)" />
              <line x1="36" y1="8" x2="36" y2={CHART_H - 20} stroke="var(--border)" />
              {[0, 6, 12, 18, 24].map((h) => (
                <text
                  key={h}
                  x={36 + (h / HOURS) * (CHART_W - 52)}
                  y={CHART_H - 6}
                  fontSize="10"
                  fill="var(--muted)"
                  textAnchor="middle"
                >
                  {h}h
                </text>
              ))}
              <text x="4" y="14" fontSize="10" fill="var(--muted)">
                {formatNumber(result.doseMg)}mg
              </text>
              <line
                x1="36"
                y1={8 + (1 - result.thresholdMg / result.doseMg) * (CHART_H - 28)}
                x2={CHART_W - 8}
                y2={8 + (1 - result.thresholdMg / result.doseMg) * (CHART_H - 28)}
                stroke="var(--warning-border)"
                strokeDasharray="4 3"
              />
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2"
                points={result.points
                  .map(({ t, mg }) => {
                    const x = 36 + (t / HOURS) * (CHART_W - 52);
                    const y = 8 + (1 - mg / result.doseMg) * (CHART_H - 28);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(" ")}
              />
            </svg>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Dashed line = your {formatNumber(result.thresholdMg)} mg
              threshold. Half-life varies hugely between people. Genetics,
              pregnancy, smoking and some medications all shift it.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter a dose, half-life and threshold to see the decay curve.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
