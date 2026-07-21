"use client";

import { useId, useMemo, useState } from "react";
import { hrMaxLegacy, hrMaxTanaka, hrZones } from "@/lib/formulas/heart-rate";
import {
  HR_DEFAULTS,
  HR_LIMITS,
} from "@/registry/configs/heart-rate-zone-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const ZONE_DESCRIPTIONS = [
  "Very easy — recovery",
  "Easy — aerobic base",
  "Steady — tempo",
  "Hard — threshold",
  "Maximal — VO₂ work",
];

export function HrZoneCalculator() {
  const id = useId();
  const [ageText, setAgeText] = useState(String(HR_DEFAULTS.ageYears));
  const [rhrText, setRhrText] = useState("");

  const result = useMemo(() => {
    const ageYears = Number(ageText);
    if (!inRange(ageYears, HR_LIMITS.ageYears)) return null;
    const restingHr = rhrText.trim() === "" ? undefined : Number(rhrText);
    if (restingHr !== undefined && !inRange(restingHr, HR_LIMITS.restingHr)) {
      return null;
    }
    const hrMax = hrMaxTanaka(ageYears);
    return {
      hrMax,
      legacy: hrMaxLegacy(ageYears),
      restingHr,
      zones: hrZones(hrMax, restingHr),
    };
  }, [ageText, rhrText]);

  return (
    <CalculatorShell>
      <form aria-label="Heart rate zone inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-age`} className={labelClass}>
              Age (years)
            </label>
            <input
              id={`${id}-age`}
              type="number"
              inputMode="numeric"
              min={HR_LIMITS.ageYears.min}
              max={HR_LIMITS.ageYears.max}
              className={inputClass}
              value={ageText}
              onChange={(e) => setAgeText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-rhr`} className={labelClass}>
              Resting HR (optional)
            </label>
            <input
              id={`${id}-rhr`}
              type="number"
              inputMode="numeric"
              min={HR_LIMITS.restingHr.min}
              max={HR_LIMITS.restingHr.max}
              placeholder="e.g. 60"
              className={inputClass}
              value={rhrText}
              onChange={(e) => setRhrText(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">
              Adding it switches to the more personal Karvonen method
            </p>
          </div>
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your estimated maximum heart rate
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="hr-max">
              {formatNumber(result.hrMax)}{" "}
              <span className="text-lg font-medium text-muted">bpm</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              Tanaka equation (208 − 0.7 × age). The legacy 220 − age rule
              gives {formatNumber(result.legacy)} bpm.
              {result.restingHr !== undefined
                ? " Zones below use your heart-rate reserve (Karvonen)."
                : " Zones below use %HRmax — add your resting HR for more personal zones."}
            </p>
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Five heart-rate training zones</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 font-semibold">Zone</th>
                  <th scope="col" className="py-1.5 font-semibold">Effort</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Heart rate (bpm)</th>
                </tr>
              </thead>
              <tbody>
                {result.zones.map((zone) => (
                  <tr key={zone.zone} className="border-b border-border last:border-0">
                    <td className="py-1.5 font-medium">Z{zone.zone}</td>
                    <td className="py-1.5">{ZONE_DESCRIPTIONS[zone.zone - 1]}</td>
                    <td className="py-1.5 text-right tabular-nums" data-testid={`zone-${zone.zone}`}>
                      {formatNumber(zone.lowerBpm)}–{formatNumber(zone.upperBpm)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Formula-based maxima are estimates — measured values commonly
              differ by ten or more beats either way. Anchor training to how
              zones feel as much as to the numbers.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter your age (13–100). Optionally add your waking resting heart
            rate (30–100 bpm) for Karvonen zones.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
