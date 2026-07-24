"use client";

import { useSyncExternalStore } from "react";

/* The Arcade BestChip pattern, relabelled for instruments: the Lab's bests
   read as measurements ("Fastest: 231 ms", "Longest span: 8"), and for the
   timed stations lower is better — so this chip formats, it doesn't rank. */
const subscribe = () => () => {};

function readStored(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null; // private mode — no chip
  }
}

export function LabBestChip({
  storageKey,
  label,
  unit,
}: {
  storageKey: string;
  label: string;
  unit?: string;
}) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readStored(storageKey),
    () => null,
  );
  const value = Number(raw ?? 0);
  if (!Number.isFinite(value) || value <= 0) return null;

  return (
    <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
      {label}: {value.toLocaleString("en-GB")}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}
