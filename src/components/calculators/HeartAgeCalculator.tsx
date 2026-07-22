"use client";

import { useId, useMemo, useState } from "react";
import { heartAge, type Sex } from "@/lib/formulas/heart-age";
import {
  HEART_AGE_DEFAULTS,
  HEART_AGE_LIMITS,
} from "@/registry/configs/heart-age-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

type CholUnit = "mmol" | "mg";
const MG_PER_MMOL = 38.67; // cholesterol

interface State {
  sex: Sex;
  ageYears: number;
  totalCholMmol: number;
  hdlMmol: number;
  systolicBp: number;
  onBpMeds: boolean;
  onStatin: boolean;
  diabetes: boolean;
  currentSmoker: boolean;
  egfr: number;
  apoBmgDl: number | null;
  lpaNmol: number | null;
}

const INITIAL: State = { ...HEART_AGE_DEFAULTS, apoBmgDl: null, lpaNmol: null };

const TOGGLES: { key: "onBpMeds" | "onStatin" | "diabetes" | "currentSmoker"; label: string }[] = [
  { key: "onBpMeds", label: "On blood-pressure medication" },
  { key: "onStatin", label: "On a statin" },
  { key: "diabetes", label: "Diabetes" },
  { key: "currentSmoker", label: "Current smoker" },
];

function round(value: number, dp = 2): string {
  return String(Number(value.toFixed(dp)));
}

/** Lp(a) risk band, nmol/L (NLA 2024 focused update). Context only. */
function lpaBand(nmol: number): { label: string; tone: string } {
  if (nmol >= 125) return { label: "High risk (≥125 nmol/L)", tone: "text-foreground" };
  if (nmol >= 75) return { label: "Intermediate (75–125 nmol/L)", tone: "text-foreground" };
  return { label: "Lower risk (<75 nmol/L)", tone: "text-good" };
}

/** ApoB general reference band, mg/dL. Context only, not a treatment target. */
function apoBBand(mgDl: number): { label: string; tone: string } {
  if (mgDl >= 130) return { label: "High (≥130 mg/dL)", tone: "text-foreground" };
  if (mgDl >= 90) return { label: "Above desirable (90–129 mg/dL)", tone: "text-foreground" };
  return { label: "Desirable (<90 mg/dL)", tone: "text-good" };
}

