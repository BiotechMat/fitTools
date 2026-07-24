"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { mulberry32 } from "@/lib/lifeline";
import { formatMs } from "@/lib/lab/reaction";
import {
  BOARD_RADIUS,
  MAX_POINTS,
  TRACK,
  averageHitMs,
  pointsRatio,
  positionFor,
  ringPointsFor,
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
 * Track v2 (PERFORMANCE-LAB.md §4.6): the range. Full-size archery
 * boards relocate around the arena; EVERY tap scores by the ring it
 * lands in and advances — no binary miss, so a thumb and a cursor play
 * the same game and imprecision costs ring points proportionally.
 * The whole arena is the input surface; the boards are drawings.
 */

const BEST_KEY = "fittools.lab.track.range.best";

/* Award → beep frequency: the range sings when you group well. */
const AWARD_FREQ: Record<number, number> = { 10: 1046, 7: 784, 4: 523, 0: 150 };

type Phase = "ready" | "live" | "done";

interface Award {
  x: number;
  y: number;
  points: number;
  id: number;
}

export function TrackTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState<TargetPos>({ x: 210, y: 240 });
  const [points, setPoints] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [award, setAward] = useState<Award | null>(null);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  /* The finishing tap's ghost click must not press a result-card button
     that mounts under the same spot (the Lifeline restart-guard pattern). */
  const [guarded, setGuarded] = useState(false);

  const phaseRef = useRef<Phase>("ready");
  const guardTimerRef = useRef<number | null>(null);
  const spawnAtRef = useRef(0);
  const awardIdRef = useRef(0);
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
       hydration after mount; server render must stay storage-free */
    try {
      setBest(Number(localStorage.getItem(BEST_KEY) ?? 0));
    } catch {
      /* private mode */
    }
    setMuted(readLabMuted());
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      if (guardTimerRef.current !== null) {
        window.clearTimeout(guardTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.muted = muted;
  }, [muted]);

  const begin = () => {
    if (!synthRef.current) synthRef.current = createLabSynth(muted);
    setIndex(0);
    setPoints(0);
    setTimes([]);
    setAward(null);
    setCopied(false);
    setPos(positionFor(rng, null));
    spawnAtRef.current = performance.now();
    trackEvent({ name: "lab_test_started", params: { station: "track" } });
    setPhaseBoth("live");
  };

  const finish = (finalTimes: number[], finalPoints: number) => {
    const avg = averageHitMs(finalTimes);
    setNewBest(false);
    setBest((prev) => {
      if (finalPoints > prev) {
        setNewBest(true);
        try {
          localStorage.setItem(BEST_KEY, String(finalPoints));
        } catch {
          /* fine */
        }
        return finalPoints;
      }
      return prev;
    });
    trackEvent({
      name: "lab_test_completed",
      params: {
        station: "track",
        score: finalPoints,
        tier: trackTier(avg, pointsRatio(finalPoints)).name,
      },
    });
    labBeep(synthRef.current, 1046, 160, "triangle", 0.05);
    setGuarded(true);
    if (guardTimerRef.current !== null) window.clearTimeout(guardTimerRef.current);
    guardTimerRef.current = window.setTimeout(() => setGuarded(false), 400);
    setPhaseBoth("done");
  };

  /** Every arrow lands somewhere: score the ring, advance the board. */
  const arrow = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "live") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * TRACK.width;
    const y = ((e.clientY - rect.top) / rect.height) * TRACK.height;
    const awarded = ringPointsFor(Math.hypot(x - pos.x, y - pos.y));
    const ms = Math.max(1, Math.round(e.timeStamp - spawnAtRef.current));

    const nextTimes = [...times, ms];
    const nextPoints = points + awarded;
    setTimes(nextTimes);
    setPoints(nextPoints);
    awardIdRef.current += 1;
    setAward({ x, y, points: awarded, id: awardIdRef.current });
    labBeep(synthRef.current, AWARD_FREQ[awarded] ?? 150, awarded > 0 ? 70 : 90, awarded > 0 ? "square" : "sawtooth", 0.04);

    if (nextTimes.length >= TRACK.targets) {
      finish(nextTimes, nextPoints);
      return;
    }
    setIndex(nextTimes.length);
    setPos((prev) => positionFor(rng, prev));
    spawnAtRef.current = performance.now();
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const avg = averageHitMs(times);
    // Result params make the pasted link unfurl as the score card.
    const path = labTrackSharePath({ ms: avg, pts: points });
    const text = `${trackShareText(points, avg)}\n${origin}${path}`;
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
  const tier = trackTier(avg, pointsRatio(points));
  const pct = (v: number, axis: number) => `${(v / axis) * 100}%`;

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      {/* HUD */}
      <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        <span>
          {phase === "live"
            ? `TARGET ${Math.min(index + 1, TRACK.targets)}/${TRACK.targets}`
            : "TRACK"}
        </span>
        <span>
          {phase === "live"
            ? `POINTS ${points}`
            : best > 0
              ? `Top score: ${best}/${MAX_POINTS}`
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

      {/* The range. The arena is the input; the board is a drawing. */}
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          arrow(e);
        }}
        role="presentation"
        aria-label={`The range — tap the target board. ${TRACK.targets} targets, rings score ${TRACK.rings.map((r) => r.points).join(", ")}.`}
        className="relative w-full touch-none overflow-hidden rounded-2xl border-2 border-foreground bg-surface-deep shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ aspectRatio: `${TRACK.width} / ${TRACK.height}` }}
      >
        {phase === "live" ? (
          <span
            aria-hidden="true"
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-foreground bg-background shadow-[2px_2px_0_0_var(--color-foreground)]"
            style={{
              left: pct(pos.x, TRACK.width),
              top: pct(pos.y, TRACK.height),
              width: pct(BOARD_RADIUS * 2, TRACK.width),
              aspectRatio: "1",
            }}
          >
            <span
              className="flex items-center justify-center rounded-full border-2 border-foreground bg-primary-soft"
              style={{
                width: `${(TRACK.rings[1].radius / BOARD_RADIUS) * 100}%`,
                aspectRatio: "1",
              }}
            >
              <span
                className="block rounded-full border-2 border-foreground bg-primary-strong"
                style={{
                  width: `${(TRACK.rings[0].radius / TRACK.rings[1].radius) * 100}%`,
                  aspectRatio: "1",
                }}
              />
            </span>
          </span>
        ) : null}

        {/* The last arrow's award, floating where it landed. */}
        {phase === "live" && award ? (
          <span
            key={award.id}
            aria-hidden="true"
            className="sticker-slap pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-mono text-sm font-bold"
            style={{
              left: pct(award.x, TRACK.width),
              top: pct(award.y, TRACK.height),
              color:
                award.points >= 7
                  ? "var(--color-good)"
                  : award.points > 0
                    ? "var(--color-foreground)"
                    : "var(--color-primary)",
            }}
          >
            {award.points > 0 ? `+${award.points}` : "0"}
          </span>
        ) : null}

        {phase === "ready" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-display text-4xl uppercase">Track</p>
            <p className="max-w-[16rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
              {TRACK.targets} targets, scored by ring — bullseye is{" "}
              {TRACK.rings[0].points}. No misses, just worse arrows.
            </p>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={begin}
              className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
            >
              Targets up
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
                Ring points
              </p>
              <p className="font-display text-6xl uppercase text-primary-strong">
                {points}
                <span className="text-3xl text-muted">/{MAX_POINTS}</span>
              </p>
              <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
                {formatMs(avg)} a target
              </p>
              <p className="mt-2 inline-block -rotate-2 rounded-full border-2 border-foreground bg-primary-soft px-4 py-1 font-display text-xl uppercase tracking-wide">
                {tier.name}
              </p>
              <p className="mt-1 text-sm font-semibold">{tier.blurb}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Top score {best}/{MAX_POINTS}
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
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={begin}
                  className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
                >
                  Nock another
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={share}
                  className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                >
                  {copied ? "Copied ✓" : "Share it"}
                </button>
                <Link
                  href="/max-out"
                  onPointerDown={(e) => e.stopPropagation()}
                  className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                >
                  Hands warm? Max Out →
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Rings score {TRACK.rings.map((ring) => ring.points).join(" · ")} · every
        tap counts · needs a touchscreen or pointer
      </p>
    </div>
  );
}
