"use client";

import type { StreakState } from "@/lib/daily-store";

/**
 * Streak chip (DAILY-GAMES.md §11). Ember motif in the Blaze accent; shows the
 * current run and freeze balance plainly. No decay animation exists in this
 * system (§6, DESIGN §6 no-loss rule) — a rest day is bridged or warmly reset,
 * never punished.
 */
export function StreakChip({ streak }: { streak: StreakState }) {
  const { current, best, freezes } = streak;

  if (current === 0) {
    return (
      <p className="text-sm text-muted">
        Play today to start a streak. Miss a day and an earned freeze covers it —
        no guilt, no lost progress.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary-soft px-3 py-1 font-semibold text-primary">
        <span aria-hidden="true">🔥</span>
        {current}-day streak
      </span>
      {freezes > 0 ? (
        <span
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted"
          title="A freeze automatically covers a missed day, so your streak survives the odd rest day."
        >
          <span aria-hidden="true">❄️</span>
          {freezes} {freezes === 1 ? "freeze" : "freezes"}
        </span>
      ) : null}
      {best > current ? <span className="text-muted">Best: {best}</span> : null}
    </div>
  );
}
