"use client";

import { useId, useState } from "react";
import { totalTonnage, weeklySetsPerMuscle } from "@/lib/formulas/volume";
import { MUSCLE_GROUPS } from "@/registry/configs/training-volume-calculator.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

interface Row {
  muscle: (typeof MUSCLE_GROUPS)[number];
  sets: number;
  reps: number;
  loadKg: number;
}

export function VolumeCalculator() {
  const id = useId();
  const [rows, setRows] = useState<Row[]>([{ muscle: "chest", sets: 3, reps: 8, loadKg: 100 }]);

  const tonnage = totalTonnage(rows);
  const perMuscle = weeklySetsPerMuscle(rows);

  const update = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <CalculatorShell>
      <form aria-label="Training volume inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <fieldset key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <legend className="sr-only">Exercise {i + 1}</legend>
              <div>
                <label htmlFor={`${id}-m-${i}`} className={labelClass}>Muscle</label>
                <select
                  id={`${id}-m-${i}`}
                  className={inputClass}
                  value={row.muscle}
                  onChange={(e) => {
                    const value = e.target.value;
                    const muscle = MUSCLE_GROUPS.find((m) => m === value);
                    if (muscle) update(i, { muscle });
                  }}
                >
                  {MUSCLE_GROUPS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-s-${i}`} className={labelClass}>Sets</label>
                <input id={`${id}-s-${i}`} type="number" inputMode="numeric" min={0} max={20} className={inputClass} value={row.sets} onChange={(e) => update(i, { sets: Math.max(0, Math.min(20, Math.floor(Number(e.target.value) || 0))) })} />
              </div>
              <div>
                <label htmlFor={`${id}-r-${i}`} className={labelClass}>Reps</label>
                <input id={`${id}-r-${i}`} type="number" inputMode="numeric" min={1} max={50} className={inputClass} value={row.reps} onChange={(e) => update(i, { reps: Math.max(1, Math.min(50, Math.floor(Number(e.target.value) || 1))) })} />
              </div>
              <div>
                <label htmlFor={`${id}-l-${i}`} className={labelClass}>Load (kg)</label>
                <input id={`${id}-l-${i}`} type="number" inputMode="decimal" min={0} max={500} step="0.5" className={inputClass} value={row.loadKg} onChange={(e) => update(i, { loadKg: Math.max(0, Math.min(500, Number(e.target.value) || 0)) })} />
              </div>
              <div className="flex items-end">
                {rows.length > 1 ? (
                  <button
                    type="button"
                    className="rounded-md border border-border px-3 py-2 text-sm text-muted hover:text-foreground"
                    onClick={() => setRows((current) => current.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </fieldset>
          ))}
        </div>
        {rows.length < 20 ? (
          <button
            type="button"
            className="mt-3 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface"
            onClick={() => setRows((current) => [...current, { muscle: "back", sets: 3, reps: 8, loadKg: 60 }])}
          >
            + Add exercise
          </button>
        ) : null}
      </form>
      <ResultsPanel>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Session volume
          </h2>
          <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="tonnage-value">
            {formatNumber(tonnage)}{" "}
            <span className="text-lg font-medium text-muted">kg tonnage</span>
          </p>
          <h3 className="mt-4 text-sm font-semibold">Hard sets per muscle</h3>
          <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {[...perMuscle.entries()].map(([muscle, sets]) => (
              <li key={muscle} data-testid={`sets-${muscle}`}>
                <span className="capitalize">{muscle}</span>:{" "}
                <span className="font-semibold">{sets}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-prose text-sm text-muted">
            Research counts weekly hard sets per muscle as the key volume
            metric, roughly 10 to 20 for trained lifters. Log a whole week here
            to compare against that range.
          </p>
        </div>
      </ResultsPanel>
    </CalculatorShell>
  );
}
