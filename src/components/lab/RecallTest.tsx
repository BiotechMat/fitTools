"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { mulberry32 } from "@/lib/lifeline";
import {
  RECALL,
  extendSequence,
  recallBlocks,
  recallShareText,
  recallTier,
  sequenceFor,
} from "@/lib/lab/recall";
import { labRecallSharePath } from "@/lib/arcade-share";
import {
  createLabSynth,
  labBeep,
  readLabMuted,
  writeLabMuted,
  type LabSynth,
} from "./labSynth";

/**
 * Recall (PERFORMANCE-LAB.md §4.2): the 3×3 grid lights a sequence, tap it
 * back, every clean round adds one light. Two wobbles at a length and the
 * run ends — the span you finished is the score and the animal is the tier.
 * Each pad has its own tone (pentatonic, so even the failures sound nice);
 * lit pads change colour AND scale so the cue never rides on hue alone.
 */

const BEST_KEY = "fittools.lab.recall.best";

/* One tone per pad — A-minor pentatonic climbing left-to-right. */
const PAD_TONES = [392, 440, 523, 587, 659, 784, 880, 1046, 1174] as const;

type Phase = "ready" | "watch" | "recall" | "wobble" | "level" | "done";

export function RecallTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [seq, setSeq] = useState<number[]>([]);
  const [litPad, setLitPad] = useState<number | null>(null);
  const [tapped, setTapped] = useState<number | null>(null);
  const [inputAt, setInputAt] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [span, setSpan] = useState(0);
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  /* The ending tap's ghost click must not press a result-card button that
     mounts under the same spot (the Lifeline restart-guard pattern). */
  const [guarded, setGuarded] = useState(false);

  const phaseRef = useRef<Phase>("ready");
  const seqRef = useRef<number[]>([]);
  const inputAtRef = useRef(0);
  const strikesRef = useRef(0);
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
    return clearTimers;
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.muted = muted;
  }, [muted]);

  /** Play the sequence: light + tone, pad by pad, then hand over. */
  const playback = (sequence: number[]) => {
    setPhaseBoth("watch");
    setTapped(null);
    const step = RECALL.litMs + RECALL.gapMs;
    sequence.forEach((pad, i) => {
      later(() => {
        setLitPad(pad);
        labBeep(synthRef.current, PAD_TONES[pad], RECALL.litMs, "sine", 0.05);
      }, i * step);
      later(() => setLitPad(null), i * step + RECALL.litMs);
    });
    later(() => {
      inputAtRef.current = 0;
      setInputAt(0);
      setPhaseBoth("recall");
    }, sequence.length * step + 150);
  };

  const startLevel = (sequence: number[]) => {
    seqRef.current = sequence;
    setSeq(sequence);
    playback(sequence);
  };

  const begin = () => {
    clearTimers();
    if (!synthRef.current) synthRef.current = createLabSynth(muted);
    strikesRef.current = 0;
    setStrikes(0);
    setSpan(0);
    setCopied(false);
    trackEvent({ name: "lab_test_started", params: { station: "recall" } });
    startLevel(sequenceFor(rng, RECALL.startLength));
  };

  const finish = (finalSpan: number) => {
    setSpan(finalSpan);
    setNewBest(false);
    setBest((prev) => {
      if (finalSpan > prev) {
        setNewBest(true);
        try {
          localStorage.setItem(BEST_KEY, String(finalSpan));
        } catch {
          /* fine */
        }
        return finalSpan;
      }
      return prev;
    });
    trackEvent({
      name: "lab_test_completed",
      params: { station: "recall", score: finalSpan, tier: recallTier(finalSpan).name },
    });
    labBeep(synthRef.current, 196, 450, "sawtooth", 0.05);
    setGuarded(true);
    later(() => setGuarded(false), 400);
    setPhaseBoth("done");
  };

  const padTap = (pad: number) => {
    if (phaseRef.current !== "recall") return;
    const expected = seqRef.current[inputAtRef.current];
    setTapped(pad);
    later(() => setTapped(null), 160);

    if (pad === expected) {
      labBeep(synthRef.current, PAD_TONES[pad], 140, "sine", 0.05);
      inputAtRef.current += 1;
      setInputAt(inputAtRef.current);
      if (inputAtRef.current >= seqRef.current.length) {
        /* Level cleared — one more light. */
        const cleared = seqRef.current.length;
        labBeep(synthRef.current, 1318, 160, "triangle", 0.05);
        setPhaseBoth("level");
        later(() => {
          startLevel(extendSequence(rng, seqRef.current));
        }, RECALL.interRoundMs);
        setSpan(cleared);
      }
      return;
    }

    /* Wrong pad. First wobble replays the same pattern; the second ends it. */
    labBeep(synthRef.current, 130, 320, "sawtooth", 0.06);
    strikesRef.current += 1;
    setStrikes(strikesRef.current);
    if (strikesRef.current >= RECALL.strikes) {
      finish(seqRef.current.length - 1);
      return;
    }
    setPhaseBoth("wobble");
    later(() => playback(seqRef.current), 900);
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // Result params make the pasted link unfurl as the score card.
    const text = `${recallShareText(span)}\n${origin}${labRecallSharePath({ span })}`;
    trackEvent({ name: "lab_test_shared", params: { station: "recall" } });
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

  const tier = recallTier(span);
  const level = seq.length;
  const statusLine =
    phase === "watch"
      ? "WATCH THE GRID"
      : phase === "recall"
        ? `YOUR TURN · ${inputAt}/${level}`
        : phase === "wobble"
          ? "ONE WOBBLE — SAME PATTERN, WATCH AGAIN"
          : phase === "level"
            ? `LEVEL ${level} CLEARED`
            : "";

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      <div className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)]">
        {/* HUD */}
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          <span>{phase === "ready" || phase === "done" ? "RECALL" : `LEVEL ${level}`}</span>
          <span aria-label={`Wobbles used: ${strikes} of ${RECALL.strikes}`}>
            {phase === "ready" || phase === "done"
              ? best > 0
                ? `Longest span: ${best}`
                : ""
              : "♥".repeat(RECALL.strikes - strikes) + "♡".repeat(strikes)}
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

        {/* The grid */}
        <div className="relative mt-3">
          <div
            className="grid grid-cols-3 gap-2"
            role="group"
            aria-label="Recall grid — watch the pads light up, then tap the sequence back"
          >
            {Array.from({ length: RECALL.pads }, (_, pad) => (
              <button
                key={pad}
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  padTap(pad);
                }}
                aria-label={`Pad ${pad + 1}`}
                disabled={phase !== "recall"}
                className={`aspect-square rounded-xl border-2 border-foreground transition-transform duration-100 motion-reduce:transition-none ${
                  litPad === pad
                    ? "scale-95 bg-primary-strong motion-reduce:scale-100"
                    : tapped === pad
                      ? "scale-95 bg-good motion-reduce:scale-100"
                      : "bg-surface-deep"
                } ${phase === "recall" ? "cursor-pointer" : "cursor-default"}`}
              />
            ))}
          </div>

          {/* Overlays */}
          {phase === "ready" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-surface/90 p-6 text-center">
              <p className="font-display text-4xl uppercase">Recall</p>
              <p className="max-w-[16rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
                The grid lights a pattern. Tap it back. Every clean round adds
                one light. Two wobbles and it&rsquo;s over.
              </p>
              <button
                type="button"
                onClick={begin}
                className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
              >
                Light it up
              </button>
            </div>
          ) : null}

          {phase === "done" ? (
            <div
              className={`absolute inset-0 flex items-center justify-center p-2 ${
                guarded ? "pointer-events-none" : ""
              }`}
            >
              <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Sequence span
                </p>
                <p className="font-display text-6xl uppercase text-primary-strong">
                  {span}
                </p>
                <p className="mt-2 inline-block -rotate-2 rounded-full border-2 border-foreground bg-good-soft px-4 py-1 font-display text-xl uppercase tracking-wide text-good">
                  {tier.name}
                </p>
                <p className="mt-1 text-sm font-semibold">{tier.blurb}</p>
                <p aria-hidden="true" className="mt-2 text-lg tracking-[0.2em]">
                  {recallBlocks(span)}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Longest span {best}
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
                    Run it back
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                  >
                    {copied ? "Copied ✓" : "Share it"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Status line under the grid, dimensions reserved (zero-CLS). */}
        <p
          aria-live="polite"
          className="mt-3 min-h-[1.25rem] text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted"
        >
          {statusLine}
        </p>
      </div>

      {phase === "done" ? (
        <p className="mt-3 text-center">
          <Link
            href="/sleep-calculator"
            className="text-sm font-semibold text-primary underline underline-offset-2 hover:text-foreground"
          >
            Sleep consolidates this — check yours →
          </Link>
        </p>
      ) : null}
    </div>
  );
}
