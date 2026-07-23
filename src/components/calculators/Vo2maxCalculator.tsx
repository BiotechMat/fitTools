"use client";

import { useId, useMemo, useState } from "react";
import { type Sex } from "@/lib/formulas/energy";
import {
  cooperVo2max,
  heartRateRatioVo2max,
  rockportVo2max,
} from "@/lib/formulas/vo2max";
import {
  VO2MAX_DEFAULTS,
  VO2MAX_LIMITS,
} from "@/registry/configs/vo2max-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

type Method = "cooper" | "rockport" | "hr-ratio";

const METHOD_LABELS: Record<Method, string> = {
  cooper: "Cooper 12-minute run",
  rockport: "Rockport 1-mile walk",
  "hr-ratio": "Resting & max heart rate",
};

export function Vo2maxCalculator() {
  const id = useId();
  const [method, setMethod] = useState<Method>(VO2MAX_DEFAULTS.method);
  const [sex, setSex] = useState<Sex>(VO2MAX_DEFAULTS.sex);
  const [distanceText, setDistanceText] = useState(String(VO2MAX_DEFAULTS.cooperDistanceM));
  const [ageText, setAgeText] = useState(String(VO2MAX_DEFAULTS.ageYears));
  const [weightText, setWeightText] = useState(String(VO2MAX_DEFAULTS.weightKg));
  const [walkTimeText, setWalkTimeText] = useState(String(VO2MAX_DEFAULTS.walkTimeMin));
  const [walkHrText, setWalkHrText] = useState(String(VO2MAX_DEFAULTS.walkHeartRateBpm));
  const [hrMaxText, setHrMaxText] = useState(String(VO2MAX_DEFAULTS.hrMaxBpm));
  const [hrRestText, setHrRestText] = useState(String(VO2MAX_DEFAULTS.hrRestBpm));

  const result = useMemo(() => {
    if (method === "cooper") {
      const distanceM = Number(distanceText);
      if (!inRange(distanceM, VO2MAX_LIMITS.cooperDistanceM)) return null;
      return { vo2max: cooperVo2max(distanceM) };
    }
    if (method === "rockport") {
      const ageYears = Number(ageText);
      const weightKg = Number(weightText);
      const walkTimeMin = Number(walkTimeText);
      const heartRateBpm = Number(walkHrText);
      const valid =
        inRange(ageYears, VO2MAX_LIMITS.ageYears) &&
        inRange(weightKg, VO2MAX_LIMITS.weightKg) &&
        inRange(walkTimeMin, VO2MAX_LIMITS.walkTimeMin) &&
        inRange(heartRateBpm, VO2MAX_LIMITS.walkHeartRateBpm);
      if (!valid) return null;
      return {
        vo2max: rockportVo2max({ sex, ageYears, weightKg, walkTimeMin, heartRateBpm }),
      };
    }
    const hrMax = Number(hrMaxText);
    const hrRest = Number(hrRestText);
    const valid =
      inRange(hrMax, VO2MAX_LIMITS.hrMaxBpm) && inRange(hrRest, VO2MAX_LIMITS.hrRestBpm);
    if (!valid) return null;
    return { vo2max: heartRateRatioVo2max(hrMax, hrRest) };
  }, [method, sex, distanceText, ageText, weightText, walkTimeText, walkHrText, hrMaxText, hrRestText]);

  return (
    <CalculatorShell>
      <form aria-label="VO2max inputs" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor={`${id}-method`} className={labelClass}>Test method</label>
          <select
            id={`${id}-method`}
            className={inputClass}
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
          >
            {(Object.keys(METHOD_LABELS) as Method[]).map((key) => (
              <option key={key} value={key}>
                {METHOD_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        {method === "cooper" ? (
          <div className="mt-3">
            <label htmlFor={`${id}-distance`} className={labelClass}>
              Distance covered in 12 minutes (m)
            </label>
            <input
              id={`${id}-distance`}
              type="number"
              inputMode="numeric"
              min={VO2MAX_LIMITS.cooperDistanceM.min}
              max={VO2MAX_LIMITS.cooperDistanceM.max}
              step="10"
              className={inputClass}
              value={distanceText}
              onChange={(e) => setDistanceText(e.target.value)}
            />
          </div>
        ) : null}

        {method === "rockport" ? (
          <>
            <fieldset className="mt-3 flex gap-4">
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
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`${id}-age`} className={labelClass}>Age (years)</label>
                <input
                  id={`${id}-age`}
                  type="number"
                  inputMode="numeric"
                  className={inputClass}
                  value={ageText}
                  onChange={(e) => setAgeText(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${id}-weight`} className={labelClass}>Weight (kg)</label>
                <input
                  id={`${id}-weight`}
                  type="number"
                  inputMode="decimal"
                  className={inputClass}
                  value={weightText}
                  onChange={(e) => setWeightText(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${id}-walk-time`} className={labelClass}>1-mile walk time (min)</label>
                <input
                  id={`${id}-walk-time`}
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  className={inputClass}
                  value={walkTimeText}
                  onChange={(e) => setWalkTimeText(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`${id}-walk-hr`} className={labelClass}>Finish heart rate (bpm)</label>
                <input
                  id={`${id}-walk-hr`}
                  type="number"
                  inputMode="numeric"
                  className={inputClass}
                  value={walkHrText}
                  onChange={(e) => setWalkHrText(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : null}

        {method === "hr-ratio" ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-hrmax`} className={labelClass}>Max heart rate (bpm)</label>
              <input
                id={`${id}-hrmax`}
                type="number"
                inputMode="numeric"
                className={inputClass}
                value={hrMaxText}
                onChange={(e) => setHrMaxText(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">A measured max beats an age formula.</p>
            </div>
            <div>
              <label htmlFor={`${id}-hrrest`} className={labelClass}>Resting heart rate (bpm)</label>
              <input
                id={`${id}-hrrest`}
                type="number"
                inputMode="numeric"
                className={inputClass}
                value={hrRestText}
                onChange={(e) => setHrRestText(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted">Measure on waking, before coffee.</p>
            </div>
          </div>
        ) : null}
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Estimated VO2max
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="vo2max-value">
              {formatNumber(result.vo2max, 1)}{" "}
              <span className="text-lg font-medium text-muted">ml/kg/min</span>
            </p>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Field estimates carry a few ml/kg/min of uncertainty — the trend
              across repeat tests of the <em>same</em> method is the number to
              watch.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Fill in the test values to see your estimate.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