export function HeartAgeCalculator() {
  const id = useId();
  const [cholUnit, setCholUnit] = useState<CholUnit>("mmol");
  const [s, setS] = useState<State>(INITIAL);

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setS((cur) => ({ ...cur, [key]: value }));

  const result = useMemo(() => {
    const numeric = { ...s };
    const valid =
      inRange(numeric.ageYears, HEART_AGE_LIMITS.ageYears) &&
      inRange(numeric.totalCholMmol, HEART_AGE_LIMITS.totalCholMmol) &&
      inRange(numeric.hdlMmol, HEART_AGE_LIMITS.hdlMmol) &&
      inRange(numeric.systolicBp, HEART_AGE_LIMITS.systolicBp) &&
      inRange(numeric.egfr, HEART_AGE_LIMITS.egfr) &&
      numeric.hdlMmol < numeric.totalCholMmol;
    if (!valid) return null;
    return heartAge({
      sex: s.sex,
      ageYears: s.ageYears,
      totalCholMmol: s.totalCholMmol,
      hdlMmol: s.hdlMmol,
      systolicBp: s.systolicBp,
      onBpMeds: s.onBpMeds,
      onStatin: s.onStatin,
      diabetes: s.diabetes,
      currentSmoker: s.currentSmoker,
      egfr: s.egfr,
    });
  }, [s]);

  const cholDisplay = (mmol: number) => (cholUnit === "mg" ? mmol * MG_PER_MMOL : mmol);
  const cholToMmol = (display: number) =>
    cholUnit === "mg" ? display / MG_PER_MMOL : display;
  const cholStep = cholUnit === "mg" ? 1 : 0.1;
  const cholUnitLabel = cholUnit === "mg" ? "mg/dL" : "mmol/L";

  const older = result ? result.deltaYears > 0 : false;
  const lpa = s.lpaNmol != null ? lpaBand(s.lpaNmol) : null;
  const apoB = s.apoBmgDl != null ? apoBBand(s.apoBmgDl) : null;

  return (
    <CalculatorShell>
      <form aria-label="Heart age inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <fieldset className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 text-sm">
            <legend className="sr-only">Sex</legend>
            {(["female", "male"] as const).map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-md px-3 py-1 font-medium capitalize ${
                  s.sex === option ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-sex`}
                  value={option}
                  checked={s.sex === option}
                  onChange={() => set("sex", option)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor={`${id}-age`} className={labelClass}>
              Age (30–79)
            </label>
            <input
              id={`${id}-age`}
              type="number"
              inputMode="numeric"
              min={HEART_AGE_LIMITS.ageYears.min}
              max={HEART_AGE_LIMITS.ageYears.max}
              className={`${inputClass} w-28`}
              value={round(s.ageYears, 0)}
              onChange={(e) => set("ageYears", Number(e.target.value))}
            />
          </div>
          <fieldset className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 text-sm">
            <legend className="sr-only">Cholesterol unit</legend>
            {(["mmol", "mg"] as const).map((option) => (
              <label
                key={option}
                className={`cursor-pointer rounded-md px-3 py-1 font-medium ${
                  cholUnit === option ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-cholunit`}
                  value={option}
                  checked={cholUnit === option}
                  onChange={() => setCholUnit(option)}
                  className="sr-only"
                />
                {option === "mg" ? "mg/dL" : "mmol/L"}
              </label>
            ))}
          </fieldset>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-tc`} className={labelClass}>
              Total cholesterol ({cholUnitLabel})
            </label>
            <input
              id={`${id}-tc`}
              type="number"
              inputMode="decimal"
              step={cholStep}
              className={inputClass}
              value={round(cholDisplay(s.totalCholMmol))}
              onChange={(e) => set("totalCholMmol", cholToMmol(Number(e.target.value)))}
            />
          </div>
          <div>
            <label htmlFor={`${id}-hdl`} className={labelClass}>
              HDL cholesterol ({cholUnitLabel})
            </label>
            <input
              id={`${id}-hdl`}
              type="number"
              inputMode="decimal"
              step={cholStep}
              className={inputClass}
              value={round(cholDisplay(s.hdlMmol))}
              onChange={(e) => set("hdlMmol", cholToMmol(Number(e.target.value)))}
            />
          </div>
          <div>
            <label htmlFor={`${id}-sbp`} className={labelClass}>
              Systolic BP (mmHg)
            </label>
            <input
              id={`${id}-sbp`}
              type="number"
              inputMode="numeric"
              step={1}
              className={inputClass}
              value={round(s.systolicBp, 0)}
              onChange={(e) => set("systolicBp", Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor={`${id}-egfr`} className={labelClass}>
              eGFR (mL/min/1.73m²)
            </label>
            <input
              id={`${id}-egfr`}
              type="number"
              inputMode="numeric"
              step={1}
              className={inputClass}
              value={round(s.egfr, 0)}
              onChange={(e) => set("egfr", Number(e.target.value))}
            />
          </div>
        </div>

        <fieldset className="mt-4 grid grid-cols-2 gap-2">
          <legend className="mb-1 text-sm font-medium">Health history</legend>
          {TOGGLES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s[t.key]}
                onChange={(e) => set(t.key, e.target.checked)}
                className="size-4 rounded border-border"
              />
              {t.label}
            </label>
          ))}
        </fieldset>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated heart age
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="heart-age-value">
              {result.clampedAt === "max" ? "79+" : formatNumber(result.heartAge, 0)}{" "}
              <span className="text-lg font-medium text-muted">years</span>
            </p>
            <p className="mt-1 text-lg" data-testid="heart-age-delta">
              {result.clampedAt ? (
                <>
                  Your risk sits {result.clampedAt === "max" ? "above" : "below"} the model&rsquo;s
                  reference range for your age.
                </>
              ) : (
                <>
                  That&rsquo;s{" "}
                  <span className="font-semibold">
                    {formatNumber(Math.abs(result.deltaYears), 0)} years{" "}
                    {older ? "older" : "younger"}
                  </span>{" "}
                  than your actual age of {formatNumber(s.ageYears, 0)}.
                </>
              )}
            </p>
            <p className="mt-2 text-sm text-muted">
              Predicted 10-year risk of a cardiovascular event:{" "}
              <span className="font-semibold text-foreground" data-testid="heart-age-risk">
                {formatNumber(result.risk10yr * 100, 1)}%
              </span>{" "}
              (PREVENT, total CVD).
            </p>
            <p className="mt-3 max-w-prose text-sm text-muted">
              This is a population-level estimate from the AHA PREVENT model, not
              a diagnosis or a personal prediction. It does not tell you to start
              or change any treatment — that is a conversation for your doctor,
              who can weigh the full picture.
            </p>

            {(lpa || apoB) && (
              <div
                data-testid="apob-lpa-context"
                className="mt-5 rounded-lg border border-border bg-surface p-3"
              >
                <h3 className="text-sm font-semibold">
                  ApoB &amp; Lp(a) — context, not part of the heart-age calculation
                </h3>
                <p className="mt-1 text-xs text-muted">
                  These are not inputs to PREVENT, so they don&rsquo;t change the
                  number above. They&rsquo;re shown here against general reference
                  thresholds to discuss with your doctor.
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {apoB && (
                    <li>
                      ApoB {formatNumber(s.apoBmgDl ?? 0, 0)} mg/dL —{" "}
                      <span className={`font-semibold ${apoB.tone}`}>{apoB.label}</span>
                    </li>
                  )}
                  {lpa && (
                    <li>
                      Lp(a) {formatNumber(s.lpaNmol ?? 0, 0)} nmol/L —{" "}
                      <span className={`font-semibold ${lpa.tone}`}>{lpa.label}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter your details above (HDL must be below total cholesterol) to see
            your heart age.
          </p>
        )}

        <details className="mt-5 text-sm">
          <summary className="cursor-pointer font-medium">
            Add ApoB / Lp(a) for context (optional)
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-apob`} className={labelClass}>
                ApoB (mg/dL)
              </label>
              <input
                id={`${id}-apob`}
                type="number"
                inputMode="decimal"
                step={1}
                className={inputClass}
                value={s.apoBmgDl ?? ""}
                onChange={(e) =>
                  set("apoBmgDl", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
            <div>
              <label htmlFor={`${id}-lpa`} className={labelClass}>
                Lp(a) (nmol/L)
              </label>
              <input
                id={`${id}-lpa`}
                type="number"
                inputMode="decimal"
                step={1}
                className={inputClass}
                value={s.lpaNmol ?? ""}
                onChange={(e) =>
                  set("lpaNmol", e.target.value === "" ? null : Number(e.target.value))
                }
              />
            </div>
          </div>
        </details>
      </ResultsPanel>
    </CalculatorShell>
  );
}
