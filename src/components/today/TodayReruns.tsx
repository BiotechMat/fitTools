"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/analytics";
import { daysBetween, localDateISO } from "@/lib/daily/schedule";
import { HISTORY_CHANGE_EVENT, parseHistory, readRawHistory } from "@/lib/history";

/**
 * "Due a re-run" chips (TODAY.md §6.4; DESIGN.md §6 welcome-back strip).
 * Soft-amber, never urgent: a nudge that numbers drift, not a task list.
 * Derived entirely from the local history store; renders nothing until a
 * saved result is old enough to be worth refreshing.
 */

/** A tool is worth a fresh run after this many days (TODAY.md §6.4). */
export const RERUN_DUE_AFTER_DAYS = 30;
const MAX_CHIPS = 3;

export interface RerunToolMeta {
  slug: string;
  title: string;
}

function subscribeToHistory(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(HISTORY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(HISTORY_CHANGE_EVENT, onChange);
  };
}

export function TodayReruns({ tools }: { tools: RerunToolMeta[] }) {
  const raw = useSyncExternalStore(subscribeToHistory, readRawHistory, () => null);

  const due = useMemo(() => {
    const titles = new Map(tools.map((t) => [t.slug, t.title]));
    const today = localDateISO();
    // Latest save per tool, then keep the ones old enough to be due.
    const latest = new Map<string, string>();
    for (const r of parseHistory(raw).results) {
      const prev = latest.get(r.tool);
      if (prev === undefined || Date.parse(r.savedAt) > Date.parse(prev)) {
        latest.set(r.tool, r.savedAt);
      }
    }
    return [...latest.entries()]
      .flatMap(([slug, savedAt]) => {
        const title = titles.get(slug);
        if (title === undefined) return [];
        return [{ slug, title, days: daysBetween(localDateISO(new Date(savedAt)), today) }];
      })
      .filter((entry) => entry.days >= RERUN_DUE_AFTER_DAYS)
      .sort((a, b) => b.days - a.days)
      .slice(0, MAX_CHIPS);
  }, [raw, tools]);

  if (due.length === 0) return null;

  return (
    <section aria-label="Due a re-run" data-testid="today-reruns" className="mt-8">
      <h2 className="font-display text-xl uppercase">Due a re-run</h2>
      <p className="mt-1 text-sm text-muted">
        Numbers drift — a fresh run keeps the picture honest.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {due.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/${entry.slug}`}
              onClick={() => trackEvent({ name: "today_rerun_click", params: { tool: entry.slug } })}
              className="inline-flex items-center rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-sm text-foreground hover:border-foreground"
            >
              {entry.title} — last run {entry.days} days ago
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
