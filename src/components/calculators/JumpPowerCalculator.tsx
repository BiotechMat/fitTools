"use client";

import { useId, useMemo, useState } from "react";
import { lewisAveragePowerW, sayersPeakPowerW } from "@/lib/formulas/jump-power";
import {
  JUMP_DEFAULTS,
  JUMP_LIMITS,
} from "@/registry/configs/vertical-jump-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function JumpPowerCalculator() {
  const id = useId();
  const [jumpText, setJumpText] = useState(String(JUMP_DEFAULTS.jumpCm));
  const [massText, setMassText] = useState(String(JUMP_DEFAULTS.massKg));

  const result = useMemo(() => {
    const jumpCm = Number(jumpText);
    const massKg = Number(massText);
    const valid =
      inRange(jumpCm, JUMP_LIMITS.jumpCm) && inRange(massKg, JUMP_LIMITS.massKg);
    if (!valid) return null;
    return {
      peakW: sayersPeakPowerW(jumpCm, massKg),
      averageW: lewisAveragePowerW(jumpCm, massKg),
    };
  }, [jumpText, massText]);

  return (
    <CalculatorShell>
      <form aria-label="Vertical jump inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-jump`} className={labelClass}>Vertical jump (cm)</label>
            <input
              id={`${id}-jump`}
              type="number"
              inputMode="decimal"
              min={JUMP_LIMITS.jumpCm.min}
              max={JUMP_LIMITS.jumpCm.max}
              step="0.5"
              className={inputClass}
              value={jumpText}
              onChange={(e) => setJumpText(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">Jump-and-reach: best of three.</p>
          </div>
          <div>
            <label htmlFor={`${id}-mass`} className={labelClass}>Body mass (kg)</label>
            <input
              id={`${id}-mass`}
              type="number"
              inputMode="decimal"
              min={JUMP_LIMITS.massKg.min}
              max={JUMP_LIMITS.massKg.max}
              step="0.5"
              className={inputClass}
              value={massText}
              onChange={(e) => setMassText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Peak power (Sayers)
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="jump-peak">
              {formatNumber(result.peakW)}{" "}
              <span className="text-lg font-medium text-muted">W</span>
            </p>
            <dl className="mt-4 text-sm">
              <div className="flex items-baseline justify-between gap-4 border-t border-border py-2">
                <dt className="text-muted">Average power (Lewis)</dt>
                <dd className="font-semibold" data-testid="jump-average">
                  {formatNumber(result.averageW)} W
                </dd>
              </div>
            </dl>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Peak and average are different quantities, peak is the highest
              instant of the drive, average the whole push-off. Track each
              against itself.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter jump height and body mass to see your power.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
