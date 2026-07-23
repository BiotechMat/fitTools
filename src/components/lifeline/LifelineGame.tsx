"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  EDGE_CAUSE,
  LIFELINE,
  type Medal,
  OBSTACLE_KINDS,
  type ObstacleKind,
  ageAt,
  gapAt,
  hitsColumn,
  medalFor,
  mulberry32,
  spawnIntervalAt,
  speedAt,
} from "@/lib/lifeline";

/**
 * Lifeline (LIFELINE.md): tap-to-flap heartbeat arcade. All rendering is
 * canvas (DPR-scaled, nearest-neighbour pixel sprites drawn from pixel
 * maps below); React state only handles phase transitions and overlays.
 * Audio is a tiny WebAudio synth, created on first input, mute persisted.
 */

const BEST_KEY = "fittools.lifeline.best";
const MUTE_KEY = "fittools.lifeline.muted";

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

/* The hero: a Blaze heart with a paper wing. Two frames = the flap. */
const HEART_UP = [
  "..KK....KK..",
  ".KBBK..KBBK.",
  "KBWBBKKBBBBK",
  "KBWBBBBBBBBK",
  "KPPKBBBBBBBK",
  "KPPPKBBBBBK.",
  ".KPKBBBBBK..",
  "..KBBBBBK...",
  "...KBBBK....",
  "....KBK.....",
  ".....K......",
];
const HEART_DOWN = [
  "..KK....KK..",
  ".KBBK..KBBK.",
  "KBWBBKKBBBBK",
  "KBWBBBBBBBBK",
  "KBBBBBBBBBBK",
  "KKKKBBBBBBK.",
  "KPPPKBBBBK..",
  ".KPPKBBBK...",
  "..KKKBBK....",
  "....KBK.....",
  ".....K......",
];

const SPRITE_MAPS: Record<ObstacleKind["id"] | "veg" | "zed", string[]> = {
  sugar: [
    ".KKKKK.",
    "KPWPPPK",
    "KEEEEEK",
    "KEWWEEK",
    "KEWEEEK",
    "KEEEEEK",
    "KEEEEEK",
    ".KKKKK.",
  ],
  smokes: [
    "KKKKKKKKKK",
    "KWWWWWWEAK",
    "KKKKKKKKKK",
  ],
  allnighters: [
    "...KKKK...",
    "..KAAAAK..",
    ".KAAKKAAK.",
    "KAAK..KAAK",
    "KAAK......",
    "KAAK..KAAK",
    ".KAAKKAAK.",
    "..KAAAAK..",
    "...KKKK...",
  ],
  stress: [
    "..KK..KK..",
    ".KEEKKEEK.",
    "KEEEEEEEEK",
    ".KEEEEEEK.",
    "..KEEEEK..",
    "...KEEK...",
    "..KEEK....",
    "...KK.....",
  ],
  sofa: [
    "KKK......KKK",
    "KSSK.KK..KSSK",
    "KSSKKSSKKKSSK",
    "KSSSSSSSSSSSK",
    "KKKKKKKKKKKKK",
    ".KK.......KK.",
  ],
  veg: [
    "..KMMK..",
    ".KMMMMK.",
    "KMMFMMMK",
    "KMFMMFMK",
    ".KMMMMK.",
    "..KFFK..",
    "..KFFK..",
    "...KK...",
  ],
  zed: [
    "KKKKKK",
    "...KK.",
    "..KK..",
    ".KK...",
    "KKKKKK",
  ],
};

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

/* ------------------------------------------------------------------- game */

interface Column {
  x: number;
  gapY: number;
  gapH: number;
  kind: ObstacleKind;
  passed: boolean;
}

interface Pickup {
  x: number;
  y: number;
  type: "veg" | "zed";
  taken: boolean;
}

interface Toast {
  x: number;
  y: number;
  text: string;
  ttl: number;
}

interface World {
  y: number;
  vy: number;
  t: number;
  bonus: number;
  columns: Column[];
  pickups: Pickup[];
  toasts: Toast[];
  spawnIn: number;
  lastDecade: number;
  wingT: number;
  groundX: number;
  rng: () => number;
}

function freshWorld(): World {
  return {
    y: LIFELINE.height / 2,
    vy: 0,
    t: 0,
    bonus: 0,
    columns: [],
    pickups: [],
    toasts: [],
    spawnIn: 0.9,
    lastDecade: 1,
    wingT: 0,
    groundX: 0,
    rng: mulberry32(Math.floor(Math.random() * 2 ** 31)),
  };
}

type Phase = "ready" | "playing" | "paused" | "dead";

