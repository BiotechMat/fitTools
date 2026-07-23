"use client";

import { useId, useMemo, useState } from "react";
import { phenotypicAge } from "@/lib/formulas/phenotypic-age";
import {
  PHENOAGE_DEFAULTS,
  PHENOAGE_LIMITS,
} from "@/registry/configs/phenotypic-age-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

type UnitMode = "si" | "us";

/** Convertible markers: canonical SI stored; display converts per unit mode. */
interface Convertible {
  key: "albuminGPerL" | "creatinineUmolPerL" | "glucoseMmolPerL" | "crpMgPerL";
  label: string;
  siUnit: string;
  usUnit: string;
  toDisplay: (si: number, mode: UnitMode) => number;
  toSi: (display: number, mode: UnitMode) => number;
  step: number;
}

const CONVERTIBLES: Convertible[] = [
  {
    key: "albuminGPerL",
    label: "Albumin",
    siUnit: "g/L",
    usUnit: "g/dL",
    toDisplay: (si, m) => (m === "us" ? si / 10 : si),
    toSi: (v, m) => (m === "us" ? v * 10 : v),
    step: 0.1,
  },
  {
    key: "creatinineUmolPerL",
    label: "Creatinine",
    siUnit: "µmol/L",
    usUnit: "mg/dL",
    toDisplay: (si, m) => (m === "us" ? si / 88.42 : si),
    toSi: (v, m) => (m === "us" ? v * 88.42 : v),
    step: 0.01,
  },
  {
    key: "glucoseMmolPerL",
    label: "Fasting glucose",
    siUnit: "mmol/L",
    usUnit: "mg/dL",
    toDisplay: (si, m) => (m === "us" ? si * 18.0182 : si),
    toSi: (v, m) => (m === "us" ? v / 18.0182 : v),
    step: 0.1,
  },
  {
    key: "crpMgPerL",
    label: "C-reactive protein",
    siUnit: "mg/L",
    usUnit: "mg/dL",
    toDisplay: (si, m) => (m === "us" ? si / 10 : si),
    toSi: (v, m) => (m === "us" ? v * 10 : v),
    step: 0.1,
  },
];

/** Same numeric value in US and SI — no conversion. */
const PLAIN: {
  key: "lymphocytePercent" | "mcvFl" | "rdwPercent" | "alpUPerL" | "wbc10e9PerL";
  label: string;
  unit: string;
  step: number;
}[] = [
  { key: "lymphocytePercent", label: "Lymphocytes", unit: "%", step: 0.1 },
  { key: "mcvFl", label: "MCV", unit: "fL", step: 0.1 },
  { key: "rdwPercent", label: "RDW", unit: "%", step: 0.1 },
  { key: "alpUPerL", label: "Alkaline phosphatase", unit: "U/L", step: 1 },
  { key: "wbc10e9PerL", label: "White blood cells", unit: "10⁹/L", step: 0.1 },
];

type SiValues = typeof PHENOAGE_DEFAULTS;

function roundDisplay(value: number): string {
  return String(Number(value.toFixed(3)));
}

export function PhenotypicAgeCalculator() {
  const id = useId();
  const [mode, setMode] = useState<UnitMode>("si");
  // Canonical SI values; convertible fields display in the current mode.
  const [si, setSi] = useState<SiValues>({ ...PHENOAGE_DEFAULTS });

  const result = useMemo(() => {
    const valid = (Object.keys(PHENOAGE_LIMITS) as (keyof SiValues)[]).every(
      (key) => inRange(si[key], PHENOAGE_LIMITS[key]),
    );
    if (!valid) return null;
    return phenotypicAge(si);
  }, [si]);

  const update = (key: keyof SiValues, value: number) =>
    setSi((current) => ({ ...current, [key]: value }));

  const younger = result ? result.deltaYears < 0 : false;

  return (
    <CalculatorShell>
      <form aria-label="Phenotypic age inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <label htmlFor={`${id}-age`} className={labelClass}>
              Age (years)
            </label>
            <input
              id={`${id}-age`}
              type="number"
              inputMode="numeric"
              min={PHENOAGE_LIMITS.ageYears.min}
              max={PHENOAGE_LIMITS.ageYears.max}
              className={`${inputClass} w-28`}
              value={roundDisplay(si.ageYears)}
              onChange={(e) => update("ageYears", Number(e.target.value))}
            />
          </div>
          <fieldset className="flex items-center gap-1 self-end rounded-lg border border-border bg-background p-1 text-sm">
            <legend className="sr-only">Unit system</legend>
            {(["si", "us"] as const).map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-md px-3 py-1 font-medium ${
                  mode === option ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-mode`}
                  value={option}
                  checked={mode === option}
                  onChange={() => setMode(option)}
                  className="sr-only"
                />
                {option === "si" ? "SI (UK)" : "US"}
              </label>
            ))}
          </fieldset>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CONVERTIBLES.map((marker) => {
            const unit = mode === "us" ? marker.usUnit : marker.siUnit;
            return (
              <div key={marker.key}>
                <label htmlFor={`${id}-${marker.key}`} className={labelClass}>
                  {marker.label} ({unit})
                </label>
                <input
                  id={`${id}-${marker.key}`}
                  type="number"
                  inputMode="decimal"
                  step={marker.step}
                  className={inputClass}
                  value={roundDisplay(marker.toDisplay(si[marker.key], mode))}
                  onChange={(e) =>
                    update(marker.key, marker.toSi(Number(e.target.value), mode))
                  }
                />
              </div>
            );
          })}
          {PLAIN.map((marker) => (
            <div key={marker.key}>
              <label htmlFor={`${id}-${marker.key}`} className={labelClass}>
                {marker.label} ({marker.unit})
              </label>
              <input
                id={`${id}-${marker.key}`}
                type="number"
                inputMode="decimal"
                step={marker.step}
                className={inputClass}
                value={roundDisplay(si[marker.key])}
                onChange={(e) => update(marker.key, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated phenotypic age
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="phenoage-value">
              {formatNumber(result.phenotypicAge, 1)}{" "}
              <span className="text-lg font-medium text-muted">years</span>
            </p>
            <p className="mt-1 text-lg" data-testid="phenoage-delta">
              That&rsquo;s{" "}
              <span className="font-semibold">
                {formatNumber(Math.abs(result.deltaYears), 1)} years{" "}
                {younger ? "younger" : "older"}
              </span>{" "}
              than your chronological age of {formatNumber(si.ageYears)}.
            </p>
            <p className="mt-3 max-w-prose text-sm text-muted">
              This is a population-level association from the published Levine
              PhenoAge model, not a prediction about you and not a medical
              test. A single blood panel is a snapshot. Recent illness or
              inflammation can move it. Discuss what your results mean with
              your doctor.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter all nine blood markers and your age within their plausible
            ranges to see your estimate.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
