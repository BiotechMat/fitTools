"use client";

import { useId, useMemo, useState } from "react";
import { paceSecPerKm, splitTimes } from "@/lib/formulas/running";
import {
  COMMON_DISTANCES,
  PACE_DEFAULTS,
  PACE_LIMITS,
} from "@/registry/configs/running-pace-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatDuration, formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const MILE_M = 1609.344;

export function PaceCalculator() {
  const id = useId();
  const [distanceM, setDistanceM] = useState<number>(PACE_DEFAULTS.distanceM);
  const [hoursText, setHoursText] = useState("0");
  const [minutesText, setMinutesText] = useState("50");
  const [secondsText, setSecondsText] = useState("0");

  const result = useMemo(() => {
    const totalSeconds =
      Number(hoursText) * 3600 + Number(minutesText) * 60 + Number(secondsText);
    const valid =
      inRange(distanceM, PACE_LIMITS.distanceM) &&
      inRange(totalSeconds, PACE_LIMITS.totalSeconds);
    if (!valid) return null;
    const pace = paceSecPerKm(distanceM, totalSeconds);
    return {
      pace,
      paceMile: pace * (MILE_M / 1000),
      speedKmh: 3600 / pace,
      splits: splitTimes(distanceM, totalSeconds, 1000).slice(0, 50),
    };
  }, [distanceM, hoursText, minutesText, secondsText]);

  return (
    <CalculatorShell>
      <form aria-label="Pace inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor={`${id}-distance`} className={labelClass}>Distance</label>
            <select
              id={`${id}-distance`}
              className={inputClass}
              value={distanceM}
              onChange={(e) => setDistanceM(Number(e.target.value))}
            >
              {COMMON_DISTANCES.map((d) => (
                <option key={d.meters} value={d.meters}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-h`} className={labelClass}>Hours</label>
            <input id={`${id}-h`} type="number" inputMode="numeric" min={0} max={23} className={inputClass} value={hoursText} onChange={(e) => setHoursText(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-m`} className={labelClass}>Minutes</label>
            <input id={`${id}-m`} type="number" inputMode="numeric" min={0} max={59} className={inputClass} value={minutesText} onChange={(e) => setMinutesText(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-s`} className={labelClass}>Seconds</label>
            <input id={`${id}-s`} type="number" inputMode="numeric" min={0} max={59} className={inputClass} value={secondsText} onChange={(e) => setSecondsText(e.target.value)} />
          </div>
        </div>
      </form>
      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Your pace
            </h2>
            <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="pace-value">
              {formatDuration(result.pace)}{" "}
              <span className="text-lg font-medium text-muted">/km</span>
            </p>
            <p className="mt-1 text-lg">
              {formatDuration(result.paceMile)} /mile ·{" "}
              {formatNumber(result.speedKmh, 1)} km/h
            </p>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium">
                Kilometre splits (even pacing)
              </summary>
              <table className="mt-2 w-full text-sm">
                <caption className="sr-only">Cumulative splits</caption>
                <tbody>
                  {result.splits.map((split) => (
                    <tr key={split.distanceM} className="border-b border-border last:border-0">
                      <td className="py-1">{formatNumber(split.distanceM / 1000, split.distanceM % 1000 === 0 ? 0 : 2)} km</td>
                      <td className="py-1 text-right tabular-nums">
                        {formatDuration(split.cumulativeSeconds)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter a distance and finish time to see pace and splits.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