const MEDAL_STYLE: Record<Exclude<Medal, "none">, { label: string; bg: string }> = {
  bronze: { label: "BRONZE · 40+", bg: "bg-primary-soft" },
  silver: { label: "SILVER · 60+", bg: "bg-surface-deep" },
  gold: { label: "GOLD · 80+", bg: "bg-warning-bg" },
  centenarian: { label: "CENTENARIAN · 100", bg: "bg-good-soft" },
};

export function LifelineGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld());
  const phaseRef = useRef<Phase>("ready");
  const synthRef = useRef<Synth | null>(null);
  const spritesRef = useRef<Record<string, HTMLCanvasElement> | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [finalAge, setFinalAge] = useState(0);
  const [cause, setCause] = useState("");
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);

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
    canvas.width = LIFELINE.width * dpr;
    canvas.height = LIFELINE.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    spritesRef.current = {
      heartUp: makeSprite(HEART_UP, 2),
      heartDown: makeSprite(HEART_DOWN, 2),
      sugar: makeSprite(SPRITE_MAPS.sugar, 4),
      smokes: makeSprite(SPRITE_MAPS.smokes, 4),
      allnighters: makeSprite(SPRITE_MAPS.allnighters, 3),
      stress: makeSprite(SPRITE_MAPS.stress, 3),
      sofa: makeSprite(SPRITE_MAPS.sofa, 3),
      veg: makeSprite(SPRITE_MAPS.veg, 3),
      zed: makeSprite(SPRITE_MAPS.zed, 3),
    };

    const die = (deathCause: string) => {
      const w = world.current;
      const age = Math.floor(ageAt(w.t, w.bonus));
      setFinalAge(age);
      setCause(deathCause);
      setNewBest(false);
      setBest((prev) => {
        if (age > prev) {
          setNewBest(true);
          try {
            localStorage.setItem(BEST_KEY, String(age));
          } catch {
            /* fine */
          }
          return age;
        }
        return prev;
      });
      setPhaseBoth("dead");
      beep(synthRef.current, 660, 80, "sawtooth", 0.06);
      setTimeout(() => beep(synthRef.current, 880, 700, "sine", 0.05), 90);
    };

    const step = (dt: number) => {
      const w = world.current;
      w.t += dt;
      w.wingT = Math.max(0, w.wingT - dt);
      const age = ageAt(w.t, w.bonus);
      const speed = speedAt(age);
      w.groundX = (w.groundX + speed * dt) % 32;

      const decade = Math.floor(age / 10);
      if (decade > w.lastDecade) {
        w.lastDecade = decade;
        beep(synthRef.current, 520, 70, "square", 0.05);
        setTimeout(() => beep(synthRef.current, 700, 90, "square", 0.05), 100);
      }

      w.vy = Math.min(LIFELINE.terminalFall, w.vy + LIFELINE.gravity * dt);
      w.y += w.vy * dt;
      const floor = LIFELINE.height - LIFELINE.groundHeight;
      if (w.y < LIFELINE.playerRadius + 2 || w.y > floor - LIFELINE.playerRadius) {
        die(EDGE_CAUSE);
        return;
      }

      w.spawnIn -= dt;
      if (w.spawnIn <= 0) {
        w.spawnIn = spawnIntervalAt(age);
        const gapH = gapAt(age);
        const margin = 60;
        const gapY =
          margin + gapH / 2 + w.rng() * (floor - margin * 2 - gapH);
        const kind = OBSTACLE_KINDS[Math.floor(w.rng() * OBSTACLE_KINDS.length)];
        w.columns.push({ x: LIFELINE.width + 40, gapY, gapH, kind, passed: false });
        if (w.rng() < 0.35) {
          w.pickups.push({
            x: LIFELINE.width + 40 + 130,
            y: margin + w.rng() * (floor - margin * 2),
            type: w.rng() < 0.6 ? "veg" : "zed",
            taken: false,
          });
        }
      }

      for (let i = w.columns.length - 1; i >= 0; i--) {
        const c = w.columns[i];
        c.x -= speed * dt;
        if (c.x < -60) {
          w.columns.splice(i, 1);
          continue;
        }
        if (hitsColumn(w.y, LIFELINE.playerRadius, LIFELINE.playerX, c)) {
          die(c.kind.cause);
          return;
        }
      }

      for (let i = w.pickups.length - 1; i >= 0; i--) {
        const p = w.pickups[i];
        p.x -= speed * dt;
        if (p.x < -30) {
          w.pickups.splice(i, 1);
          continue;
        }
        const dx = p.x - LIFELINE.playerX;
        const dy = p.y - w.y;
        if (!p.taken && dx * dx + dy * dy < 24 * 24) {
          p.taken = true;
          const years = p.type === "veg" ? 2 : 1;
          w.bonus += years;
          w.toasts.push({
            x: p.x,
            y: p.y - 16,
            text: `+${years} yr${years > 1 ? "s" : ""}`,
            ttl: 0.9,
          });
          beep(synthRef.current, p.type === "veg" ? 660 : 540, 90, "triangle", 0.06);
          setTimeout(
            () => beep(synthRef.current, p.type === "veg" ? 880 : 720, 110, "triangle", 0.05),
            80,
          );
          w.pickups.splice(i, 1);
        }
      }

      for (let i = w.toasts.length - 1; i >= 0; i--) {
        const toast = w.toasts[i];
        toast.ttl -= dt;
        toast.y -= 30 * dt;
        if (toast.ttl <= 0) w.toasts.splice(i, 1);
      }
    };

    const draw = () => {
      const w = world.current;
      const sprites = spritesRef.current;
      if (!sprites) return;
      const floor = LIFELINE.height - LIFELINE.groundHeight;
      const age = Math.floor(ageAt(w.t, w.bonus));

      /* Sky scene (parallax, brand palette): sun, clouds, skyline, hills. */
      ctx.fillStyle = "#fbf4ec";
      ctx.fillRect(0, 0, LIFELINE.width, LIFELINE.height);
      ctx.fillStyle = "#e8c33c";
      ctx.strokeStyle = "#1c130d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(LIFELINE.width - 70 - ((w.t * 2) % 40), 74, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const cloudShift = (w.t * 14) % 210;
      for (let i = -1; i < 4; i++) {
        const cx = i * 210 - cloudShift + 40;
        const cy = 58 + (((i + 4) * 53) % 70);
        ctx.fillStyle = "#fffdf9";
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.arc(cx + 18, cy - 7, 12, 0, Math.PI * 2);
        ctx.arc(cx + 34, cy, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      const skyShift = (w.t * 22) % 96;
      ctx.fillStyle = "#f3e7d8";
      for (let i = -1; i < 6; i++) {
        const bx = i * 96 - skyShift;
        const bh = 40 + (((i + 6) * 31) % 46);
        ctx.fillRect(bx, floor - 60 - bh, 44, bh + 60);
        ctx.fillRect(bx + 52, floor - 60 - bh * 0.6, 30, bh * 0.6 + 60);
      }
      const hillShift = (w.t * 38) % 90;
      ctx.fillStyle = "#1f5c3d";
      for (let i = -1; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(i * 90 - hillShift + 20, floor + 14, 52, Math.PI, 0);
        ctx.fill();
      }
      ctx.fillStyle = "#8fbf3f";
      for (let i = -1; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(i * 90 - hillShift + 66, floor + 22, 46, Math.PI, 0);
        ctx.fill();
      }

      for (const c of w.columns) {
        const sprite = sprites[c.kind.id];
        const top = c.gapY - c.gapH / 2;
        const bottom = c.gapY + c.gapH / 2;
        const halfW = LIFELINE.columnHalfWidth;
        /* Columns are themed objects, not pipes (LIFELINE.md §5). */
        const COLUMN_FILL: Record<ObstacleKind["id"], string> = {
          sugar: "#c63d08",
          smokes: "#fffdf9",
          allnighters: "#1c130d",
          stress: "#c63d08",
          sofa: "#f3e7d8",
        };
        ctx.fillStyle = COLUMN_FILL[c.kind.id];
        ctx.strokeStyle = "#1c130d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(c.x - halfW, -8, halfW * 2, top + 8, 4);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(c.x - halfW, bottom, halfW * 2, floor - bottom + 8, 4);
        ctx.fill();
        ctx.stroke();
        if (c.kind.id === "smokes") {
          ctx.fillStyle = "#e8c33c";
          ctx.fillRect(c.x - halfW + 2, top - 18, halfW * 2 - 4, 16);
          ctx.fillRect(c.x - halfW + 2, bottom + 2, halfW * 2 - 4, 16);
          ctx.fillStyle = "#ff531a";
          ctx.fillRect(c.x - halfW + 2, top - 2, halfW * 2 - 4, 2);
          ctx.fillRect(c.x - halfW + 2, bottom, halfW * 2 - 4, 2);
        } else if (c.kind.id === "sugar") {
          ctx.fillStyle = "#fbf4ec";
          if (top > 70) ctx.fillRect(c.x - halfW + 2, top / 2 - 14, halfW * 2 - 4, 28);
          if (floor - bottom > 70) {
            ctx.fillRect(c.x - halfW + 2, bottom + (floor - bottom) / 2 - 14, halfW * 2 - 4, 28);
          }
        } else if (c.kind.id === "sofa") {
          ctx.strokeStyle = "#1c130d";
          ctx.lineWidth = 1;
          for (let sy = 18; sy < top; sy += 22) {
            ctx.beginPath();
            ctx.moveTo(c.x - halfW + 3, sy);
            ctx.lineTo(c.x + halfW - 3, sy);
            ctx.stroke();
          }
          for (let sy = bottom + 18; sy < floor; sy += 22) {
            ctx.beginPath();
            ctx.moveTo(c.x - halfW + 3, sy);
            ctx.lineTo(c.x + halfW - 3, sy);
            ctx.stroke();
          }
          ctx.lineWidth = 2;
        } else if (c.kind.id === "allnighters") {
          ctx.fillStyle = "#e8c33c";
          for (let sy = 14; sy < top - 8; sy += 34) {
            ctx.fillRect(c.x - 8 + ((sy * 7) % 14), sy, 3, 3);
          }
          for (let sy = bottom + 12; sy < floor - 8; sy += 34) {
            ctx.fillRect(c.x - 8 + ((sy * 7) % 14), sy, 3, 3);
          }
        }
        ctx.drawImage(
          sprite,
          c.x - sprite.width / 2,
          top - sprite.height - 4,
        );
        ctx.drawImage(sprite, c.x - sprite.width / 2, bottom + 4);
        ctx.save();
        ctx.translate(c.x + 4, Math.max(26, top - sprite.height - 12));
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "left";
        ctx.fillText(c.kind.label, 0, 0);
        ctx.restore();
      }

      for (const p of w.pickups) {
        const sprite = sprites[p.type];
        ctx.drawImage(sprite, p.x - sprite.width / 2, p.y - sprite.height / 2);
      }

      ctx.strokeStyle = "#c63d08";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, phaseRef.current === "dead" ? w.y : w.y + 4);
      ctx.lineTo(LIFELINE.playerX - 14, w.y + 4);
      ctx.stroke();

      const heart = w.wingT > 0 ? sprites.heartUp : sprites.heartDown;
      ctx.save();
      ctx.translate(LIFELINE.playerX, w.y);
      ctx.rotate(
        Math.max(-0.45, Math.min(0.9, (w.vy / LIFELINE.terminalFall) * 1.1)),
      );
      ctx.drawImage(heart, -heart.width / 2, -heart.height / 2);
      ctx.restore();

      /* Ground: a blaze running track with scrolling lane dashes. */
      ctx.fillStyle = "#ff531a";
      ctx.fillRect(0, floor, LIFELINE.width, LIFELINE.groundHeight);
      ctx.fillStyle = "#1c130d";
      ctx.fillRect(0, floor, LIFELINE.width, 3);
      ctx.strokeStyle = "#fffdf9";
      ctx.lineWidth = 3;
      for (let gx = -w.groundX; gx < LIFELINE.width; gx += 32) {
        ctx.beginPath();
        ctx.moveTo(gx, floor + 18);
        ctx.lineTo(gx + 16, floor + 18);
        ctx.stroke();
      }

      for (const toast of w.toasts) {
        ctx.fillStyle = "#1f5c3d";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(toast.text, toast.x, toast.y);
      }

      if (phaseRef.current !== "ready") {
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 34px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`AGE ${age}`, LIFELINE.width - 14, 44);
      }
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

  const flap = () => {
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
      setPhaseBoth("playing");
    } else if (current === "paused") {
      setPhaseBoth("playing");
    }
    const w = world.current;
    w.vy = LIFELINE.flapImpulse;
    w.wingT = 0.18;
    beep(synthRef.current, 300, 45, "square", 0.04);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "ArrowUp") && !e.repeat) {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flap is stable enough (refs)
  }, []);

  const medal = medalFor(finalAge);

  return (
    <div className="relative mx-auto w-full max-w-[420px] select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          e.preventDefault();
          flap();
        }}
        aria-label="Lifeline — tap or press space to keep the heart beating"
        className="block h-auto w-full cursor-pointer touch-none rounded-2xl border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ aspectRatio: `${LIFELINE.width} / ${LIFELINE.height}` }}
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-4xl uppercase">Lifeline</p>
          <p className="max-w-[16rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
            Tap or press space to flap. Dodge the risk factors. Grow old.
          </p>
          {best > 0 ? (
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
              Best: {best}
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
              Flatlined at
            </p>
            <p className="font-display text-7xl uppercase text-primary-strong">
              {finalAge}
            </p>
            <p className="mt-2 text-sm font-semibold">{cause}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {medal !== "none" ? (
                <span
                  className={`inline-block -rotate-2 rounded-full border-2 border-foreground px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] ${MEDAL_STYLE[medal].bg}`}
                >
                  {MEDAL_STYLE[medal].label}
                </span>
              ) : null}
              <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Best {best}
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
                onClick={flap}
                className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
              >
                Go again
              </button>
              <Link
                href="/heart-age-calculator"
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Your real heart age →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
