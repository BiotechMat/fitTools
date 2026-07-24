"use client";

/**
 * Manual biomarker entry (A4 — DASHBOARD §3.3b, decided ACCOUNTS §9.7:
 * manual entry ships before the partner integration; the partner
 * auto-population later lands in the same store). Values are stored in
 * this browser's dashboard store, and — Mat, 2026-07-24 — follow the
 * account when its own 18+ consent switch ("bloodwork-storage", separate
 * from the general health consent) is on, synced via the `bloodwork`
 * namespace. Without that consent, or signed out, they stay device-only.
 *
 * Compliance (DASHBOARD §9): ClinicalDisclaimer renders wherever blood
 * values show; no reference ranges, no "optimal" values — the registry's
 * deliberate omission holds. Entries are educational self-tracking, framed
 * exactly like the blood-test page.
 */

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  DASHBOARD_CHANGE_EVENT,
  parseDashboard,
  readRawDashboard,
  upsertBiomarkerReading,
  writeDashboard,
  type BiomarkerReading,
} from "@/lib/dashboard-store";
import { BIOMARKER_GROUPS, biomarkers } from "@/registry/biomarkers";
import { ClinicalDisclaimer } from "@/components/ClinicalDisclaimer";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(DASHBOARD_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DASHBOARD_CHANGE_EVENT, onChange);
  };
}

const inputClass = "rounded-xl border-2 border-foreground bg-background px-3 py-2";

export function BiomarkerEntry(): React.ReactElement {
  const raw = useSyncExternalStore(subscribe, readRawDashboard, () => null);
  const doc = useMemo(() => parseDashboard(raw), [raw]);

  const [marker, setMarker] = useState(biomarkers[0]?.id ?? "");
  const [value, setValue] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [confirmNote, setConfirmNote] = useState(false);

  const selected = biomarkers.find((b) => b.id === marker);
  const readings = [...doc.biomarkers].sort((a, b) => (a.takenAt < b.takenAt ? 1 : -1));

  const markerName = (id: string): string => biomarkers.find((b) => b.id === id)?.name ?? id;

  const add = (event: React.FormEvent): void => {
    event.preventDefault();
    const numeric = Number(value);
    if (!selected || !Number.isFinite(numeric) || numeric <= 0 || takenAt === "") return;
    const reading: BiomarkerReading = {
      marker: selected.id,
      value: numeric,
      unit: selected.unit,
      takenAt,
      source: "manual",
    };
    writeDashboard(upsertBiomarkerReading(doc, reading));
    setValue("");
    setConfirmNote(true);
  };

  const remove = (reading: BiomarkerReading): void => {
    writeDashboard({
      ...doc,
      biomarkers: doc.biomarkers.filter(
        (b) => !(b.marker === reading.marker && b.takenAt === reading.takenAt),
      ),
    });
  };

  return (
    <section aria-labelledby="biomarker-entry" className="mt-10">
      <h2 id="biomarker-entry" className="font-display text-xl uppercase">
        Add a blood result
      </h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Type results from any lab report — they feed the same dashboard your{" "}
        <Link href="/blood-test" className="underline hover:text-foreground">
          blood test
        </Link>{" "}
        will, stored on this device (and in your account, if you switch that
        on). No target ranges are shown: a number without clinical context is
        a note, not a verdict — discuss anything unexpected with your GP.
      </p>

      <div className="mt-4">
        <ClinicalDisclaimer />
      </div>

      <form
        onSubmit={add}
        className="mt-4 rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[4px_4px_0_0_var(--color-foreground)]"
      >
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="bm-marker" className="block font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Marker
            </label>
            <select
              id="bm-marker"
              value={marker}
              onChange={(event) => setMarker(event.target.value)}
              className={`${inputClass} mt-1`}
            >
              {BIOMARKER_GROUPS.map((group) => (
                <optgroup key={group.category} label={group.label}>
                  {biomarkers
                    .filter((b) => b.category === group.category)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bm-value" className="block font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Value {selected ? `(${selected.unit})` : ""}
            </label>
            <input
              id="bm-value"
              type="number"
              step="any"
              min="0"
              required
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className={`${inputClass} mt-1 w-32`}
            />
          </div>
          <div>
            <label htmlFor="bm-date" className="block font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Draw date
            </label>
            <input
              id="bm-date"
              type="date"
              required
              value={takenAt}
              onChange={(event) => setTakenAt(event.target.value)}
              className={`${inputClass} mt-1`}
            />
          </div>
          <button
            type="submit"
            className="rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 font-bold text-foreground shadow-[3px_3px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]"
          >
            Add result
          </button>
        </div>
        {confirmNote ? (
          <p aria-live="polite" className="mt-3 text-sm text-muted">
            Saved to this device. Blood results follow your account only if
            you&apos;ve switched that on (its own consent, 18+) on your{" "}
            <Link href="/account" className="underline hover:text-foreground">
              account page
            </Link>
            .
          </p>
        ) : null}
      </form>

      {readings.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {readings.map((reading) => (
            <li
              key={`${reading.marker}-${reading.takenAt}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-foreground bg-surface px-4 py-2 text-sm"
            >
              <span>
                <strong>{markerName(reading.marker)}</strong>{" "}
                <span className="font-mono">
                  {reading.value} {reading.unit}
                </span>{" "}
                <span className="text-muted">
                  · {reading.takenAt} · {reading.source === "manual" ? "entered by you" : "blood test"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(reading)}
                aria-label={`Remove ${markerName(reading.marker)} from ${reading.takenAt}`}
                className="rounded-full border border-foreground px-2 text-xs font-bold text-muted hover:text-foreground"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
