"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { mulberry32 } from "@/lib/lifeline";
import {
  VIGIL,
  VIGIL_SECONDS,
  vigilScore,
  vigilSequence,
  vigilShareText,
  vigilTier,
  type VigilScore,
} from "@/lib/lab/vigil";
import { labVigilSharePath } from "@/lib/arcade-share";
import {
  createLabSynth,
  labBeep,
  labVibrate,
  readLabMuted,
  writeLabMuted,
  type LabSynth,
} from "./labSynth";

/**
 * Vigil (PERFORMANCE-LAB.md §4.8): the SART short form. Digits stream for
 * ~90 seconds; tap the pad for every digit EXCEPT the 3 — the withhold is
 * the measure. One big pad, one verb: identical on touch, mouse and
 * keyboard. A hidden tab aborts the run — vigilance can't be paused.
 */

const BEST_KEY = "fittools.lab.vigil.best";

type Phase = "ready" | "live" | "done" | "abandoned";

export function VigilTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [digit, setDigit] = useState<number | null>(null);
  const [trial, setTrial] = useState(0);
  const [slips, setSlips] = useState(0);
  const [flash, setFlash] = useState<"go" | "three" | null>(null);
  const [score, setScore] = useState<VigilScore>({ commissions: 0, omissions: 0, pct: 0 });
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  const phaseRef = useRef<Phase>("ready");
  const seqRef = useRef<number[]>([]);
  const tappedRef = useRef<boolean[]>([]);
  const trialRef = useRef(-1);
  const timersRef = useRef<number[]>([]);
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

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
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
    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "live") {
        clearTimers();
        setDigit(null);
        setPhaseBoth("abandoned");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimers();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.muted = muted;
  }, [muted]);

  const finish = () => {
    const finalScore = vigilScore(seqRef.current, tappedRef.current);
    setScore(finalScore);
    setDigit(null);
    setNewBest(false);
    setBest((prev) => {
      if (finalScore.pct > prev) {
        setNewBest(true);
        try {
          localStorage.setItem(BEST_KEY, String(finalScore.pct));
        } catch {
          /* fine */
        }
        return finalScore.pct;
      }
      return prev;
    });
    trackEvent({
      name: "lab_test_completed",
      params: { station: "vigil", score: finalScore.pct, tier: vigilTier(finalScore.pct).name },
    });
    labBeep(synthRef.current, 1046, 200, "triangle", 0.05);
    setPhaseBoth("done");
  };

  const begin = () => {
    clearTimers();
    if (!synthRef.current) synthRef.current = createLabSynth(muted);
    const seq = vigilSequence(rng);
    seqRef.current = seq;
    tappedRef.current = Array.from({ length: seq.length }, () => false);
    trialRef.current = -1;
    setSlips(0);
    setCopied(false);
    trackEvent({ name: "lab_test_started", params: { station: "vigil" } });
    setPhaseBoth("live");

    const step = VIGIL.litMs + VIGIL.gapMs;
    seq.forEach((d, i) => {
      later(() => {
        /* Before moving on, an untapped go digit is a slip (omission). */
        const prev = trialRef.current;
        if (
          prev >= 0 &&
          seq[prev] !== VIGIL.noGo &&
          !tappedRef.current[prev]
        ) {
          setSlips((n) => n + 1);
        }
        trialRef.current = i;
        setTrial(i);
        setDigit(d);
      }, i * step);
      later(() => setDigit(null), i * step + VIGIL.litMs);
    });
    later(() => {
      const last = trialRef.current;
      if (last >= 0 && seq[last] !== VIGIL.noGo && !tappedRef.current[last]) {
        setSlips((n) => n + 1);
      }
      finish();
    }, seq.length * step + 200);
  };

  /** The one verb: respond to the current digit (pad, click or space).
   *  Every REGISTERED tap answers back — tint, tick, tiny buzz — so a
   *  press never feels swallowed; a second tap on the same digit is
   *  ignored and deliberately gets nothing. */
  const act = () => {
    if (phaseRef.current !== "live") return;
    const i = trialRef.current;
    if (i < 0 || tappedRef.current[i]) return;
    tappedRef.current[i] = true;
    if (seqRef.current[i] === VIGIL.noGo) {
      /* The 3 got you — the one loud moment in a quiet test. */
      setSlips((n) => n + 1);
      setFlash("three");
      later(() => setFlash(null), 450);
      labBeep(synthRef.current, 130, 300, "sawtooth", 0.06);
      labVibrate([25, 40, 25]);
    } else {
      setFlash("go");
      later(() => setFlash(null), 130);
      labBeep(synthRef.current, 880, 40, "sine", 0.03);
      labVibrate(10);
    }
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `${vigilShareText(score.pct)}\n${origin}${labVigilSharePath({ pct: score.pct })}`;
    trackEvent({ name: "lab_test_shared", params: { station: "vigil" } });
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

  const tier = vigilTier(score.pct);

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      {/* HUD */}
      <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        <span>
          {phase === "live" ? `DIGIT ${trial + 1}/${VIGIL.trials}` : "VIGIL"}
        </span>
        <span>
          {phase === "live"
            ? `SLIPS ${slips}`
            : best > 0
              ? `Best hold: ${best}%`
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

      {/* The pad */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          act();
        }}
        onKeyDown={(e) => {
          if ((e.code === "Space" || e.code === "Enter") && !e.repeat) {
            e.preventDefault();
            act();
          }
        }}
        disabled={phase !== "live"}
        aria-label="Vigil pad — tap for every digit except 3"
        className={`block aspect-[420/380] w-full touch-none rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition-colors duration-100 motion-reduce:transition-none ${
          flash === "three"
            ? "bg-primary-soft"
            : flash === "go"
              ? "bg-good-soft"
              : "bg-surface"
        } ${phase === "live" ? "cursor-pointer" : "cursor-default"}`}
      >
        {phase === "live" ? (
          <span className="flex h-full flex-col items-center justify-center gap-2">
            <span className="font-display text-9xl leading-none" aria-live="off">
              {digit ?? " "}
            </span>
            {flash === "three" ? (
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-primary">
                The 3 got you
              </span>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Tap everything except 3
              </span>
            )}
          </span>
        ) : null}
      </button>

      {phase === "ready" || phase === "abandoned" ? (
        <div className="absolute inset-x-0 top-8 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="font-display text-4xl uppercase">Vigil</p>
          <p className="max-w-[17rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
            {phase === "abandoned"
              ? "Run abandoned — vigilance can't be paused. Ninety undisturbed seconds, when you're ready."
              : `Digits stream for ${VIGIL_SECONDS} seconds. Tap every digit EXCEPT the 3. That's it. That's the trap.`}
          </p>
          <button
            type="button"
            onClick={begin}
            className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
          >
            {phase === "abandoned" ? "Go again" : "Start the watch"}
          </button>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Held for {VIGIL_SECONDS} seconds
            </p>
            <p className="font-display text-6xl uppercase text-primary-strong">
              {score.pct}%
            </p>
            <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
              The 3 got through {score.commissions}× · {score.omissions} go
              {score.omissions === 1 ? "" : "s"} slipped past
            </p>
            <p className="mt-2 inline-block -rotate-2 rounded-full border-2 border-foreground bg-primary-soft px-4 py-1 font-display text-xl uppercase tracking-wide">
              {tier.name}
            </p>
            <p className="mt-1 text-sm font-semibold">{tier.blurb}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Best hold {best}%
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
                Hold again
              </button>
              <button
                type="button"
                onClick={share}
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                {copied ? "Copied ✓" : "Share it"}
              </button>
              <Link
                href="/recovery/breathwork"
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Breathwork helps →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
