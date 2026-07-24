"use client";

/**
 * The first-sign-in profile wizard (Mat, 2026-07-24; PROFILE.md §2.1 pulled
 * forward): one card asking the basics — sex, date of birth, height, weight
 * — plus optional extras if known (resting heart rate). Everything lands in
 * the dashboard vitals store (DASHBOARD §3.1/§5.2 — canonical SI, age
 * derived from DOB and never stored), which the sync engine carries to the
 * account under the health consent and the calculators prefill from
 * (profile-prefill.ts).
 *
 * Every field is optional and the whole thing is skippable — a welcome, not
 * a wall (DESIGN §5). Shown once per device (completion flag), and only
 * when the profile is still empty; everything stays editable later.
 * Sanity ranges mirror SPEC §14's Zod bounds (age 13–100, weight 30–300 kg,
 * height 100–250 cm).
 */

import { useState } from "react";
import { readDashboard, setProfile, writeDashboard, type Sex } from "@/lib/dashboard-store";
import { feetInchesToCm, lbToKg } from "@/lib/units";

export const WIZARD_DONE_KEY = "fittools.account.wizard.v1";

/** Fresh sign-ins see the wizard only while the profile is empty. */
export function profileWizardNeeded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(WIZARD_DONE_KEY) !== null) return false;
  } catch {
    return false;
  }
  const vitals = readDashboard().profile;
  return (
    vitals.sex === undefined &&
    vitals.birthDate === undefined &&
    vitals.heightCm === undefined &&
    vitals.weightKg === undefined
  );
}

function markWizardDone(): void {
  try {
    window.localStorage.setItem(WIZARD_DONE_KEY, new Date().toISOString());
  } catch {
    // fine — worst case the wizard offers itself again on this device
  }
}

const inputClass = "rounded-xl border-2 border-foreground bg-background px-3 py-2";
const labelClass = "block font-mono text-xs font-bold uppercase tracking-[0.14em]";
const pillClass =
  "rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_0_var(--color-foreground)]";

