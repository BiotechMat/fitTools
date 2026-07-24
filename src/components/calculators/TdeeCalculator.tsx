"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { hasProfilePrefill, readProfilePrefill } from "@/lib/account/profile-prefill";
import { ProfilePrefillChip } from "@/components/account/ProfilePrefillChip";
import {
  ACTIVITY_FACTORS,
  type ActivityLevel,
  type Sex,
  fatFreeMassKg,
  harrisBenedictRevised,
  katchMcArdle,
  mifflinStJeor,
  tdee,
} from "@/lib/formulas/energy";
import {
  TDEE_DEFAULTS,
  TDEE_LIMITS,
  TDEE_SLUG,
  inRange,
} from "@/registry/configs/tdee.shared";
import { trackEvent } from "@/lib/analytics";
import { CalculatorShell } from "@/components/CalculatorShell";
import { ResultHistory } from "@/components/ResultHistory";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ScoreCard } from "@/components/ScoreCard";
import {
  HeightField,
  UnitSystemToggle,
  WeightField,
  useUnitSystem,
} from "@/components/UnitInput";

type Formula = "mifflin" | "katch" | "harris";

/** Plain labels for the activity factors (SPEC §7). */
const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary: little or no exercise (×1.2)",
  light: "Lightly active: exercise 1 to 3 days a week (×1.375)",
  moderate: "Moderately active: exercise 3 to 5 days a week (×1.55)",
  active: "Very active: hard exercise 6 to 7 days a week (×1.725)",
  veryActive: "Extremely active: hard daily exercise or a physical job (×1.9)",
};

const FORMULA_LABELS: Record<Formula, string> = {
  mifflin: "Mifflin-St Jeor (recommended)",
  katch: "Katch-McArdle (requires body-fat %)",
  harris: "Revised Harris-Benedict",
};

const selectClass =
  "mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base focus:outline-2 focus:outline-offset-2 focus:outline-primary";

function formatKcal(value: number): string {
  return Math.round(value).toLocaleString("en-GB");
}

