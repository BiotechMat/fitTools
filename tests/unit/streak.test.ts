import { describe, expect, it } from "vitest";
import {
  EMPTY_RUN,
  FREEZE_EARN_EVERY,
  MAX_FREEZES,
  advanceRun,
  runAlive,
  type StreakRun,
} from "@/lib/streak";

const on = (run: StreakRun, dates: string[]): StreakRun =>
  dates.reduce((r, d) => advanceRun(r, d), run);

describe("advanceRun — the shared streak core (DAILY-GAMES.md §6 rules)", () => {
  it("starts at 1 and counts consecutive days", () => {
    const run = on(EMPTY_RUN, ["2026-07-01", "2026-07-02", "2026-07-03"]);
    expect(run.current).toBe(3);
    expect(run.best).toBe(3);
    expect(run.last).toBe("2026-07-03");
  });

  it("is idempotent within a day", () => {
    const a = advanceRun(EMPTY_RUN, "2026-07-23");
    expect(advanceRun(a, "2026-07-23")).toEqual(a);
  });

  it("ignores a backdated action — history is never rewritten", () => {
    const run = on(EMPTY_RUN, ["2026-07-01", "2026-07-02"]);
    expect(advanceRun(run, "2026-07-01")).toEqual(run);
    expect(advanceRun(run, "2026-06-15")).toEqual(run);
  });

  it("earns a freeze each completed week, capped at MAX_FREEZES", () => {
    const days = Array.from({ length: FREEZE_EARN_EVERY * (MAX_FREEZES + 1) }, (_, i) => {
      const d = new Date(Date.UTC(2026, 0, 1 + i));
      return d.toISOString().slice(0, 10);
    });
    const run = on(EMPTY_RUN, days);
    expect(run.current).toBe(days.length);
    expect(run.freezes).toBe(MAX_FREEZES); // 4 weeks completed, cap holds at 3
  });

  it("bridges a multi-day gap when the balance covers every missed day", () => {
    // 14 straight days → 2 freezes; then miss the 15th and 16th.
    const days = Array.from({ length: 14 }, (_, i) => `2026-07-${String(i + 1).padStart(2, "0")}`);
    let run = on(EMPTY_RUN, days);
    expect(run.freezes).toBe(2);
    run = advanceRun(run, "2026-07-17");
    expect(run.current).toBe(15);
    expect(run.freezes).toBe(0);
  });

  it("resets warmly (best kept) when the gap exceeds the balance", () => {
    let run = on(EMPTY_RUN, ["2026-07-01", "2026-07-02"]); // no freezes yet
    run = advanceRun(run, "2026-07-10");
    expect(run.current).toBe(1);
    expect(run.best).toBe(2);
    expect(run.last).toBe("2026-07-10");
  });
});

describe("runAlive — display-state helper", () => {
  it("a never-started run is not alive", () => {
    expect(runAlive(EMPTY_RUN, "2026-07-23")).toBe(false);
  });

  it("alive on the counted day and the day after", () => {
    const run = advanceRun(EMPTY_RUN, "2026-07-22");
    expect(runAlive(run, "2026-07-22")).toBe(true);
    expect(runAlive(run, "2026-07-23")).toBe(true);
  });

  it("without freezes, a one-day miss lapses it; a freeze keeps it alive", () => {
    const noFreeze = advanceRun(EMPTY_RUN, "2026-07-20");
    expect(runAlive(noFreeze, "2026-07-22")).toBe(false);
    const withFreeze: StreakRun = { ...noFreeze, freezes: 1 };
    expect(runAlive(withFreeze, "2026-07-22")).toBe(true);
    expect(runAlive(withFreeze, "2026-07-23")).toBe(false);
  });
});
