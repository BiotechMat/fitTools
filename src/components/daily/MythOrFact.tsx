"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { EvidenceTier } from "@/components/EvidenceTier";
import { markActiveToday } from "@/lib/activity-store";
import { trackEvent } from "@/lib/analytics";
import {
  getResult,
  hasPlayed,
  mythKey,
  parseDailyStore,
  readRawDailyStore,
  recordResult,
  subscribeDailyStore,
  updateDailyStore,
} from "@/lib/daily-store";
import { localDateISO, mythIndicesForDate, mythPuzzleNumber } from "@/lib/daily/schedule";
import { mythShareText, shareText } from "@/lib/daily/share";
import type { MythResult } from "@/lib/daily/types";
import { mythItems } from "@/registry/daily";

const ROUNDS = 5;

/**
 * Myth or Fact? — the weekly quiz (DAILY-GAMES.md §3.2). One set per ISO week
 * (refreshes Monday), available all week, locked once played. Deterministic
 * per week; registry ships in the bundle, so pure client state.
 */
export function MythOrFact() {
  const today = useMountedDate();
  const rawStore = useSyncExternalStore(subscribeDailyStore, readRawDailyStore, () => null);
  const store = useMemo(() => parseDailyStore(rawStore), [rawStore]);

  if (!today) {
    return <div className="h-40 animate-pulse rounded-lg border border-border bg-surface-deep" aria-hidden="true" />;
  }

  const puzzle = mythPuzzleNumber(today);
  const items = mythIndicesForDate(mythItems.length, today, ROUNDS).map((i) => mythItems[i]);
  const key = mythKey(puzzle);
  const stored = getResult(store, key) as MythResult | undefined;

  return (
    <MythGame
      key={key}
      items={items}
      puzzle={puzzle}
      today={today}
      storeKey={key}
      alreadyPlayed={hasPlayed(store, key)}
      stored={stored ?? null}
    />
  );
}

function MythGame({
  items,
  puzzle,
  today,
  storeKey,
  alreadyPlayed,
  stored,
}: {
  items: (typeof mythItems)[number][];
  puzzle: number;
  today: string;
  storeKey: string;
  alreadyPlayed: boolean;
  stored: MythResult | null;
}) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<"myth" | "fact" | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(alreadyPlayed);

  const total = items.length;
  const item = items[round];

  const pick = (verdict: "myth" | "fact") => {
    if (picked) return;
    setPicked(verdict);
    if (verdict === item.verdict) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    const isLast = round === total - 1;
    if (isLast) {
      const finalCorrect = correctCount; // already includes this round
      const result: MythResult = { game: "myth", puzzle, correct: finalCorrect, total };
      updateDailyStore((s) => recordResult(s, storeKey, result, today));
      markActiveToday("daily");
      trackEvent({ name: "daily_game_played", params: { game: "myth", result: `${finalCorrect}/${total}` } });
      setFinished(true);
    } else {
      setRound((r) => r + 1);
      setPicked(null);
    }
  };

  const share = () => {
    const correct = stored?.correct ?? correctCount;
    void shareText(mythShareText(puzzle, correct, stored?.total ?? total));
    trackEvent({ name: "daily_game_shared", params: { game: "myth" } });
  };

  const heading = (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-xl uppercase">Myth or Fact?</h2>
      <span className="font-mono text-xs text-muted">Week #{puzzle}</span>
    </div>
  );

  if (total === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-4">
        {heading}
        <p className="mt-2 text-sm text-muted">This week&rsquo;s set is being prepared. Check back soon.</p>
      </section>
    );
  }

  if (finished) {
    const correct = stored?.correct ?? correctCount;
    const shown = stored?.total ?? total;
    return (
      <section aria-label="Myth or Fact result" className="rounded-lg border border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)] sm:p-6">
        {heading}
        <p className="mt-3 font-display text-3xl uppercase" role="status">
          {correct}/{shown} correct
        </p>
        <p className="mt-2 text-muted">
          {alreadyPlayed && stored ? "You&rsquo;ve played this week&rsquo;s set." : "Nicely done."} A fresh five drop every Monday.
        </p>
        <button
          type="button"
          onClick={share}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-foreground px-4 py-2 font-semibold hover:bg-surface-deep"
        >
          <span aria-hidden="true">↗</span> Share score
        </button>
      </section>
    );
  }

  return (
    <section aria-labelledby="myth-heading" className="rounded-lg border border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)] sm:p-6">
      <div className="flex items-center justify-between">
        <h2 id="myth-heading" className="font-display text-xl uppercase">
          Myth or Fact?
        </h2>
        <span className="font-mono text-xs text-muted">
          {round + 1} / {total}
        </span>
      </div>

      <p className="mt-3 text-lg font-medium">&ldquo;{item.statement}&rdquo;</p>

      {!picked ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => pick("myth")}
            className="rounded-full border border-foreground px-4 py-2.5 font-semibold hover:bg-surface-deep"
          >
            Myth
          </button>
          <button
            type="button"
            onClick={() => pick("fact")}
            className="rounded-full border border-foreground px-4 py-2.5 font-semibold hover:bg-surface-deep"
          >
            Fact
          </button>
        </div>
      ) : (
        <div className="mt-4 border-t border-border pt-4" role="status" aria-live="polite">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl uppercase">
              {picked === item.verdict ? "Correct" : "Not quite"}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold uppercase text-muted">
              It&rsquo;s a {item.verdict}
            </span>
            <EvidenceTier tier={item.tier} basis={item.basis} />
          </div>
          <p className="mt-2 text-muted">{item.explanation}</p>

          {item.relatedTool || item.relatedContent ? (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {item.relatedTool ? (
                <Link href={item.relatedTool} className="text-primary underline underline-offset-2" onClick={() => trackEvent({ name: "daily_related_click", params: { id: item.id, target: item.relatedTool! } })}>
                  Try the calculator →
                </Link>
              ) : null}
              {item.relatedContent ? (
                <Link href={item.relatedContent} className="text-primary underline underline-offset-2" onClick={() => trackEvent({ name: "daily_related_click", params: { id: item.id, target: item.relatedContent! } })}>
                  Read more →
                </Link>
              ) : null}
            </div>
          ) : null}

          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-2 block max-w-full truncate font-mono text-xs text-muted underline underline-offset-2 hover:text-foreground"
            title={item.source.label}
          >
            Source: {item.source.label}
          </a>

          <button
            type="button"
            onClick={next}
            className="mt-4 w-full rounded-full bg-primary px-4 py-2.5 font-semibold text-background hover:bg-primary-strong"
          >
            {round === total - 1 ? "See my score" : "Next"}
          </button>
        </div>
      )}
    </section>
  );
}

function useMountedDate(): string | null {
  return useSyncExternalStore(
    () => () => {},
    () => localDateISO(),
    () => null,
  );
}
