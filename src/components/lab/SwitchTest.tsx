"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { mulberry32 } from "@/lib/lifeline";
import {
  SWITCH,
  correctAnswer,
  switchSchedule,
  switchScore,
  switchShareText,
  switchTier,
  type ScoredSwitchTrial,
  type SwitchScore,
  type SwitchTrial,
} from "@/lib/lab/switch";
import { labSwitchSharePath } from "@/lib/arcade-share";
import {
  createLabSynth,
  labBeep,
  readLabMuted,
  writeLabMuted,
  type LabSynth,
} from "./labSynth";

/**
 * Switch (PERFORMANCE-LAB.md §4.5): colour/shape task switching. Each
 * card is a coloured shape; the banner says which feature answers, and
 * the rule keeps flipping. Two big labelled pads (plus ←/→ keys):
 * device-agnostic. The score is the switch cost — the ms the brain pays
 * to change rules.
 */

const BEST_KEY = "fittools.lab.switch.best";

/* Answer pads: index 0 = orange/circle, 1 = green/square. Labels follow
   the ACTIVE rule so the cue is text, never colour alone. */
const ANSWER_LABELS: Record<"colour" | "shape", [string, string]> = {
  colour: ["ORANGE", "GREEN"],
  shape: ["CIRCLE", "SQUARE"],
};

type Phase = "ready" | "live" | "done";

