"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { mulberry32 } from "@/lib/lifeline";
import { powerhouseSharePath } from "@/lib/arcade-share";
import {
  BOSS,
  ENEMY_KINDS,
  POWERHOUSE,
  POWERUP_KINDS,
  type EnemyKind,
  type PowerupKind,
  ZONES,
  bossHpFor,
  bpmFor,
  hitsCircle,
  multiplierFor,
  rollDrop,
  shareText,
  spawnIntervalFor,
  speedMulFor,
  unlockedKinds,
  zoneName,
} from "@/lib/powerhouse";

/**
 * Powerhouse (POWERHOUSE.md): side-scrolling mitochondria shooter. All
 * rendering is canvas (DPR-scaled, nearest-neighbour pixel sprites from
 * the maps below); React state only handles phase transitions and
 * overlays. Audio is a WebAudio synth created on first input (mute
 * persisted) — including the heartbeat kick that tracks the zone's BPM.
 */

const BEST_KEY = "fittools.powerhouse.best";
const MUTE_KEY = "fittools.powerhouse.muted";

/* ---------------------------------------------------------------- sprites */

const PALETTE: Record<string, string> = {
  K: "#1c130d", // ink
  B: "#ff531a", // blaze
  E: "#c63d08", // ember
  P: "#fbf4ec", // paper
  W: "#fffdf9", // white
  M: "#8fbf3f", // matcha
  F: "#1f5c3d", // forest
  A: "#e8c33c", // amber
  S: "#f3e7d8", // soft
  L: "#a3e635", // lime — ATP energy
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

/* The hero: a Blaze mitochondrion, amber cristae, eye on the road ahead.
   Two frames = the engine flame flicker (cols 0 are the exhaust). */
const MITO_A = [
  "...KKKKKKKK...",
  "..KBBBBBBBBK..",
  ".KBABBABBABBK.",
  "LKBBAABBAWKBK.",
  "AKBABBABBWKBK.",
  "LKBBAABBABBBK.",
  ".KBABBABBABBK.",
  "..KBBBBBBBBK..",
  "...KKKKKKKK...",
];
const MITO_B = [
  "...KKKKKKKK...",
  "..KBBBBBBBBK..",
  ".KBABBABBABBK.",
  ".KBBAABBAWKBK.",
  "LKBBABBABWKBK.",
  ".KBBAABBABBBK.",
  ".KBABBABBABBK.",
  "..KBBBBBBBBK..",
  "...KKKKKKKK...",
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

const ENEMY_MAPS: Record<EnemyKind["id"], string[]> = {
  radical: [
    "K...K...K",
    ".K.EEE.K.",
    "..EEEEE..",
    ".EEWEWEE.",
    "KEEEEEEEK",
    ".EEEEEEE.",
    "..EEKEE..",
    ".K.EEE.K.",
    "K...K...K",
  ],
  sugar: [
    ".KKKKKK.",
    "KWWWWPSK",
    "KWPWWWSK",
    "KWWWWWSK",
    "KWWPWWSK",
    "KWPWWWSK",
    "KSSSSSSK",
    ".KKKKKK.",
  ],
  cortisol: [
    "....KKKK....",
    "..KKKKKKKK..",
    ".KKKKKKKKKK.",
    "KKEKKKKKKEKK",
    "KKWKKKKKKWKK",
    ".KKKKKKKKKK.",
    "..KKKKKKKK..",
    "....KAAK....",
  ],
  screen: [
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
  ultra: [
    "...KKKKK...",
    ".KKAAAAAKK.",
    "KAAEAAAEAAK",
    "KAAAAEAAAAK",
    "KAEAAAAAEAK",
    "KAAAEAAAAAK",
    ".KKAAAAAKK.",
    "...KKKKK...",
  ],
};

/* THE CRASH: a giant energy-drink can with opinions. */
const BOSS_MAP = [
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
];

const POWERUP_MAPS: Record<PowerupKind["id"], string[]> = {
  protein: [
    "..KKK..",
    ".KWWWK.",
    "KWWWWSK",
    "KWWWWSK",
    "KWWWWSK",
    "KWWWSSK",
    "KWWSSSK",
    ".KSSSK.",
    "..KKK..",
  ],
  creatine: [
    ".KKKKKKK.",
    "KAAAAAAAK",
    "KKKKKKKKK",
    "KPPPPPPPK",
    "KPEEEEEPK",
    "KPEWWWEPK",
    "KPEEEEEPK",
    "KPPPPPPPK",
    "KPPPPPPPK",
    ".KKKKKKK.",
  ],
  caffeine: [
    "..KKK..",
    ".KEEEK.",
    "KEEKEEK",
    "KEEKEEK",
    "KEKEEEK",
    "KEEKEEK",
    "KEEKEEK",
    ".KEEEK.",
    "..KKK..",
  ],
  sleep: [
    "..KKKK..",
    ".KAAAAK.",
    "KAAKKKK.",
    "KAAK....",
    "KAAK....",
    "KAAKKKK.",
    ".KAAAAK.",
    "..KKKK..",
  ],
  berry: [
    "....MM..",
    "...FF...",
    "..KKKK..",
    ".KKWKKK.",
    "KKWKKKKK",
    "KKKKKKKK",
    ".KKKKKK.",
    "..KKKK..",
  ],
  water: [
    "...K...",
    "..KSK..",
    "..KSK..",
    ".KSWSK.",
    ".KSSSK.",
    "KSWSSSK",
    "KSSSSSK",
    ".KSSSK.",
    "..KKK..",
  ],
};

const SPARK_MAP = [
  "..L..",
  ".LLL.",
  "LLWLL",
  ".LLL.",
  "..L..",
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

/** beep with a frequency slide — pews, pops and power-downs. */
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

interface Bullet {
  x: number;
  y: number;
  vy: number;
  big: boolean;
}

/** Enemy fire; carries the bonk gag of whoever launched it. */
interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  cause: string;
}

interface Enemy {
  kind: EnemyKind;
  x: number;
  y: number;
  y0: number;
  hp: number;
  t: number;
  seed: number;
  fireIn: number;
  flashT: number;
}

interface BossState {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  t: number;
  fireIn: number;
  flashT: number;
}

interface Drop {
  x: number;
  y: number;
  id: PowerupKind["id"] | "atp";
  t: number;
  seed: number;
}

interface Toast {
  x: number;
  y: number;
  text: string;
  ttl: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  colour: string;
}

/** Parallax plasma cells; position derives from t, nothing mutates. */
interface Cell {
  x: number;
  y: number;
  r: number;
  speed: number;
  deep: boolean;
}

interface World {
  px: number;
  py: number;
  tx: number;
  ty: number;
  t: number;
  fireIn: number;
  beatT: number;
  hearts: number;
  invulnT: number;
  shield: boolean;
  atp: number;
  streak: number;
  zoneIdx: number;
  tInZone: number;
  zoneFlashT: number;
  screenFlashT: number;
  bossActive: boolean;
  boss: BossState | null;
  buffs: { triple: number; rapid: number; big: number };
  bullets: Bullet[];
  shots: Shot[];
  enemies: Enemy[];
  drops: Drop[];
  toasts: Toast[];
  particles: Particle[];
  spawnIn: number;
  shakeT: number;
  cells: Cell[];
  rng: () => number;
}

function freshWorld(): World {
  const rng = mulberry32(Math.floor(Math.random() * 2 ** 31));
  const cells: Cell[] = [];
  for (let i = 0; i < 9; i++) {
    cells.push({
      x: rng() * POWERHOUSE.width,
      y: 50 + rng() * (POWERHOUSE.height - 100),
      r: 16 + rng() * 14,
      speed: 10 + rng() * 8,
      deep: true,
    });
  }
  for (let i = 0; i < 6; i++) {
    cells.push({
      x: rng() * POWERHOUSE.width,
      y: 50 + rng() * (POWERHOUSE.height - 100),
      r: 7 + rng() * 6,
      speed: 26 + rng() * 12,
      deep: false,
    });
  }
  return {
    px: 90,
    py: POWERHOUSE.height / 2,
    tx: 90,
    ty: POWERHOUSE.height / 2,
    t: 0,
    fireIn: 0.25,
    beatT: 0,
    hearts: POWERHOUSE.maxHearts,
    invulnT: 0,
    shield: false,
    atp: 0,
    streak: 0,
    zoneIdx: 0,
    tInZone: 0,
    zoneFlashT: 2.2,
    screenFlashT: 0,
    bossActive: false,
    boss: null,
    buffs: { triple: 0, rapid: 0, big: 0 },
    bullets: [],
    shots: [],
    enemies: [],
    drops: [],
    toasts: [],
    particles: [],
    spawnIn: 1,
    shakeT: 0,
    cells,
    rng,
  };
}

type Phase = "ready" | "playing" | "paused" | "dead";

export function PowerhouseGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld());
  const phaseRef = useRef<Phase>("ready");
  const synthRef = useRef<Synth | null>(null);
  const spritesRef = useRef<Record<string, HTMLCanvasElement> | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const draggingRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [finalAtp, setFinalAtp] = useState(0);
  const [finalZone, setFinalZone] = useState(0);
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
    canvas.width = POWERHOUSE.width * dpr;
    canvas.height = POWERHOUSE.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    spritesRef.current = {
      mitoA: makeSprite(MITO_A, 2),
      mitoB: makeSprite(MITO_B, 2),
      heartFull: makeSprite(HEART_FULL, 2),
      heartEmpty: makeSprite(HEART_EMPTY, 2),
      radical: makeSprite(ENEMY_MAPS.radical, 3),
      sugar: makeSprite(ENEMY_MAPS.sugar, 3),
      cortisol: makeSprite(ENEMY_MAPS.cortisol, 3),
      screen: makeSprite(ENEMY_MAPS.screen, 2),
      ultra: makeSprite(ENEMY_MAPS.ultra, 3),
      boss: makeSprite(BOSS_MAP, 3),
      protein: makeSprite(POWERUP_MAPS.protein, 3),
      creatine: makeSprite(POWERUP_MAPS.creatine, 3),
      caffeine: makeSprite(POWERUP_MAPS.caffeine, 3),
      sleep: makeSprite(POWERUP_MAPS.sleep, 3),
      berry: makeSprite(POWERUP_MAPS.berry, 3),
      water: makeSprite(POWERUP_MAPS.water, 3),
      atp: makeSprite(SPARK_MAP, 3),
    };

    const fieldTop = POWERHOUSE.wallHeight;
    const fieldBottom = POWERHOUSE.height - POWERHOUSE.wallHeight;

    const spawnParticles = (
      x: number,
      y: number,
      colour: string,
      count: number,
    ) => {
      const w = world.current;
      const n = reducedMotionRef.current ? Math.ceil(count / 2) : count;
      for (let i = 0; i < n; i++) {
        const a = w.rng() * Math.PI * 2;
        const v = 40 + w.rng() * 130;
        w.particles.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          ttl: 0.42,
          colour,
        });
      }
    };

    const die = (deathCause: string) => {
      const w = world.current;
      const atp = Math.floor(w.atp);
      setFinalAtp(atp);
      setFinalZone(w.zoneIdx);
      setCause(deathCause);
      setNewBest(false);
      setBest((prev) => {
        if (atp > prev) {
          setNewBest(true);
          try {
            localStorage.setItem(BEST_KEY, String(atp));
          } catch {
            /* fine */
          }
          return atp;
        }
        return prev;
      });
      setPhaseBoth("dead");
      chirp(synthRef.current, 440, 50, 700, "sawtooth", 0.06);
      setTimeout(() => beep(synthRef.current, 96, 500, "sine", 0.05), 260);
    };

    const damagePlayer = (deathCause: string) => {
      const w = world.current;
      if (w.invulnT > 0) return;
      if (w.shield) {
        w.shield = false;
        w.invulnT = 0.8;
        chirp(synthRef.current, 520, 140, 160, "square", 0.06);
        spawnParticles(w.px, w.py, "#1f5c3d", 8);
        return;
      }
      w.hearts -= 1;
      w.streak = 0;
      w.invulnT = POWERHOUSE.invulnSeconds;
      w.shakeT = 0.3;
      spawnParticles(w.px, w.py, "#ff531a", 12);
      chirp(synthRef.current, 220, 60, 260, "sawtooth", 0.07);
      if (w.hearts <= 0) die(deathCause);
    };

    const dropAt = (x: number, y: number, id: Drop["id"]) => {
      const w = world.current;
      w.drops.push({ x, y, id, t: 0, seed: w.rng() * Math.PI * 2 });
    };

    const killEnemy = (index: number) => {
      const w = world.current;
      const e = w.enemies[index];
      const gain = e.kind.atp * multiplierFor(w.streak);
      w.atp += gain;
      w.streak += 1;
      w.toasts.push({ x: e.x, y: e.y - 14, text: `+${gain}`, ttl: 0.7 });
      spawnParticles(e.x, e.y, e.kind.id === "ultra" ? "#e8c33c" : "#c63d08", 8);
      dropAt(e.x, e.y, "atp");
      const drop = rollDrop(w.rng, w.hearts);
      if (drop !== null) dropAt(e.x, e.y - 10, drop);
      w.enemies.splice(index, 1);
      chirp(synthRef.current, 320, 70, 120, "sawtooth", 0.05);
    };

    const bossDown = (b: BossState) => {
      const w = world.current;
      const gain = BOSS.atp * multiplierFor(w.streak);
      w.atp += gain;
      w.streak += 4;
      w.toasts.push({ x: b.x, y: b.y - 30, text: `+${gain}`, ttl: 1 });
      spawnParticles(b.x, b.y, "#c63d08", 26);
      spawnParticles(b.x, b.y, "#e8c33c", 14);
      const pool: PowerupKind["id"][] = [
        "protein",
        "caffeine",
        "creatine",
        "sleep",
        "berry",
        w.hearts < POWERHOUSE.maxHearts ? "water" : "berry",
      ];
      dropAt(b.x, b.y, pool[Math.floor(w.rng() * pool.length)]);
      for (let i = 0; i < 4; i++) {
        dropAt(b.x - 14 + w.rng() * 28, b.y - 20 + w.rng() * 40, "atp");
      }
      w.bossActive = false;
      w.boss = null;
      w.zoneIdx += 1;
      w.tInZone = 0;
      w.spawnIn = 1.1;
      w.zoneFlashT = 2.2;
      w.shakeT = 0.4;
      chirp(synthRef.current, 600, 50, 350, "sawtooth", 0.06);
      [523, 659, 784].forEach((f, i) =>
        setTimeout(() => beep(synthRef.current, f, 110, "square", 0.05), 380 + i * 110),
      );
    };

    const applyPickup = (id: PowerupKind["id"]) => {
      const w = world.current;
      const blurb = POWERUP_KINDS.find((p) => p.id === id)?.blurb ?? "";
      w.toasts.push({ x: w.px, y: w.py - 22, text: blurb, ttl: 1 });
      switch (id) {
        case "protein":
          w.buffs.triple = POWERHOUSE.buffSeconds;
          break;
        case "creatine":
          w.buffs.big = POWERHOUSE.buffSeconds;
          break;
        case "caffeine":
          w.buffs.rapid = POWERHOUSE.buffSeconds;
          break;
        case "sleep":
          w.shield = true;
          break;
        case "water":
          w.hearts = Math.min(POWERHOUSE.maxHearts, w.hearts + 1);
          chirp(synthRef.current, 523, 784, 150, "triangle", 0.06);
          break;
        case "berry": {
          /* Antioxidant burst: the field is cleared and PAID. */
          w.screenFlashT = 0.3;
          for (const e of w.enemies) {
            const gain = e.kind.atp * multiplierFor(w.streak);
            w.atp += gain;
            w.streak += 1;
            spawnParticles(e.x, e.y, "#a3e635", 6);
          }
          w.enemies = [];
          w.shots = [];
          if (w.boss) {
            w.boss.hp -= 6;
            w.boss.flashT = 0.15;
            if (w.boss.hp <= 0) bossDown(w.boss);
          }
          chirp(synthRef.current, 200, 1200, 320, "triangle", 0.07);
          break;
        }
      }
      beep(synthRef.current, 660, 90, "triangle", 0.06);
      setTimeout(() => beep(synthRef.current, 880, 110, "triangle", 0.05), 80);
    };

    const fireBullets = () => {
      const w = world.current;
      const big = w.buffs.big > 0;
      const push = (vy: number) =>
        w.bullets.push({ x: w.px + 16, y: w.py, vy, big });
      push(0);
      if (w.buffs.triple > 0) {
        push(-110);
        push(110);
      }
      chirp(synthRef.current, 900, 500, 50, "square", 0.02);
    };

    const spawnEnemy = () => {
      const w = world.current;
      const kinds = unlockedKinds(w.zoneIdx);
      const kind = ENEMY_KINDS[Math.floor(w.rng() * kinds)];
      const top = fieldTop + 24;
      const bottom = fieldBottom - 24;
      const y = top + w.rng() * (bottom - top);
      w.enemies.push({
        kind,
        x: POWERHOUSE.width + 34,
        y,
        y0: y,
        hp: kind.hp,
        t: 0,
        seed: w.rng() * Math.PI * 2,
        fireIn: 2 + w.rng() * 1.6,
        flashT: 0,
      });
    };

    const aimedShot = (x: number, y: number, speed: number, shotCause: string, spread = 0) => {
      const w = world.current;
      const base = Math.atan2(w.py - y, w.px - x) + spread;
      w.shots.push({
        x,
        y,
        vx: Math.cos(base) * speed,
        vy: Math.sin(base) * speed,
        cause: shotCause,
      });
    };

    const step = (dt: number) => {
      const w = world.current;
      w.t += dt;
      w.tInZone += dt;
      w.invulnT = Math.max(0, w.invulnT - dt);
      w.shakeT = Math.max(0, w.shakeT - dt);
      w.zoneFlashT = Math.max(0, w.zoneFlashT - dt);
      w.screenFlashT = Math.max(0, w.screenFlashT - dt);
      w.buffs.triple = Math.max(0, w.buffs.triple - dt);
      w.buffs.rapid = Math.max(0, w.buffs.rapid - dt);
      w.buffs.big = Math.max(0, w.buffs.big - dt);

      /* The soundtrack IS the difficulty: a heartbeat at the zone's BPM. */
      const bpm = bpmFor(w.zoneIdx);
      w.beatT += dt;
      const beatLen = 60 / bpm;
      if (w.beatT >= beatLen) {
        w.beatT -= beatLen;
        beep(synthRef.current, 75, 70, "sine", 0.05);
        if (bpm < 140) {
          setTimeout(() => beep(synthRef.current, 62, 80, "sine", 0.04), 120);
        }
      }

      /* Keyboard flies the mito directly; pointer sets a chase target. */
      const k = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (k.has("ArrowUp") || k.has("KeyW")) dy -= 1;
      if (k.has("ArrowDown") || k.has("KeyS")) dy += 1;
      if (k.has("ArrowLeft") || k.has("KeyA")) dx -= 1;
      if (k.has("ArrowRight") || k.has("KeyD")) dx += 1;
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        w.px += (dx / len) * POWERHOUSE.keySpeed * dt;
        w.py += (dy / len) * POWERHOUSE.keySpeed * dt;
        w.tx = w.px;
        w.ty = w.py;
      }
      const follow = 1 - Math.exp(-POWERHOUSE.playerFollow * dt);
      w.px += (w.tx - w.px) * follow;
      w.py += (w.ty - w.py) * follow;
      w.px = Math.max(POWERHOUSE.playerMinX, Math.min(POWERHOUSE.playerMaxX, w.px));
      w.py = Math.max(
        fieldTop + POWERHOUSE.playerRadius + 2,
        Math.min(fieldBottom - POWERHOUSE.playerRadius - 2, w.py),
      );
      w.tx = Math.max(POWERHOUSE.playerMinX, Math.min(POWERHOUSE.playerMaxX, w.tx));
      w.ty = Math.max(
        fieldTop + POWERHOUSE.playerRadius + 2,
        Math.min(fieldBottom - POWERHOUSE.playerRadius - 2, w.ty),
      );

      w.fireIn -= dt;
      if (w.fireIn <= 0) {
        w.fireIn =
          w.buffs.rapid > 0 ? POWERHOUSE.rapidInterval : POWERHOUSE.fireInterval;
        fireBullets();
      }

      /* Spawning pauses while THE CRASH holds the floor. */
      if (!w.bossActive) {
        if (w.tInZone >= POWERHOUSE.bossAt) {
          w.bossActive = true;
          const hp = bossHpFor(w.zoneIdx);
          w.boss = {
            x: POWERHOUSE.width + 60,
            y: POWERHOUSE.height / 2,
            hp,
            maxHp: hp,
            t: 0,
            fireIn: 1.4,
            flashT: 0,
          };
          beep(synthRef.current, 110, 220, "sawtooth", 0.07);
          setTimeout(() => beep(synthRef.current, 110, 220, "sawtooth", 0.07), 300);
        } else {
          w.spawnIn -= dt;
          if (w.spawnIn <= 0) {
            w.spawnIn = spawnIntervalFor(w.zoneIdx);
            spawnEnemy();
          }
        }
      }

      const mul = speedMulFor(w.zoneIdx);
      for (let i = w.enemies.length - 1; i >= 0; i--) {
        const e = w.enemies[i];
        e.t += dt;
        e.flashT = Math.max(0, e.flashT - dt);
        e.x -= e.kind.speed * mul * dt;
        switch (e.kind.id) {
          case "radical":
            e.y = e.y0 + Math.sin(e.t * 2.4 + e.seed) * 44;
            break;
          case "ultra":
            e.y = e.y0 + Math.sin(e.t * 1.3 + e.seed) * 12;
            break;
          case "screen": {
            const track = Math.max(-80 * dt, Math.min(80 * dt, w.py - e.y));
            e.y += track;
            break;
          }
          case "cortisol":
            if (w.zoneIdx >= 2 && e.x > w.px + 60) {
              e.fireIn -= dt;
              if (e.fireIn <= 0) {
                e.fireIn = 2.6 + w.rng();
                aimedShot(e.x, e.y, POWERHOUSE.enemyBulletSpeed, e.kind.cause);
                beep(synthRef.current, 180, 90, "square", 0.03);
              }
            }
            break;
          case "sugar":
            break;
        }
        e.y = Math.max(
          fieldTop + e.kind.radius,
          Math.min(fieldBottom - e.kind.radius, e.y),
        );
        if (e.x < -40) {
          w.enemies.splice(i, 1);
          continue;
        }
        if (
          hitsCircle(w.px, w.py, POWERHOUSE.playerRadius, e.x, e.y, e.kind.radius)
        ) {
          const gag = e.kind.cause;
          spawnParticles(e.x, e.y, "#c63d08", 8);
          w.enemies.splice(i, 1);
          damagePlayer(gag);
          if (phaseRef.current !== "playing") return;
        }
      }

      if (w.bossActive && w.boss) {
        const b = w.boss;
        b.t += dt;
        b.flashT = Math.max(0, b.flashT - dt);
        b.x = Math.max(340, b.x - 90 * dt);
        const hover = POWERHOUSE.height / 2 + Math.sin(b.t * 0.9) * 130;
        b.y = Math.max(fieldTop + 44, Math.min(fieldBottom - 44, hover));
        if (b.x <= 362) {
          b.fireIn -= dt;
          if (b.fireIn <= 0) {
            b.fireIn = w.zoneIdx >= ZONES.length ? 1.35 : 1.7;
            const spreads =
              w.zoneIdx >= ZONES.length
                ? [-0.6, -0.3, 0, 0.3, 0.6]
                : [-0.35, 0, 0.35];
            for (const s of spreads) {
              aimedShot(b.x - 20, b.y, POWERHOUSE.enemyBulletSpeed, BOSS.cause, s);
            }
            beep(synthRef.current, 150, 110, "square", 0.04);
          }
        }
        if (hitsCircle(w.px, w.py, POWERHOUSE.playerRadius, b.x, b.y, BOSS.radius)) {
          damagePlayer(BOSS.cause);
          if (phaseRef.current !== "playing") return;
        }
      }

      for (let i = w.bullets.length - 1; i >= 0; i--) {
        const b = w.bullets[i];
        b.x += POWERHOUSE.bulletSpeed * dt;
        b.y += b.vy * dt;
        if (b.x > POWERHOUSE.width + 20) {
          w.bullets.splice(i, 1);
          continue;
        }
        const dmg = b.big ? 2 : 1;
        const radius = b.big ? 7 : 4;
        let hit = false;
        if (w.bossActive && w.boss) {
          const boss = w.boss;
          if (hitsCircle(b.x, b.y, radius, boss.x, boss.y, BOSS.radius)) {
            boss.hp -= dmg;
            boss.flashT = 0.1;
            hit = true;
            if (boss.hp <= 0) bossDown(boss);
          }
        }
        if (!hit) {
          for (let j = w.enemies.length - 1; j >= 0; j--) {
            const e = w.enemies[j];
            if (hitsCircle(b.x, b.y, radius, e.x, e.y, e.kind.radius)) {
              e.hp -= dmg;
              e.flashT = 0.1;
              hit = true;
              if (e.hp <= 0) killEnemy(j);
              break;
            }
          }
        }
        if (hit) w.bullets.splice(i, 1);
      }

      for (let i = w.shots.length - 1; i >= 0; i--) {
        const s = w.shots[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (
          s.x < -20 ||
          s.x > POWERHOUSE.width + 20 ||
          s.y < -20 ||
          s.y > POWERHOUSE.height + 20
        ) {
          w.shots.splice(i, 1);
          continue;
        }
        if (hitsCircle(w.px, w.py, POWERHOUSE.playerRadius, s.x, s.y, 5)) {
          const gag = s.cause;
          w.shots.splice(i, 1);
          damagePlayer(gag);
          if (phaseRef.current !== "playing") return;
        }
      }

      for (let i = w.drops.length - 1; i >= 0; i--) {
        const d = w.drops[i];
        d.t += dt;
        d.x -= 60 * dt;
        d.y += Math.sin(d.t * 3 + d.seed) * 14 * dt;
        const ddx = w.px - d.x;
        const ddy = w.py - d.y;
        const dist = Math.hypot(ddx, ddy) || 1;
        if (dist < 90) {
          d.x += (ddx / dist) * 210 * dt;
          d.y += (ddy / dist) * 210 * dt;
        }
        if (d.x < -26) {
          w.drops.splice(i, 1);
          continue;
        }
        if (dist < POWERHOUSE.playerRadius + 13) {
          w.drops.splice(i, 1);
          if (d.id === "atp") {
            w.atp += POWERHOUSE.sparkAtp;
            beep(synthRef.current, 990, 60, "triangle", 0.035);
          } else {
            applyPickup(d.id);
          }
        }
      }

      for (let i = w.toasts.length - 1; i >= 0; i--) {
        const toast = w.toasts[i];
        toast.ttl -= dt;
        toast.y -= 30 * dt;
        if (toast.ttl <= 0) w.toasts.splice(i, 1);
      }
      for (let i = w.particles.length - 1; i >= 0; i--) {
        const p = w.particles[i];
        p.ttl -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.ttl <= 0) w.particles.splice(i, 1);
      }
    };

    const draw = () => {
      const w = world.current;
      const sprites = spritesRef.current;
      if (!sprites) return;
      const redline = w.zoneIdx >= ZONES.length;

      ctx.save();
      if (w.shakeT > 0 && !reducedMotionRef.current) {
        const mag = 6 * (w.shakeT / 0.4);
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      /* Plasma: paper ground, two parallax layers of drifting cells. */
      ctx.fillStyle = "#fbf4ec";
      ctx.fillRect(-8, -8, POWERHOUSE.width + 16, POWERHOUSE.height + 16);
      for (const c of w.cells) {
        let x = (c.x - w.t * c.speed) % (POWERHOUSE.width + 80);
        if (x < -40) x += POWERHOUSE.width + 80;
        ctx.fillStyle = c.deep ? "#f3e7d8" : "#ffe1d3";
        ctx.beginPath();
        ctx.ellipse(x, c.y, c.r, c.r * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Vessel walls (REDLINE turns them ember). */
      const wallFill = redline ? "#c63d08" : "#ff531a";
      const scallopFill = redline ? "#ff531a" : "#c63d08";
      ctx.fillStyle = wallFill;
      ctx.fillRect(-8, -8, POWERHOUSE.width + 16, fieldTop + 8);
      ctx.fillRect(-8, fieldBottom, POWERHOUSE.width + 16, POWERHOUSE.height - fieldBottom + 8);
      ctx.fillStyle = scallopFill;
      const scallopShift = (w.t * 90) % 28;
      for (let sx = -28; sx < POWERHOUSE.width + 28; sx += 28) {
        ctx.beginPath();
        ctx.arc(sx - scallopShift + 14, fieldTop, 7, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx - scallopShift, fieldBottom, 7, Math.PI, 0);
        ctx.fill();
      }
      ctx.fillStyle = "#1c130d";
      ctx.fillRect(0, fieldTop - 2, POWERHOUSE.width, 2);
      ctx.fillRect(0, fieldBottom, POWERHOUSE.width, 2);

      for (const d of w.drops) {
        const sprite = sprites[d.id];
        ctx.drawImage(sprite, d.x - sprite.width / 2, d.y - sprite.height / 2);
      }

      ctx.strokeStyle = "#1c130d";
      ctx.lineWidth = 2;
      for (const s of w.shots) {
        ctx.fillStyle = "#c63d08";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      for (const e of w.enemies) {
        const sprite = sprites[e.kind.id];
        ctx.drawImage(sprite, e.x - sprite.width / 2, e.y - sprite.height / 2);
        if (e.flashT > 0) {
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = "#fffdf9";
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.kind.radius + 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      if (w.bossActive && w.boss) {
        const b = w.boss;
        const sprite = sprites.boss;
        const wobble = Math.sin(b.t * 6) * 0.06;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(wobble);
        ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        ctx.restore();
        if (b.flashT > 0) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = "#fffdf9";
          ctx.beginPath();
          ctx.arc(b.x, b.y, BOSS.radius + 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      for (const b of w.bullets) {
        ctx.fillStyle = "#a3e635";
        ctx.strokeStyle = "#1c130d";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (b.big) {
          ctx.roundRect(b.x - 8, b.y - 3.5, 16, 7, 3.5);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#fffdf9";
          ctx.fillRect(b.x - 3, b.y - 1.5, 6, 3);
        } else {
          ctx.roundRect(b.x - 5, b.y - 2, 10, 4, 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      /* The mito (blinks while invulnerable, tilts into the turn). */
      const blink = w.invulnT > 0 && Math.floor(w.invulnT * 10) % 2 === 0;
      ctx.save();
      ctx.translate(w.px, w.py);
      ctx.rotate(Math.max(-0.3, Math.min(0.3, (w.ty - w.py) * 0.012)));
      if (blink) ctx.globalAlpha = 0.35;
      const mito = Math.floor(w.t * 12) % 2 === 0 ? sprites.mitoA : sprites.mitoB;
      ctx.drawImage(mito, -mito.width / 2, -mito.height / 2);
      ctx.globalAlpha = 1;
      if (w.shield) {
        ctx.strokeStyle = "#1f5c3d";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.lineDashOffset = -w.t * 30;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      for (const p of w.particles) {
        ctx.globalAlpha = Math.max(0, p.ttl / 0.42);
        ctx.fillStyle = p.colour;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;

      for (const toast of w.toasts) {
        ctx.fillStyle = "#1f5c3d";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(toast.text, toast.x, toast.y);
      }

      if (w.screenFlashT > 0) {
        ctx.globalAlpha = Math.min(0.5, w.screenFlashT * 2);
        ctx.fillStyle = "#fffdf9";
        ctx.fillRect(0, 0, POWERHOUSE.width, POWERHOUSE.height);
        ctx.globalAlpha = 1;
      }

      /* ------------------------------------------------------------- HUD */
      for (let i = 0; i < POWERHOUSE.maxHearts; i++) {
        const sprite = i < w.hearts ? sprites.heartFull : sprites.heartEmpty;
        ctx.drawImage(sprite, 12 + i * 20, 36);
      }

      ctx.fillStyle = "#1c130d";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        `${Math.floor(w.atp).toLocaleString("en-GB")} ATP`,
        POWERHOUSE.width - 12,
        54,
      );
      const mult = multiplierFor(w.streak);
      if (mult > 1) {
        ctx.fillStyle = "#c63d08";
        ctx.font = "bold 13px monospace";
        ctx.fillText(`×${mult} streak`, POWERHOUSE.width - 12, 72);
      }

      let chipX = 12;
      const chip = (label: string, frac: number) => {
        ctx.fillStyle = "#fffdf9";
        ctx.strokeStyle = "#1c130d";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(chipX, fieldBottom - 30, 54, 20, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "left";
        ctx.fillText(label, chipX + 5, fieldBottom - 21);
        ctx.fillStyle = "#c63d08";
        ctx.fillRect(chipX + 5, fieldBottom - 17, 44 * Math.min(1, frac), 3);
        chipX += 60;
      };
      if (w.buffs.triple > 0) chip("TRIPLE", w.buffs.triple / POWERHOUSE.buffSeconds);
      if (w.buffs.rapid > 0) chip("RAPID", w.buffs.rapid / POWERHOUSE.buffSeconds);
      if (w.buffs.big > 0) chip("SWOLE", w.buffs.big / POWERHOUSE.buffSeconds);

      if (w.bossActive && w.boss) {
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(BOSS.label, POWERHOUSE.width / 2, 88);
        ctx.strokeStyle = "#1c130d";
        ctx.lineWidth = 2;
        ctx.strokeRect(POWERHOUSE.width / 2 - 110, 94, 220, 9);
        ctx.fillStyle = "#c63d08";
        ctx.fillRect(
          POWERHOUSE.width / 2 - 108,
          96,
          216 * Math.max(0, w.boss.hp / w.boss.maxHp),
          5,
        );
      }

      if (w.zoneFlashT > 0 && phaseRef.current !== "ready") {
        ctx.globalAlpha = Math.min(1, w.zoneFlashT / 0.5);
        ctx.textAlign = "center";
        ctx.fillStyle = redline ? "#c63d08" : "#1c130d";
        ctx.font = "bold 40px monospace";
        ctx.fillText(
          redline ? "REDLINE" : `ZONE ${w.zoneIdx + 1}`,
          POWERHOUSE.width / 2,
          POWERHOUSE.height / 2 - 60,
        );
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#c63d08";
        if (!redline) {
          ctx.fillText(
            zoneName(w.zoneIdx),
            POWERHOUSE.width / 2,
            POWERHOUSE.height / 2 - 38,
          );
        }
        ctx.fillStyle = "#6e5b4d";
        ctx.font = "bold 11px monospace";
        ctx.fillText(
          `♥ ${bpmFor(w.zoneIdx)} BPM`,
          POWERHOUSE.width / 2,
          POWERHOUSE.height / 2 - (redline ? 38 : 20),
        );
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
      setCopied(false);
      setPhaseBoth("playing");
    } else if (current === "paused") {
      setPhaseBoth("playing");
    }
  };

  const steer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = world.current;
    w.tx = ((e.clientX - rect.left) / rect.width) * POWERHOUSE.width;
    w.ty = ((e.clientY - rect.top) / rect.height) * POWERHOUSE.height;
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        begin();
        return;
      }
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(
          e.code,
        )
      ) {
        if (e.code.startsWith("Arrow")) e.preventDefault();
        keysRef.current.add(e.code);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- begin is stable enough (refs)
  }, []);

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // Result params make the pasted link unfurl as the score card.
    const path = powerhouseSharePath({ atp: finalAtp, zone: finalZone });
    const text = `${shareText(finalAtp, finalZone)}\n${origin}${path}`;
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
          draggingRef.current = true;
          begin();
          steer(e);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) steer(e);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
        aria-label="Powerhouse — drag or use the arrow keys to fly the mitochondrion; firing is automatic"
        className="block h-auto w-full cursor-pointer touch-none rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ aspectRatio: `${POWERHOUSE.width} / ${POWERHOUSE.height}` }}
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
          <p className="font-display text-4xl uppercase">Powerhouse</p>
          <p className="max-w-[17rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
            You are the mitochondrion. Drag or use WASD to fly — firing is
            automatic. Outlast the junk, climb the zones.
          </p>
          <p className="max-w-[17rem] font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Tap or press space to start
          </p>
          {best > 0 ? (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Best: {best.toLocaleString("en-GB")} ATP
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
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="sticker-slap w-full rounded-2xl border-2 border-foreground bg-surface p-5 text-center shadow-[4px_4px_0_0_var(--color-foreground)]">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Bonked in
            </p>
            <p className="font-display text-6xl uppercase text-primary-strong">
              {finalZone < ZONES.length ? `Zone ${finalZone + 1}` : "Redline"}
            </p>
            <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
              {zoneName(finalZone)}
            </p>
            <p className="mt-2 font-mono text-2xl font-bold">
              {finalAtp.toLocaleString("en-GB")}{" "}
              <span className="text-sm">ATP</span>
            </p>
            <p className="mt-2 text-sm font-semibold">{cause}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Best {best.toLocaleString("en-GB")}
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
                href="/heart-rate-zone-calculator"
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Your real zones →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
