"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { mulberry32 } from "@/lib/lifeline";
import { trackEvent } from "@/lib/analytics";
import {
  MAXOUT,
  type RepJudgement,
  aidFor,
  causeFor,
  formatKg,
  incrementFor,
  judge,
  milestoneFor,
  needleAt,
  needleSpeedFor,
  platesPhrase,
  shareText,
  weightAfter,
  windowCentreFor,
  windowWidthFor,
} from "@/lib/maxout";

/**
 * Max Out (MAXOUT.md): the one-rep-max timing game. One verb — tap when
 * the needle crosses the green window; every clean rep loads the bar.
 * All rendering is canvas (DPR-scaled, nearest-neighbour pixel sprites);
 * React state only handles phase transitions and overlays. Audio is a
 * WebAudio synth created on first input (mute persisted).
 */

const BEST_KEY = "fittools.maxout.best";
const MUTE_KEY = "fittools.maxout.muted";

/* ---------------------------------------------------------------- sprites */

const PALETTE: Record<string, string> = {
  K: "#1c130d", // ink
  B: "#ff531a", // blaze — the sweatband
  E: "#c63d08", // ember
  P: "#fbf4ec", // paper
  W: "#fffdf9", // white
  F: "#1f5c3d", // forest — the singlet
  A: "#e8c33c", // amber
  S: "#f3e7d8", // soft — skin
  L: "#a3e635", // lime — the PERFECT core
};

function makeSprite(rows: string[], scale: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = rows[0].length * scale;
  canvas.height = rows.length * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  rows.forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      const colour = PALETTE[ch];
      if (!colour) return;
      ctx.fillStyle = colour;
      ctx.fillRect(rx * scale, ry * scale, scale, scale);
    });
  });
  return canvas;
}

/* The lifter: sweatband, forest singlet, business face. Two frames —
   set-up grit and lockout pride (open eyes, chest a pixel prouder). */
const LIFTER_SETUP = [
  "....KKKK....",
  "...KBBBBK...",
  "...KSSSSK...",
  "...KSKKSK...",
  "...KSSSSK...",
  "..KKFFFFKK..",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKKFFKKSK.",
  ".KSKFSSFKSK.",
  ".KSKFSSFKSK.",
  ".KSSKSSKSSK.",
  "..KKKKKKKK..",
];
const LIFTER_LOCKOUT = [
  "....KKKK....",
  "...KBBBBK...",
  "...KSSSSK...",
  "...KSWWSK...",
  "...KSSSSK...",
  "..KKFFFFKK..",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKFFFFKSK.",
  ".KSKKFFKKSK.",
  ".KSKFSSFKSK.",
  ".KSSKSSKSSK.",
  "..KKKKKKKK..",
];

const HEART_FULL = [
  ".KK.KK.",
  "KBBKBBK",
  "KBBBBBK",
  ".KBBBK.",
  "..KBK..",
  "...K...",
];
const HEART_EMPTY = [
  ".KK.KK.",
  "KSSKSSK",
  "KSSSSSK",
  ".KSSSK.",
  "..KSK..",
  "...K...",
];

/* ---------------------------------------------------- plate stack visuals */

/** kg → drawn disc size and colour (competition-poster palette, cartooned). */
const PLATE_STYLE: Record<string, { w: number; h: number; colour: string }> = {
  "20": { w: 12, h: 32, colour: "#ff531a" },
  "15": { w: 10, h: 26, colour: "#e8c33c" },
  "10": { w: 9, h: 21, colour: "#1f5c3d" },
  "5": { w: 8, h: 15, colour: "#fffdf9" },
  "2.5": { w: 7, h: 11, colour: "#c63d08" },
  "1.25": { w: 6, h: 8, colour: "#a3e635" },
};

/**
 * Per-side stack: 20s first (so "n plates a side" reads literally), then
 * the smalls. Purely visual — the drawn 20s cap at 8 so legend runs never
 * push plates off the canvas.
 */
function plateStackFor(perSide: number): string[] {
  const stack: string[] = [];
  let rest = perSide;
  while (rest >= 20 && stack.length < 8) {
    stack.push("20");
    rest -= 20;
  }
  for (const kg of [15, 10, 5, 2.5, 1.25]) {
    while (rest >= kg) {
      stack.push(String(kg));
      rest -= kg;
    }
  }
  return stack;
}

/* ------------------------------------------------------------------ audio */

interface Synth {
  ctx: AudioContext;
  muted: boolean;
}

