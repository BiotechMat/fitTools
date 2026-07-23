"use client";

import { useId, useMemo, useState } from "react";
import {
  METABOLIC_FITNESS_VERSION,
  metabolicFitnessIndex,
} from "@/lib/composite/metabolic-fitness";
import { MF_DEFAULTS, MF_LIMITS } from "@/registry/configs/metabolic-fitness-index.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { IndexResultPanel } from "@/components/composite/IndexResultPanel";
import { inputClass, labelClass } from "@/components/calculators/styles";

type Key = keyof typeof MF_DEFAULTS;

const FIELDS: { key: Key; label: string; step: number }[] = [
  { key: "timeInRangePercent", label: "Time in range (%)", step: 1 },
  { key: "cvPercent", label: "Glucose variability %CV", step: 0.1 },
  { key: "gmiPercent", label: "GMI (%)", step: 0.1 },
  { key: "waistCm", label: "Waist (cm)", step: 0.5 },
  { key: "heightCm", label: "Height (cm)", step: 0.5 },
  { key: "restingHr", label: "Resting HR (bpm)", step: 1 },
];

export function MetabolicFitnessCalculator() {
  const id = useId();
  const [values, setValues] = useState<Record<Key, number>>({ ...MF_DEFAULTS });

  const result = useMemo(() => {
    const valid = FIELDS.every(({ key }) => inRange(values[key], MF_LIMITS[key]));
    if (!valid) return null;
    return metabolicFitnessIndex({
      timeInRangePercent: values.timeInRangePercent,
      cvPercent: values.cvPercent,
      gmiPercent: values.gmiPercent,
      waistToHeight: values.waistCm / values.heightCm,
      restingHr: values.restingHr,
    });
  }, [values]);

  return (
    <CalculatorShell>
      <form aria-label="Metabolic fitness inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FIELDS.map(({ key, label, step }) => (
            <div key={key}>
              <label htmlFor={`${id}-${key}`} className={labelClass}>{label}</label>
              <input
                id={`${id}-${key}`}
                type="number"
                inputMode="decimal"
                step={step}
                min={MF_LIMITS[key].min}
                max={MF_LIMITS[key].max}
                className={inputClass}
                value={values[key]}
                onChange={(e) => setValues((v) => ({ ...v, [key]: Number(e.target.value) }))}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          Don&rsquo;t have CGM numbers? The CGM metrics calculator computes
          time in range, %CV and GMI from your readings.
        </p>
      </form>

      <ResultsPanel>
        {result ? (
          <IndexResultPanel
            result={result}
            version={METABOLIC_FITNESS_VERSION}
            scoreLabel="Metabolic Fitness Index"
            shareTool="metabolic-fitness-index"
            whatItIs="A transparent self-tracking score that summarises five metabolic markers into one number, with every weight and mapping published. Best used to watch your own trend over time."
            whatItIsnt="A diagnosis, a medical test, or a validated predictor of disease. It cannot tell you whether you have a metabolic condition — that is for a clinician and proper testing."
          />
        ) : (
          <p className="text-sm text-muted">
            Enter your five metabolic markers within their plausible ranges to
            see your index and full sub-score breakdown.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
