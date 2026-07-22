"use client";

import { useId, useMemo, useState } from "react";
import { boerLeanBodyMass } from "@/lib/formulas/body-composition";
import { type Sex, fatFreeMassKg } from "@/lib/formulas/energy";
import { kgToLb } from "@/lib/units";
import { LBM_DEFAULTS, LBM_LIMITS } from "@/registry/configs/lean-body-mass-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { HeightField, UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function LbmCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [sex, setSex] = useState<Sex>("male");
  const [weightKg, setWeightKg] = useState<number>(LBM_DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState<number>(LBM_DEFAULTS.heightCm);
  const [bodyFatText, setBodyFatText] = useState("");

  const result = useMemo(() => {
    const bodyFatPercent = bodyFatText.trim() === "" ? undefined : Number(bodyFatText);
    const valid =
      inRange(weightKg, LBM_LIMITS.weightKg) &&
      inRange(heightCm, LBM_LIMITS.heightCm) &&
      (bodyFatPercent === undefined || inRange(bodyFatPercent, LBM_LIMITS.bodyFatPercent));
    if (!valid) return null;
    if (bodyFatPercent !== undefined) {
      return { lbm: fatFreeMassKg(weightKg, bodyFatPercent), method: "your body-fat measurement" };
    }
    return { lbm: boerLeanBodyMass({ sex, weightKg, heightCm }), method: "the Boer formula" };
  }, [sex, weightKg, heightCm, bodyFatText]);

  const display = (kg: number) =>
    system === "imperial" ? `${formatNumber(kgToLb(kg), 1)} lb` : `${formatNumber(kg, 1)} kg`;

  return (
    <CalculatorShell>
      <form aria-label="Lean body mass inputs" onSubmit={(e) => e.preventDefault()}>
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
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
          <HeightField valueCm={heightCm} onChange={setHeightCm} system={system} />
          <div>
            <label htmlFor={`${id}-bf`} className={labelClass}>Body fat % (optional)</label>
            <input
              id={`${id}-bf`}
              type="number"
              inputMode="decimal"
              min={5}
              max={60}
              step="0.1"
              placeholder="If measured"
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
              Your estimated lean body mass
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="lbm-value">
              {display(result.lbm)}
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Estimated via {result.method}. That&rsquo;s{" "}
              {formatNumber((result.lbm / weightKg) * 100)}% of your bodyweight
              as muscle, bone, organs and water — an estimate, not a scan
              result.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter a valid weight and height to see your LBM.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
