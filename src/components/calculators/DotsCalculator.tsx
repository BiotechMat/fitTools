"use client";

import { useId, useMemo, useState } from "react";
import { type Sex } from "@/lib/formulas/energy";
import {
  type GlEquipment,
  type GlEvent,
  dotsScore,
  ipfGlScore,
  wilksScore,
} from "@/lib/formulas/powerlifting";
import { DOTS_DEFAULTS, DOTS_LIMITS } from "@/registry/configs/dots-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

export function DotsCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [sex, setSex] = useState<Sex>("male");
  const [bodyweightKg, setBodyweightKg] = useState<number>(DOTS_DEFAULTS.bodyweightKg);
  const [totalText, setTotalText] = useState(String(DOTS_DEFAULTS.totalKg));
  const [event, setEvent] = useState<GlEvent>("sbd");
  const [equipment, setEquipment] = useState<GlEquipment>("raw");

  const result = useMemo(() => {
    const totalKg = Number(totalText);
    const valid =
      inRange(bodyweightKg, DOTS_LIMITS.bodyweightKg) &&
      inRange(totalKg, DOTS_LIMITS.totalKg);
    if (!valid) return null;
    return {
      dots: dotsScore(sex, bodyweightKg, totalKg),
      wilks: wilksScore(sex, bodyweightKg, totalKg),
      gl: ipfGlScore(sex, bodyweightKg, totalKg, event, equipment),
    };
  }, [sex, bodyweightKg, totalText, event, equipment]);

  return (
    <CalculatorShell>
      <form aria-label="Powerlifting score inputs" onSubmit={(e) => e.preventDefault()}>
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
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <WeightField valueKg={bodyweightKg} onChange={setBodyweightKg} system={system} />
          <div>
            <label htmlFor={`${id}-total`} className={labelClass}>Total (kg)</label>
            <input
              id={`${id}-total`}
              type="number"
              inputMode="decimal"
              min={1}
              max={1500}
              step="2.5"
              className={inputClass}
              value={totalText}
              onChange={(e) => setTotalText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-event`} className={labelClass}>Event (IPF GL)</label>
            <select
              id={`${id}-event`}
              className={inputClass}
              value={event}
              onChange={(e) => setEvent(e.target.value === "bench" ? "bench" : "sbd")}
            >
              <option value="sbd">Full power (SBD)</option>
              <option value="bench">Bench only</option>
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-equip`} className={labelClass}>Equipment (IPF GL)</label>
            <select
              id={`${id}-equip`}
              className={inputClass}
              value={equipment}
              onChange={(e) => setEquipment(e.target.value === "equipped" ? "equipped" : "raw")}
            >
              <option value="raw">Raw / classic</option>
              <option value="equipped">Equipped</option>
            </select>
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your scores
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="dots-value">
              {formatNumber(result.dots, 1)}{" "}
              <span className="text-lg font-medium text-muted">DOTS</span>
            </p>
            <p className="mt-1 text-lg">
              Wilks:{" "}
              <span className="font-semibold" data-testid="wilks-value">
                {formatNumber(result.wilks, 1)}
              </span>{" "}
              · IPF GL:{" "}
              <span className="font-semibold" data-testid="gl-value">
                {formatNumber(result.gl, 1)}
              </span>
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted">
              Official coefficients from the OpenPowerlifting codebase,
              regression-tested against real meet results. DOTS and Wilks are
              shown for a full-power total; the event and equipment settings
              apply to IPF GL points.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter bodyweight (35 to 210 kg) and total to see your scores.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
