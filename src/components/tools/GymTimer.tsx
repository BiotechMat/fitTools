"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TABATA,
  TIMER_DEFAULTS,
  type TimerConfig,
  type TimerMode,
  clampTimerConfig,
  timerStateAt,
  totalSessionSeconds,
} from "@/lib/tools/timer";

/**
 * Gym timers (MICROTOOLS.md §2). Wall-clock engine from src/lib/tools/timer
 * — the component only renders state, so backgrounding never drifts it.
 * Synth countdown ticks (muted state persisted), shareable URL params,
 * wake-lock while running (progressive enhancement), title countdown.
 */

const MUTE_KEY = "fittools.tools.muted";

function beep(
  ctx: AudioContext | null,
  muted: boolean,
  freq: number,
  ms: number,
  type: OscillatorType = "square",
  gain = 0.05,
): void {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + ms / 1000);
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : String(s);
}

const MODE_LABELS: Record<TimerMode, string> = {
  rest: "Rest",
  interval: "Intervals",
  emom: "EMOM",
};

const REST_PRESETS = [60, 90, 120, 180];

export function GymTimer() {
  const [config, setConfig] = useState<TimerConfig>(TIMER_DEFAULTS);
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [muted, setMuted] = useState(false);
  const startedAt = useRef(0);
  const pausedAccum = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);
  const lastSecond = useRef(-1);
  const lastPhase = useRef<string>("");
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const originalTitle = useRef<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MUTE_KEY) === "1";
      setMuted(stored);
      mutedRef.current = stored;
    } catch {
      /* fine */
    }
    const params = new URLSearchParams(window.location.search);
    const num = (key: string) => {
      const raw = params.get(key);
      return raw === null ? undefined : Number(raw);
    };
    const modeParam = params.get("mode");
    if (modeParam !== null || params.size > 0) {
      setConfig(
        clampTimerConfig({
          // Unknown strings fall back to "rest" inside the clamp; the cast
          // just satisfies the partial's type at the boundary.
          mode: (modeParam ?? undefined) as TimerMode | undefined,
          restSeconds: num("rest"),
          workSeconds: num("work"),
          intervalRestSeconds: num("pause"),
          rounds: num("rounds"),
          emomSeconds: num("emom"),
          emomRounds: num("emomRounds"),
        }),
      );
    }
    return () => {
      if (originalTitle.current !== null) document.title = originalTitle.current;
      void wakeLock.current?.release().catch(() => undefined);
    };
  }, []);

  const updateConfig = (next: TimerConfig) => {
    setConfig(next);
    setRunning(false);
    pausedAccum.current = 0;
    setElapsedMs(0);
    lastSecond.current = -1;
    lastPhase.current = "";
    const params = new URLSearchParams();
    params.set("mode", next.mode);
    if (next.mode === "rest") params.set("rest", String(next.restSeconds));
    if (next.mode === "interval") {
      params.set("work", String(next.workSeconds));
      params.set("pause", String(next.intervalRestSeconds));
      params.set("rounds", String(next.rounds));
    }
    if (next.mode === "emom") {
      params.set("emom", String(next.emomSeconds));
      params.set("emomRounds", String(next.emomRounds));
    }
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const state = timerStateAt(config, elapsedMs);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const elapsed = pausedAccum.current + (performance.now() - startedAt.current);
      setElapsedMs(elapsed);
      const s = timerStateAt(config, elapsed);
      document.title = `${formatClock(s.remainingSeconds)} · ${
        s.phase === "done" ? "done" : s.phase
      } | FitTools`;
      const ctx = audioRef.current;
      if (s.phase !== lastPhase.current) {
        if (s.phase === "work") beep(ctx, mutedRef.current, 880, 140, "square", 0.06);
        if (s.phase === "rest" && lastPhase.current !== "")
          beep(ctx, mutedRef.current, 440, 140, "square", 0.05);
        if (s.phase === "done") {
          beep(ctx, mutedRef.current, 660, 120);
          setTimeout(() => beep(audioRef.current, mutedRef.current, 660, 120), 180);
          setTimeout(() => beep(audioRef.current, mutedRef.current, 990, 320), 360);
          if ("vibrate" in navigator) navigator.vibrate([80, 60, 120]);
          setRunning(false);
          void wakeLock.current?.release().catch(() => undefined);
        }
        lastPhase.current = s.phase;
      } else if (
        s.remainingSeconds !== lastSecond.current &&
        s.remainingSeconds <= 3 &&
        s.remainingSeconds > 0
      ) {
        beep(ctx, mutedRef.current, 520, 80, "square", 0.045);
      }
      lastSecond.current = s.remainingSeconds;
    }, 100);
    return () => window.clearInterval(id);
  }, [running, config]);

  const start = useCallback(() => {
    if (!audioRef.current && typeof AudioContext !== "undefined") {
      try {
        audioRef.current = new AudioContext();
      } catch {
        /* silent timer */
      }
    }
    if (originalTitle.current === null) originalTitle.current = document.title;
    if (state.phase === "done") {
      pausedAccum.current = 0;
      setElapsedMs(0);
      lastSecond.current = -1;
      lastPhase.current = "";
    }
    startedAt.current = performance.now();
    setRunning(true);
    const nav = navigator;
    if ("wakeLock" in nav) {
      void nav.wakeLock
        .request("screen")
        .then((lock) => {
          wakeLock.current = lock;
        })
        .catch(() => undefined);
    }
  }, [state.phase]);

  const pause = () => {
    pausedAccum.current += performance.now() - startedAt.current;
    setRunning(false);
    void wakeLock.current?.release().catch(() => undefined);
  };

  const reset = () => {
    setRunning(false);
    pausedAccum.current = 0;
    setElapsedMs(0);
    lastSecond.current = -1;
    lastPhase.current = "";
    if (originalTitle.current !== null) document.title = originalTitle.current;
    void wakeLock.current?.release().catch(() => undefined);
  };

  const numberField = (
    label: string,
    value: number,
    onChange: (v: number) => void,
  ) => (
    <label className="block text-sm font-semibold">
      {label}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base"
      />
    </label>
  );

  const phaseTone =
    state.phase === "work"
      ? "bg-primary-strong text-background"
      : state.phase === "done"
        ? "bg-good text-background"
        : "bg-surface-deep text-foreground";

  return (
    <div className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[5px_5px_0_0_var(--color-foreground)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border-2 border-foreground bg-background p-1">
          {(Object.keys(MODE_LABELS) as TimerMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => updateConfig({ ...config, mode })}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                config.mode === mode
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-pressed={muted}
          onClick={() =>
            setMuted((m) => {
              mutedRef.current = !m;
              try {
                localStorage.setItem(MUTE_KEY, m ? "0" : "1");
              } catch {
                /* fine */
              }
              return !m;
            })
          }
          className="rounded-full border-2 border-foreground bg-surface px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {config.mode === "rest" ? (
          <>
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold">Presets</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {REST_PRESETS.map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    onClick={() => updateConfig({ ...config, restSeconds: seconds })}
                    className={`rounded-full border-2 border-foreground px-4 py-1.5 font-mono text-xs font-bold ${
                      config.restSeconds === seconds
                        ? "bg-foreground text-background"
                        : "bg-background"
                    }`}
                  >
                    {formatClock(seconds)}
                  </button>
                ))}
              </div>
            </div>
            {numberField("Custom (seconds)", config.restSeconds, (v) =>
              updateConfig(clampTimerConfig({ ...config, restSeconds: v })),
            )}
          </>
        ) : null}
        {config.mode === "interval" ? (
          <>
            {numberField("Work (s)", config.workSeconds, (v) =>
              updateConfig(clampTimerConfig({ ...config, workSeconds: v })),
            )}
            {numberField("Rest (s)", config.intervalRestSeconds, (v) =>
              updateConfig(clampTimerConfig({ ...config, intervalRestSeconds: v })),
            )}
            {numberField("Rounds", config.rounds, (v) =>
              updateConfig(clampTimerConfig({ ...config, rounds: v })),
            )}
            <button
              type="button"
              onClick={() =>
                updateConfig(clampTimerConfig({ ...config, ...TABATA }))
              }
              className="justify-self-start rounded-full border-2 border-foreground bg-good-soft px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] sm:col-span-3"
            >
              Tabata preset · 20/10 × 8
            </button>
          </>
        ) : null}
        {config.mode === "emom" ? (
          <>
            {numberField("Every (s)", config.emomSeconds, (v) =>
              updateConfig(clampTimerConfig({ ...config, emomSeconds: v })),
            )}
            {numberField("Rounds", config.emomRounds, (v) =>
              updateConfig(clampTimerConfig({ ...config, emomRounds: v })),
            )}
          </>
        ) : null}
      </div>

      <div
        className="mt-6 rounded-2xl border-2 border-foreground bg-foreground p-6 text-center text-background"
        aria-live="off"
      >
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background/70">
          {config.mode === "rest"
            ? "Resting"
            : `Round ${state.round} of ${state.totalRounds}`}
        </p>
        <p
          className="font-display text-8xl uppercase tabular-nums text-primary-strong"
          data-testid="timer-clock"
        >
          {formatClock(state.remainingSeconds)}
        </p>
        <p className="mt-2">
          <span
            className={`inline-block rounded-full px-4 py-1 font-mono text-xs font-bold uppercase tracking-[0.14em] ${phaseTone}`}
          >
            {state.phase === "done"
              ? "Done ✓"
              : state.phase === "work"
                ? "Work"
                : "Rest"}
          </span>
        </p>
        <div
          className="mx-auto mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-background/20"
          aria-hidden="true"
        >
          <div
            className="h-full bg-primary-strong"
            style={{ width: `${Math.round(state.phaseProgress * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {running ? (
          <button
            type="button"
            onClick={pause}
            className="riso-press rounded-full border-2 border-foreground bg-surface px-6 py-2 font-bold"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-6 py-2 font-bold text-background"
          >
            {elapsedMs > 0 && state.phase !== "done" ? "Resume" : "Start"}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="riso-press rounded-full border-2 border-foreground bg-surface px-6 py-2 font-bold"
        >
          Reset
        </button>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Total session: {formatClock(totalSessionSeconds(config))} · settings live
        in the URL, so bookmark or share it
      </p>
    </div>
  );
}
