"use client";

import { useId, useMemo, useState } from "react";
import { riegelPredict } from "@/lib/formulas/running";
import { COMMON_DISTANCES } from "@/registry/configs/running-pace-calculator.shared";
import { RACE_LIMITS } from "@/registry/configs/race-time-predictor.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatDuration, inputClass, labelClass } from "@/components/calculators/styles";

const TARGET_TESTIDS: Record<number, string> = {
  5000: "riegel-5k",
  10000: "riegel-10k",
  21097.5: "riegel-hm",
  42195: "riegel-marathon",
};

export function RacePredictorCalculator() {
  const id = useId();
  const [distanceM, setDistanceM] = useState<number>(10000);
  const [hoursText, setHoursText] = useState("0");
  const [minutesText, setMinutesText] = useState("50");
  const [secondsText, setSecondsText] = useState("0");

  const result = useMemo(() => {
    const totalSeconds =
      Number(hoursText) * 3600 + Number(minutesText) * 60 + Number(secondsText);
    const valid =
      inRange(distanceM, RACE_LIMITS.distanceM) &&
      inRange(totalSeconds, RACE_LIMITS.totalSeconds);
    if (!valid) return null;
    return COMMON_DISTANCES.filter((d) => d.meters !== distanceM).map((d) => ({
      ...d,
      predicted: riegelPredict(totalSeconds, distanceM, d.meters),
    }));
  }, [distanceM, hoursText, minutesText, secondsText]);

  return (
    <CalculatorShell>
      <form aria-label="Race predictor inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor={`${id}-distance`} className={labelClass}>Recent race</label>
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
              Riegel predictions
            </h2>
            <table className="mt-3 w-full text-sm">
              <caption className="sr-only">Predicted race times</caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 font-semibold">Distance</th>
                  <th scope="col" className="py-1.5 text-right font-semibold">Predicted time</th>
                </tr>
              </thead>
              <tbody>
                {result.map((row) => (
                  <tr key={row.meters} className="border-b border-border last:border-0">
                    <td className="py-2">{row.label}</td>
                    <td
                      className="py-2 text-right text-lg font-semibold tabular-nums text-primary-strong"
                      data-testid={TARGET_TESTIDS[row.meters]}
                    >
                      {formatDuration(row.predicted)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Assumes you&rsquo;re as trained for the target distance as the
              known one, marathon predictions in particular are a best case
              without marathon-specific mileage.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter a recent race result to see predictions.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