export function SwitchTest() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [index, setIndex] = useState(0);
  const [trial, setTrial] = useState<SwitchTrial | null>(null);
  const [verdict, setVerdict] = useState<"good" | "bad" | null>(null);
  const [score, setScore] = useState<SwitchScore>({
    repeatMs: 0,
    switchMs: 0,
    cost: 0,
    errors: 0,
    errorRate: 0,
  });
  const [best, setBest] = useState(0);
  const [hasBest, setHasBest] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  const phaseRef = useRef<Phase>("ready");
  const scheduleRef = useRef<SwitchTrial[]>([]);
  const indexRef = useRef(0);
  const shownAtRef = useRef(0);
  const resultsRef = useRef<ScoredSwitchTrial[]>([]);
  const answeredRef = useRef(false);
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
    return clearTimers;
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.muted = muted;
  }, [muted]);

  const showTrial = (i: number) => {
    indexRef.current = i;
    answeredRef.current = false;
    setIndex(i);
    setTrial(scheduleRef.current[i]);
    setVerdict(null);
    /* Dawdling past the window scores as an error and moves on. */
    later(() => {
      if (indexRef.current === i && !answeredRef.current && phaseRef.current === "live") {
        record(i, false, SWITCH.windowMs);
      }
    }, SWITCH.windowMs);
  };

  /* Stamp the card's onset as close to the paint as the DOM allows —
     the ReactionTest pattern, and the honest end of the RT measurement. */
  useEffect(() => {
    if (phase !== "live" || trial === null) return;
    const raf = requestAnimationFrame(() => {
      shownAtRef.current = performance.now();
    });
    return () => cancelAnimationFrame(raf);
  }, [trial, phase]);

  const finish = () => {
    const finalScore = switchScore(resultsRef.current);
    setScore(finalScore);
    setTrial(null);
    setNewBest(false);
    /* A best only counts from a legitimate run (under the error gate). */
    if (finalScore.errorRate <= SWITCH.errorGate) {
      setBest((prev) => {
        if (!hasBest || finalScore.cost < prev) {
          setNewBest(true);
          setHasBest(true);
          try {
            localStorage.setItem(BEST_KEY, String(finalScore.cost));
          } catch {
            /* fine */
          }
          return finalScore.cost;
        }
        return prev;
      });
    }
    trackEvent({
      name: "lab_test_completed",
      params: {
        station: "switch",
        score: finalScore.cost,
        tier: switchTier(finalScore.cost, finalScore.errorRate).name,
      },
    });
    labBeep(synthRef.current, 1046, 200, "triangle", 0.05);
    setPhaseBoth("done");
  };

  const record = (i: number, correct: boolean, ms: number) => {
    answeredRef.current = true;
    if (i >= SWITCH.warmup) {
      resultsRef.current.push({
        isSwitch: scheduleRef.current[i].isSwitch,
        correct,
        ms: Math.round(ms),
      });
    }
    setVerdict(correct ? "good" : "bad");
    labBeep(
      synthRef.current,
      correct ? 880 : 150,
      correct ? 40 : 120,
      correct ? "sine" : "sawtooth",
      correct ? 0.025 : 0.05,
    );
    const next = i + 1;
    if (next >= scheduleRef.current.length) {
      later(finish, 250);
      return;
    }
    later(() => showTrial(next), 280);
  };

  /** Answer with the event's own timestamp — fair at any frame rate. */
  const answer = (side: 0 | 1, tapAt: number) => {
    if (phaseRef.current !== "live" || answeredRef.current) return;
    const i = indexRef.current;
    const t = scheduleRef.current[i];
    if (!t) return;
    record(i, side === correctAnswer(t), Math.max(1, tapAt - shownAtRef.current));
  };

  const begin = () => {
    clearTimers();
    if (!synthRef.current) synthRef.current = createLabSynth(muted);
    scheduleRef.current = switchSchedule(rng);
    resultsRef.current = [];
    setCopied(false);
    trackEvent({ name: "lab_test_started", params: { station: "switch" } });
    setPhaseBoth("live");
    showTrial(0);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        answer(0, e.timeStamp);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        answer(1, e.timeStamp);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- answer is stable enough (refs)
  }, []);

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = labSwitchSharePath({
      cost: Math.max(0, score.cost),
      err: Math.round(score.errorRate * 100),
    });
    const text = `${switchShareText(score)}\n${origin}${path}`;
    trackEvent({ name: "lab_test_shared", params: { station: "switch" } });
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

  const tier = switchTier(score.cost, score.errorRate);
  const warmup = phase === "live" && index < SWITCH.warmup;
  const labels = trial ? ANSWER_LABELS[trial.rule] : ANSWER_LABELS.colour;

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      {/* HUD */}
      <div className="mb-2 flex items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
        <span>
          {phase === "live"
            ? warmup
              ? "WARM-UP"
              : `CARD ${index - SWITCH.warmup + 1}/${SWITCH.trials}`
            : "SWITCH"}
        </span>
        <span>
          {phase !== "live" && hasBest ? `Lowest cost: ${best} ms` : ""}
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

      <div className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)]">
        {/* The rule banner — the thing that keeps flipping. */}
        <p
          key={trial?.rule ?? "idle"}
          className={`sticker-slap text-center font-display text-3xl uppercase ${
            trial?.rule === "shape" ? "text-good" : "text-primary-strong"
          }`}
        >
          {trial ? `${trial.rule}?` : " "}
        </p>

        {/* The card */}
        <div className="relative mx-auto mt-3 flex aspect-[5/3] w-full items-center justify-center rounded-xl border-2 border-foreground bg-surface-deep">
          {trial ? (
            <span
              aria-label={`${trial.colour === 0 ? "orange" : "green"} ${trial.shape === 0 ? "circle" : "square"}`}
              className={`block h-24 w-24 border-2 border-foreground ${
                trial.shape === 0 ? "rounded-full" : "rounded-lg"
              } ${trial.colour === 0 ? "bg-primary-strong" : "bg-good"}`}
            />
          ) : null}

          {phase === "ready" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              <p className="font-display text-4xl uppercase">Switch</p>
              <p className="max-w-[17rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
                The banner asks COLOUR? or SHAPE? — answer for THAT feature.
                The rule keeps flipping. That&rsquo;s the whole trap.
              </p>
              <button
                type="button"
                onClick={begin}
                className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
              >
                Deal the cards
              </button>
            </div>
          ) : null}

          {phase === "done" ? (
            <div className="absolute inset-x-0 -top-14 bottom-0 z-10 flex items-center justify-center">
              <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Switch cost
                </p>
                <p className="font-display text-6xl uppercase text-primary-strong">
                  {score.cost}
                  <span className="text-3xl text-muted"> ms</span>
                </p>
                <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
                  Repeat {score.repeatMs} ms · switch {score.switchMs} ms ·{" "}
                  {score.errors} error{score.errors === 1 ? "" : "s"}
                </p>
                <p className="mt-2 inline-block -rotate-2 rounded-full border-2 border-foreground bg-primary-soft px-4 py-1 font-display text-xl uppercase tracking-wide">
                  {tier.name}
                </p>
                <p className="mt-1 text-sm font-semibold">{tier.blurb}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={begin}
                    className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
                  >
                    Redeal
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
                  >
                    {copied ? "Copied ✓" : "Share it"}
                  </button>
                  {newBest ? (
                    <span className="sticker-slap inline-block rotate-2 self-center rounded-full border-2 border-good bg-good-soft px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-good">
                      New best ✓
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Answer pads — labels follow the rule, text never colour alone. */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[0, 1].map((side) => (
            <button
              key={side}
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                answer(side as 0 | 1, e.timeStamp);
              }}
              disabled={phase !== "live"}
              className={`riso-press rounded-xl border-2 border-foreground py-4 font-display text-xl uppercase tracking-wide ${
                phase === "live" ? "bg-background" : "bg-surface-deep text-muted"
              }`}
            >
              {labels[side]}
            </button>
          ))}
        </div>

        {/* Verdict line, dimensions reserved (zero-CLS). */}
        <p
          aria-live="polite"
          className={`mt-2 min-h-[1.25rem] text-center font-mono text-[11px] font-bold uppercase tracking-[0.14em] ${
            verdict === "bad" ? "text-primary" : "text-good"
          }`}
        >
          {verdict === "good" ? "✓" : verdict === "bad" ? "wrong feature" : ""}
        </p>
      </div>

      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        Keyboard: ← left pad · → right pad
      </p>
    </div>
  );
}
