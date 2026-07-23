"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { mulberry32 } from "@/lib/lifeline";
import { trackEvent } from "@/lib/analytics";
import { snakeOilSharePath } from "@/lib/arcade-share";
import {
  type Claim,
  type Receipt,
  SNAKEOIL,
  burstSizeFor,
  comboBonusFor,
  escapedCause,
  launch,
  pickClaim,
  receiptFor,
  segmentHitsCircle,
  shareText,
  slicedTruthCause,
  spawnIntervalFor,
} from "@/lib/snakeoil";

/**
 * Snake Oil (SNAKEOIL.md): the myth-slicing game. One verb — swipe.
 * Claims fly up as bottles with their slogan on a chip; slice the myths,
 * spare the truths. A sliced truth or an escaped myth costs a heart, and
 * the death card serves the receipt: the registry item behind the claim
 * that got you, with its real source. All rendering is canvas; React
 * handles overlays. WebAudio synth on first input, mute persisted.
 */

const BEST_KEY = "fittools.snakeoil.best";
const MUTE_KEY = "fittools.snakeoil.muted";

/* ---------------------------------------------------------------- sprites */

const PALETTE: Record<string, string> = {
  K: "#1c130d", // ink
  B: "#ff531a", // blaze
  E: "#c63d08", // ember — bottle glass
  P: "#fbf4ec", // paper — labels
  W: "#fffdf9", // white shine
  F: "#1f5c3d", // forest — the tin
  A: "#e8c33c", // amber — the cork
  S: "#f3e7d8", // soft
  L: "#a3e635", // lime — flask liquid
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

/* Three containers so the shelf looks stocked. The container NEVER encodes
   the verdict — the label is the only tell, by design. */
const BOTTLE = [
  "....KK....",
  "...KAAK...",
  "...KAAK...",
  "..KKKKKK..",
  ".KEEEEEEK.",
  ".KEWEEEEK.",
  ".KEEEEEEK.",
  ".KPPPPPPK.",
  ".KPKPPKPK.",
  ".KPPPPPPK.",
  ".KEEEEEEK.",
  ".KEEEEEEK.",
  "..KKKKKK..",
];
const TIN = [
  "..KKKKKK..",
  ".KSSSSSSK.",
  ".KKKKKKKK.",
  ".KFFFFFFK.",
  ".KFWFFFFK.",
  ".KFFFFFFK.",
  ".KFFFFFFK.",
  ".KFFFFFFK.",
  "..KKKKKK..",
];
const FLASK = [
  "...KKKK...",
  "....KK....",
  "...KSSK...",
  "...KSSK...",
  "..KSSSSK..",
  "..KSWSSK..",
  ".KSSSSSSK.",
  ".KLLLLLLK.",
  "KLLLLLLLLK",
  "KLWLLLLLLK",
  "KKKKKKKKKK",
];
const CONTAINER_KEYS = ["bottle", "tin", "flask"] as const;

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

/** Deterministic container per claim — stable, uncorrelated with verdict. */
function containerFor(id: string): (typeof CONTAINER_KEYS)[number] {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return CONTAINER_KEYS[Math.abs(hash) % CONTAINER_KEYS.length];
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

interface Flying {
  claim: Claim;
  container: (typeof CONTAINER_KEYS)[number];
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  spin: number;
}

interface Half {
  container: (typeof CONTAINER_KEYS)[number];
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
  points: number;
  busted: number;
  spawnIn: number;
  comboCount: number;
  comboT: number;
  comboX: number;
  comboY: number;
  prevWave: number;
  waveFlashT: number;
  claims: Flying[];
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
    hearts: SNAKEOIL.maxHearts,
    points: 0,
    busted: 0,
    spawnIn: 0.6,
    comboCount: 0,
    comboT: 0,
    comboX: 0,
    comboY: 0,
    prevWave: 0,
    waveFlashT: 0,
    claims: [],
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

export function SnakeOilGame() {
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
  const [finalBusted, setFinalBusted] = useState(0);
  const [finalPoints, setFinalPoints] = useState(0);
  const [cause, setCause] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
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
    canvas.width = SNAKEOIL.width * dpr;
    canvas.height = SNAKEOIL.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    spritesRef.current = {
      bottle: makeSprite(BOTTLE, 3),
      tin: makeSprite(TIN, 3),
      flask: makeSprite(FLASK, 3),
      heartFull: makeSprite(HEART_FULL, 2),
      heartEmpty: makeSprite(HEART_EMPTY, 2),
    };

    const toast = (x: number, y: number, text: string, colour = "#1f5c3d") => {
      world.current.toasts.push({ x, y, text, ttl: 1, colour });
    };

    const splat = (x: number, y: number, colour: string, count: number) => {
      const w = world.current;
      const n = reducedMotionRef.current ? Math.ceil(count / 2) : count;
      for (let i = 0; i < n; i++) {
        const a = w.rng() * Math.PI * 2;
        const v = 40 + w.rng() * 140;
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

    const die = (deathCause: string, culprit: Claim) => {
      const w = world.current;
      setFinalBusted(w.busted);
      setFinalPoints(w.points);
      setCause(deathCause);
      setReceipt(receiptFor(culprit));
      setNewBest(false);
      setBest((prev) => {
        if (w.busted > prev) {
          setNewBest(true);
          try {
            localStorage.setItem(BEST_KEY, String(w.busted));
          } catch {
            /* fine */
          }
          return w.busted;
        }
        return prev;
      });
      trackEvent({
        name: "snakeoil_run_ended",
        params: { busted: w.busted, points: w.points },
      });
      setPhaseBoth("dead");
      chirp(synthRef.current, 380, 45, 700, "sawtooth", 0.06);
      setTimeout(() => beep(synthRef.current, 90, 500, "sine", 0.05), 260);
    };

    const loseHeart = (deathCause: string, culprit: Claim) => {
      const w = world.current;
      w.hearts -= 1;
      w.flashT = 0.25;
      w.shakeT = 0.25;
      if (w.hearts <= 0) die(deathCause, culprit);
    };

    const sliceClaim = (index: number, sx: number, sy: number) => {
      const w = world.current;
      const f = w.claims[index];
      w.claims.splice(index, 1);
      /* The container splits; both halves keep flying. */
      for (const left of [true, false]) {
        w.halves.push({
          container: f.container,
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
      if (f.claim.verdict === "myth") {
        w.busted += 1;
        w.points += SNAKEOIL.mythPoints;
        w.comboCount += 1;
        w.comboT = SNAKEOIL.comboWindow;
        w.comboX = f.x;
        w.comboY = f.y;
        toast(f.x, f.y - 26, "BUSTED +10", "#1f5c3d");
        splat(sx, sy, "#c63d08", 10);
        chirp(synthRef.current, 620, 90, 90, "square", 0.05);
        beep(synthRef.current, 990, 60, "triangle", 0.04);
      } else {
        toast(f.x, f.y - 26, "THAT WAS TRUE", "#c63d08");
        splat(sx, sy, "#1c130d", 12);
        beep(synthRef.current, 110, 240, "sawtooth", 0.07);
        setTimeout(() => beep(synthRef.current, 78, 220, "sawtooth", 0.06), 120);
        loseHeart(slicedTruthCause(f.claim.label), f.claim);
      }
    };

    const step = (dt: number) => {
      const w = world.current;
      w.t += dt;
      w.flashT = Math.max(0, w.flashT - dt);
      w.shakeT = Math.max(0, w.shakeT - dt);
      w.waveFlashT = Math.max(0, w.waveFlashT - dt);
      const wave = Math.floor(w.t / SNAKEOIL.waveSeconds);
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
              for (let i = w.claims.length - 1; i >= 0; i--) {
                const f = w.claims[i];
                if (
                  segmentHitsCircle(
                    prev.x,
                    prev.y,
                    point.x,
                    point.y,
                    f.x,
                    f.y,
                    SNAKEOIL.sliceRadius,
                  )
                ) {
                  whoosh = true;
                  sliceClaim(i, point.x, point.y);
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

      /* The combo window closes — pay the bonus. */
      if (w.comboT > 0) {
        w.comboT -= dt;
        if (w.comboT <= 0) {
          if (w.comboCount >= 2) {
            const bonus = comboBonusFor(w.comboCount);
            w.points += bonus;
            toast(w.comboX, w.comboY - 48, `COMBO ×${w.comboCount} +${bonus}`, "#c63d08");
            [660, 880, 1100].forEach((f, i) =>
              setTimeout(() => beep(synthRef.current, f, 70, "triangle", 0.05), i * 70),
            );
          }
          w.comboCount = 0;
        }
      }

      /* Tosses. */
      w.spawnIn -= dt;
      if (w.spawnIn <= 0) {
        w.spawnIn = spawnIntervalFor(wave) * (0.8 + w.rng() * 0.4);
        const burst = burstSizeFor(wave, w.rng);
        for (let i = 0; i < burst; i++) {
          /* Avoid identical claims sharing the air — confusing to judge. */
          let claim = pickClaim(w.rng, wave);
          for (
            let attempt = 0;
            attempt < 5 && w.claims.some((f) => f.claim.id === claim.id);
            attempt++
          ) {
            claim = pickClaim(w.rng, wave);
          }
          const l = launch(w.rng);
          w.claims.push({
            claim,
            container: containerFor(claim.id),
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
      for (let i = w.claims.length - 1; i >= 0; i--) {
        const f = w.claims[i];
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.vy += SNAKEOIL.gravity * dt;
        f.rot += f.spin * dt;
        if (f.vy > 0 && f.y > SNAKEOIL.height + 40) {
          w.claims.splice(i, 1);
          if (f.claim.verdict === "myth") {
            toast(
              Math.max(40, Math.min(SNAKEOIL.width - 40, f.x)),
              SNAKEOIL.height - 60,
              "IT SPREAD",
              "#c63d08",
            );
            chirp(synthRef.current, 420, 140, 320, "triangle", 0.05);
            loseHeart(escapedCause(f.claim.label), f.claim);
            if (phaseRef.current !== "playing") return;
          } else {
            w.points += SNAKEOIL.sparePoints;
            toast(
              Math.max(40, Math.min(SNAKEOIL.width - 40, f.x)),
              SNAKEOIL.height - 60,
              "TRUE · SPARED +5",
              "#1f5c3d",
            );
            beep(synthRef.current, 880, 70, "triangle", 0.03);
          }
        }
      }

      for (let i = w.halves.length - 1; i >= 0; i--) {
        const h = w.halves[i];
        h.ttl -= dt;
        h.x += h.vx * dt;
        h.y += h.vy * dt;
        h.vy += SNAKEOIL.gravity * dt;
        h.rot += h.spin * dt;
        if (h.ttl <= 0 || h.y > SNAKEOIL.height + 60) w.halves.splice(i, 1);
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

    const drawClaim = (f: Flying) => {
      const sprites = spritesRef.current;
      if (!sprites) return;
      const sprite = sprites[f.container];
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot * 0.35);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();

      /* The label chip stays level — it IS the game. */
      ctx.font = "bold 10px monospace";
      const textW = ctx.measureText(f.claim.label).width;
      const chipW = textW + 14;
      const chipY = f.y + sprite.height / 2 + 4;
      ctx.fillStyle = "#fffdf9";
      ctx.strokeStyle = "#1c130d";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(f.x - chipW / 2, chipY, chipW, 18, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1c130d";
      ctx.textAlign = "center";
      ctx.fillText(f.claim.label, f.x, chipY + 13);
    };

    const draw = () => {
      const w = world.current;
      const sprites = spritesRef.current;
      if (!sprites) return;

      ctx.save();
      if (w.shakeT > 0 && !reducedMotionRef.current) {
        const mag = 6 * (w.shakeT / 0.25);
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      /* The expo hall: paper, a faint stall shelf, dust motes. */
      ctx.fillStyle = "#fbf4ec";
      ctx.fillRect(-8, -8, SNAKEOIL.width + 16, SNAKEOIL.height + 16);
      ctx.fillStyle = "#f3e7d8";
      for (let i = 0; i < 5; i++) {
        const mx = ((i * 97 + w.t * 8) % (SNAKEOIL.width + 40)) - 20;
        const my = 90 + ((i * 131) % 380);
        ctx.beginPath();
        ctx.arc(mx, my, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillRect(-8, SNAKEOIL.height - 14, SNAKEOIL.width + 16, 14);
      ctx.fillStyle = "#1c130d";
      ctx.fillRect(0, SNAKEOIL.height - 14, SNAKEOIL.width, 2);

      for (const h of w.halves) {
        const sprite = sprites[h.container];
        const hw = sprite.width / 2;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot * 0.35);
        ctx.globalAlpha = Math.min(1, h.ttl * 2.4);
        if (h.left) {
          ctx.drawImage(sprite, 0, 0, hw, sprite.height, -hw, -sprite.height / 2, hw, sprite.height);
        } else {
          ctx.drawImage(sprite, hw, 0, hw, sprite.height, 0, -sprite.height / 2, hw, sprite.height);
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      for (const f of w.claims) drawClaim(f);

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
        ctx.fillRect(0, 0, SNAKEOIL.width, SNAKEOIL.height);
        ctx.globalAlpha = 1;
      }

      /* ------------------------------------------------------------- HUD */
      for (let i = 0; i < SNAKEOIL.maxHearts; i++) {
        const sprite = i < w.hearts ? sprites.heartFull : sprites.heartEmpty;
        ctx.drawImage(sprite, 12 + i * 20, 40);
      }

      ctx.fillStyle = "#1c130d";
      ctx.font = "bold 22px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        `${w.points.toLocaleString("en-GB")} PTS`,
        SNAKEOIL.width - 12,
        54,
      );
      ctx.fillStyle = "#6e5b4d";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`${w.busted} BUSTED`, SNAKEOIL.width - 12, 70);

      if (w.waveFlashT > 0 && phaseRef.current !== "ready") {
        ctx.globalAlpha = Math.min(1, w.waveFlashT / 0.4);
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 24px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`WAVE ${w.prevWave + 1}`, SNAKEOIL.width / 2, 110);
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
      trackEvent({ name: "snakeoil_run_started", params: {} });
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
      x: ((e.clientX - rect.left) / rect.width) * SNAKEOIL.width,
      y: ((e.clientY - rect.top) / rect.height) * SNAKEOIL.height,
    };
  };

  const share = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // Result params make the pasted link unfurl as the score card.
    const path = snakeOilSharePath({ busted: finalBusted, points: finalPoints });
    const text = `${shareText(finalBusted, finalPoints, cause)}\n${origin}${path}`;
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
        aria-label="Snake Oil — swipe across the flying claims to slice the myths and spare the true ones"
        className="block h-auto w-full cursor-pointer touch-none rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ aspectRatio: `${SNAKEOIL.width} / ${SNAKEOIL.height}` }}
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
          <p className="font-display text-4xl uppercase">Snake Oil</p>
          <p className="max-w-[18rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
            Slice the myths. Spare the truth. A sliced truth — or a myth that
            gets away — costs a heart.
          </p>
          <p className="max-w-[17rem] font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Swipe to start
          </p>
          {best > 0 ? (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Best: {best.toLocaleString("en-GB")} myths busted
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
              Snake oiled
            </p>
            <p className="font-display text-6xl uppercase text-primary-strong">
              {finalBusted}
            </p>
            <p className="mt-1 font-mono text-xs font-bold uppercase tracking-[0.16em]">
              myth{finalBusted === 1 ? "" : "s"} busted ·{" "}
              {finalPoints.toLocaleString("en-GB")} pts
            </p>
            <p className="mt-2 text-sm font-semibold">{cause}</p>

            {receipt ? (
              <div className="mt-3 rounded-xl border-2 border-foreground bg-background p-3 text-left">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                  <span
                    className={
                      receipt.kicker === "MYTH"
                        ? "text-primary-strong"
                        : "text-good"
                    }
                  >
                    {receipt.kicker}
                  </span>{" "}
                  · {receipt.label}
                </p>
                <p className="mt-1 line-clamp-4 text-xs text-muted">
                  {receipt.body}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  <a
                    href={receipt.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary underline underline-offset-2 hover:text-foreground"
                  >
                    Source →
                  </a>
                  {receipt.link ? (
                    <Link
                      href={receipt.link}
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary underline underline-offset-2 hover:text-foreground"
                    >
                      The evidence on the site →
                    </Link>
                  ) : null}
                </p>
              </div>
            ) : null}

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
                href="/daily"
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Myth or Fact? →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