function beep(
  synth: Synth | null,
  freq: number,
  ms: number,
  type: OscillatorType,
  gain = 0.05,
): void {
  if (!synth || synth.muted) return;
  const { ctx } = synth;
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

function chirp(
  synth: Synth | null,
  from: number,
  to: number,
  ms: number,
  type: OscillatorType,
  gain = 0.05,
): void {
  if (!synth || synth.muted) return;
  const { ctx } = synth;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(1, to),
    ctx.currentTime + ms / 1000,
  );
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + ms / 1000);
}

/* ------------------------------------------------------------------- game */

interface Toast {
  x: number;
  y: number;
  text: string;
  ttl: number;
  colour: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  colour: string;
}

type RepState = "setup" | "live" | "locked" | "failed";

interface World {
  t: number;
  repState: RepState;
  stateT: number;
  /** Time since this rep's needle started — drives `needleAt`. */
  liveT: number;
  weight: number;
  lockedReps: number;
  form: number;
  perfectStreak: number;
  windowCentre: number;
  windowWidth: number;
  needleSpeed: number;
  /** Earned aids pending for the next rep. */
  chalkNext: boolean;
  beltNext: boolean;
  /** Aids actually applied to the rep in play (HUD chips). */
  chalkOn: boolean;
  beltOn: boolean;
  spotter: boolean;
  spotterAnnounced: boolean;
  milestone: string | null;
  milestoneT: number;
  lastJudgement: RepJudgement | null;
  judgeFlashT: number;
  needleWasHigh: boolean;
  toasts: Toast[];
  particles: Particle[];
  shakeT: number;
  hopT: number;
  rng: () => number;
}

function freshWorld(): World {
  return {
    t: 0,
    repState: "setup",
    stateT: 0,
    liveT: 0,
    weight: MAXOUT.startWeight,
    lockedReps: 0,
    form: MAXOUT.maxForm,
    perfectStreak: 0,
    windowCentre: 0.5,
    windowWidth: windowWidthFor(MAXOUT.startWeight),
    needleSpeed: needleSpeedFor(MAXOUT.startWeight),
    chalkNext: false,
    beltNext: false,
    chalkOn: false,
    beltOn: false,
    spotter: false,
    spotterAnnounced: false,
    milestone: null,
    milestoneT: 0,
    lastJudgement: null,
    judgeFlashT: 0,
    needleWasHigh: false,
    toasts: [],
    particles: [],
    shakeT: 0,
    hopT: 0,
    rng: mulberry32(Math.floor(Math.random() * 2 ** 31)),
  };
}

/* Scene geometry (logical px). */
const FLOOR_Y = 505;
const BAR_Y = 489;
const LIFTER_X = 210;
const LIFTER_TOP = 449;
const METER_X = 40;
const METER_W = 340;
const METER_Y = 120;
const METER_H = 22;

type Phase = "ready" | "playing" | "paused" | "dead";

