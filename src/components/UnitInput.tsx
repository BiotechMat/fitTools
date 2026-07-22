"use client";

import { useCallback, useId, useState, useSyncExternalStore } from "react";
import {
  cmToFeetInches,
  cmToInches,
  feetInchesToCm,
  inchesToCm,
  kgToLb,
  kgToStonesLb,
  lbToKg,
  stonesLbToKg,
} from "@/lib/units";
import { trackEvent } from "@/lib/analytics";

/**
 * Unit system handling (SPEC §6): metric/imperial toggle persisted in
 * localStorage. First paint is deterministic (metric) for static
 * generation; the stored — or locale-inferred — preference is applied on
 * hydration. US visitors default to imperial; a request-geo default can be
 * layered in at the edge once deployed (see README).
 */

export type UnitSystem = "metric" | "imperial";

const STORAGE_KEY = "fittools:units";

function isUnitSystem(value: string | null): value is UnitSystem {
  return value === "metric" || value === "imperial";
}

const CHANGE_EVENT = "fittools:units-change";

function subscribeToUnitSystem(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readUnitSystem(): UnitSystem {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (isUnitSystem(stored)) return stored;
  return navigator.language.toLowerCase() === "en-us" ? "imperial" : "metric";
}

export function useUnitSystem(): [UnitSystem, (next: UnitSystem) => void] {
  // Server snapshot is always "metric" so static HTML is deterministic; the
  // stored/locale preference applies on the client's first post-hydration
  // render (React re-renders when the snapshots differ).
  const system = useSyncExternalStore(
    subscribeToUnitSystem,
    readUnitSystem,
    () => "metric" as const,
  );

  const update = useCallback((next: UnitSystem) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
    trackEvent({ name: "unit_toggled", params: { system: next } });
  }, []);

  return [system, update];
}

export function UnitSystemToggle({
  system,
  onChange,
}: {
  system: UnitSystem;
  onChange: (next: UnitSystem) => void;
}) {
  return (
    <fieldset className="flex items-center gap-1 rounded-full border-2 border-foreground bg-background p-0.5 text-sm">
      <legend className="sr-only">Unit system</legend>
      {(["metric", "imperial"] as const).map((option) => (
        <label
          key={option}
          className={`cursor-pointer rounded-full px-3 py-1 font-semibold ${
            system === option
              ? "bg-foreground text-background"
              : "text-muted hover:text-foreground"
          }`}
        >
          <input
            type="radio"
            name="unit-system"
            value={option}
            checked={system === option}
            onChange={() => onChange(option)}
            className="sr-only"
          />
          {option === "metric" ? "Metric" : "Imperial"}
        </label>
      ))}
    </fieldset>
  );
}

const fieldClass =
  "w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base focus:outline-2 focus:outline-offset-2 focus:outline-primary";
const labelClass = "block text-sm font-semibold";

function parseNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function formatNumber(value: number, decimals: number): string {
  return String(Number(value.toFixed(decimals)));
}

type ImperialWeightMode = "lb" | "st";

/**
 * Weight input. Canonical value is always kg (SPEC §2); conversion happens
 * here at the input layer only. Imperial mode offers lb or st+lb (UK).
 */
