"use client";

import { useSyncExternalStore } from "react";

/* localStorage never notifies this tab's own writes, and the chip only
   needs a read-once snapshot per visit — so the subscription is empty. */
const subscribe = () => () => {};

function readStored(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null; // private mode — no chip
  }
}

/**
 * Shows a game's persisted local best on its Arcade card. The server
 * snapshot is null (clean card for first-time visitors); the client
 * snapshot fills it in at hydration without a cascading effect render.
 */
export function BestChip({
  storageKey,
  unit,
}: {
  storageKey: string;
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
      Your best: {value.toLocaleString("en-GB")}
      {unit ? ` ${unit}` : ""}
    </span>
  );
}
