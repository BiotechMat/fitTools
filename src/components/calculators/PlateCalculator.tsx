"use client";

import { useCallback, useId, useMemo, useState, useSyncExternalStore } from "react";
import { type PlateStock, planPlateLoad } from "@/lib/formulas/plates";
import plateData from "@/data/plates.json";
import {
  PLATE_DEFAULTS,
  PLATE_LIMITS,
} from "@/registry/configs/plate-calculator.shared";
import { inRange } from "@/registry/configs/tdee.shared";
import { CalculatorShell } from "@/components/CalculatorShell";
import { BarbellLoad } from "@/components/effects/BarbellLoad";
import { ResultsPanel } from "@/components/ResultsPanel";
import { formatNumber, inputClass, labelClass } from "@/components/calculators/styles";

const STORAGE_KEY = "fittools:plate-inventory";
const CHANGE_EVENT = "fittools:plate-inventory-change";

function defaultInventory(): PlateStock[] {
  return plateData.metric.plates.map((plate) => ({ ...plate }));
}

function parseInventory(raw: string | null): PlateStock[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const valid = parsed.every(
      (item): item is PlateStock =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as PlateStock).plateKg === "number" &&
        typeof (item as PlateStock).perSide === "number",
    );
    return valid ? (parsed as PlateStock[]) : null;
  } catch {
    return null;
  }
}

// Snapshot cache: useSyncExternalStore needs referential stability for
// unchanged data, so re-parse only when the raw string changes.
let cachedRaw: string | null = null;
let cachedInventory: PlateStock[] | null = null;

function inventorySnapshot(): PlateStock[] | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedInventory = parseInventory(raw);
  }
  return cachedInventory;
}

function subscribeToInventory(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function PlateCalculator() {
  const id = useId();
  const [targetText, setTargetText] = useState(String(PLATE_DEFAULTS.targetKg));
  const [barKg, setBarKg] = useState<number>(PLATE_DEFAULTS.barKg);

  // Inventory lives in localStorage (user-editable, SPEC §7); the server
  // snapshot is null so static HTML renders the default rack.
  const storedInventory = useSyncExternalStore(
    subscribeToInventory,
    inventorySnapshot,
    () => null,
  );
  const inventory = useMemo(
    () => storedInventory ?? defaultInventory(),
    [storedInventory],
  );

  const updateInventory = useCallback(
    (index: number, perSide: number) => {
      const next = inventory.map((item, i) =>
        i === index ? { ...item, perSide } : item,
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [inventory],
  );

  const result = useMemo(() => {
    const targetKg = Number(targetText);
    if (!inRange(targetKg, PLATE_LIMITS.targetKg) || targetKg < barKg) return null;
    return planPlateLoad(targetKg, barKg, inventory);
  }, [targetText, barKg, inventory]);

  return (
    <CalculatorShell>
      <form aria-label="Plate calculator inputs" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-target`} className={labelClass}>
              Target weight (kg)
            </label>
            <input
              id={`${id}-target`}
              type="number"
              inputMode="decimal"
              min={PLATE_LIMITS.targetKg.min}
              max={PLATE_LIMITS.targetKg.max}
              step="0.5"
              className={inputClass}
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${id}-bar`} className={labelClass}>
              Bar weight
            </label>
            <select
              id={`${id}-bar`}
              className={inputClass}
              value={barKg}
              onChange={(e) => setBarKg(Number(e.target.value))}
            >
              {plateData.metric.barOptionsKg.map((option) => (
                <option key={option} value={option}>
                  {option} kg{option === plateData.metric.defaultBarKg ? " (standard)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">
            Plates available per side
          </legend>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {inventory.map((stock, index) => (
              <div key={stock.plateKg}>
                <label
                  htmlFor={`${id}-plate-${stock.plateKg}`}
                  className="block text-xs text-muted"
                >
                  {stock.plateKg} kg
                </label>
                <input
                  id={`${id}-plate-${stock.plateKg}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={10}
                  className={inputClass}
                  value={stock.perSide}
                  onChange={(e) => {
                    const perSide = Math.max(
                      0,
                      Math.min(10, Math.floor(Number(e.target.value) || 0)),
                    );
                    updateInventory(index, perSide);
                  }}
                />
              </div>
            ))}
          </div>
        </fieldset>
      </form>

      <ResultsPanel>
        {result ? (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {result.exact ? "Load each side with" : "Nearest achievable load"}
            </h2>
            <p className="mt-1 text-3xl font-bold text-primary-strong" data-testid="plate-stack">
              {result.perSide.length > 0
                ? result.perSide.map((plate) => `${plate}`).join(" + ")
                : "Empty bar"}
              {result.perSide.length > 0 ? " kg" : ""}
            </p>
            <BarbellLoad
              key={result.perSide.join("+")}
              perSide={result.perSide}
            />
            <p className="mt-2 text-lg" data-testid="plate-total">
              Total: <span className="font-semibold">{formatNumber(result.achievedKg, 1)} kg</span>
              {result.exact ? "" : ` (nearest to your ${targetText} kg target)`}
            </p>
            {!result.exact ? (
              <p className="mt-2 max-w-prose text-sm text-muted">
                Your exact target can&rsquo;t be built from the plates listed —
                this is the closest load your rack allows. Add smaller plates
                to the inventory for finer jumps.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Enter a target of at least the bar weight to see the per-side
            plate stack.
          </p>
        )}
      </ResultsPanel>
    </CalculatorShell>
  );
}
