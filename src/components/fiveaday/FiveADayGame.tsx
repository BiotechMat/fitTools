"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { mulberry32 } from "@/lib/lifeline";
import { trackEvent } from "@/lib/analytics";
import {
  FIVEADAY,
  type Junk,
  type Produce,
  burstSizeFor,
  comboBonusFor,
  comboLabelFor,
  escapedCause,
  junkChanceFor,
  launch,
  pickJunk,
  pickProduce,
  segmentHitsCircle,
  shareText,
  spawnIntervalFor,
} from "@/lib/fiveaday";

/**
 * Five a Day (FIVEADAY.md): the produce slicer. One verb — swipe. Fruit
 * and veg fly; slice them for portions (SMOOTHIE combos, NEW PLANT
 * variety bonuses), and never touch the junk — the arcade's villains end
 * the run on contact, bomb-style. Recognition is entirely visual: the
 * game's Snake Oil predecessor proved text cannot be read at toss speed.
 * All rendering is canvas; React handles overlays. WebAudio synth on
 * first input, mute persisted.
 */

const BEST_KEY = "fittools.fiveaday.best";
const MUTE_KEY = "fittools.fiveaday.muted";

/* ---------------------------------------------------------------- sprites */

const PALETTE: Record<string, string> = {
  K: "#1c130d", // ink
  B: "#ff531a", // blaze — oranges, carrots, apples
  E: "#c63d08", // ember — tomatoes, cherries, kiwi skin
  P: "#fbf4ec", // paper
  W: "#fffdf9", // white shine
  F: "#1f5c3d", // forest — leaves, broccoli
  M: "#8fbf3f", // matcha — grapes, stalks
  A: "#e8c33c", // amber — bananas, pineapple
  S: "#f3e7d8", // soft
  L: "#a3e635", // lime — rind, kiwi flesh
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

/* The harvest. Silhouette + colour must read in a tenth of a second. */
const PRODUCE_MAPS: Record<string, { rows: string[]; scale: number }> = {
  apple: {
    scale: 3,
    rows: [
      "....K.....",
      "....K.FF..",
      "..KKKKK...",
      ".KBBWBBK..",
      "KBBBWBBBK.",
      "KBBBBBBBK.",
      "KEBBBBBEK.",
      ".KEBBBEK..",
      "..KKKKK...",
    ],
  },
  banana: {
    scale: 3,
    rows: [
      "KK..........",
      ".KAK........",
      ".KAAK.......",
      "..KAAKK.....",
      "...KAAAKK...",
      "....KAAAAKK.",
      ".....KAAAAK.",
      "......KKKK..",
    ],
  },
  orange: {
    scale: 3,
    rows: [
      "....KF...",
      "..KKKKK..",
      ".KBBBBBK.",
      "KBBWBBBBK",
      "KBBBBBBBK",
      "KBBBBBBBK",
      ".KBBBBBK.",
      "..KKKKK..",
    ],
  },
  broccoli: {
    scale: 3,
    rows: [
      "..KKKKK...",
      ".KFFFFFK..",
      "KFMFFMFFK.",
      "KFFMFFFMK.",
      ".KFFFFFK..",
      "..KKSKK...",
      "...KSSK...",
      "...KSSK...",
      "...KKKK...",
    ],
  },
  strawberry: {
    scale: 3,
    rows: [
      "..FFKFF..",
      ".KKKKKKK.",
      "KEBBWBBEK",
      "KEBWBBWEK",
      ".KEBWBEK.",
      "..KEBEK..",
      "...KEK...",
      "....K....",
    ],
  },
  carrot: {
    scale: 3,
    rows: [
      "..LFL...",
      "..FLF...",
      "..KKK...",
      ".KBBBK..",
      ".KBBBK..",
      ".KBWBK..",
      "..KBBK..",
      "..KBBK..",
      "...KBK..",
      "...KBK..",
      "....K...",
    ],
  },
  watermelon: {
    scale: 3,
    rows: [
      "KKKKKKKKKKKKKK",
      "KBBBKBBBBKBBBK",
      "KBBBBBBKBBBBBK",
      ".KBBBKBBBBBK..",
      ".KBBBBBBBBBK..",
      "..KLLLLLLLK...",
      "..KFFFFFFFK...",
      "...KKKKKKK....",
    ],
  },
  tomato: {
    scale: 3,
    rows: [
      "...FKF...",
      "..KKFKK..",
      ".KEEFEEK.",
      "KEEWEEEEK",
      "KEEEEEEEK",
      "KEEEEEEEK",
      ".KEEEEEK.",
      "..KKKKK..",
    ],
  },
  blueberry: {
    scale: 4,
    rows: [
      "....MM..",
      "...FF...",
      "..KKKK..",
      ".KKWKKK.",
      "KKWKKKKK",
      "KKKKKKKK",
      ".KKKKKK.",
      "..KKKK..",
    ],
  },
  pineapple: {
    scale: 3,
    rows: [
      "..FL.LF...",
      "...FLF....",
      "...KKK....",
      ".KKAAAKK..",
      "KAAKAAKAAK",
      "KAAAAKAAAK",
      "KAAKAAKAAK",
      "KAAAAKAAAK",
      ".KAAAAAAK.",
      "..KKKKKK..",
    ],
  },
  kiwi: {
    scale: 3,
    rows: [
      "..KKKKK...",
      ".KELLLEK..",
      "KELLKLLEK.",
      "KELKWKLEK.",
      "KELLWLLEK.",
      "KELLKLLEK.",
      ".KELLLEK..",
      "..KKKKK...",
    ],
  },
  avocado: {
    scale: 3,
    rows: [
      "...KKK...",
      "..KFFFK..",
      ".KFLLLFK.",
      ".KFLLLFK.",
      "KFLLELLFK",
      "KFLEEELFK",
      "KFLLELLFK",
      ".KFLLLFK.",
      ".KFLLLFK.",
      "..KFFFK..",
      "...KKK...",
    ],
  },
  pepper: {
    scale: 3,
    rows: [
      "....F....",
      "...KFK...",
      ".KKKKKKK.",
      "KBWBBBBBK",
      "KBWBBBBBK",
      "KBBBBBBBK",
      "KBBBBBBBK",
      "KBBBBBBBK",
      ".KBBBBBK.",
      "..KKKKK..",
    ],
  },
  grapes: {
    scale: 3,
    rows: [
      "....K....",
      "...KK....",
      "..KKKKK..",
      ".KMMMMMK.",
      ".KMKMKMK.",
      "..KMMMK..",
      "..KMKMK..",
      "...KMK...",
      "....K....",
    ],
  },
  cherries: {
    scale: 3,
    rows: [
      "....KKK....",
      "...K...K...",
      "..K.....K..",
      ".KKK...KKK.",
      "KEEEK.KEEEK",
      "KEWEK.KEWEK",
      "KEEEK.KEEEK",
      ".KKK...KKK.",
    ],
  },
  pomegranate: {
    scale: 3,
    rows: [
      "...KKK...",
      "...K.K...",
      ".KKKKKKK.",
      "KEEEEEEEK",
      "KEWEWEWEK",
      "KEEEEEEEK",
      ".KEEEEEK.",
      "..KKKKK..",
    ],
  },
};

/* The junk — the arcade's villains, unmistakable at any speed. The phone,
   nugget and CRASH can are Powerhouse's own sprites; the cigarette and
   fizzy can are Lifeline's obstacles in the flesh. */
const JUNK_MAPS: Record<string, { rows: string[]; scale: number }> = {
  cigarette: {
    scale: 3,
    rows: [
      "W.............",
      ".KKKKKKKKKKKK.",
      "KEWWWWWWWKAAAK",
      "KEWWWWWWWKAAAK",
      ".KKKKKKKKKKKK.",
    ],
  },
  fizzy: {
    scale: 3,
    rows: [
      ".KKKKKK.",
      ".KWWWWK.",
      ".KKKKKK.",
      "KSSSSSSK",
      "KSBBBBSK",
      "KSBWWBSK",
      "KSBBBBSK",
      "KSSSSSSK",
      "KSSSSSSK",
      ".KKKKKK.",
    ],
  },
  crash: {
    scale: 2,
    rows: [
      "..KKKKKKKKKK..",
      ".KWWWWWWWWWWK.",
      ".KKKKKKKKKKKK.",
      "KEEEEEEEEEEEEK",
      "KEEEEEEEEEEEEK",
      "KEWWEEEEEEWWEK",
      "KEWWEEEEEEWWEK",
      "KEEEEEEEEEEEEK",
      "KEEEEEAAEEEEEK",
      "KEEEEAAEEEEEEK",
      "KEEEAAAAAAEEEK",
      "KEEEEEEAAEEEEK",
      "KEEEEEAAEEEEEK",
      "KEEEEEEEEEEEEK",
      "KEEKKEEEEKKEEK",
      "KEEEKKKKKKEEEK",
      "KEEEEEEEEEEEEK",
      "KEEEEEEEEEEEEK",
      "KEEEEEEEEEEEEK",
      ".KKKKKKKKKKKK.",
      ".KWWWWWWWWWWK.",
      "..KKKKKKKKKK..",
    ],
  },
  phone: {
    scale: 3,
    rows: [
      ".KKKKKK.",
      "KSSSSSAK",
      "KSSSSSSK",
      "KSWWWSSK",
      "KSSSSSSK",
      "KSWWSSSK",
      "KSSSSSSK",
      "KSWWWSSK",
      "KSSSSSSK",
      "KSSSSSSK",
      "KKKKKKKK",
      ".KKKKKK.",
    ],
  },
  nugget: {
    scale: 3,
    rows: [
      "...KKKKK...",
      ".KKAAAAAKK.",
      "KAAEAAAEAAK",
      "KAAAAEAAAAK",
      "KAEAAAAAEAK",
      "KAAAEAAAAAK",
      ".KKAAAAAKK.",
      "...KKKKK...",
    ],
  },
};

/** Juice colour per produce (junk bursts ink). */
const SPLAT: Record<string, string> = {
  apple: "#ff531a",
  banana: "#e8c33c",
  orange: "#ff531a",
  broccoli: "#1f5c3d",
  strawberry: "#c63d08",
  carrot: "#ff531a",
  watermelon: "#c63d08",
  tomato: "#c63d08",
  blueberry: "#1c130d",
  pineapple: "#e8c33c",
  kiwi: "#a3e635",
  avocado: "#a3e635",
  pepper: "#ff531a",
  grapes: "#8fbf3f",
  cherries: "#c63d08",
  pomegranate: "#c63d08",
};

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

type Payload =
  | { type: "produce"; item: Produce }
  | { type: "junk"; item: Junk };

interface Flying {
  payload: Payload;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
}

interface Half {
  spriteKey: string;
  left: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
  ttl: number;
}

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

interface BladePoint {
  x: number;
  y: number;
  age: number;
  stroke: number;
}

interface World {
  t: number;
  hearts: number;
  portions: number;
  plantsSliced: Set<string>;
  bestCombo: number;
  spawnIn: number;
  comboCount: number;
  comboKinds: Produce["kind"][];
  comboT: number;
  comboX: number;
  comboY: number;
  prevWave: number;
  waveFlashT: number;
  items: Flying[];
  halves: Half[];
  blade: BladePoint[];
  toasts: Toast[];
  particles: Particle[];
  shakeT: number;
  flashT: number;
  rng: () => number;
}

function freshWorld(): World {
  return {
    t: 0,
    hearts: FIVEADAY.maxHearts,
    portions: 0,
    plantsSliced: new Set(),
    bestCombo: 0,
    spawnIn: 0.6,
    comboCount: 0,
    comboKinds: [],
    comboT: 0,
    comboX: 0,
    comboY: 0,
    prevWave: 0,
    waveFlashT: 0,
    items: [],
    halves: [],
    blade: [],
    toasts: [],
    particles: [],
    shakeT: 0,
    flashT: 0,
    rng: mulberry32(Math.floor(Math.random() * 2 ** 31)),
  };
}

interface PendingPoint {
  x: number;
  y: number;
  stroke: number;
}

type Phase = "ready" | "playing" | "paused" | "dead";

export function FiveADayGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld());
  const phaseRef = useRef<Phase>("ready");
  const synthRef = useRef<Synth | null>(null);
  const spritesRef = useRef<Record<string, HTMLCanvasElement> | null>(null);
  const reducedMotionRef = useRef(false);
  const pendingRef = useRef<PendingPoint[]>([]);
  const strokeRef = useRef(0);
  const strokeActiveRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [finalPortions, setFinalPortions] = useState(0);
  const [finalPlants, setFinalPlants] = useState(0);
  const [finalCombo, setFinalCombo] = useState(0);
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
    canvas.width = FIVEADAY.width * dpr;
    canvas.height = FIVEADAY.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const sprites: Record<string, HTMLCanvasElement> = {
      heartFull: makeSprite(HEART_FULL, 2),
      heartEmpty: makeSprite(HEART_EMPTY, 2),
    };
    for (const [id, map] of Object.entries(PRODUCE_MAPS)) {
      sprites[id] = makeSprite(map.rows, map.scale);
    }
    for (const [id, map] of Object.entries(JUNK_MAPS)) {
      sprites[id] = makeSprite(map.rows, map.scale);
    }
    spritesRef.current = sprites;

    const toast = (x: number, y: number, text: string, colour = "#1f5c3d") => {
      world.current.toasts.push({ x, y, text, ttl: 1, colour });
    };

    const splat = (x: number, y: number, colour: string, count: number) => {
      const w = world.current;
      const n = reducedMotionRef.current ? Math.ceil(count / 2) : count;
      for (let i = 0; i < n; i++) {
        const a = w.rng() * Math.PI * 2;
        const v = 40 + w.rng() * 150;
        w.particles.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          ttl: 0.45,
          colour,
        });
      }
    };

    const die = (deathCause: string) => {
      const w = world.current;
      setFinalPortions(w.portions);
      setFinalPlants(w.plantsSliced.size);
      setFinalCombo(w.bestCombo);
      setCause(deathCause);
      setNewBest(false);
      setBest((prev) => {
        if (w.portions > prev) {
          setNewBest(true);
          try {
            localStorage.setItem(BEST_KEY, String(w.portions));
          } catch {
            /* fine */
          }
          return w.portions;
        }
        return prev;
      });
      trackEvent({
        name: "fiveaday_run_ended",
        params: { portions: w.portions, plants: w.plantsSliced.size },
      });
      setPhaseBoth("dead");
      chirp(synthRef.current, 380, 45, 700, "sawtooth", 0.06);
      setTimeout(() => beep(synthRef.current, 90, 500, "sine", 0.05), 260);
    };

    const sliceItem = (index: number, sx: number, sy: number) => {
      const w = world.current;
      const f = w.items[index];
      w.items.splice(index, 1);
      const spriteKey = f.payload.item.id;
      for (const left of [true, false]) {
        w.halves.push({
          spriteKey,
          left,
          x: f.x,
          y: f.y,
          vx: f.vx + (left ? -70 : 70),
          vy: f.vy - 40,
          rot: f.rot,
          spin: f.spin + (left ? -3 : 3),
          ttl: 0.8,
        });
      }
      if (f.payload.type === "junk") {
        w.shakeT = 0.35;
        w.flashT = 0.35;
        splat(sx, sy, "#1c130d", 18);
        splat(sx, sy, "#c63d08", 10);
        beep(synthRef.current, 110, 240, "sawtooth", 0.07);
        die(f.payload.item.cause);
        return;
      }
      const item = f.payload.item;
      w.portions += 1;
      splat(sx, sy, SPLAT[item.id] ?? "#c63d08", 9);
      chirp(synthRef.current, 620, 90, 80, "square", 0.045);
      if (!w.plantsSliced.has(item.id)) {
        w.plantsSliced.add(item.id);
        w.portions += FIVEADAY.newPlantBonus;
        toast(f.x, f.y - 30, `NEW PLANT +${FIVEADAY.newPlantBonus}`, "#1f5c3d");
        beep(synthRef.current, 990, 80, "triangle", 0.05);
      }
      w.comboCount += 1;
      w.comboKinds.push(item.kind);
      w.comboT = FIVEADAY.comboWindow;
      w.comboX = f.x;
      w.comboY = f.y;
    };

    const step = (dt: number) => {
      const w = world.current;
      w.t += dt;
      w.flashT = Math.max(0, w.flashT - dt);
      w.shakeT = Math.max(0, w.shakeT - dt);
      w.waveFlashT = Math.max(0, w.waveFlashT - dt);
      const wave = Math.floor(w.t / FIVEADAY.waveSeconds);
      if (wave > w.prevWave) {
        w.prevWave = wave;
        w.waveFlashT = 1.6;
        beep(synthRef.current, 523, 90, "square", 0.04);
      }

      /* The blade: consume queued pointer points, slice along segments. */
      const pending = pendingRef.current;
      if (pending.length > 0) {
        pendingRef.current = [];
        let prev: BladePoint | null =
          w.blade.length > 0 ? w.blade[w.blade.length - 1] : null;
        for (const p of pending) {
          const point: BladePoint = { x: p.x, y: p.y, age: 0, stroke: p.stroke };
          if (prev && prev.stroke === p.stroke) {
            const dx = point.x - prev.x;
            const dy = point.y - prev.y;
            if (dx * dx + dy * dy >= 36) {
              let whoosh = false;
              for (let i = w.items.length - 1; i >= 0; i--) {
                const f = w.items[i];
                if (
                  segmentHitsCircle(
                    prev.x,
                    prev.y,
                    point.x,
                    point.y,
                    f.x,
                    f.y,
                    FIVEADAY.sliceRadius,
                  )
                ) {
                  whoosh = true;
                  sliceItem(i, point.x, point.y);
                  if (phaseRef.current !== "playing") return;
                }
              }
              if (whoosh) chirp(synthRef.current, 800, 200, 45, "sawtooth", 0.02);
            }
          }
          w.blade.push(point);
          prev = point;
        }
      }
      for (let i = w.blade.length - 1; i >= 0; i--) {
        w.blade[i].age += dt;
        if (w.blade[i].age > 0.14) w.blade.splice(i, 1);
      }

      /* The combo window closes — name the drink, pay the bonus. */
      if (w.comboT > 0) {
        w.comboT -= dt;
        if (w.comboT <= 0) {
          if (w.comboCount >= 2) {
            const bonus = comboBonusFor(w.comboCount);
            w.portions += bonus;
            w.bestCombo = Math.max(w.bestCombo, w.comboCount);
            toast(
              w.comboX,
              w.comboY - 48,
              `${comboLabelFor(w.comboKinds)} ×${w.comboCount} +${bonus}`,
              "#c63d08",
            );
            [660, 880, 1100].forEach((f, i) =>
              setTimeout(() => beep(synthRef.current, f, 70, "triangle", 0.05), i * 70),
            );
          }
          w.comboCount = 0;
          w.comboKinds = [];
        }
      }

      /* Tosses. */
      w.spawnIn -= dt;
      if (w.spawnIn <= 0) {
        w.spawnIn = spawnIntervalFor(wave) * (0.8 + w.rng() * 0.4);
        const burst = burstSizeFor(wave, w.rng);
        for (let i = 0; i < burst; i++) {
          const junk = w.rng() < junkChanceFor(wave);
          const payload: Payload = junk
            ? { type: "junk", item: pickJunk(w.rng) }
            : { type: "produce", item: pickProduce(w.rng, wave) };
          const l = launch(w.rng);
          w.items.push({
            payload,
            x: l.x0,
            y: l.y0,
            vx: l.vx,
            vy: l.vy,
            rot: 0,
            spin: l.spin,
          });
        }
      }

      /* Flight. */
      for (let i = w.items.length - 1; i >= 0; i--) {
        const f = w.items[i];
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vy += FIVEADAY.gravity * dt;
        f.rot += f.spin * dt;
        if (f.vy > 0 && f.y > FIVEADAY.height + 40) {
          w.items.splice(i, 1);
          if (f.payload.type === "produce") {
            const gone = escapedCause(f.payload.item.label);
            w.hearts -= 1;
            w.flashT = 0.2;
            toast(
              Math.max(40, Math.min(FIVEADAY.width - 40, f.x)),
              FIVEADAY.height - 60,
              gone.toUpperCase(),
              "#c63d08",
            );
            chirp(synthRef.current, 420, 140, 320, "triangle", 0.05);
            if (w.hearts <= 0) {
              die(gone);
              return;
            }
          }
          /* Junk falling untouched is the correct play — silence. */
        }
      }

      for (let i = w.halves.length - 1; i >= 0; i--) {
        const h = w.halves[i];
        h.ttl -= dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.vy += FIVEADAY.gravity * dt;
        h.rot += h.spin * dt;
        if (h.ttl <= 0 || h.y > FIVEADAY.height + 60) w.halves.splice(i, 1);
      }
      for (let i = w.toasts.length - 1; i >= 0; i--) {
        const t = w.toasts[i];
        t.ttl -= dt;
        t.y -= 28 * dt;
        if (t.ttl <= 0) w.toasts.splice(i, 1);
      }
      for (let i = w.particles.length - 1; i >= 0; i--) {
        const p = w.particles[i];
        p.ttl -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 300 * dt;
        if (p.ttl <= 0) w.particles.splice(i, 1);
      }
    };

    const draw = () => {
      const w = world.current;
      if (!spritesRef.current) return;
      const spr = spritesRef.current;

      ctx.save();
      if (w.shakeT > 0 && !reducedMotionRef.current) {
        const mag = 6 * (w.shakeT / 0.35);
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      /* The market: paper sky, drifting motes, a stall counter below. */
      ctx.fillStyle = "#fbf4ec";
      ctx.fillRect(-8, -8, FIVEADAY.width + 16, FIVEADAY.height + 16);
      ctx.fillStyle = "#f3e7d8";
      for (let i = 0; i < 5; i++) {
        const mx = ((i * 97 + w.t * 8) % (FIVEADAY.width + 40)) - 20;
        const my = 90 + ((i * 131) % 380);
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillRect(-8, FIVEADAY.height - 14, FIVEADAY.width + 16, 14);
      ctx.fillStyle = "#1c130d";
      ctx.fillRect(0, FIVEADAY.height - 14, FIVEADAY.width, 2);

      for (const h of w.halves) {
        const sprite = spr[h.spriteKey];
        const hw = sprite.width / 2;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.globalAlpha = Math.min(1, h.ttl * 2.4);
        if (h.left) {
          ctx.drawImage(sprite, 0, 0, hw, sprite.height, -hw, -sprite.height / 2, hw, sprite.height);
        } else {
          ctx.drawImage(sprite, hw, 0, hw, sprite.height, 0, -sprite.height / 2, hw, sprite.height);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      for (const f of w.items) {
        const sprite = spr[f.payload.item.id];
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        ctx.restore();
      }

      /* The blade trail. */
      if (w.blade.length > 1) {
        for (const pass of [
          { width: 6, colour: "#1c130d" },
          { width: 2.5, colour: "#fffdf9" },
        ]) {
          ctx.strokeStyle = pass.colour;
          ctx.lineWidth = pass.width;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          let started = false;
          ctx.beginPath();
          for (let i = 0; i < w.blade.length; i++) {
            const p = w.blade[i];
            const prev = i > 0 ? w.blade[i - 1] : null;
            if (!prev || prev.stroke !== p.stroke) {
              if (started) ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              started = true;
            } else {
              ctx.lineTo(p.x, p.y);
            }
          }
          if (started) ctx.stroke();
        }
      }

      for (const p of w.particles) {
        ctx.globalAlpha = Math.max(0, p.ttl / 0.45);
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

      if (w.flashT > 0) {
        ctx.globalAlpha = Math.min(0.35, w.flashT * 1.6);
        ctx.fillStyle = "#c63d08";
        ctx.fillRect(0, 0, FIVEADAY.width, FIVEADAY.height);
        ctx.globalAlpha = 1;
      }

      /* ------------------------------------------------------------- HUD */
      for (let i = 0; i < FIVEADAY.maxHearts; i++) {
        const sprite = i < w.hearts ? spr.heartFull : spr.heartEmpty;
        ctx.drawImage(sprite, 12 + i * 20, 44);
      }

      ctx.fillStyle = "#1c130d";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        `${w.portions.toLocaleString("en-GB")} PORTIONS`,
        FIVEADAY.width - 12,
        54,
      );
      ctx.fillStyle = "#6e5b4d";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`${w.plantsSliced.size} PLANTS`, FIVEADAY.width - 12, 70);

      if (w.waveFlashT > 0 && phaseRef.current !== "ready") {
        ctx.globalAlpha = Math.min(1, w.waveFlashT / 0.4);
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 24px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`WAVE ${w.prevWave + 1}`, FIVEADAY.width / 2, 110);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
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
      pendingRef.current = [];
      setCopied(false);
      trackEvent({ name: "fiveaday_run_started", params: {} });
      setPhaseBoth("playing");
    } else if (current === "paused") {
      setPhaseBoth("playing");
    }
  };

  const logicalPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * FIVEADAY.width,
      y: ((e.clientY - rect.top) / rect.height) * FIVEADAY.height,
    };
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `${shareText(finalPortions, finalPlants, cause)}\n${origin}/five-a-day`;
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
          e.currentTarget.setPointerCapture(e.pointerId);
          begin();
          strokeRef.current += 1;
          strokeActiveRef.current = true;
          const p = logicalPoint(e);
          if (p) pendingRef.current.push({ ...p, stroke: strokeRef.current });
        }}
        onPointerMove={(e) => {
          if (!strokeActiveRef.current) return;
          const p = logicalPoint(e);
          if (p) pendingRef.current.push({ ...p, stroke: strokeRef.current });
        }}
        onPointerUp={() => {
          strokeActiveRef.current = false;
        }}
        onPointerCancel={() => {
          strokeActiveRef.current = false;
        }}
        aria-label="Five a Day — swipe to slice the fruit and veg; never slice the junk"
        className="block h-auto w-full cursor-pointer touch-none rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ aspectRatio: `${FIVEADAY.width} / ${FIVEADAY.height}` }}
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
          <p className="font-display text-4xl uppercase">Five a Day</p>
          <p className="max-w-[18rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
            Slice the produce. Never the junk. Drop three and it&rsquo;s
            compost.
          </p>
          <p className="max-w-[17rem] font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Swipe to start
          </p>
          {best > 0 ? (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Best: {best.toLocaleString("en-GB")} portions
            </p>
          ) : null}
        </div>
      ) : null}

      {phase === "paused" ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-display text-3xl uppercase">Paused — tap to resume</p>
        </div>
      ) : null}

      {phase === "dead" ? (
        <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4">
          <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Composted
            </p>
            <p className="font-display text-6xl uppercase text-primary-strong">
              {finalPortions}
            </p>
            <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
              portion{finalPortions === 1 ? "" : "s"} · {finalPlants} different
              plant{finalPlants === 1 ? "" : "s"}
            </p>
            <p className="mt-2 text-sm font-semibold">cause: {cause}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Best {best.toLocaleString("en-GB")}
              </span>
              {finalCombo >= 2 ? (
                <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Best combo ×{finalCombo}
                </span>
              ) : null}
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
                Go again
              </button>
              <button
                type="button"
                onClick={share}
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                {copied ? "Copied ✓" : "Share score"}
              </button>
              <Link
                href="/nutrition/reference"
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Food reference →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
