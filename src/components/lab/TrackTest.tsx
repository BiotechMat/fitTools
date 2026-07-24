"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { mulberry32 } from "@/lib/lifeline";
import { formatMs } from "@/lib/lab/reaction";
import {
  TRACK,
  accuracyFor,
  averageHitMs,
  hitRadiusFor,
  positionFor,
  radiusFor,
  trackShareText,
  trackTier,
  type TargetPos,
} from "@/lib/lab/track";
import { labTrackSharePath } from "@/lib/arcade-share";
import {
  createLabSynth,
  labBeep,
  readLabMuted,
  writeLabMuted,
  type LabSynth,
} from "./labSynth";

/**
 * Track (PERFORMANCE-LAB.md §4.6): 25 targets relocate around the arena and
 * shrink as the run goes; stray taps count against you. Fitts tapping in a
 * riso shirt. DOM only — the target is an absolutely-positioned button in a
 * fixed-aspect arena, coordinates in the logical 420×480 space rendered as
 * percentages so touch and desktop play the same course.
 */

const BEST_KEY = "fittools.lab.track.best";

type Phase = "ready" | "live" | "done";

export function TrackTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState<TargetPos>({ x: 210, y: 240 });
  const [misses, setMisses] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  /* Coarse pointer (touch): bigger discs, deeper margins, a wider grace
     ring — a fingertip is not a cursor (PERFORMANCE-LAB §4.6 build note). */
  const [coarse, setCoarse] = useState(false);

  const phaseRef = useRef<Phase>("ready");
  const spawnAtRef = useRef(0);
  const synthRef = useRef<LabSynth | null>(null);
  const rngRef = useRef<(() => number) | null>(null);
  /* Lazily seeded on first use — Math.random is impure during render. */
  const rng = () => {
    rngRef.current ??= mulberry32(Math.floor(Math.random() * 2 ** 31));
    return rngRef.current();
  };

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage
       + media-query hydration after mount; server render must stay neutral */
    try {
      setBest(Number(localStorage.getItem(BEST_KEY) ?? 0));
    } catch {
      /* private mode */
    }
    setMuted(readLabMuted());
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.muted = muted;
  }, [muted]);

  const begin = () => {
    if (!synthRef.current) synthRef.current = createLabSynth(muted);
    setIndex(0);
    setMisses(0);
    setTimes([]);
    setCopied(false);
    setPos(positionFor(rng, null, coarse));
    spawnAtRef.current = performance.now();
    trackEvent({ name: "lab_test_started", params: { station: "track" } });
    setPhaseBoth("live");
  };

  const finish = (finalTimes: number[], finalMisses: number) => {
    const avg = averageHitMs(finalTimes);
    const accuracy = accuracyFor(TRACK.targets, finalMisses);
    setNewBest(false);
    setBest((prev) => {
      if (prev === 0 || avg < prev) {
        setNewBest(true);
        try {
          localStorage.setItem(BEST_KEY, String(avg));
        } catch {
          /* fine */
        }
        return avg;
      }
      return prev;
    });
    trackEvent({
      name: "lab_test_completed",
      params: { station: "track", score: avg, tier: trackTier(avg, accuracy).name },
    });
    labBeep(synthRef.current, 1046, 160, "triangle", 0.05);
    setPhaseBoth("done");
  };

  const hit = (tapAt: number) => {
    if (phaseRef.current !== "live") return;
    const ms = Math.max(1, Math.round(tapAt - spawnAtRef.current));
    const nextTimes = [...times, ms];
    setTimes(nextTimes);
    labBeep(synthRef.current, 700 + index * 14, 60, "square", 0.04);
    if (nextTimes.length >= TRACK.targets) {
      finish(nextTimes, misses);
      return;
    }
    setIndex(nextTimes.length);
    setPos((prev) => positionFor(rng, prev, coarse));
    spawnAtRef.current = performance.now();
  };

  const stray = () => {
    if (phaseRef.current !== "live") return;
    setMisses((n) => n + 1);
    labBeep(synthRef.current, 150, 90, "sawtooth", 0.04);
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const avg = averageHitMs(times);
    // Result params make the pasted link unfurl as the score card.
    const path = labTrackSharePath({
      ms: avg,
      acc: Math.round(accuracyFor(TRACK.targets, misses) * 100),
    });
    const text = `${trackShareText(misses, avg)}\n${origin}${path}`;
    trackEvent({ name: "lab_test_shared", params: { station: "track" } });
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

  const avg = averageHitMs(times);
  const accuracy = accuracyFor(TRACK.targets, misses);
  const tier = trackTier(avg, accuracy);
  const radius = radiusFor(index, coarse);
  const hitRadius = hitRadiusFor(index, coarse);

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      {/* HUD */}
      <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        <span>
          {phase === "live"
            ? `TARGET ${Math.min(index + 1, TRACK.targets)}/${TRACK.targets}`
            : "TRACK"}
        </span>
        <span>{phase === "live" ? `STRAYS ${misses}` : best > 0 ? `Quickest hands: ${best} ms` : ""}</span>
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

      {/* The arena */}
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          stray();
        }}
        role="presentation"
        className="relative w-full touch-none overflow-hidden rounded-2xl border-2 border-foreground bg-surface-deep shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ aspectRatio: `${TRACK.width} / ${TRACK.height}` }}
      >
        {phase === "live" ? (
          /* The button is the tappable GRACE zone (invisible, larger than
             the disc); the drawn target sits inside it. On touch the finger
             occludes the disc at the moment of truth, so near-misses inside
             the ring count as hits instead of miss-plus-stray. */
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              hit(e.timeStamp);
            }}
            aria-label={`Target ${index + 1} of ${TRACK.targets}`}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-crosshair items-center justify-center rounded-full"
            style={{
              left: `${(pos.x / TRACK.width) * 100}%`,
              top: `${(pos.y / TRACK.height) * 100}%`,
              width: `${((hitRadius * 2) / TRACK.width) * 100}%`,
              aspectRatio: "1",
            }}
          >
            <span
              aria-hidden="true"
              className="flex items-center justify-center rounded-full border-2 border-foreground bg-primary-strong shadow-[2px_2px_0_0_var(--color-foreground)]"
              style={{ width: `${(radius / hitRadius) * 100}%`, aspectRatio: "1" }}
            >
              <span className="block h-1/3 w-1/3 rounded-full border-2 border-background bg-background/20" />
            </span>
          </button>
        ) : null}

        {phase === "ready" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-display text-4xl uppercase">Track</p>
            <p className="max-w-[16rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
              {TRACK.targets} targets. They shrink. Strays count. Don&rsquo;t
              spray.
            </p>
            <button
              type="button"
              onClick={begin}
              className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
            >
              Targets up
            </button>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Average to target
              </p>
              <p className="font-display text-6xl uppercase text-primary-strong">
                {formatMs(avg)}
              </p>
              <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
                Accuracy {Math.round(accuracy * 100)}% · {misses}{" "}
                {misses === 1 ? "stray" : "strays"}
              </p>
              <p className="mt-2 inline-block -rotate-2 rounded-full border-2 border-foreground bg-primary-soft px-4 py-1 font-display text-xl uppercase tracking-wide">
                {tier.name}
              </p>
              <p className="mt-1 text-sm font-semibold">{tier.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Quickest {formatMs(best)}
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
                  Reload
                </button>
                <button
                  type="button"
                  onClick={share}
                  className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                >
                  {copied ? "Copied ✓" : "Share it"}
                </button>
                <Link
                  href="/max-out"
                  className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                >
                  Hands warm? Max Out →
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