export function MaxOutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld());
  const phaseRef = useRef<Phase>("ready");
  const synthRef = useRef<Synth | null>(null);
  const spritesRef = useRef<Record<string, HTMLCanvasElement> | null>(null);
  const reducedMotionRef = useRef(false);
  /** A queued tap carries the precise needle time it happened at. */
  const tapRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("ready");
  const [finalKg, setFinalKg] = useState(0);
  const [cause, setCause] = useState("");
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time localStorage
       hydration after mount; server render must stay storage-free */
    try {
      setBest(Number(localStorage.getItem(BEST_KEY) ?? 0));
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      /* private mode — best score just lives for the session */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = MAXOUT.width * dpr;
    canvas.height = MAXOUT.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    spritesRef.current = {
      setup: makeSprite(LIFTER_SETUP, 4),
      lockout: makeSprite(LIFTER_LOCKOUT, 4),
      heartFull: makeSprite(HEART_FULL, 2),
      heartEmpty: makeSprite(HEART_EMPTY, 2),
    };

    const toast = (x: number, y: number, text: string, colour = "#1f5c3d") => {
      world.current.toasts.push({ x, y, text, ttl: 1, colour });
    };

    const chalkPuff = (x: number, y: number, count: number, colour = "#fffdf9") => {
      const w = world.current;
      const n = reducedMotionRef.current ? Math.ceil(count / 2) : count;
      for (let i = 0; i < n; i++) {
        const a = w.rng() * Math.PI * 2;
        const v = 30 + w.rng() * 110;
        w.particles.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 40,
          ttl: 0.5,
          colour,
        });
      }
    };

    const die = (deathCause: string) => {
      const w = world.current;
      const kg = w.weight;
      setFinalKg(kg);
      setCause(deathCause);
      setNewBest(false);
      setBest((prev) => {
        if (kg > prev) {
          setNewBest(true);
          try {
            localStorage.setItem(BEST_KEY, String(kg));
          } catch {
            /* fine */
          }
          return kg;
        }
        return prev;
      });
      trackEvent({ name: "maxout_form_failed", params: { kg, cause: deathCause } });
      setPhaseBoth("dead");
      chirp(synthRef.current, 300, 40, 650, "sawtooth", 0.06);
      setTimeout(() => beep(synthRef.current, 82, 500, "sine", 0.05), 240);
    };

    const enterState = (state: RepState) => {
      const w = world.current;
      w.repState = state;
      w.stateT = 0;
      if (state === "live") {
        w.liveT = 0;
        w.needleWasHigh = false;
        w.windowCentre = windowCentreFor(w.rng);
        w.chalkOn = w.chalkNext;
        w.beltOn = w.beltNext;
        w.chalkNext = false;
        w.beltNext = false;
        w.windowWidth =
          windowWidthFor(w.weight) * (w.beltOn ? MAXOUT.beltWiden : 1);
        w.needleSpeed =
          needleSpeedFor(w.weight) * (w.chalkOn ? MAXOUT.chalkSlow : 1);
      }
    };

    const lockRep = (judgement: Exclude<RepJudgement, "miss">) => {
      const w = world.current;
      const prevWeight = w.weight;
      const gain = incrementFor(w.lockedReps);
      w.lockedReps += 1;
      w.weight = weightAfter(w.lockedReps);
      w.hopT = 0.35;
      w.judgeFlashT = 0.5;
      w.lastJudgement = judgement;

      if (judgement === "perfect") {
        w.perfectStreak += 1;
        toast(LIFTER_X, 260, `PERFECT +${formatKg(gain)} KG`, "#1f5c3d");
        chalkPuff(LIFTER_X, BAR_Y - 10, 14, "#a3e635");
        chirp(synthRef.current, 1300, 300, 90, "square", 0.05);
        setTimeout(() => beep(synthRef.current, 72, 130, "sine", 0.06), 40);
        const aid = aidFor(w.perfectStreak);
        if (aid === "chalk") {
          w.chalkNext = true;
          toast(LIFTER_X, 290, "CHALKED UP, SLOWER NEEDLE", "#c63d08");
          beep(synthRef.current, 880, 90, "triangle", 0.05);
        } else if (aid === "belt") {
          w.beltNext = true;
          toast(LIFTER_X, 290, "BELT ON, WIDER WINDOW", "#c63d08");
          beep(synthRef.current, 660, 90, "triangle", 0.05);
          setTimeout(() => beep(synthRef.current, 990, 110, "triangle", 0.05), 90);
        }
      } else {
        w.perfectStreak = 0;
        toast(LIFTER_X, 260, `+${formatKg(gain)} KG`, "#1c130d");
        chalkPuff(LIFTER_X, BAR_Y - 10, 8);
        chirp(synthRef.current, 900, 260, 70, "square", 0.04);
        setTimeout(() => beep(synthRef.current, 72, 110, "sine", 0.05), 40);
      }

      const milestone = milestoneFor(prevWeight, w.weight);
      if (milestone) {
        w.milestone = milestone;
        w.milestoneT = 2.2;
        [523, 659, 784].forEach((f, i) =>
          setTimeout(() => beep(synthRef.current, f, 110, "square", 0.05), 200 + i * 110),
        );
      }
      if (!w.spotterAnnounced && w.weight >= MAXOUT.spotterAt) {
        w.spotterAnnounced = true;
        w.spotter = true;
        toast(LIFTER_X, 320, "THE SPOTTER WANDERS OVER", "#1c130d");
      }
      enterState("locked");
    };

    const missRep = () => {
      const w = world.current;
      w.perfectStreak = 0;
      w.lastJudgement = "miss";
      w.judgeFlashT = 0.5;
      if (w.spotter) {
        w.spotter = false;
        toast(LIFTER_X, 260, "SPOTTER SAVE!", "#1f5c3d");
        chirp(synthRef.current, 420, 900, 160, "triangle", 0.06);
        enterState("failed");
        return;
      }
      w.form -= 1;
      w.shakeT = 0.3;
      chalkPuff(LIFTER_X, BAR_Y, 12, "#c63d08");
      chirp(synthRef.current, 200, 55, 280, "sawtooth", 0.07);
      if (w.form <= 0) {
        die(causeFor(w.rng));
        return;
      }
      toast(LIFTER_X, 260, "FORM BREAK", "#c63d08");
      enterState("failed");
    };

    const step = (dt: number) => {
      const w = world.current;
      w.t += dt;
      w.stateT += dt;
      w.judgeFlashT = Math.max(0, w.judgeFlashT - dt);
      w.milestoneT = Math.max(0, w.milestoneT - dt);
      w.shakeT = Math.max(0, w.shakeT - dt);
      w.hopT = Math.max(0, w.hopT - dt);

      if (w.repState === "setup" && w.stateT >= MAXOUT.setupSeconds) {
        enterState("live");
      } else if (w.repState === "live") {
        w.liveT += dt;
        /* A soft tick at each end of the sweep — the rhythm cue. */
        const pos = needleAt(w.liveT, w.needleSpeed);
        const high = pos > 0.98;
        const low = pos < 0.02;
        if ((high && !w.needleWasHigh) || (low && w.needleWasHigh)) {
          w.needleWasHigh = high;
          beep(synthRef.current, 240, 30, "square", 0.015);
        }
        const tap = tapRef.current;
        if (tap !== null) {
          tapRef.current = null;
          const tapPos = needleAt(tap, w.needleSpeed);
          const judgement = judge(tapPos, w.windowCentre, w.windowWidth);
          if (judgement === "miss") missRep();
          else lockRep(judgement);
        }
      } else if (w.repState === "locked" && w.stateT >= MAXOUT.lockedSeconds) {
        enterState("setup");
      } else if (w.repState === "failed" && w.stateT >= MAXOUT.failedSeconds) {
        enterState("setup");
      }
      if (w.repState !== "live") tapRef.current = null;

      for (let i = w.toasts.length - 1; i >= 0; i--) {
        const t = w.toasts[i];
        t.ttl -= dt;
        t.y -= 26 * dt;
        if (t.ttl <= 0) w.toasts.splice(i, 1);
      }
      for (let i = w.particles.length - 1; i >= 0; i--) {
        const p = w.particles[i];
        p.ttl -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        if (p.ttl <= 0) w.particles.splice(i, 1);
      }
    };

    const drawBarAndLifter = () => {
      const w = world.current;
      const sprites = spritesRef.current;
      if (!sprites) return;

      const lockFrac =
        w.repState === "locked"
          ? Math.min(1, w.stateT / 0.18)
          : 0;
      const hop = reducedMotionRef.current
        ? 0
        : lockFrac > 0
          ? Math.sin(Math.min(1, w.stateT / MAXOUT.lockedSeconds) * Math.PI) * 16
          : 0;
      const wobble =
        w.repState === "failed" && !reducedMotionRef.current
          ? Math.sin(w.stateT * 34) * 3 * (1 - w.stateT / MAXOUT.failedSeconds)
          : 0;

      /* The lifter (behind the bar). */
      const sprite = w.repState === "locked" ? sprites.lockout : sprites.setup;
      ctx.drawImage(
        sprite,
        LIFTER_X - sprite.width / 2 + wobble,
        LIFTER_TOP - hop,
      );

      const barY = BAR_Y - hop;
      const sag = Math.min(20, (w.weight - MAXOUT.startWeight) * 0.075);

      /* The bar, bending under the load. */
      ctx.strokeStyle = "#1c130d";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(40, barY + sag);
      ctx.quadraticCurveTo(210, barY - sag * 0.4, 380, barY + sag);
      ctx.stroke();

      /* Collars. */
      ctx.fillStyle = "#1c130d";
      ctx.fillRect(146, barY + sag * 0.55 - 7, 5, 14);
      ctx.fillRect(269, barY + sag * 0.55 - 7, 5, 14);

      /* Plates, 20s first — the "n plates a side" flex, drawn literally. */
      const stack = plateStackFor((w.weight - MAXOUT.barWeight) / 2);
      let lx = 146;
      let rx = 274;
      for (const kg of stack) {
        const style = PLATE_STYLE[kg];
        const py = barY + sag * 0.8;
        lx -= style.w + 1;
        ctx.fillStyle = style.colour;
        ctx.strokeStyle = "#1c130d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(lx, py - style.h / 2, style.w, style.h, 3);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(rx, py - style.h / 2, style.w, style.h, 3);
        ctx.fill();
        ctx.stroke();
        rx += style.w + 1;
      }
    };

    const drawMeter = () => {
      const w = world.current;
      const live = w.repState === "live";

      /* Track. */
      ctx.fillStyle = "#f3e7d8";
      ctx.strokeStyle = "#1c130d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(METER_X, METER_Y, METER_W, METER_H, 6);
      ctx.fill();
      ctx.stroke();

      /* The window and its PERFECT core. */
      const winX = METER_X + (w.windowCentre - w.windowWidth / 2) * METER_W;
      const winW = w.windowWidth * METER_W;
      ctx.fillStyle = "#1f5c3d";
      ctx.fillRect(winX, METER_Y + 2, winW, METER_H - 4);
      const coreW = winW * MAXOUT.perfectCore;
      ctx.fillStyle = "#a3e635";
      ctx.fillRect(winX + (winW - coreW) / 2, METER_Y + 2, coreW, METER_H - 4);

      /* The needle. */
      const pos = live ? needleAt(w.liveT, w.needleSpeed) : 0;
      const nx = METER_X + pos * METER_W;
      ctx.globalAlpha = live ? 1 : 0.25;
      ctx.fillStyle = "#1c130d";
      ctx.fillRect(nx - 1.5, METER_Y - 7, 3, METER_H + 14);
      ctx.beginPath();
      ctx.moveTo(nx - 6, METER_Y - 13);
      ctx.lineTo(nx + 6, METER_Y - 13);
      ctx.lineTo(nx, METER_Y - 5);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      /* Judgement flash under the meter. */
      if (w.judgeFlashT > 0 && w.lastJudgement) {
        const labels: Record<RepJudgement, [string, string]> = {
          perfect: ["PERFECT", "#1f5c3d"],
          good: ["GOOD REP", "#1c130d"],
          miss: ["MISSED IT", "#c63d08"],
        };
        const [text, colour] = labels[w.lastJudgement];
        ctx.globalAlpha = Math.min(1, w.judgeFlashT * 3);
        ctx.fillStyle = colour;
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "center";
        ctx.fillText(text, MAXOUT.width / 2, METER_Y + METER_H + 24);
        ctx.globalAlpha = 1;
      } else if (w.repState === "setup" && phaseRef.current === "playing") {
        ctx.fillStyle = "#6e5b4d";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GET SET…", MAXOUT.width / 2, METER_Y + METER_H + 24);
      }
    };

    const draw = () => {
      const w = world.current;
      const sprites = spritesRef.current;
      if (!sprites) return;

      ctx.save();
      if (w.shakeT > 0 && !reducedMotionRef.current) {
        const mag = 6 * (w.shakeT / 0.3);
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      /* The gym: paper walls, a skirting line, platform, floor. */
      ctx.fillStyle = "#fbf4ec";
      ctx.fillRect(-8, -8, MAXOUT.width + 16, MAXOUT.height + 16);
      ctx.fillStyle = "#f3e7d8";
      ctx.fillRect(-8, 300, MAXOUT.width + 16, 4);
      ctx.fillRect(-8, FLOOR_Y, MAXOUT.width + 16, MAXOUT.height - FLOOR_Y + 8);
      ctx.fillStyle = "#1c130d";
      ctx.fillRect(0, FLOOR_Y, MAXOUT.width, 2);
      /* The platform. */
      ctx.fillStyle = "#e8c33c";
      ctx.fillRect(60, FLOOR_Y, 300, 6);

      drawBarAndLifter();
      drawMeter();

      for (const p of w.particles) {
        ctx.globalAlpha = Math.max(0, p.ttl / 0.5);
        ctx.fillStyle = p.colour;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;

      for (const t of w.toasts) {
        ctx.globalAlpha = Math.min(1, t.ttl * 2);
        ctx.fillStyle = t.colour;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(t.text, t.x, t.y);
      }
      ctx.globalAlpha = 1;

      /* ------------------------------------------------------------- HUD */
      for (let i = 0; i < MAXOUT.maxForm; i++) {
        const sprite = i < w.form ? sprites.heartFull : sprites.heartEmpty;
        ctx.drawImage(sprite, 12 + i * 20, 50);
      }
      ctx.fillStyle = "#6e5b4d";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText("FORM", 12, 46);

      ctx.fillStyle = "#1c130d";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${formatKg(w.weight)} KG`, MAXOUT.width - 12, 58);
      ctx.fillStyle = "#6e5b4d";
      ctx.font = "bold 11px monospace";
      ctx.fillText(
        `NEXT +${formatKg(incrementFor(w.lockedReps))}`,
        MAXOUT.width - 12,
        74,
      );

      /* Aid chips for the rep in play. */
      let chipX = 12;
      const chip = (label: string) => {
        ctx.fillStyle = "#fffdf9";
        ctx.strokeStyle = "#1c130d";
        ctx.lineWidth = 1.5;
        const cw = 12 + label.length * 6.5;
        ctx.beginPath();
        ctx.roundRect(chipX, 78, cw, 18, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "left";
        ctx.fillText(label, chipX + 6, 90);
        chipX += cw + 6;
      };
      if (w.chalkOn && w.repState === "live") chip("CHALKED");
      if (w.beltOn && w.repState === "live") chip("BELT ON");
      if (w.spotter) chip("SPOTTER IN");

      if (w.milestoneT > 0) {
        ctx.globalAlpha = Math.min(1, w.milestoneT / 0.5);
        ctx.textAlign = "center";
        ctx.fillStyle = "#c63d08";
        ctx.font = "bold 30px monospace";
        ctx.fillText(w.milestone ?? "", MAXOUT.width / 2, 250);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      lastFrameRef.current = now;
      if (phaseRef.current === "playing") step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden && phaseRef.current === "playing") {
        setPhaseBoth("paused");
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const begin = () => {
    const current = phaseRef.current;
    if (!synthRef.current && typeof AudioContext !== "undefined") {
      try {
        synthRef.current = { ctx: new AudioContext(), muted };
      } catch {
        /* no audio — the game plays silent */
      }
    }
    if (current === "dead" || current === "ready") {
      world.current = freshWorld();
      setCopied(false);
      trackEvent({ name: "maxout_run_started", params: {} });
      setPhaseBoth("playing");
    } else if (current === "paused") {
      setPhaseBoth("playing");
    }
  };

  /** The one verb: start when idle, judge the rep when the needle runs. */
  const act = () => {
    if (phaseRef.current !== "playing") {
      begin();
      return;
    }
    const w = world.current;
    if (w.repState === "live") {
      /* Stamp the tap with the needle time it REALLY happened at, so a
         between-frames tap is judged at its true position. */
      const sinceFrame = Math.max(
        0,
        (performance.now() - lastFrameRef.current) / 1000,
      );
      tapRef.current = w.liveT + sinceFrame;
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        act();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- act is stable enough (refs)
  }, []);

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `${shareText(finalKg, cause)}\n${origin}/max-out`;
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

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          e.preventDefault();
          act();
        }}
        aria-label="Max Out, tap, click or press space when the needle is inside the green window to lock the rep"
        className="block h-auto w-full cursor-pointer touch-none rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ aspectRatio: `${MAXOUT.width} / ${MAXOUT.height}` }}
      />
      <button
        type="button"
        aria-pressed={muted}
        onClick={() => {
          setMuted((m) => {
            try {
              localStorage.setItem(MUTE_KEY, m ? "0" : "1");
            } catch {
              /* fine */
            }
            return !m;
          });
        }}
        className="absolute left-3 top-3 rounded-full border-2 border-foreground bg-surface px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]"
      >
        {muted ? "Sound off" : "Sound on"}
      </button>

      {phase === "ready" ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
          <p className="font-display text-4xl uppercase">Max Out</p>
          <p className="max-w-[17rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
            Tap when the needle crosses the green. Every clean rep loads the
            bar. Three form breaks and the lift is done.
          </p>
          <p className="max-w-[17rem] font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Tap or press space to start
          </p>
          {best > 0 ? (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Best: {formatKg(best)} kg
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "paused" ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-display text-3xl uppercase">Paused, tap to resume</p>
        </div>
      ) : null}

      {phase === "dead" ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Form failed at
            </p>
            <p className="font-display text-6xl uppercase text-primary-strong">
              {formatKg(finalKg)} kg
            </p>
            <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
              {platesPhrase(finalKg)}
            </p>
            <p className="mt-2 text-sm font-semibold">cause: {cause}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Best {formatKg(best)} kg
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
                One more attempt
              </button>
              <button
                type="button"
                onClick={share}
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                {copied ? "Copied ✓" : "Share score"}
              </button>
              <Link
                href="/one-rep-max-calculator"
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Your real 1RM →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