export function ProfileWizard({ onDone }: { onDone: () => void }): React.ReactElement {
  const [sex, setSex] = useState<Sex | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [imperial, setImperial] = useState(false);
  const [heightCmText, setHeightCmText] = useState("");
  const [feetText, setFeetText] = useState("");
  const [inchesText, setInchesText] = useState("");
  const [weightText, setWeightText] = useState(""); // kg or lb per toggle
  const [showExtras, setShowExtras] = useState(false);
  const [restingHrText, setRestingHrText] = useState("");

  const finish = (save: boolean): void => {
    if (save) {
      const patch: Parameters<typeof setProfile>[1] = {};
      if (sex !== null) patch.sex = sex;
      const dob = Date.parse(birthDate);
      // SPEC §14 age bounds, derived leniently: born 1926–2013-ish.
      if (!Number.isNaN(dob)) {
        const age = (Date.now() - dob) / (365.25 * 24 * 60 * 60 * 1000);
        if (age >= 13 && age <= 100) patch.birthDate = birthDate;
      }
      const heightCm = imperial
        ? feetInchesToCm(Number(feetText || "0"), Number(inchesText || "0"))
        : Number(heightCmText);
      if (Number.isFinite(heightCm) && heightCm >= 100 && heightCm <= 250) {
        patch.heightCm = heightCm;
      }
      const weightRaw = Number(weightText);
      const weightKg = imperial ? lbToKg(weightRaw) : weightRaw;
      if (Number.isFinite(weightKg) && weightKg >= 30 && weightKg <= 300) {
        patch.weightKg = weightKg;
      }
      const restingHr = Number(restingHrText);
      if (Number.isFinite(restingHr) && restingHr >= 30 && restingHr <= 120) {
        patch.restingHr = restingHr;
      }
      if (Object.keys(patch).length > 0) {
        writeDashboard(setProfile(readDashboard(), patch));
      }
    }
    markWizardDone();
    onDone();
  };

  return (
    <section className="mt-6 rounded-2xl border-2 border-foreground bg-surface p-6 shadow-[4px_4px_0_0_var(--color-foreground)]">
      <h2 className="font-display text-2xl uppercase">Welcome — your numbers</h2>
      <p className="mt-2 text-sm text-muted">
        Tell us the basics once and every relevant calculator opens already
        filled in. All optional, all editable later on your dashboard, and
        stored under the same one-click delete as everything else.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          finish(true);
        }}
        className="mt-5 space-y-5"
      >
        <div>
          <span className={labelClass}>Sex (used by the formulas)</span>
          <div className="mt-2 flex gap-2">
            {(["male", "female"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={sex === option}
                onClick={() => setSex(sex === option ? null : option)}
                className={`${pillClass} ${sex === option ? "bg-primary-strong" : "bg-background"}`}
              >
                {option === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="wiz-dob" className={labelClass}>
            Date of birth (for your age — the date itself stays in your profile)
          </label>
          <input
            id="wiz-dob"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            className={`${inputClass} mt-2`}
          />
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className={labelClass}>Height &amp; weight</span>
            <button
              type="button"
              onClick={() => setImperial(!imperial)}
              className="font-mono text-xs underline underline-offset-2 text-muted hover:text-foreground"
            >
              {imperial ? "use cm / kg" : "use ft / lb"}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            {imperial ? (
              <>
                <div>
                  <label htmlFor="wiz-feet" className="text-xs text-muted">
                    ft
                  </label>
                  <input
                    id="wiz-feet"
                    type="number"
                    min="3"
                    max="8"
                    value={feetText}
                    onChange={(event) => setFeetText(event.target.value)}
                    className={`${inputClass} mt-1 w-20`}
                  />
                </div>
                <div>
                  <label htmlFor="wiz-inches" className="text-xs text-muted">
                    in
                  </label>
                  <input
                    id="wiz-inches"
                    type="number"
                    min="0"
                    max="11"
                    value={inchesText}
                    onChange={(event) => setInchesText(event.target.value)}
                    className={`${inputClass} mt-1 w-20`}
                  />
                </div>
                <div>
                  <label htmlFor="wiz-weight" className="text-xs text-muted">
                    lb
                  </label>
                  <input
                    id="wiz-weight"
                    type="number"
                    min="66"
                    max="660"
                    value={weightText}
                    onChange={(event) => setWeightText(event.target.value)}
                    className={`${inputClass} mt-1 w-24`}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="wiz-height" className="text-xs text-muted">
                    cm
                  </label>
                  <input
                    id="wiz-height"
                    type="number"
                    min="100"
                    max="250"
                    value={heightCmText}
                    onChange={(event) => setHeightCmText(event.target.value)}
                    className={`${inputClass} mt-1 w-24`}
                  />
                </div>
                <div>
                  <label htmlFor="wiz-weight" className="text-xs text-muted">
                    kg
                  </label>
                  <input
                    id="wiz-weight"
                    type="number"
                    min="30"
                    max="300"
                    step="0.1"
                    value={weightText}
                    onChange={(event) => setWeightText(event.target.value)}
                    className={`${inputClass} mt-1 w-24`}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {showExtras ? (
          <div>
            <label htmlFor="wiz-rhr" className={labelClass}>
              Resting heart rate (bpm)
            </label>
            <input
              id="wiz-rhr"
              type="number"
              min="30"
              max="120"
              value={restingHrText}
              onChange={(event) => setRestingHrText(event.target.value)}
              className={`${inputClass} mt-2 w-24`}
            />
            <p className="mt-1 text-xs text-muted">
              Feeds the heart-rate zone and readiness tools. Skip it if you
              don&apos;t know it.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowExtras(true)}
            className="font-mono text-xs underline underline-offset-2 text-muted hover:text-foreground"
          >
            + More metrics, if you know them (resting heart rate)
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-foreground/30 pt-4">
          <button
            type="submit"
            className={`${pillClass} bg-primary-strong hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]`}
          >
            Save &amp; continue
          </button>
          <button
            type="button"
            onClick={() => finish(false)}
            className="text-sm text-muted underline underline-offset-2 hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      </form>
    </section>
  );
}
