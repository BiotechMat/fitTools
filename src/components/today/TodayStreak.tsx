"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  isDoneOn,
  parseActivityStore,
  readRawActivityStore,
  subscribeActivityStore,
  type ActivitySource,
} from "@/lib/activity-store";
import { localDateISO } from "@/lib/daily/schedule";
import { runAlive } from "@/lib/streak";

/**
 * The site-wide "showed up" streak panel (TODAY.md §5–§6). One generous
 * umbrella run; DESIGN.md §6 states bind: active = flame chip, freezes are
 * visibly protective, a lapse gets warm re-entry copy — no loss state, no
 * countdown, no guilt register anywhere in this component.
 */

const CHECKLIST: { source: ActivitySource; label: string }[] = [
  { source: "calc", label: "run a number" },
  { source: "daily", label: "play the daily" },
  { source: "pulse", label: "save a fact" },
];

export function TodayStreak() {
  const raw = useSyncExternalStore(subscribeActivityStore, readRawActivityStore, () => null);
  const store = useMemo(() => parseActivityStore(raw), [raw]);
  const today = localDateISO();
  const { streak } = store;
  const alive = runAlive(streak, today);
  const countedToday = streak.last === today;

  let headline: React.ReactNode;
  if (alive) {
    headline = (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary-soft px-3 py-1 font-semibold text-primary">
          <span aria-hidden="true">🔥</span>
          {streak.current}-day streak
        </span>
        {countedToday ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-good bg-good-soft px-3 py-1 font-medium text-good">
            banked today ✓
          </span>
        ) : (
          <span className="text-muted">One small thing today keeps it going.</span>
        )}
        {streak.freezes > 0 ? (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-muted"
            title="A freeze automatically covers a missed day, so your streak survives the odd rest day."
          >
            <span aria-hidden="true">❄️</span>
            {streak.freezes} {streak.freezes === 1 ? "freeze" : "freezes"}
          </span>
        ) : null}
        {streak.best > streak.current ? <span className="text-muted">Best: {streak.best}</span> : null}
      </div>
    );
  } else if (streak.best > 0) {
    // Lapsed — warm re-entry, best kept, no ceremony (DESIGN.md §6).
    headline = (
      <p className="text-sm text-foreground">
        Good to have you back — pick up where it counts.{" "}
        <span className="text-muted">Best run: {streak.best} days, still yours.</span>
      </p>
    );
  } else {
    headline = (
      <p className="text-sm text-muted">
        Do one small thing today and a streak starts here. Miss a day later and an
        earned freeze covers it — no guilt, no lost progress.
      </p>
    );
  }

  return (
    <section
      aria-label="Your streak"
      data-testid="today-streak"
      className="rounded-xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
    >
      {headline}
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted">
        {CHECKLIST.map(({ source, label }) => {
          const done = isDoneOn(store, source, today);
          return (
            <li key={source} className={done ? "text-good" : undefined}>
              <span aria-hidden="true">{done ? "✓" : "·"}</span> {label}
              {done ? <span className="sr-only"> — done today</span> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
