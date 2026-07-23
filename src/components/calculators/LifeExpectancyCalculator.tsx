"use client";

import { useId, useMemo, useState } from "react";
import type { Sex } from "@/lib/formulas/energy";
import {
  LOW_RISK_FACTOR_DEFINITIONS,
  LOW_RISK_FACTOR_KEYS,
  type FactorSelections,
  lifeExpectancyContext,
} from "@/lib/formulas/life-expectancy";
import { LIFE_EXPECTANCY_DEFAULTS } from "@/registry/configs/life-expectancy-calculator.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultsPanel } from "@/components/ResultsPanel";
import { LifeMonthsGrid } from "@/components/effects/LifeMonthsGrid";
import { formatNumber, labelClass } from "@/components/calculators/styles";

const EMPTY: FactorSelections = {
  smoking: false,
  bmi: false,
  physicalActivity: false,
  alcohol: false,
  diet: false,
};

export function LifeExpectancyCalculator() {
  const id = useId();
  const [sex, setSex] = useState<Sex>(LIFE_EXPECTANCY_DEFAULTS.sex);
  const [selections, setSelections] = useState<FactorSelections>({ ...EMPTY });

  const ctx = useMemo(() => lifeExpectancyContext(sex, selections), [sex, selections]);

  return (
    <CalculatorShell>
      <form aria-label="Lifestyle factors" onSubmit={(e) => e.preventDefault()}>
        <fieldset className="flex gap-4">
          <legend className="sr-only">Sex</legend>
          {(["female", "male"] as const).map((option) => (
            <label key={option} className="flex items-center gap-1.5 text-sm font-medium">
              <input
                type="radio"
                name={`${id}-sex`}
                value={option}
                checked={sex === option}
                onChange={() => setSex(option)}
                className="accent-[var(--primary)]"
              />
              {option === "female" ? "Female" : "Male"}
            </label>
          ))}
        </fieldset>

        <p className={`${labelClass} mt-4`}>Which of these low-risk factors do you meet?</p>
        <ul className="mt-2 space-y-2">
          {LOW_RISK_FACTOR_KEYS.map((key) => {
            const def = LOW_RISK_FACTOR_DEFINITIONS[key];
            return (
              <li key={key}>
                <label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selections[key]}
                    data-testid={`factor-${key}`}
                    onChange={(e) =>
                      setSelections((s) => ({ ...s, [key]: e.target.checked }))
                    }
                    className="mt-0.5 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="font-medium">{def.label}</span>
                    <span className="block text-xs text-muted">{def.definition}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </form>

      <ResultsPanel>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            You meet
          </h2>
          <p className="mt-1 text-4xl font-bold text-primary-strong" data-testid="factor-count">
            {ctx.count} of 5
          </p>
          <p className="mt-1 text-sm text-muted">low-risk lifestyle factors.</p>

          <div className="mt-4 rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)] text-sm">
            <p className="font-semibold">What the study found (population average)</p>
            <p className="mt-1">
              In the Li 2018 cohort, {sex === "female" ? "women" : "men"} who
              met <strong>all five</strong> factors had a projected life
              expectancy at age 50 of about{" "}
              <span data-testid="le-all">
                {formatNumber(ctx.allFactorsProjectedAge, 1)} years
              </span>{" "}
              — around{" "}
              <strong>{formatNumber(ctx.anchors.reportedGainYears, 1)} years longer</strong>{" "}
              than those who met <strong>none</strong> (about{" "}
              {formatNumber(ctx.zeroFactorsProjectedAge, 1)} years).
            </p>
            {!ctx.isPublishedExactCount ? (
              <p className="mt-2 text-muted">
                The study reported that meeting more factors was linked to more
                years, but it only published exact figures for none and all
                five — so we don&rsquo;t show a specific number for {ctx.count}{" "}
                of 5.
              </p>
            ) : null}
          </div>

          <LifeMonthsGrid
            gainYears={ctx.anchors.reportedGainYears}
            filled={ctx.count === 5}
          />

          <p className="mt-3 max-w-prose text-sm text-muted">
            This is a <strong>population-level association</strong> from one
            large study — <strong>not a prediction about you</strong>. It
            cannot tell any individual how long they will live, and the factors
            are correlated with many other advantages. Read it as
            encouragement that these habits mattered, on average, in this
            cohort.
          </p>
        </div>
      </ResultsPanel>
    </CalculatorShell>
  );
}
