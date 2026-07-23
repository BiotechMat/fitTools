import { describe, expect, it } from "vitest";
import {
  TABATA,
  TIMER_DEFAULTS,
  clampTimerConfig,
  timerStateAt,
  totalSessionSeconds,
} from "@/lib/tools/timer";

const interval = clampTimerConfig({ mode: "interval", ...TABATA });

describe("timer engine (MICROTOOLS.md §2)", () => {
  it("rest mode counts down and completes", () => {
    const config = clampTimerConfig({ mode: "rest", restSeconds: 90 });
    expect(totalSessionSeconds(config)).toBe(90);
    expect(timerStateAt(config, 0).remainingSeconds).toBe(90);
    expect(timerStateAt(config, 89_500).remainingSeconds).toBe(1);
    expect(timerStateAt(config, 90_000).phase).toBe("done");
  });

  it("tabata cycles work→rest across 8 rounds", () => {
    expect(totalSessionSeconds(interval)).toBe(240);
    const early = timerStateAt(interval, 5_000);
    expect(early.phase).toBe("work");
    expect(early.round).toBe(1);
    const rest1 = timerStateAt(interval, 25_000);
    expect(rest1.phase).toBe("rest");
    expect(rest1.remainingSeconds).toBe(5);
    const round2 = timerStateAt(interval, 30_000);
    expect(round2.phase).toBe("work");
    expect(round2.round).toBe(2);
    expect(timerStateAt(interval, 240_000).phase).toBe("done");
  });

  it("emom rolls a fresh minute per round", () => {
    const config = clampTimerConfig({ mode: "emom", emomSeconds: 60, emomRounds: 10 });
    const state = timerStateAt(config, 61_000);
    expect(state.round).toBe(2);
    expect(state.remainingSeconds).toBe(59);
    expect(timerStateAt(config, 600_000).phase).toBe("done");
  });

  it("clamps hostile URL params into sane ranges", () => {
    const config = clampTimerConfig({
      mode: "interval",
      workSeconds: 99999,
      intervalRestSeconds: -5,
      rounds: 4000,
    });
    expect(config.workSeconds).toBe(600);
    expect(config.intervalRestSeconds).toBe(0);
    expect(config.rounds).toBe(50);
    expect(clampTimerConfig({}).mode).toBe("rest");
    expect(clampTimerConfig({}).restSeconds).toBe(TIMER_DEFAULTS.restSeconds);
  });
});
