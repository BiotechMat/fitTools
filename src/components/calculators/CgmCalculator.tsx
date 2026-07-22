"use client";

import { useId, useMemo, useState } from "react";
import { cgmMetrics, mgDlToMmol } from "@/lib/formulas/cgm";
import {
  CGM_LIMITS,
  type CgmUnit,
} from "@/registry/configs/cgm-metrics-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass, warningClass } from "@/components/calculators/styles";

/** Parse pasted CGM data — one glucose value per line or comma-separated;
 *  tolerates "timestamp,glucose" rows by taking the last number on each line. */
function parseReadings(raw: string, unit: CgmUnit): number[] {
  const tokens = raw
    .split(/[\n;]+/)
    .map((line) => {
      const nums = line.match(/-?\d+(\.\d+)?/g);
      return nums ? Number(nums[nums.length - 1]) : NaN;
    })
    .filter((n) => Number.isFinite(n));
  // Fall back to comma/space split when the input is a single flat list.
  const flat =
    tokens.length <= 1
      ? raw.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n))
      : tokens;
  return flat.map((v) => (unit === "mgdl" ? mgDlToMmol(v) : v));
}

export function CgmCalculator() {
  const id = useId();
  const [unit, setUnit] = useState<CgmUnit>("mmol");
  const [raw, setRaw] = useState("");

  const parsed = useMemo(() => parseReadings(raw, unit), [raw, unit]);

  const result = useMemo(() => {
    if (parsed.length < CGM_LIMITS.minReadings || parsed.length > CGM_LIMITS.maxReadings) {
      return null;
    }
    const allValid = parsed.every((g) => inRange(g, CGM_LIMITS.glucoseMmol));
    if (!allValid) return { error: true as const };
    return { error: false as const, metrics: cgmMetrics(parsed) };
  }, [parsed]);

  return (
    <CalculatorShell>
      <form aria-label="CGM metrics inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Paste your glucose readings (one per line or comma-separated).</p>
          <fieldset className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 text-sm">
            <legend className="sr-only">Glucose unit</legend>
            {(["mmol", "mgdl"] as const).map((u) => (
              <label
                key={u}
                className={`cursor-pointer rounded-md px-3 py-1 font-medium ${
                  unit === u ? "bg-primary text-white" : "text-muted hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-unit`}
                  value={u}
                  checked={unit === u}
                  onChange={() => setUnit(u)}
                  className="sr-only"
                />
                {u === "mmol" ? "mmol/L" : "mg/dL"}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="mt-3">
          <label htmlFor={`${id}-data`} className={labelClass}>
            CGM readings ({unit === "mmol" ? "mmol/L" : "mg/dL"})
          </label>
          <textarea
            id={`${id}-data`}
            rows={6}
            className={`${inputClass} font-mono text-sm`}
            placeholder={unit === "mmol" ? "5.4\n6.1\n7.8\n…" : "97\n110\n140\n…"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">
            {parsed.length > 0 ? `${formatNumber(parsed.length)} readings detected` : " "}
          </p>
        </div>
      </form>

      <ResultsPanel>
        {result && !result.error ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your CGM metrics
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Time in range" value={`${formatNumber(result.metrics.timeInRangePercent)}%`} testid="cgm-tir" />
              <Stat label="GMI (est. HbA1c)" value={`${formatNumber(result.metrics.gmi, 1)}%`} testid="cgm-gmi" />
              <Stat label="Variability (%CV)" value={`${formatNumber(result.metrics.cvPercent, 1)}%`} testid="cgm-cv" />
              <Stat label="Mean glucose" value={`${formatNumber(result.metrics.meanMmol, 1)} mmol/L`} testid="cgm-mean" />
            </div>
            <p className="mt-3 text-sm">
              Below range: {formatNumber(result.metrics.timeBelowPercent)}% ·
              Above range: {formatNumber(result.metrics.timeAbovePercent)}% ·
              Variability {result.metrics.cvStable ? "within" : "above"} the 36% stability target.
            </p>
            <p className={warningClass}>
              These metrics were designed for diabetes management. If you
              don&rsquo;t have diabetes, the evidence that flattening normal
              glucose rises improves health is limited — treat this as data,
              not a verdict. Discuss anything concerning with your clinician.
            </p>
          </div>
        ) : result?.error ? (
          <p className="text-sm" role="alert">
            Some readings are outside the plausible range
            ({unit === "mmol" ? "2–30 mmol/L" : "36–540 mg/dL"}) — check the
            unit toggle and your pasted data.
          </p>
        ) : (
          <p className="text-sm text-muted">
            Paste at least two glucose readings to see your GMI, time in range
            and variability. Everything is computed in your browser.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}

function Stat({ label, value, testid }: { label: string; value: string; testid: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 text-xl font-bold text-primary-strong" data-testid={testid}>
        {value}
      </div>
    </div>
  );
}
