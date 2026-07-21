"use client";

import { useId, useMemo, useState } from "react";
import {
  LATENCY_MINUTES,
  bedtimesForWake,
  formatMinutesOfDay,
} from "@/lib/formulas/sleep";
import { SLEEP_DEFAULTS } from "@/registry/configs/sleep-calculator.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { inputClass, labelClass } from "@/components/calculators/styles";

function parseTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function SleepCalculator() {
  const id = useId();
  const [wakeText, setWakeText] = useState(
    formatMinutesOfDay(SLEEP_DEFAULTS.wakeMinutes),
  );

  const options = useMemo(() => {
    const wakeMinutes = parseTime(wakeText);
    if (wakeMinutes === null) return null;
    return bedtimesForWake(wakeMinutes);
  }, [wakeText]);

  return (
    <CalculatorShell>
      <form aria-label="Sleep calculator inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-wake`} className={labelClass}>
              I need to wake up at
            </label>
            <input
              id={`${id}-wake`}
              type="time"
              className={inputClass}
              value={wakeText}
              onChange={(e) => setWakeText(e.target.value)}
            />
          </div>
        </div>
      </form>

      <ResultsPanel>
        {options ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Suggested bedtimes
            </h2>
            <ul className="mt-3 space-y-3">
              {options.map((option) => (
                <li
                  key={option.cycles}
                  className="flex items-baseline justify-between rounded-lg border border-border p-3"
                >
                  <span
                    className="text-2xl font-bold text-primary-strong tabular-nums"
                    data-testid={`bedtime-${option.cycles}`}
                  >
                    {formatMinutesOfDay(option.bedtimeMinutes)}
                  </span>
                  <span className="text-sm text-muted">
                    {option.cycles} cycles ·{" "}
                    {(option.sleepMinutes / 60).toLocaleString("en-GB", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    h asleep
                    {option.cycles === 5 ? " · suits most adults" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-prose text-sm text-muted">
              Times include {LATENCY_MINUTES} minutes to fall asleep and
              assume 90-minute cycles. Real cycles run roughly 70–120 minutes
              and vary between people — treat these as starting points and
              adjust to how you feel on waking.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">Enter a wake-up time to see bedtime options.</p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
