"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  HISTORY_CHANGE_EVENT,
  type MetricDirection,
  type StoredResult,
  claimFirstWin,
  clearToolHistory,
  frameDelta,
  latestBefore,
  parseHistory,
  readHistory,
  readRawHistory,
  upsertResult,
  writeHistory,
} from "@/lib/history";

/**
 * "Since last time" footer for a ResultsPanel (DESIGN.md §6 — the temporal
 * you-vs-you loop, local-only per SPEC §10). Renders a fixed-height row so
 * the post-hydration chip never shifts layout (zero CLS):
 *
 *   first ever save   → day-1 win badge (ROADMAP E3)
 *   prior-day result  → positively-framed delta chip vs that baseline
 *   otherwise         → the on-device privacy note
 *
 * Saves are debounced until the result has been stable for a beat, and only
 * fire after the user has actually driven a recalculation — the defaults
 * render is not progress (same rule as calc_completed).
 */

const SAVE_DELAY_MS = 2000;

interface ResultHistoryProps {
  /** Registry slug, e.g. "one-rep-max-calculator". */
  tool: string;
  /** Canonical SI value of the primary result; null while inputs are invalid. */
  value: number | null;
  /** Whether a bigger number is an improvement ("none" = valence-free). */
  direction: MetricDirection;
  /** Noise floor in canonical units: differences within it read as "level". */
  epsilon: number;
  /** Formats a canonical-unit delta for display (unit-system aware). */
  formatDelta: (deltaAbs: number) => string;
}

function subscribeToHistory(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(HISTORY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(HISTORY_CHANGE_EVENT, onChange);
  };
}

function baselineDate(baseline: StoredResult): string {
  const saved = new Date(baseline.savedAt);
  const sameYear = saved.getFullYear() === new Date().getFullYear();
  return saved.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// Positive deltas are forest green (DESIGN.md §1: Forest owns health wins);
// neutral states stay quiet — regression is never given an alarm colour.
const goodChipClass =
  "inline-flex items-center gap-1 rounded-full border border-good bg-good-soft px-2.5 py-0.5 font-medium text-good tabular-nums";
const neutralChipClass =
  "inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-muted tabular-nums";

export function ResultHistory({
  tool,
  value,
  direction,
  epsilon,
  formatDelta,
}: ResultHistoryProps) {
  const [firstWin, setFirstWin] = useState(false);

  // Reactive raw-storage read (server snapshot: null, so static HTML is
  // deterministic). Because latestBefore ignores today's entries, this
  // session's own saves never move the baseline — only a prior-day entry
  // or the clear button changes it.
  const rawHistory = useSyncExternalStore(subscribeToHistory, readRawHistory, () => null);
  const baseline = useMemo(
    () => latestBefore(parseHistory(rawHistory), tool, new Date()),
    [rawHistory, tool],
  );

  // Only user-driven recalculations are saved (defaults render excluded).
  // "User-driven" means the value moved beyond the metric's noise floor
  // since the last anchor: a first-run flag is defeated by StrictMode's
  // double dev effects, and exact comparison is defeated by the unit-system
  // hydration flip, whose display round-trip drifts canonical values by a
  // hair. Neither is progress; neither may bank a result.
  const lastValue = useRef<number | null>(value);
  useEffect(() => {
    const previous = lastValue.current;
    const unchanged =
      value !== null && previous !== null
        ? Math.abs(value - previous) <= epsilon
        : value === previous;
    if (unchanged) return;
    lastValue.current = value;
    if (value === null) return;
    const timer = window.setTimeout(() => {
      const saved = writeHistory(
        upsertResult(readHistory(), {
          tool,
          value,
          savedAt: new Date().toISOString(),
        }),
      );
      if (saved && claimFirstWin()) setFirstWin(true);
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [tool, value, epsilon]);

  if (value === null) return null;

  let content: React.ReactNode;
  if (firstWin) {
    content = (
      <>
        <span className={goodChipClass}>First number banked ✓</span>
        <span className="text-muted">Progress saves on this device only.</span>
      </>
    );
  } else if (baseline !== null) {
    const delta = frameDelta(direction, epsilon, baseline.value, value);
    const date = baselineDate(baseline);
    let chip: React.ReactNode;
    switch (delta.kind) {
      case "better":
        chip = (
          <span className={goodChipClass}>
            {direction === "up" ? "Up" : "Down"} {formatDelta(delta.deltaAbs)} since {date} ✓
          </span>
        );
        break;
      case "level":
        chip = (
          <span className={goodChipClass}>Level with your {date} number — consistency banked</span>
        );
        break;
      case "behind":
        chip = (
          <span className={neutralChipClass}>
            {formatDelta(delta.deltaAbs)} {direction === "up" ? "below" : "above"} your {date}{" "}
            number — day-to-day swings are normal
          </span>
        );
        break;
      case "changed":
        chip = (
          <span className={neutralChipClass}>
            {delta.direction === "up" ? "Up" : "Down"} {formatDelta(delta.deltaAbs)} since {date}
          </span>
        );
        break;
    }
    content = (
      <>
        {chip}
        <button
          type="button"
          className="text-muted underline underline-offset-2 hover:text-foreground"
          onClick={() => clearToolHistory(tool)}
        >
          Saved on this device · clear
        </button>
      </>
    );
  } else {
    content = (
      <span className="text-muted">Results save to this device only — private, automatic.</span>
    );
  }

  return (
    <div
      data-testid="result-history"
      className="mt-3 flex min-h-7 flex-wrap items-center gap-x-3 gap-y-1 text-xs"
    >
      {content}
    </div>
  );
}
