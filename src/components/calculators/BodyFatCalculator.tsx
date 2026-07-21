"use client";

import { useId, useMemo, useState } from "react";
import { navyBodyFatPercent } from "@/lib/formulas/body-fat";
import type { Sex } from "@/lib/formulas/energy";
import {
  BODY_FAT_DEFAULTS,
  BODY_FAT_ERROR_BAND_PP,
  BODY_FAT_LIMITS,
} from "@/registry/configs/body-fat-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import {
  HeightField,
  LengthField,
  UnitSystemToggle,
  useUnitSystem,
} from "@/components/UnitInput";
import { formatNumber } from "@/components/calculators/styles";

export function BodyFatCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [sex, setSex] = useState<Sex>("male");
  const [heightCm, setHeightCm] = useState<number>(BODY_FAT_DEFAULTS.heightCm);
  const [neckCm, setNeckCm] = useState<number>(BODY_FAT_DEFAULTS.neckCm);
  const [waistCm, setWaistCm] = useState<number>(BODY_FAT_DEFAULTS.waistCm);
  const [hipCm, setHipCm] = useState<number>(BODY_FAT_DEFAULTS.hipCm);

  const result = useMemo(() => {
    const valid =
      inRange(heightCm, BODY_FAT_LIMITS.heightCm) &&
      inRange(neckCm, BODY_FAT_LIMITS.neckCm) &&
      inRange(waistCm, BODY_FAT_LIMITS.waistCm) &&
      (sex === "male" || inRange(hipCm, BODY_FAT_LIMITS.hipCm));
    if (!valid) return null;
    try {
      return {
        percent: navyBodyFatPercent({
          sex,
          heightCm,
          neckCm,
          waistCm,
          hipCm: sex === "female" ? hipCm : undefined,
        }),
      };
    } catch {
      // Log-argument guard tripped (e.g. waist ≤ neck).
      return null;
    }
  }, [sex, heightCm, neckCm, waistCm, hipCm]);

  return (
    <CalculatorShell>
      <form aria-label="Body fat inputs" onSubmit={(e) => e.preventDefault()}>
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
          <LengthField
            label="Neck"
            valueCm={neckCm}
            onChange={setNeckCm}
            system={system}
          />
          <LengthField
            label="Waist"
            valueCm={waistCm}
            onChange={setWaistCm}
            system={system}
          />
          {sex === "female" ? (
            <LengthField
              label="Hips"
              valueCm={hipCm}
              onChange={setHipCm}
              system={system}
            />
          ) : null}
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated body fat
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="body-fat-value">
              {formatNumber(result.percent, 1)}%
            </p>
            <p className="mt-1 text-sm font-medium">
              Realistic range: about{" "}
              {formatNumber(Math.max(2, result.percent - 3.5), 1)}% –{" "}
              {formatNumber(result.percent + 3.5, 1)}%
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              The US Navy circumference method carries a {BODY_FAT_ERROR_BAND_PP}{" "}
              percentage-point error band against laboratory methods, so treat
              the single figure as the centre of the range above. Measured
              consistently, it tracks change over time well — that trend is the
              useful number.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {waistCm <= neckCm && sex === "male"
              ? "Waist must measure larger than neck — please check both tape measurements."
              : "Enter your height and tape measurements to estimate body fat. Women also need a hip measurement."}
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
