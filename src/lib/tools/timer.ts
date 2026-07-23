/**
 * Gym timer engine (MICROTOOLS.md §2) — pure schedule maths. The component
 * renders `timerStateAt(config, elapsedMs)` against wall-clock elapsed time,
 * so backgrounded tabs and dropped frames never drift the countdown.
 */

export type TimerMode = "rest" | "interval" | "emom";

export interface TimerConfig {
  mode: TimerMode;
  /** Rest mode: total seconds. */
  restSeconds: number;
  /** Interval mode: work/rest seconds and round count. */
  workSeconds: number;
  intervalRestSeconds: number;
  rounds: number;
  /** EMOM: minutes cap per round (usually 60s) and round count. */
  emomSeconds: number;
  emomRounds: number;
}

export const TIMER_DEFAULTS: TimerConfig = {
  mode: "rest",
  restSeconds: 90,
  workSeconds: 40,
  intervalRestSeconds: 20,
  rounds: 8,
  emomSeconds: 60,
  emomRounds: 10,
};

/** Tabata: the classic 20/10 × 8 protocol. */
export const TABATA: Pick<
  TimerConfig,
  "workSeconds" | "intervalRestSeconds" | "rounds"
> = { workSeconds: 20, intervalRestSeconds: 10, rounds: 8 };

export interface TimerState {
  phase: "work" | "rest" | "done";
  /** 1-based round in progress (1 for rest mode). */
  round: number;
  totalRounds: number;
  /** Whole seconds remaining in the current phase (ceil). */
  remainingSeconds: number;
  /** 0..1 progress through the current phase. */
  phaseProgress: number;
  /** Total session length in seconds. */
  totalSeconds: number;
}

export function totalSessionSeconds(config: TimerConfig): number {
  switch (config.mode) {
    case "rest":
      return config.restSeconds;
    case "interval":
      return (config.workSeconds + config.intervalRestSeconds) * config.rounds;
    case "emom":
      return config.emomSeconds * config.emomRounds;
  }
}

export function timerStateAt(config: TimerConfig, elapsedMs: number): TimerState {
  const elapsed = Math.max(0, elapsedMs / 1000);
  const total = totalSessionSeconds(config);
  if (elapsed >= total) {
    return {
      phase: "done",
      round: config.mode === "interval" ? config.rounds : config.emomRounds,
      totalRounds:
        config.mode === "rest"
          ? 1
          : config.mode === "interval"
            ? config.rounds
            : config.emomRounds,
      remainingSeconds: 0,
      phaseProgress: 1,
      totalSeconds: total,
    };
  }

  if (config.mode === "rest") {
    const remaining = total - elapsed;
    return {
      phase: "rest",
      round: 1,
      totalRounds: 1,
      remainingSeconds: Math.ceil(remaining),
      phaseProgress: elapsed / total,
      totalSeconds: total,
    };
  }

  if (config.mode === "interval") {
    const cycle = config.workSeconds + config.intervalRestSeconds;
    const round = Math.floor(elapsed / cycle);
    const inCycle = elapsed - round * cycle;
    const working = inCycle < config.workSeconds;
    const phaseLen = working ? config.workSeconds : config.intervalRestSeconds;
    const inPhase = working ? inCycle : inCycle - config.workSeconds;
    return {
      phase: working ? "work" : "rest",
      round: round + 1,
      totalRounds: config.rounds,
      remainingSeconds: Math.ceil(phaseLen - inPhase),
      phaseProgress: inPhase / phaseLen,
      totalSeconds: total,
    };
  }

  const round = Math.floor(elapsed / config.emomSeconds);
  const inPhase = elapsed - round * config.emomSeconds;
  return {
    phase: "work",
    round: round + 1,
    totalRounds: config.emomRounds,
    remainingSeconds: Math.ceil(config.emomSeconds - inPhase),
    phaseProgress: inPhase / config.emomSeconds,
    totalSeconds: total,
  };
}

/** Clamped URL-param parsing so shared links can't produce absurd timers. */
export function clampTimerConfig(partial: Partial<TimerConfig>): TimerConfig {
  const clamp = (v: number | undefined, lo: number, hi: number, fallback: number) =>
    typeof v === "number" && Number.isFinite(v)
      ? Math.min(hi, Math.max(lo, Math.round(v)))
      : fallback;
  const mode: TimerMode =
    partial.mode === "interval" || partial.mode === "emom" ? partial.mode : "rest";
  return {
    mode,
    restSeconds: clamp(partial.restSeconds, 5, 900, TIMER_DEFAULTS.restSeconds),
    workSeconds: clamp(partial.workSeconds, 5, 600, TIMER_DEFAULTS.workSeconds),
    intervalRestSeconds: clamp(
      partial.intervalRestSeconds,
      0,
      600,
      TIMER_DEFAULTS.intervalRestSeconds,
    ),
    rounds: clamp(partial.rounds, 1, 50, TIMER_DEFAULTS.rounds),
    emomSeconds: clamp(partial.emomSeconds, 10, 300, TIMER_DEFAULTS.emomSeconds),
    emomRounds: clamp(partial.emomRounds, 1, 60, TIMER_DEFAULTS.emomRounds),
  };
}
