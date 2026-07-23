"use client";

import { useId, useMemo, useState } from "react";
import {
  RECOVERY_READINESS_VERSION,
  recoveryReadinessIndex,
} from "@/lib/composite/recovery-readiness";
import { RR_DEFAULTS, RR_LIMITS } from "@/registry/configs/recovery-readiness-index.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { IndexResultPanel } from "@/components/composite/IndexResultPanel";
import { inputClass, labelClass } from "@/components/calculators/styles";

type Key = keyof typeof RR_DEFAULTS;

const ROWS: { today: Key; baseline: Key; label: string; unit: string; limit: keyof typeof RR_LIMITS; step: number; baselineLabel: string }[] = [
  { today: "hrvMs", baseline: "hrvBaselineMs", label: "HRV", unit: "ms", limit: "hrvMs", step: 1, baselineLabel: "baseline" },
  { today: "restingHr", baseline: "restingHrBaseline", label: "Resting HR", unit: "bpm", limit: "restingHr", step: 1, baselineLabel: "baseline" },
  { today: "sleepHours", baseline: "sleepNeedHours", label: "Sleep", unit: "h", limit: "sleepHours", step: 0.25, baselineLabel: "your need" },
  { today: "respRate", baseline: "respRateBaseline", label: "Breathing rate", unit: "/min", limit: "respRate", step: 0.5, baselineLabel: "baseline" },
];

export function RecoveryReadinessCalculator() {
  const id = useId();
  const [v, setV] = useState<Record<Key, number>>({ ...RR_DEFAULTS });

  const result = useMemo(() => {
    const valid = ROWS.every(
      (r) => inRange(v[r.today], RR_LIMITS[r.limit]) && inRange(v[r.baseline], RR_LIMITS[r.limit]),
    );
    if (!valid) return null;
    return recoveryReadinessIndex({
      hrvMs: v.hrvMs,
      hrvBaselineMs: v.hrvBaselineMs,
      restingHr: v.restingHr,
      restingHrBaseline: v.restingHrBaseline,
      sleepHours: v.sleepHours,
      sleepNeedHours: v.sleepNeedHours,
      respRate: v.respRate,
      respRateBaseline: v.respRateBaseline,
    });
  }, [v]);

  return (
    <CalculatorShell>
      <form aria-label="Recovery readiness inputs" onSubmit={(e) => e.preventDefault()}>
        <p className="text-sm text-muted">Enter today&rsquo;s reading and your usual baseline for each metric.</p>
        <div className="mt-3 space-y-3">
          {ROWS.map((r) => (
            <fieldset key={r.today} className="grid grid-cols-2 gap-3">
              <legend className="sr-only">{r.label}</legend>
              <div>
                <label htmlFor={`${id}-${r.today}`} className={labelClass}>
                  {r.label} today ({r.unit})
                </label>
                <input id={`${id}-${r.today}`} type="number" inputMode="decimal" step={r.step} min={RR_LIMITS[r.limit].min} max={RR_LIMITS[r.limit].max} className={inputClass} value={v[r.today]} onChange={(e) => setV((s) => ({ ...s, [r.today]: Number(e.target.value) }))} />
              </div>
              <div>
                <label htmlFor={`${id}-${r.baseline}`} className={labelClass}>
                  {r.label} {r.baselineLabel} ({r.unit})
                </label>
                <input id={`${id}-${r.baseline}`} type="number" inputMode="decimal" step={r.step} min={RR_LIMITS[r.limit].min} max={RR_LIMITS[r.limit].max} className={inputClass} value={v[r.baseline]} onChange={(e) => setV((s) => ({ ...s, [r.baseline]: Number(e.target.value) }))} />
              </div>
            </fieldset>
          ))}
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <IndexResultPanel
            result={result}
            version={RECOVERY_READINESS_VERSION}
            scoreLabel="Recovery Readiness Index"
            shareTool="recovery-readiness-index"
            whatItIs="A transparent, self-relative daily readiness score comparing today's metrics to your own baseline, with every weight and mapping published. A data point to weigh alongside how you feel."
            whatItIsnt="A medical test, a diagnosis, or a cross-user comparison. A low score is not an instruction, it reflects your own recent averages, nothing more."
          />
        ) : (
          <p className="text-sm text-muted">
            Enter today&rsquo;s readings and your baselines within their ranges
            to see your readiness score.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