export function TdeeCalculator() {
  const id = useId();
  const [system, setSystem] = useUnitSystem();

  const [sex, setSex] = useState<Sex>(TDEE_DEFAULTS.sex);
  const [ageText, setAgeText] = useState(String(TDEE_DEFAULTS.ageYears));
  const [weightKg, setWeightKg] = useState<number>(TDEE_DEFAULTS.weightKg);
  const [heightCm, setHeightCm] = useState<number>(TDEE_DEFAULTS.heightCm);
  const [activity, setActivity] = useState<ActivityLevel>(TDEE_DEFAULTS.activity);
  const [formula, setFormula] = useState<Formula>(TDEE_DEFAULTS.formula);
  const [bodyFatText, setBodyFatText] = useState("");

  // Auto-populate from the signed-in profile (PROFILE §5 via
  // profile-prefill.ts): applied once on mount, before any interaction, so
  // it can never overwrite an edit; the chip discloses the provenance.
  const [prefilled, setPrefilled] = useState(false);
  useEffect(() => {
    const profile = readProfilePrefill();
    if (!hasProfilePrefill(profile)) return;
    let used = false;
    if (profile.sex !== undefined) {
      setSex(profile.sex);
      used = true;
    }
    if (profile.ageYears !== undefined && inRange(profile.ageYears, TDEE_LIMITS.ageYears)) {
      setAgeText(String(profile.ageYears));
      used = true;
    }
    if (profile.weightKg !== undefined && inRange(profile.weightKg, TDEE_LIMITS.weightKg)) {
      setWeightKg(profile.weightKg);
      used = true;
    }
    if (profile.heightCm !== undefined && inRange(profile.heightCm, TDEE_LIMITS.heightCm)) {
      setHeightCm(profile.heightCm);
      used = true;
    }
    if (used) setPrefilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  // Range validation mirrors the tool's Zod schema via the shared TDEE_LIMITS
  // constants; Zod itself stays out of the client bundle (SPEC §13 budget).
  const result = useMemo(() => {
    const ageYears = Number(ageText);
    const bodyFatPercent =
      bodyFatText.trim() === "" ? undefined : Number(bodyFatText);
    const valid =
      inRange(ageYears, TDEE_LIMITS.ageYears) &&
      inRange(weightKg, TDEE_LIMITS.weightKg) &&
      inRange(heightCm, TDEE_LIMITS.heightCm) &&
      (bodyFatPercent === undefined ||
        inRange(bodyFatPercent, TDEE_LIMITS.bodyFatPercent));
    if (!valid) return null;

    let bmr: number;
    if (formula === "katch") {
      if (bodyFatPercent === undefined) return null;
      bmr = katchMcArdle(fatFreeMassKg(weightKg, bodyFatPercent));
    } else if (formula === "harris") {
      bmr = harrisBenedictRevised({ sex, weightKg, heightCm, ageYears });
    } else {
      bmr = mifflinStJeor({ sex, weightKg, heightCm, ageYears });
    }
    return { bmr, tdeeKcal: tdee(bmr, ACTIVITY_FACTORS[activity]) };
  }, [sex, ageText, weightKg, heightCm, activity, formula, bodyFatText]);

  // calc_completed fires once per page view, on the first user-driven
  // recalculation (the initial defaults render doesn't count).
  const isFirstRender = useRef(true);
  const hasTracked = useRef(false);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (result && !hasTracked.current) {
      hasTracked.current = true;
      trackEvent({ name: "calc_completed", params: { tool: TDEE_SLUG } });
    }
  }, [result]);

  const katchNeedsBodyFat =
    formula === "katch" && bodyFatText.trim() === "";

  return (
    <CalculatorShell>
      <form
        aria-label="TDEE calculator inputs"
        onSubmit={(event) => event.preventDefault()}
      >
        {prefilled ? (
          <div className="mb-3">
            <ProfilePrefillChip />
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <fieldset className="flex gap-4">
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
          <UnitSystemToggle system={system} onChange={setSystem} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${id}-age`} className="block text-sm font-medium">
              Age (years)
            </label>
            <input
              id={`${id}-age`}
              type="number"
              inputMode="numeric"
              min={13}
              max={100}
              className={selectClass}
              value={ageText}
              onChange={(event) => setAgeText(event.target.value)}
            />
          </div>
          <WeightField valueKg={weightKg} onChange={setWeightKg} system={system} />
          <HeightField valueCm={heightCm} onChange={setHeightCm} system={system} />
          <div className="col-span-2 sm:col-span-2">
            <label htmlFor={`${id}-activity`} className="block text-sm font-medium">
              Activity level
            </label>
            <select
              id={`${id}-activity`}
              className={selectClass}
              value={activity}
              onChange={(event) => {
                const value = event.target.value;
                if (value in ACTIVITY_FACTORS) {
                  setActivity(value as ActivityLevel); // narrowed by the `in` guard above
                }
              }}
            >
              {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-formula`} className="block text-sm font-medium">
              Formula
            </label>
            <select
              id={`${id}-formula`}
              className={selectClass}
              value={formula}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "mifflin" || value === "katch" || value === "harris") {
                  setFormula(value);
                }
              }}
            >
              {Object.entries(FORMULA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {formula === "katch" ? (
            <div>
              <label htmlFor={`${id}-bf`} className="block text-sm font-medium">
                Body fat (%)
              </label>
              <input
                id={`${id}-bf`}
                type="number"
                inputMode="decimal"
                min={5}
                max={60}
                step="0.1"
                className={selectClass}
                value={bodyFatText}
                onChange={(event) => setBodyFatText(event.target.value)}
              />
            </div>
          ) : null}
        </div>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <ScoreCard
              label="Your estimated daily energy expenditure"
              value={formatKcal(result.tdeeKcal)}
              unit="kcal/day"
              valueTestId="tdee-value"
              secondary={{
                label: "of which BMR",
                value: `${formatKcal(result.bmr)} kcal`,
              }}
            />
            <p className="mt-3 max-w-prose text-sm text-muted">
              We estimate you burn around {formatKcal(result.tdeeKcal)} kcal per
              day at your selected activity level, of which{" "}
              {formatKcal(result.bmr)} kcal is your estimated basal metabolic
              rate, the energy your body uses at complete rest. These are
              estimates, not measurements: use them as a starting point and
              adjust based on how your weight actually responds over a few
              weeks.
            </p>
            <ResultHistory
              tool={TDEE_SLUG}
              value={result.tdeeKcal}
              direction="none"
              epsilon={25}
              formatDelta={(delta) => `${formatKcal(delta)} kcal`}
            />
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">
                Estimated daily energy expenditure at each activity level
              </caption>
              <thead>
                <tr className="border-b border-border text-left">
                  <th scope="col" className="py-1.5 pr-2 font-semibold">
                    Activity level
                  </th>
                  <th scope="col" className="py-1.5 text-right font-semibold">
                    Estimate (kcal/day)
                  </th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(ACTIVITY_FACTORS) as ActivityLevel[]).map((level) => (
                  <tr
                    key={level}
                    className={`border-b border-border last:border-0 ${
                      level === activity ? "font-semibold text-primary" : ""
                    }`}
                  >
                    <td className="py-1.5 pr-2">{ACTIVITY_LABELS[level]}</td>
                    <td className="py-1.5 text-right tabular-nums">
                      {formatKcal(tdee(result.bmr, ACTIVITY_FACTORS[level]))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {katchNeedsBodyFat
              ? "Enter your body-fat percentage (5 to 60%) to use the Katch-McArdle formula, or switch back to Mifflin-St Jeor."
              : "Enter a valid age (13 to 100), weight (30 to 300 kg) and height (120 to 250 cm) to see your estimate."}
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
