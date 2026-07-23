"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseDailyStore, readRawDailyStore, subscribeDailyStore } from "@/lib/daily-store";
import { Ballpark } from "./Ballpark";
import { MythOrFact } from "./MythOrFact";
import { StreakChip } from "./StreakChip";

/**
 * The /daily surface (DAILY-GAMES.md §11): today's Ballpark, the streak chip,
 * and this week's Myth or Fact. Each game owns its own store reads; the hub
 * subscribes only for the streak chip.
 */
export function DailyHub() {
  const rawStore = useSyncExternalStore(subscribeDailyStore, readRawDailyStore, () => null);
  const store = useMemo(() => parseDailyStore(rawStore), [rawStore]);

  return (
    <div className="flex flex-col gap-6">
      <StreakChip streak={store.streak} />
      <Ballpark />
      <MythOrFact />
    </div>
  );
}
