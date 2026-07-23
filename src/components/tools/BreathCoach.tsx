"use client";

import { useEffect, useRef, useState } from "react";
import {
  BREATH_PATTERNS,
  type BreathPattern,
  breathStateAt,
  orbScaleAt,
} from "@/lib/tools/breath";

/**
 * Breath coach (MICROTOOLS.md §3): a pacing orb driven by the pure cycle
 * maths in src/lib/tools/breath. Calm register — forest/matcha, no sound
 * by default, a soft haptic tick per phase change on mobile. Under
 * prefers-reduced-motion the orb stays static and the text does the pacing.
 */

const SESSION_MINUTES = [1, 2, 3, 5];

export function BreathCoach() {
  const [pattern, setPattern] = useState<BreathPattern>(BREATH_PATTERNS[0]);
  const [minutes, setMinutes] = useState(2);
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [done, setDone] = useState(false);
  const [reduced, setReduced] = useState(false);
  const startedAt = useRef(0);
  const pausedAccum = useRef(0);
  const lastPhaseIndex = useRef(-1);
  const raf = useRef(0);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!running) return;
    const frame = () => {
      const elapsed = pausedAccum.current + (performance.now() - startedAt.current);
      if (elapsed >= minutes * 60_000) {
        setElapsedMs(minutes * 60_000);
        setRunning(false);
        setDone(true);
        if ("vibrate" in navigator) navigator.vibrate([60, 80, 60]);
        return;
      }
      setElapsedMs(elapsed);
      const state = breathStateAt(pattern, elapsed);
      if (state.phaseIndex !== lastPhaseIndex.current) {
        lastPhaseIndex.current = state.phaseIndex;
        if ("vibrate" in navigator) navigator.vibrate(25);
      }
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
  }, [running, pattern, minutes]);

  const state = breathStateAt(pattern, elapsedMs);
  const scale = reduced ? 0.8 : orbScaleAt(pattern, elapsedMs);
  const remaining = Math.max(0, Math.ceil((minutes * 60_000 - elapsedMs) / 1000));

  const resetTo = (nextPattern: BreathPattern, nextMinutes: number) => {
    setPattern(nextPattern);
    setMinutes(nextMinutes);
    setRunning(false);
    setDone(false);
    pausedAccum.current = 0;
    setElapsedMs(0);
    lastPhaseIndex.current = -1;
  };

  return (
    <div className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[5px_5px_0_0_var(--color-foreground)] sm:p-6">
      <div className="flex flex-wrap gap-2">
        {BREATH_PATTERNS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => resetTo(p, minutes)}
            title={p.description}
            className={`rounded-full border-2 border-foreground px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] ${
              pattern.id === p.id ? "bg-good text-background" : "bg-background"
            }`}
          >
            {p.name}
          </button>
        ))}
        <span className="ml-auto flex gap-1">
          {SESSION_MINUTES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => resetTo(pattern, m)}
              className={`rounded-full border-2 border-foreground px-3 py-1.5 font-mono text-xs font-bold ${
                minutes === m ? "bg-foreground text-background" : "bg-background"
              }`}
            >
              {m}m
            </button>
          ))}
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div
          className="flex h-64 w-64 items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="flex h-56 w-56 items-center justify-center rounded-full border-2 border-good bg-good-soft"
            style={{
              transform: `scale(${scale.toFixed(3)})`,
              transition: reduced ? undefined : "transform 120ms linear",
            }}
          >
            <div className="h-24 w-24 rounded-full border-2 border-good bg-fresh opacity-60" />
          </div>
        </div>
        <p
          className="font-display text-3xl uppercase"
          aria-live={running ? "polite" : "off"}
        >
          {done ? "Session complete" : running ? state.phase.name : pattern.name}
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {done
            ? `${minutes} minute${minutes > 1 ? "s" : ""} · nicely done`
            : running
              ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")} remaining · cycle ${state.cycles + 1}`
              : pattern.description}
        </p>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {running ? (
          <button
            type="button"
            onClick={() => {
              pausedAccum.current += performance.now() - startedAt.current;
              setRunning(false);
            }}
            className="riso-press rounded-full border-2 border-foreground bg-surface px-6 py-2 font-bold"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (done) resetTo(pattern, minutes);
              setDone(false);
              startedAt.current = performance.now();
              setRunning(true);
            }}
            className="riso-press rounded-full border-2 border-foreground bg-good px-6 py-2 font-bold text-background"
          >
            {done ? "Go again" : elapsedMs > 0 ? "Resume" : "Begin"}
          </button>
        )}
        {elapsedMs > 0 && !done ? (
          <button
            type="button"
            onClick={() => resetTo(pattern, minutes)}
            className="riso-press rounded-full border-2 border-foreground bg-surface px-6 py-2 font-bold"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
