"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import {
  STEADY,
  WIRE,
  formatSeconds,
  isSparking,
  nearestOnWire,
  steadyShareText,
  steadyTier,
  wireLength,
  wirePointAt,
} from "@/lib/lab/steady";
import { labSteadySharePath } from "@/lib/arcade-share";
import {
  createLabSynth,
  labBeep,
  readLabMuted,
  writeLabMuted,
  type LabSynth,
} from "./labSynth";

/**
 * Steady (PERFORMANCE-LAB.md §4.4): the buzz wire. Drag the probe along
 * the corridor; touching a wall sparks. Track's device lesson applied at
 * design time — the corridor is thumb-wide end to end, no run can fail,
 * and sparks cost a wobbly thumb and a wobbly cursor identically.
 * Lifting off pauses the probe; the clock keeps running.
 */

const BEST_KEY = "fittools.lab.steady.best";

type Phase = "ready" | "live" | "done";

const WIRE_PATH = WIRE.map(
  (p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`,
).join(" ");

export function SteadyTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [sparks, setSparks] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [holding, setHolding] = useState(false);
  const [sparkAt, setSparkAt] = useState<{ x: number; y: number; id: number } | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [best, setBest] = useState(0);
  const [hasBest, setHasBest] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  /* Ghost-click guard for the result card (the Lifeline pattern). */
  const [guarded, setGuarded] = useState(false);

  const phaseRef = useRef<Phase>("ready");
  const holdingRef = useRef(false);
  const maxTRef = useRef(0);
  const sparksRef = useRef(0);
  const armedRef = useRef(true);
  const startedAtRef = useRef(0);
  const sparkIdRef = useRef(0);
  const guardTimerRef = useRef<number | null>(null);
  const synthRef = useRef<LabSynth | null>(null);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage
       hydration after mount; server render must stay storage-free */
    try {
      const stored = localStorage.getItem(BEST_KEY);
      if (stored !== null) {
        setBest(Number(stored));
        setHasBest(true);
      }
    } catch {
      /* private mode */
    }
    setMuted(readLabMuted());
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      if (guardTimerRef.current !== null) window.clearTimeout(guardTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.muted = muted;
  }, [muted]);

  const begin = () => {
    if (!synthRef.current) synthRef.current = createLabSynth(muted);
    maxTRef.current = 0;
    sparksRef.current = 0;
    armedRef.current = true;
    startedAtRef.current = 0;
    setSparks(0);
    setProgressPct(0);
    setSparkAt(null);
    setCopied(false);
    trackEvent({ name: "lab_test_started", params: { station: "steady" } });
    setPhaseBoth("live");
  };

  const finish = () => {
    const ms = Math.max(1, Math.round(performance.now() - startedAtRef.current));
    setElapsedMs(ms);
    holdingRef.current = false;
    setHolding(false);
    setNewBest(false);
    setBest((prev) => {
      if (!hasBest || sparksRef.current < prev) {
        setNewBest(true);
        setHasBest(true);
        try {
          localStorage.setItem(BEST_KEY, String(sparksRef.current));
        } catch {
          /* fine */
        }
        return sparksRef.current;
      }
      return prev;
    });
    trackEvent({
      name: "lab_test_completed",
      params: {
        station: "steady",
        score: sparksRef.current,
        tier: steadyTier(sparksRef.current, true).name,
      },
    });
    labBeep(synthRef.current, 1046, 200, "triangle", 0.05);
    setGuarded(true);
    if (guardTimerRef.current !== null) window.clearTimeout(guardTimerRef.current);
    guardTimerRef.current = window.setTimeout(() => setGuarded(false), 400);
    setPhaseBoth("done");
  };

  /** Client coords → logical arena coords. */
  const toLogical = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * STEADY.width,
      y: ((e.clientY - rect.top) / rect.height) * STEADY.height,
    };
  };

  const grab = (e: React.PointerEvent<SVGSVGElement>) => {
    if (phaseRef.current !== "live") return;
    const p = toLogical(e);
    /* Grab at the start pad, or re-grab near where the probe paused. */
    const head = wirePointAt(maxTRef.current);
    const nearStart = Math.hypot(p.x - WIRE[0].x, p.y - WIRE[0].y) <= STEADY.startRadius;
    const nearHead = Math.hypot(p.x - head.x, p.y - head.y) <= STEADY.startRadius;
    if (!nearStart && !nearHead) return;
    if (startedAtRef.current === 0) startedAtRef.current = performance.now();
    holdingRef.current = true;
    setHolding(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<SVGSVGElement>) => {
    if (phaseRef.current !== "live" || !holdingRef.current) return;
    const p = toLogical(e);
    const fix = nearestOnWire(p.x, p.y);

    /* Sparks: entering wall contact, debounced by the re-arm distance. */
    if (isSparking(fix.distance) && armedRef.current) {
      armedRef.current = false;
      sparksRef.current += 1;
      setSparks(sparksRef.current);
      sparkIdRef.current += 1;
      setSparkAt({ x: p.x, y: p.y, id: sparkIdRef.current });
      labBeep(synthRef.current, 110, 160, "sawtooth", 0.06);
    } else if (!isSparking(fix.distance) && fix.distance <= STEADY.rearm) {
      armedRef.current = true;
    }

    /* Progress: only inside the corridor, only forward, never wall-cutting. */
    if (
      fix.distance <= STEADY.corridor / 2 &&
      fix.t > maxTRef.current &&
      fix.t - maxTRef.current <= STEADY.maxHop
    ) {
      maxTRef.current = fix.t;
      const pct = Math.round(fix.t * 100);
      setProgressPct((prev) => (prev === pct ? prev : pct));
      if (fix.t >= STEADY.finishAt) finish();
    }
  };

  const release = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = labSteadySharePath({
      sparks: sparksRef.current,
      secs: Math.max(1, Math.round(elapsedMs / 1000)),
    });
    const text = `${steadyShareText(sparksRef.current, elapsedMs)}\n${origin}${path}`;
    trackEvent({ name: "lab_test_shared", params: { station: "steady" } });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
      } catch {
        /* user closed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* no clipboard */
    }
  };

  const tier = steadyTier(sparks, phase === "done");
  /* Render from the mirrored 1%-granular state, not the ref (render purity). */
  const head = wirePointAt(progressPct / 100);
  const totalLength = wireLength();

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      {/* HUD */}
      <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        <span>{phase === "live" ? `PROGRESS ${progressPct}%` : "STEADY"}</span>
        <span>
          {phase === "live"
            ? `SPARKS ${sparks}`
            : hasBest
              ? `Fewest sparks: ${best}`
              : ""}
        </span>
        <button
          type="button"
          aria-pressed={muted}
          onClick={() => {
            setMuted((m) => {
              writeLabMuted(!m);
              return !m;
            });
          }}
          className="rounded-full border-2 border-foreground bg-surface px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-foreground"
        >
          {muted ? "Sound off" : "Sound on"}
        </button>
      </div>

      {/* The wire */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-foreground bg-surface-deep shadow-[4px_4px_0_0_var(--color-foreground)]">
        <svg
          viewBox={`0 0 ${STEADY.width} ${STEADY.height}`}
          role="img"
          aria-label="The buzz wire — drag the probe from the start pad along the corridor without touching the walls"
          className="block w-full touch-none"
          style={{ aspectRatio: `${STEADY.width} / ${STEADY.height}` }}
          onPointerDown={(e) => {
            e.preventDefault();
            grab(e);
          }}
          onPointerMove={move}
          onPointerUp={release}
          onPointerCancel={release}
        >
          {/* Corridor: ink outline, paper channel, centre wire. */}
          <path
            d={WIRE_PATH}
            fill="none"
            stroke="var(--color-foreground)"
            strokeWidth={STEADY.corridor + 4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={WIRE_PATH}
            fill="none"
            stroke="var(--color-background)"
            strokeWidth={STEADY.corridor}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={WIRE_PATH}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={2}
            strokeDasharray="6 8"
          />
          {/* Progress trail along the centre line. */}
          <path
            d={WIRE_PATH}
            fill="none"
            stroke="var(--color-good)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={totalLength}
            strokeDashoffset={totalLength * (1 - progressPct / 100)}
          />
          {/* Start and finish pads. */}
          <circle
            cx={WIRE[0].x}
            cy={WIRE[0].y}
            r={STEADY.startRadius - 8}
            fill="var(--color-good)"
            stroke="var(--color-foreground)"
            strokeWidth={3}
          />
          <circle
            cx={WIRE[WIRE.length - 1].x}
            cy={WIRE[WIRE.length - 1].y}
            r={20}
            fill="var(--color-primary-strong)"
            stroke="var(--color-foreground)"
            strokeWidth={3}
          />
          {/* The probe head. */}
          {phase === "live" ? (
            <circle
              cx={head.x}
              cy={head.y}
              r={10}
              fill={holding ? "var(--color-primary-strong)" : "var(--color-surface)"}
              stroke="var(--color-foreground)"
              strokeWidth={3}
            />
          ) : null}
          {/* Spark flash where the wall was touched. */}
          {sparkAt && phase === "live" ? (
            <circle
              key={sparkAt.id}
              cx={sparkAt.x}
              cy={sparkAt.y}
              r={12}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={4}
              opacity={0.9}
            />
          ) : null}
        </svg>

        {phase === "ready" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-display text-4xl uppercase">Steady</p>
            <p className="max-w-[16rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
              Drag the probe from the green pad to the orange one. Touch a
              wall, it sparks. Lifting off pauses you — the clock keeps going.
            </p>
            <button
              type="button"
              onClick={begin}
              className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
            >
              Grab the probe
            </button>
          </div>
        ) : null}

        {phase === "done" ? (
          <div
            className={`absolute inset-0 flex items-center justify-center p-4 ${
              guarded ? "pointer-events-none" : ""
            }`}
          >
            <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Wire cleared
              </p>
              <p className="font-display text-6xl uppercase text-primary-strong">
                {sparks}
                <span className="text-3xl text-muted">
                  {" "}
                  spark{sparks === 1 ? "" : "s"}
                </span>
              </p>
              <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
                {formatSeconds(elapsedMs)} end to end
              </p>
              <p className="mt-2 inline-block -rotate-2 rounded-full border-2 border-foreground bg-primary-soft px-4 py-1 font-display text-xl uppercase tracking-wide">
                {tier.name}
              </p>
              <p className="mt-1 text-sm font-semibold">{tier.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Fewest sparks {best}
                </span>
                {newBest ? (
                  <span className="sticker-slap inline-block rotate-2 rounded-full border-2 border-good bg-good-soft px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-good">
                    New best ✓
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={begin}
                  className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
                >
                  Back to the wire
                </button>
                <button
                  type="button"
                  onClick={share}
                  className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                >
                  {copied ? "Copied ✓" : "Share it"}
                </button>
                <Link
                  href="/caffeine-calculator"
                  className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                >
                  Blame the coffee →
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Lift off to pause · re-grab at the probe · needs a touchscreen or
        pointer
      </p>
    </div>
  );
}
