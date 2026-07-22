"use client";

import { useId, useMemo, useState } from "react";
import type { Sex } from "@/lib/formulas/energy";
import { PACE_OF_AGING_VERSION, paceOfAgingIndex } from "@/lib/composite/pace-of-aging";
import { POA_DEFAULTS, POA_LIMITS } from "@/registry/configs/pace-of-aging-index.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { IndexResultPanel } from "@/components/composite/IndexResultPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const REQUIRED: { key: keyof typeof POA_LIMITS; label: string; step: number }[] = [
  { key: "waistCm", label: "Waist (cm)", step: 0.5 },
  { key: "heightCm", label: "Height (cm)", step: 0.5 },
  { key: "mvpaMinPerWeek", label: "Activity (min/week)", step: 5 },
  { key: "sleepHours", label: "Sleep (hours/night)", step: 0.25 },
  { key: "restingHr", label: "Resting HR (bpm)", step: 1 },
  { key: "alcoholUnitsPerWeek", label: "Alcohol (units/week)", step: 1 },
];

const OPTIONAL: { key: "vo2max" | "gripKg" | "hrvMs"; label: string; step: number }[] = [
  { key: "vo2max", label: "VO₂max (optional)", step: 0.5 },
  { key: "gripKg", label: "Grip strength kg (optional)", step: 0.5 },
  { key: "hrvMs", label: "HRV ms (optional)", step: 1 },
];

export function PaceOfAgingCalculator() {
  const id = useId();
  const [sex, setSex] = useState<Sex>(POA_DEFAULTS.sex);
  const [smoker, setSmoker] = useState<boolean>(POA_DEFAULTS.currentSmoker);
  const [req, setReq] = useState<Record<string, number>>({
    waistCm: POA_DEFAULTS.waistCm,
    heightCm: POA_DEFAULTS.heightCm,
    mvpaMinPerWeek: POA_DEFAULTS.mvpaMinPerWeek,
    sleepHours: POA_DEFAULTS.sleepHours,
    restingHr: POA_DEFAULTS.restingHr,
    alcoholUnitsPerWeek: POA_DEFAULTS.alcoholUnitsPerWeek,
  });
  const [opt, setOpt] = useState<Record<string, string>>({ vo2max: "", gripKg: "", hrvMs: "" });

  const result = useMemo(() => {
    const reqValid = REQUIRED.every(({ key }) => inRange(req[key], POA_LIMITS[key]));
    if (!reqValid) return null;
    const parseOpt = (k: "vo2max" | "gripKg" | "hrvMs") => {
      if (opt[k].trim() === "") return null;
      const v = Number(opt[k]);
      return inRange(v, POA_LIMITS[k]) ? v : undefined; // undefined = invalid
    };
    const vo2max = parseOpt("vo2max");
    const gripKg = parseOpt("gripKg");
    const hrvMs = parseOpt("hrvMs");
    if (vo2max === undefined || gripKg === undefined || hrvMs === undefined) return null;
    return paceOfAgingIndex({
      sex,
      waistToHeight: req.waistCm / req.heightCm,
      mvpaMinPerWeek: req.mvpaMinPerWeek,
      sleepHours: req.sleepHours,
      restingHr: req.restingHr,
      currentSmoker: smoker,
      alcoholUnitsPerWeek: req.alcoholUnitsPerWeek,
      vo2max,
      gripKg,
      hrvMs,
    });
  }, [sex, smoker, req, opt]);

  return (
    <CalculatorShell>
      <form aria-label="Pace of aging inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center gap-4">
          <fieldset className="flex gap-4">
            <legend className="sr-only">Sex</legend>
            {(["male", "female"] as const).map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm font-medium">
                <input type="radio" name={`${id}-sex`} checked={sex === o} onChange={() => setSex(o)} className="accent-[var(--primary)]" />
                {o === "male" ? "Male" : "Female"}
              </label>
            ))}
          </fieldset>
          <label className="flex items-center gap-1.5 text-sm font-medium">
            <input type="checkbox" checked={smoker} onChange={(e) => setSmoker(e.target.checked)} className="accent-[var(--primary)]" />
            Current smoker
          </label>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {REQUIRED.map(({ key, label, step }) => (
            <div key={key}>
              <label htmlFor={`${id}-${key}`} className={labelClass}>{label}</label>
              <input id={`${id}-${key}`} type="number" inputMode="decimal" step={step} min={POA_LIMITS[key].min} max={POA_LIMITS[key].max} className={inputClass} value={req[key]} onChange={(e) => setReq((v) => ({ ...v, [key]: Number(e.target.value) }))} />
            </div>
          ))}
          {OPTIONAL.map(({ key, label, step }) => (
            <div key={key}>
              <label htmlFor={`${id}-${key}`} className={labelClass}>{label}</label>
              <input id={`${id}-${key}`} type="number" inputMode="decimal" step={step} placeholder="skip if unknown" className={inputClass} value={opt[key]} onChange={(e) => setOpt((v) => ({ ...v, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <IndexResultPanel
            result={result}
            version={PACE_OF_AGING_VERSION}
            scoreLabel="Pace of Aging Index"
            paceLabel="Pace"
            paceValue={formatNumber(result.pace, 2)}
            whatItIs="A transparent lifestyle-trajectory score from modifiable habits and simple measures, with every weight and mapping published. Best read as a set of levers to work on."
            whatItIsnt="A biological age, a medical test, or a prediction. It cannot tell you how you're ageing at a cellular level, and it isn't validated against health outcomes."
          />
        ) : (
          <p className="text-sm text-muted">
            Fill in the required fields within their ranges to see your index.
            The three optional inputs (VO₂max, grip, HRV) refine it if you have
            them.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