export function WeightField({
  valueKg,
  onChange,
  system,
}: {
  valueKg: number;
  onChange: (kg: number) => void;
  system: UnitSystem;
}) {
  const id = useId();
  const [mode, setMode] = useState<ImperialWeightMode>("lb");
  const [kgText, setKgText] = useState(() => formatNumber(valueKg, 1));
  const [lbText, setLbText] = useState(() => formatNumber(kgToLb(valueKg), 1));
  const [stText, setStText] = useState(() =>
    String(kgToStonesLb(valueKg).stones),
  );
  const [stLbText, setStLbText] = useState(() =>
    formatNumber(kgToStonesLb(valueKg).pounds, 1),
  );

  // Re-derive display text from the canonical kg value when the unit system
  // or imperial sub-mode changes (not on keystrokes, to keep cursors
  // stable). Render-time state adjustment per React's "storing information
  // from previous renders" pattern.
  const syncKey = `${system}:${mode}`;
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (lastSyncKey !== syncKey) {
    setLastSyncKey(syncKey);
    setKgText(formatNumber(valueKg, 1));
    setLbText(formatNumber(kgToLb(valueKg), 1));
    const { stones, pounds } = kgToStonesLb(valueKg);
    setStText(String(stones));
    setStLbText(formatNumber(pounds, 1));
  }

  if (system === "metric") {
    return (
      <div>
        <label htmlFor={`${id}-kg`} className={labelClass}>
          Weight (kg)
        </label>
        <input
          id={`${id}-kg`}
          type="number"
          inputMode="decimal"
          min={30}
          max={300}
          step="0.1"
          className={`${fieldClass} mt-1`}
          value={kgText}
          onChange={(event) => {
            setKgText(event.target.value);
            const kg = parseNumber(event.target.value);
            if (kg !== null) onChange(kg);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className={labelClass}>Weight</span>
        <label className="text-xs text-muted">
          <span className="sr-only">Imperial weight unit</span>
          <select
            value={mode}
            onChange={(event) => {
              const next = event.target.value === "st" ? "st" : "lb";
              setMode(next);
            }}
            className="rounded border border-border bg-background px-1 py-0.5"
          >
            <option value="lb">pounds</option>
            <option value="st">stones &amp; pounds</option>
          </select>
        </label>
      </div>
      {mode === "lb" ? (
        <div className="mt-1">
          <label htmlFor={`${id}-lb`} className="sr-only">
            Weight (pounds)
          </label>
          <input
            id={`${id}-lb`}
            type="number"
            inputMode="decimal"
            min={66}
            max={661}
            step="0.1"
            className={fieldClass}
            value={lbText}
            onChange={(event) => {
              setLbText(event.target.value);
              const lb = parseNumber(event.target.value);
              if (lb !== null) onChange(lbToKg(lb));
            }}
          />
        </div>
      ) : (
        <div className="mt-1 grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={`${id}-st`} className="sr-only">
              Weight (stones)
            </label>
            <input
              id={`${id}-st`}
              type="number"
              inputMode="numeric"
              min={4}
              max={47}
              className={fieldClass}
              aria-describedby={`${id}-st-unit`}
              value={stText}
              onChange={(event) => {
                setStText(event.target.value);
                const st = parseNumber(event.target.value);
                const lb = parseNumber(stLbText) ?? 0;
                if (st !== null) onChange(stonesLbToKg(st, lb));
              }}
            />
            <span id={`${id}-st-unit`} className="text-xs text-muted">
              st
            </span>
          </div>
          <div>
            <label htmlFor={`${id}-stlb`} className="sr-only">
              Weight (additional pounds)
            </label>
            <input
              id={`${id}-stlb`}
              type="number"
              inputMode="decimal"
              min={0}
              max={13.9}
              step="0.1"
              className={fieldClass}
              aria-describedby={`${id}-stlb-unit`}
              value={stLbText}
              onChange={(event) => {
                setStLbText(event.target.value);
                const lb = parseNumber(event.target.value);
                const st = parseNumber(stText) ?? 0;
                if (lb !== null) onChange(stonesLbToKg(st, lb));
              }}
            />
            <span id={`${id}-stlb-unit`} className="text-xs text-muted">
              lb
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generic length/circumference input (neck, waist, hip…). Canonical value
 * is always cm; imperial mode shows inches.
 */
export function LengthField({
  label,
  valueCm,
  onChange,
  system,
}: {
  label: string;
  valueCm: number;
  onChange: (cm: number) => void;
  system: UnitSystem;
}) {
  const id = useId();
  const [text, setText] = useState(() =>
    formatNumber(system === "metric" ? valueCm : cmToInches(valueCm), 1),
  );

  const [lastSystem, setLastSystem] = useState<UnitSystem>(system);
  if (lastSystem !== system) {
    setLastSystem(system);
    setText(formatNumber(system === "metric" ? valueCm : cmToInches(valueCm), 1));
  }

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label} ({system === "metric" ? "cm" : "in"})
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="0.1"
        className={`${fieldClass} mt-1`}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          const value = parseNumber(event.target.value);
          if (value !== null) {
            onChange(system === "metric" ? value : inchesToCm(value));
          }
        }}
      />
    </div>
  );
}

/**
 * Height input. Canonical value is always cm; imperial uses split ft + in
 * fields (SPEC §6).
 */
export function HeightField({
  valueCm,
  onChange,
  system,
}: {
  valueCm: number;
  onChange: (cm: number) => void;
  system: UnitSystem;
}) {
  const id = useId();
  const [cmText, setCmText] = useState(() => formatNumber(valueCm, 0));
  const [ftText, setFtText] = useState(() =>
    String(cmToFeetInches(valueCm).feet),
  );
  const [inText, setInText] = useState(() =>
    formatNumber(cmToFeetInches(valueCm).inches, 0),
  );

  // Same render-time sync pattern as WeightField, keyed on the unit system.
  const [lastSystem, setLastSystem] = useState<UnitSystem>(system);
  if (lastSystem !== system) {
    setLastSystem(system);
    setCmText(formatNumber(valueCm, 0));
    const { feet, inches } = cmToFeetInches(valueCm);
    setFtText(String(feet));
    setInText(formatNumber(inches, 0));
  }

  if (system === "metric") {
    return (
      <div>
        <label htmlFor={`${id}-cm`} className={labelClass}>
          Height (cm)
        </label>
        <input
          id={`${id}-cm`}
          type="number"
          inputMode="decimal"
          min={120}
          max={250}
          className={`${fieldClass} mt-1`}
          value={cmText}
          onChange={(event) => {
            setCmText(event.target.value);
            const cm = parseNumber(event.target.value);
            if (cm !== null) onChange(cm);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <span className={labelClass}>Height</span>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-ft`} className="sr-only">
            Height (feet)
          </label>
          <input
            id={`${id}-ft`}
            type="number"
            inputMode="numeric"
            min={3}
            max={8}
            className={fieldClass}
            aria-describedby={`${id}-ft-unit`}
            value={ftText}
            onChange={(event) => {
              setFtText(event.target.value);
              const ft = parseNumber(event.target.value);
              const inches = parseNumber(inText) ?? 0;
              if (ft !== null) onChange(feetInchesToCm(ft, inches));
            }}
          />
          <span id={`${id}-ft-unit`} className="text-xs text-muted">
            ft
          </span>
        </div>
        <div>
          <label htmlFor={`${id}-in`} className="sr-only">
            Height (inches)
          </label>
          <input
            id={`${id}-in`}
            type="number"
            inputMode="decimal"
            min={0}
            max={11.9}
            step="0.1"
            className={fieldClass}
            aria-describedby={`${id}-in-unit`}
            value={inText}
            onChange={(event) => {
              setInText(event.target.value);
              const inches = parseNumber(event.target.value);
              const ft = parseNumber(ftText) ?? 0;
              if (inches !== null) onChange(feetInchesToCm(ft, inches));
            }}
          />
          <span id={`${id}-in-unit`} className="text-xs text-muted">
            in
          </span>
        </div>
      </div>
    </div>
  );
}
