"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { mulberry32 } from "@/lib/lifeline";
import {
  REACTION,
  averageMs,
  delayFor,
  formatMs,
  reactionBlocks,
  reactionShareText,
  reactionTier,
} from "@/lib/lab/reaction";

/**
 * Reaction (PERFORMANCE-LAB.md §4.1): wait for the pad to go Blaze, tap.
 * Five scored taps, the average is the score, the tier is the flex. DOM
 * only — the pad is one big button; the state flip is colour + a giant
 * label change (never hue alone). Deliberately silent: a sound cue would
 * arrive before the paint and hand out free milliseconds.
 */

const BEST_KEY = "fittools.lab.reaction.best";

type Phase = "ready" | "armed" | "go" | "early" | "between" | "done";

export function ReactionTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState(0);
  const [falseStarts, setFalseStarts] = useState(0);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [copied, setCopied] = useState(false);

  const phaseRef = useRef<Phase>("ready");
  const goAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);
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
      /* private mode — the best lives for the session */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const arm = () => {
    setPhaseBoth("armed");
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPhaseBoth("go");
      /* Stamp the onset as close to the paint as the DOM allows. */
      requestAnimationFrame(() => {
        goAtRef.current = performance.now();
      });
    }, delayFor(rng));
  };

  const finish = (finalTimes: number[]) => {
    const avg = averageMs(finalTimes);
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
      params: { station: "reaction", score: avg, tier: reactionTier(avg).name },
    });
    setPhaseBoth("done");
  };

  const begin = () => {
    setTimes([]);
    setRound(0);
    setFalseStarts(0);
    setCopied(false);
    trackEvent({ name: "lab_test_started", params: { station: "reaction" } });
    arm();
  };

  /** The one verb, stamped with the event's own timestamp for fairness. */
  const act = (tapAt: number) => {
    const current = phaseRef.current;
    if (current === "ready" || current === "done") {
      begin();
      return;
    }
    if (current === "armed") {
      /* Jumped the gun — the round re-arms, the enthusiasm is noted. */
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      setFalseStarts((n) => n + 1);
      setPhaseBoth("early");
      return;
    }
    if (current === "early") {
      arm();
      return;
    }
    if (current === "go") {
      const ms = Math.max(1, Math.round(tapAt - goAtRef.current));
      const nextTimes = [...times, ms];
      setTimes(nextTimes);
      setLastMs(ms);
      if (nextTimes.length >= REACTION.rounds) {
        finish(nextTimes);
        return;
      }
      setRound(nextTimes.length);
      setPhaseBoth("between");
      timerRef.current = window.setTimeout(arm, REACTION.interRoundMs);
    }
    /* "between" swallows taps — no scoring limbo. */
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const avg = averageMs(times);
    const text = `${reactionShareText(avg, times)}\n${origin}/performance-lab/reaction`;
    trackEvent({ name: "lab_test_shared", params: { station: "reaction" } });
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text });
      } catch {
        /* user closed the share sheet — that's fine */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* no clipboard — the screenshot still works */
    }
  };

  const avg = averageMs(times);
  const tier = reactionTier(avg);

  const padFace: Record<Phase, { className: string; big: string; small: string }> = {
    ready: {
      className: "bg-surface",
      big: "REACTION",
      small: "Wait for the Blaze flash, then tap. Five taps, no guessing. Tap to start.",
    },
    armed: {
      className: "bg-surface-deep",
      big: "WAIT…",
      small: "Any second now. Steady.",
    },
    go: {
      className: "bg-primary-strong text-background",
      big: "TAP!",
      small: "",
    },
    early: {
      className: "bg-warning-bg",
      big: "JUMPED THE GUN",
      small: "Too keen. That one's a false start — tap to re-arm.",
    },
    between: {
      className: "bg-surface",
      big: formatMs(lastMs).toUpperCase(),
      small: `Tap ${round} of ${REACTION.rounds} banked.`,
    },
    done: { className: "bg-surface", big: "", small: "" },
  };
  const face = padFace[phase];

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          act(e.timeStamp);
        }}
        onKeyDown={(e) => {
          if ((e.code === "Space" || e.code === "Enter") && !e.repeat) {
            e.preventDefault();
            act(e.timeStamp);
          }
        }}
        aria-label="Reaction pad — wait for it to change, then tap, click or press space"
        className={`block aspect-[420/460] w-full cursor-pointer touch-none rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition-none ${face.className}`}
      >
        {phase !== "done" ? (
          <span className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="font-display text-5xl uppercase leading-none">
              {face.big}
            </span>
            {face.small ? (
              <span className="max-w-[17rem] font-mono text-xs font-bold uppercase tracking-[0.12em] opacity-80">
                {face.small}
              </span>
            ) : null}
            {phase === "ready" && best > 0 ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">
                Fastest average: {formatMs(best)}
              </span>
            ) : null}
            {phase === "armed" || phase === "between" ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-70">
                Tap {Math.min(times.length + 1, REACTION.rounds)} of {REACTION.rounds}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="flex h-full items-center justify-center p-4">
            <span className="sticker-slap block w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
              <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Average of {REACTION.rounds}
              </span>
              <span className="block font-display text-6xl uppercase text-primary-strong">
                {formatMs(avg)}
              </span>
              <span className="mt-2 inline-block -rotate-2 rounded-full border-2 border-foreground bg-primary-soft px-4 py-1 font-display text-xl uppercase tracking-wide">
                {tier.name}
              </span>
              <span className="mt-1 block text-sm font-semibold">{tier.blurb}</span>
              <span aria-hidden="true" className="mt-2 block text-lg tracking-[0.2em]">
                {reactionBlocks(times)}
              </span>
              {falseStarts > 0 ? (
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  False starts: {falseStarts} — the enthusiasm is noted
                </span>
              ) : null}
              <span className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Fastest {formatMs(best)}
                </span>
                {newBest ? (
                  <span className="sticker-slap inline-block rotate-2 rounded-full border-2 border-good bg-good-soft px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-good">
                    New best ✓
                  </span>
                ) : null}
              </span>
              <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Tap to run it back
              </span>
            </span>
          </span>
        )}
      </button>

      {phase === "done" ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={begin}
            className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
          >
            Go again
          </button>
          <button
            type="button"
            onClick={share}
            className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
          >
            {copied ? "Copied ✓" : "Share it"}
          </button>
          <Link
            href="/sleep-calculator"
            className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
          >
            Sleep moves this →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
