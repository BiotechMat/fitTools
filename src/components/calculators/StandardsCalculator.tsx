"use client";

import { useId, useMemo, useState } from "react";
import { type Sex } from "@/lib/formulas/energy";
import { type LiftKey, classifyLift } from "@/lib/formulas/strength-standards";
import standards from "@/data/strength-standards.json";
import {
  STANDARDS_DEFAULTS,
  STANDARDS_LIMITS,
} from "@/registry/configs/strength-standards.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { UnitSystemToggle, WeightField, useUnitSystem } from "@/components/UnitInput";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const LIFT_LABELS: Record<LiftKey, string> = {
  backSquat: "Back squat",
  benchPress: "Bench press",
  deadlift: "Deadlift",
};

const LEVEL_LABELS: Record<string, string> = standards.levelLabels;

export function StandardsCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();
  const [sex, setSex] = useState<Sex>("male");
  const [bodyweightKg, setBodyweightKg] = useState<number>(STANDARDS_DEFAULTS.bodyweightKg);
  const [lift, setLift] = useState<LiftKey>("backSquat");
  const [oneRmText, setOneRmText] = useState(String(STANDARDS_DEFAULTS.oneRepMaxKg));

  const result = useMemo(() => {
    const oneRepMaxKg = Number(oneRmText);
    const valid =
      inRange(bodyweightKg, STANDARDS_LIMITS.bodyweightKg) &&
      inRange(oneRepMaxKg, STANDARDS_LIMITS.oneRepMaxKg);
    if (!valid) return null;
    return classifyLift(lift, sex, bodyweightKg, oneRepMaxKg);
  }, [sex, bodyweightKg, lift, oneRmText]);

  return (
    <CalculatorShell>
      <form aria-label="Strength standards inputs" onSubmit={(e) => e.preventDefault()}>
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
          <div>
            <label htmlFor={`${id}-lift`} className={labelClass}>Lift</label>
            <select
              id={`${id}-lift`}
              className={inputClass}
              value={lift}
              onChange={(e) => {
                const value = e.target.value;
                if (value in standards.lifts) {
                  setLift(value as LiftKey); // narrowed by the `in` guard
                }
              }}
            >
              {Object.entries(LIFT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <WeightField valueKg={bodyweightKg} onChange={setBodyweightKg} system={system} />
          <div>
            <label htmlFor={`${id}-max`} className={labelClass}>Your 1RM (kg)</label>
            <input
              id={`${id}-max`}
              type="number"
              inputMode="decimal"
              min={1}
              max={500}
              step="2.5"
              className={inputClass}
              value={oneRmText}
              onChange={(e) => setOneRmText(e.target.value)}
            />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your {LIFT_LABELS[lift].toLowerCase()} level
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong capitalize" data-testid="standard-level">
              {LEVEL_LABELS[result.level] ?? result.level}
            </p>
            {result.nextLevel && result.nextThresholdKg !== null ? (
              <p className="mt-1 text-sm">
                Next level ({LEVEL_LABELS[result.nextLevel]}):{" "}
                <span className="font-semibold">{formatNumber(result.nextThresholdKg, 1)} kg</span>
              </p>
            ) : null}
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Thresholds at your bodyweight</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 font-semibold">Level</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {standards.levels.map((level, i) => (
                  <tr key={level} className="border-b border-border last:border-0">
                    <td className="py-1.5">{LEVEL_LABELS[level]}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {formatNumber(result.thresholds[i], 1)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Kilgore standards, age band 20–29 — expectations of training
              progression, not population averages. Thresholds interpolate
              between the published bodyweight rows.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter your bodyweight (40–200 kg) and 1RM to see your level.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
