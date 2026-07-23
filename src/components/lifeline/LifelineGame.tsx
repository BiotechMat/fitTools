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
  dailyPuzzleNumber,
  dailySeed,
  gapAt,
  hitsColumn,
  medalFor,
  mulberry32,
  spawnIntervalAt,
  speedAt,
} from "@/lib/lifeline";
import { trackEvent } from "@/lib/analytics";
import { lifelineSharePath, type LifelineCauseId } from "@/lib/arcade-share";

/**
 * Lifeline (LIFELINE.md): tap-to-flap heartbeat arcade. All rendering is
 * canvas (DPR-scaled, nearest-neighbour pixel sprites); React state only
 * handles phase transitions and overlays. Audio is a WebAudio synth created
 * on first input, mute persisted.
 *
 * v2 feel rules (LIFELINE.md §2): death is a sequence (freeze → tumble →
 * flatline sweep → card), the first seconds are a grace runway, the hitbox
 * is 2px forgiving, near-misses are rewarded, and the soundtrack is a bass
 * heartbeat that tracks your age. The heart itself ages: glasses at 40,
 * grey brows at 60, a flat cap at 80.
 */

const BEST_KEY = "fittools.lifeline.best";
const MUTE_KEY = "fittools.lifeline.muted";
const DAILY_KEY_PREFIX = "fittools.lifeline.daily.";
const RESTART_GUARD_MS = 350;

/* Facts shown on the death card — only claims already vetted in this repo's
   formula modules (CLAUDE.md: never invent numbers or citations). */
const FACTS: { text: string; href: string; label: string }[] = [
  {
    text: "In the Li 2018 cohort, five lifestyle factors were associated with 12–14 extra years of life expectancy at age 50.",
    href: "/lifestyle-life-expectancy",
    label: "See the study",
  },
  {
    text: "Your modelled heart age usually moves most with systolic blood pressure — the calculator shows what moves your needle.",
    href: "/heart-age-calculator",
    label: "Check your heart age",
  },
  {
    text: "One real, cited fitness number a day: that's Ballpark.",
    href: "/daily",
    label: "Play today's",
  },
];

/* Daily modifiers ("genetics"): one deterministic twist per day, announced
   up front. Gameplay-only — never framed as advice. */
interface DailyModifier {
  id: "jitter" | "shortage" | "headwind" | "deepsleep" | "calmday";
  label: string;
}

const MODIFIERS: DailyModifier[] = [
  { id: "jitter", label: "Stress is twitchy today" },
  { id: "shortage", label: "Broccoli shortage" },
  { id: "headwind", label: "Headwind — everything's faster" },
  { id: "deepsleep", label: "Deep sleep — Zs are worth double" },
  { id: "calmday", label: "Recovery day — gaps run wider" },
];

const RUNS_KEY = "fittools.lifeline.runs";

function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/* ---------------------------------------------------------------- sprites */

const PALETTE: Record<string, string> = {
  K: "#1c130d",
  B: "#ff531a",
  E: "#c63d08",
  P: "#fbf4ec",
  W: "#fffdf9",
  M: "#8fbf3f",
  F: "#1f5c3d",
  A: "#e8c33c",
  S: "#f3e7d8",
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

/* The hero: a Blaze heart. Two frames = the beat — systole (squeezed,
   shown for 0.18s after each tap) and diastole (at rest). No wings: every
   tap IS a heartbeat, and the pump is the propulsion. */
const HEART_SQUEEZE = [
  "...KK..KK...",
  "..KBBKKBBK..",
  ".KBWBBBBBBK.",
  ".KBWBBBBBBK.",
  ".KBBBBBBBBK.",
  "..KBBBBBBK..",
  "...KBBBBK...",
  "....KBBK....",
  ".....KK.....",
];
const HEART_REST = [
  "..KK....KK..",
  ".KBBK..KBBK.",
  "KBWBBKKBBBBK",
  "KBWBBBBBBBBK",
  "KBBBBBBBBBBK",
  ".KBBBBBBBBK.",
  "..KBBBBBBK..",
  "...KBBBBK...",
  "....KBBK....",
  ".....KK.....",
];

const SPRITE_MAPS: Record<
  ObstacleKind["id"] | "veg" | "zed" | "coffee" | "shield",
  string[]
> = {
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
  smokes: ["KKKKKKKKKK", "KWWWWWWEAK", "KKKKKKKKKK"],
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
  zed: ["KKKKKK", "...KK.", "..KK..", ".KK...", "KKKKKK"],
  coffee: [
    ".KKKKK..",
    "KWSWSWKK",
    "KEEEEEKS",
    "KEEEEEKS",
    "KEEEEEKK",
    ".KKKKK..",
    "KKKKKKK.",
  ],
  shield: [
    ".KKKKK.",
    "KFWFWFK",
    "KFWWWFK",
    "KWWKWWK",
    "KFWWWFK",
    ".KFWFK.",
    "..KFK..",
    "...K...",
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
  baseGapY: number;
  gapH: number;
  kind: ObstacleKind;
  passed: boolean;
}

interface Pickup {
  x: number;
  y: number;
  type: "veg" | "zed" | "coffee" | "shield";
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
  spawned: number;
  lastDecade: number;
  wingT: number;
  squashT: number;
  beatIn: number;
  blinkIn: number;
  blinkT: number;
  groundX: number;
  deathT: number;
  deathY: number;
  spin: number;
  shield: boolean;
  invulnT: number;
  slowT: number;
  nextShieldAge: number;
  bigToast: { text: string; ttl: number } | null;
  /** Seed actually used (random ones included) — challenge links replay it. */
  seed: number;
  /** 30Hz y-position samples of this run, for the daily ghost. */
  rec: number[];
  recAcc: number;
  rng: () => number;
}

function freshWorld(seed: number | null): World {
  const usedSeed = seed ?? Math.floor(Math.random() * 2 ** 31);
  return {
    y: LIFELINE.height / 2,
    vy: 0,
    t: 0,
    bonus: 0,
    columns: [],
    pickups: [],
    toasts: [],
    // Grace runway: the first column arrives late (LIFELINE.md §2).
    spawnIn: 2.2,
    spawned: 0,
    lastDecade: 1,
    wingT: 0,
    squashT: 0,
    beatIn: 0.4,
    blinkIn: 2.5,
    blinkT: 0,
    groundX: 0,
    deathT: 0,
    deathY: LIFELINE.height / 2,
    spin: 0,
    shield: false,
    invulnT: 0,
    slowT: 0,
    // First check-up gate arrives at 38 — screening starts in your late 30s.
    nextShieldAge: 38,
    bigToast: null,
    seed: usedSeed,
    rec: [],
    recAcc: 0,
    rng: mulberry32(usedSeed),
  };
}

/* Earned cosmetics (no currency, ever — LIFELINE.md §3). */
const SKINS = [
  { id: "classic", label: "Classic", hint: "The original ticker" },
  { id: "gold", label: "Gold", hint: "Join the centenarian club (100)" },
  { id: "chalk", label: "Chalk", hint: "Reach 80 — gold-medal territory" },
] as const;
type SkinId = (typeof SKINS)[number]["id"];

const SKINS_KEY = "fittools.lifeline.skins";
const SKIN_KEY = "fittools.lifeline.skin";
const GHOST_KEY_PREFIX = "fittools.lifeline.ghost.";

function swapPalette(rows: string[], map: Record<string, string>): string[] {
  return rows.map((row) => [...row].map((ch) => map[ch] ?? ch).join(""));
}

type Phase = "ready" | "playing" | "dying" | "paused" | "dead";
/* One mode (Mat, 2026-07-23): every run plays today's seeded course — the
   daily IS the game. Challenge links are the only seed override. */

const MEDAL_STYLE: Record<Exclude<Medal, "none">, { label: string; bg: string }> = {
  bronze: { label: "BRONZE · 40+", bg: "bg-primary-soft" },
  silver: { label: "SILVER · 60+", bg: "bg-surface-deep" },
  gold: { label: "GOLD · 80+", bg: "bg-warning-bg" },
  centenarian: { label: "CENTENARIAN · 100", bg: "bg-good-soft" },
};

export function LifelineGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld(null));
  const phaseRef = useRef<Phase>("ready");
  const modifierRef = useRef<DailyModifier>(
    MODIFIERS[dailySeed(todayISO()) % MODIFIERS.length],
  );
  const challengeRef = useRef<{ seed: number; beat: number } | null>(null);
  const skinRef = useRef<SkinId>("classic");
  const ghostRef = useRef<number[] | null>(null);
  const deadAtRef = useRef(0);
  const synthRef = useRef<Synth | null>(null);
  const spritesRef = useRef<Record<string, HTMLCanvasElement> | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [finalAge, setFinalAge] = useState(0);
  const [cause, setCause] = useState("");
  const [causeLabel, setCauseLabel] = useState("");
  const [causeId, setCauseId] = useState<LifelineCauseId>("gravity");
  const [best, setBest] = useState(0);
  const [dailyBest, setDailyBest] = useState(0);
  const [lastRuns, setLastRuns] = useState<number[]>([]);
  const [challenge, setChallenge] = useState<{ seed: number; beat: number } | null>(
    null,
  );
  const [finalSeed, setFinalSeed] = useState(0);
  const [skins, setSkins] = useState<SkinId[]>(["classic"]);
  const [skin, setSkinState] = useState<SkinId>("classic");
  const [newSkin, setNewSkin] = useState<SkinId | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);

  const setPhaseBoth = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time URL +
       localStorage hydration after mount; server render must stay
       storage-free */
    const params = new URLSearchParams(window.location.search);
    const chSeed = Number(params.get("seed"));
    const chBeat = Number(params.get("beat"));
    if (chSeed > 0 && chBeat > 0 && Number.isFinite(chSeed + chBeat)) {
      const ch = { seed: Math.floor(chSeed), beat: Math.floor(chBeat) };
      challengeRef.current = ch;
      setChallenge(ch);
    }
    try {
      setBest(Number(localStorage.getItem(BEST_KEY) ?? 0));
      setDailyBest(Number(localStorage.getItem(DAILY_KEY_PREFIX + todayISO()) ?? 0));
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
      const runsRaw = localStorage.getItem(RUNS_KEY);
      if (runsRaw) {
        const parsed: unknown = JSON.parse(runsRaw);
        if (
          Array.isArray(parsed) &&
          parsed.every((n): n is number => typeof n === "number")
        ) {
          setLastRuns(parsed.slice(-5));
        }
      }
      const skinsRaw = localStorage.getItem(SKINS_KEY);
      if (skinsRaw) {
        const parsed: unknown = JSON.parse(skinsRaw);
        if (Array.isArray(parsed)) {
          const valid = SKINS.map((s) => s.id).filter((id) => parsed.includes(id));
          setSkins(["classic", ...valid.filter((id) => id !== "classic")]);
        }
      }
      const savedSkin = localStorage.getItem(SKIN_KEY);
      if (savedSkin && SKINS.some((s) => s.id === savedSkin)) {
        // Restore only if it's genuinely unlocked; a narrow cast is safe here.
        skinRef.current = savedSkin as SkinId;
        setSkinState(savedSkin as SkinId);
      }
    } catch {
      /* private mode — scores just live for the session */
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
      heartUp: makeSprite(HEART_SQUEEZE, 2),
      heartDown: makeSprite(HEART_REST, 2),
      heartUpGold: makeSprite(swapPalette(HEART_SQUEEZE, { B: "A", W: "P" }), 2),
      heartDownGold: makeSprite(swapPalette(HEART_REST, { B: "A", W: "P" }), 2),
      heartUpChalk: makeSprite(swapPalette(HEART_SQUEEZE, { B: "W", W: "S" }), 2),
      heartDownChalk: makeSprite(swapPalette(HEART_REST, { B: "W", W: "S" }), 2),
      sugar: makeSprite(SPRITE_MAPS.sugar, 4),
      smokes: makeSprite(SPRITE_MAPS.smokes, 4),
      allnighters: makeSprite(SPRITE_MAPS.allnighters, 3),
      stress: makeSprite(SPRITE_MAPS.stress, 3),
      sofa: makeSprite(SPRITE_MAPS.sofa, 3),
      veg: makeSprite(SPRITE_MAPS.veg, 3),
      zed: makeSprite(SPRITE_MAPS.zed, 3),
      coffee: makeSprite(SPRITE_MAPS.coffee, 3),
      shield: makeSprite(SPRITE_MAPS.shield, 3),
    };

    const die = (deathCause: string, label: string, kindId: LifelineCauseId) => {
      const w = world.current;
      const age = Math.floor(ageAt(w.t, w.bonus));
      trackEvent({
        name: "lifeline_flatline",
        params: { age, cause: label, mode: "daily" },
      });
      setFinalAge(age);
      setCause(deathCause);
      setCauseLabel(label);
      setCauseId(kindId);
      setCopied(false);
      setNewBest(false);
      setNewSkin(null);
      setFinalSeed(w.seed);
      const earned: SkinId[] = [];
      if (age >= 100) earned.push("gold");
      if (age >= 80) earned.push("chalk");
      if (earned.length > 0) {
        setSkins((prev) => {
          const fresh = earned.filter((s) => !prev.includes(s));
          if (fresh.length === 0) return prev;
          setNewSkin(fresh[0]);
          const next = [...prev, ...fresh];
          try {
            localStorage.setItem(SKINS_KEY, JSON.stringify(next));
          } catch {
            /* fine */
          }
          return next;
        });
      }
      // Save the ghost BEFORE the best updates below write the same key.
      try {
        const prev = Number(
          localStorage.getItem(DAILY_KEY_PREFIX + todayISO()) ?? 0,
        );
        if (age > prev) {
          localStorage.setItem(
            GHOST_KEY_PREFIX + todayISO(),
            JSON.stringify(w.rec),
          );
        }
      } catch {
        /* fine */
      }
      setLastRuns((prev) => {
        const next = [...prev, age].slice(-5);
        try {
          localStorage.setItem(RUNS_KEY, JSON.stringify(next));
        } catch {
          /* fine */
        }
        return next;
      });
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
      setDailyBest((prev) => {
        const next = Math.max(prev, age);
        try {
          localStorage.setItem(DAILY_KEY_PREFIX + todayISO(), String(next));
        } catch {
          /* fine */
        }
        return next;
      });
      w.deathT = 0;
      w.deathY = w.y;
      w.vy = -220;
      w.spin = 0;
      setPhaseBoth("dying");
      beep(synthRef.current, 220, 90, "sawtooth", 0.07);
    };

    const step = (realDt: number) => {
      const w = world.current;
      // Coffee slow-mo: the world runs at 55% while slowT is live.
      w.slowT = Math.max(0, w.slowT - realDt);
      const dt = realDt * (w.slowT > 0 ? 0.55 : 1);
      w.invulnT = Math.max(0, w.invulnT - dt);
      w.t += dt;
      w.recAcc += dt;
      if (w.recAcc >= 1 / 30 && w.rec.length < 3600) {
        w.recAcc = 0;
        w.rec.push(Math.round(w.y));
      }
      w.wingT = Math.max(0, w.wingT - dt);
      w.squashT = Math.max(0, w.squashT - dt);
      const age = ageAt(w.t, w.bonus);
      // Modifier shapes today's course; challenge replays stay unmodified.
      const mod = challengeRef.current ? null : modifierRef.current.id;
      let speed = speedAt(age);
      if (mod === "headwind") speed *= 1.08;
      w.groundX = (w.groundX + speed * dt) % 32;

      w.blinkT = Math.max(0, w.blinkT - dt);
      w.blinkIn -= dt;
      if (w.blinkIn <= 0) {
        w.blinkIn = 2 + w.rng() * 3;
        w.blinkT = 0.12;
      }

      // The soundtrack is a heartbeat that tracks your age.
      w.beatIn -= dt;
      if (w.beatIn <= 0) {
        const bpm = 55 + (age - LIFELINE.startAge) * 0.55;
        w.beatIn = 60 / bpm;
        beep(synthRef.current, 95, 70, "sine", 0.045);
        setTimeout(() => beep(synthRef.current, 76, 60, "sine", 0.035), 120);
      }

      const decade = Math.floor(age / 10);
      if (decade > w.lastDecade) {
        w.lastDecade = decade;
        w.bigToast = { text: `YOUR ${decade * 10}s`, ttl: 1.5 };
        beep(synthRef.current, 520, 70, "square", 0.05);
        setTimeout(() => beep(synthRef.current, 700, 90, "square", 0.05), 100);
      }
      if (w.bigToast) {
        w.bigToast.ttl -= dt;
        if (w.bigToast.ttl <= 0) w.bigToast = null;
      }

      w.vy = Math.min(LIFELINE.terminalFall, w.vy + LIFELINE.gravity * dt);
      w.y += w.vy * dt;
      const floor = LIFELINE.height - LIFELINE.groundHeight;
      if (
        w.y < LIFELINE.playerRadius + 2 ||
        w.y > floor - LIFELINE.playerRadius
      ) {
        die(EDGE_CAUSE, "GRAVITY", "gravity");
        return;
      }

      w.spawnIn -= dt;
      if (w.spawnIn <= 0) {
        w.spawnIn = spawnIntervalAt(age);
        // First three gaps run wider — deaths at 20 feel like the game's fault.
        let gapH = gapAt(age) + Math.max(0, 3 - w.spawned) * 10;
        if (mod === "calmday") gapH += 8;
        w.spawned += 1;
        const margin = 60;
        const gapY = margin + gapH / 2 + w.rng() * (floor - margin * 2 - gapH);
        const kind = OBSTACLE_KINDS[Math.floor(w.rng() * OBSTACLE_KINDS.length)];
        w.columns.push({
          x: LIFELINE.width + 40,
          gapY,
          baseGapY: gapY,
          gapH,
          kind,
          passed: false,
        });
        const pickupChance = mod === "shortage" ? 0.15 : 0.35;
        if (w.rng() < pickupChance) {
          const roll = w.rng();
          w.pickups.push({
            x: LIFELINE.width + 40 + 130,
            y: margin + w.rng() * (floor - margin * 2),
            type: roll < 0.12 ? "coffee" : roll < 0.62 ? "veg" : "zed",
            taken: false,
          });
        }
        // The screening shield: a check-up gate roughly every 20 years.
        if (age >= w.nextShieldAge) {
          w.nextShieldAge += 20;
          w.pickups.push({
            x: LIFELINE.width + 40 + 200,
            y: margin + w.rng() * (floor - margin * 2),
            type: "shield",
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
        // Per-kind behaviour: stress twitches, sofas slowly sag into the gap.
        if (c.kind.id === "stress") {
          const amp = mod === "jitter" ? 16 : 7;
          c.gapY = c.baseGapY + Math.sin(w.t * 4 + c.x * 0.05) * amp;
        } else if (c.kind.id === "sofa" && !c.passed) {
          c.gapH = Math.max(62, c.gapH - 3.5 * dt);
        }
        if (
          w.invulnT <= 0 &&
          hitsColumn(w.y, LIFELINE.hitboxRadius, LIFELINE.playerX, c)
        ) {
          if (w.shield) {
            // Screening caught it early: consume the shield, clear the column.
            w.shield = false;
            w.invulnT = 1.2;
            w.columns.splice(i, 1);
            w.toasts.push({
              x: LIFELINE.playerX + 10,
              y: w.y - 24,
              text: "CAUGHT EARLY ✓",
              ttl: 1,
            });
            beep(synthRef.current, 620, 90, "triangle", 0.06);
            setTimeout(
              () => beep(synthRef.current, 930, 120, "triangle", 0.05),
              90,
            );
            continue;
          }
          die(c.kind.cause, c.kind.label, c.kind.id);
          return;
        }
        if (!c.passed && c.x + LIFELINE.columnHalfWidth < LIFELINE.playerX - LIFELINE.playerRadius) {
          c.passed = true;
          const edgeDist = Math.min(
            Math.abs(w.y - (c.gapY - c.gapH / 2)),
            Math.abs(w.y - (c.gapY + c.gapH / 2)),
          );
          if (edgeDist < 16) {
            w.toasts.push({
              x: LIFELINE.playerX + 8,
              y: w.y - 22,
              text: "CLOSE ONE",
              ttl: 0.7,
            });
            beep(synthRef.current, 990, 60, "triangle", 0.04);
          }
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
          if (p.type === "shield") {
            w.shield = true;
            w.toasts.push({
              x: p.x,
              y: p.y - 16,
              text: "CHECK-UP · 1 free save",
              ttl: 1.1,
            });
            beep(synthRef.current, 520, 80, "triangle", 0.06);
            setTimeout(() => beep(synthRef.current, 780, 110, "triangle", 0.05), 90);
          } else if (p.type === "coffee") {
            w.slowT = 2.2;
            w.toasts.push({ x: p.x, y: p.y - 16, text: "COFFEE · slow-mo", ttl: 1 });
            beep(synthRef.current, 440, 70, "triangle", 0.06);
          } else {
            const years = p.type === "veg" ? 2 : mod === "deepsleep" ? 2 : 1;
            w.bonus += years;
            w.toasts.push({
              x: p.x,
              y: p.y - 16,
              text: `+${years} yr${years > 1 ? "s" : ""}`,
              ttl: 0.9,
            });
            beep(synthRef.current, p.type === "veg" ? 660 : 540, 90, "triangle", 0.06);
            setTimeout(
              () =>
                beep(
                  synthRef.current,
                  p.type === "veg" ? 880 : 720,
                  110,
                  "triangle",
                  0.05,
                ),
              80,
            );
          }
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

    /* Death beat: 80ms freeze → tumble with spin → card (LIFELINE.md §2). */
    const stepDying = (dt: number) => {
      const w = world.current;
      w.deathT += dt;
      if (w.deathT < 0.08) return;
      if (w.deathT < 0.2 && w.deathT - dt < 0.08) {
        beep(synthRef.current, 880, 900, "sine", 0.05);
      }
      w.vy = Math.min(LIFELINE.terminalFall * 1.4, w.vy + LIFELINE.gravity * 1.2 * dt);
      w.y += w.vy * dt;
      w.spin += 7 * dt;
      if (w.deathT >= 1.0) {
        deadAtRef.current = performance.now();
        setPhaseBoth("dead");
      }
    };

    const drawFace = (age: number, dying: boolean) => {
      const w = world.current;
      const eyeL = { x: -2, y: -4 };
      const eyeR = { x: 6, y: -4 };
      const panic =
        !dying &&
        w.columns.some(
          (c) => c.x - LIFELINE.playerX > -20 && c.x - LIFELINE.playerX < 70,
        );
      ctx.strokeStyle = "#1c130d";
      ctx.fillStyle = "#1c130d";
      ctx.lineWidth = 1.5;
      if (dying) {
        for (const e of [eyeL, eyeR]) {
          ctx.beginPath();
          ctx.moveTo(e.x - 2.5, e.y - 2.5);
          ctx.lineTo(e.x + 2.5, e.y + 2.5);
          ctx.moveTo(e.x + 2.5, e.y - 2.5);
          ctx.lineTo(e.x - 2.5, e.y + 2.5);
          ctx.stroke();
        }
      } else if (w.blinkT > 0) {
        for (const e of [eyeL, eyeR]) {
          ctx.beginPath();
          ctx.moveTo(e.x - 2, e.y);
          ctx.lineTo(e.x + 2, e.y);
          ctx.stroke();
        }
      } else {
        for (const e of [eyeL, eyeR]) {
          if (panic) {
            ctx.fillStyle = "#fffdf9";
            ctx.beginPath();
            ctx.arc(e.x, e.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1c130d";
          }
          ctx.beginPath();
          ctx.arc(e.x, e.y, panic ? 1.6 : 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (age >= 40) {
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(eyeL.x, eyeL.y, 4.4, 0, Math.PI * 2);
        ctx.moveTo(eyeR.x + 4.4, eyeR.y);
        ctx.arc(eyeR.x, eyeR.y, 4.4, 0, Math.PI * 2);
        ctx.moveTo(eyeL.x + 4.4, eyeL.y);
        ctx.lineTo(eyeR.x - 4.4, eyeR.y);
        ctx.stroke();
      }
      if (age >= 60) {
        ctx.strokeStyle = "#8a7a6c";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(eyeL.x - 3, eyeL.y - 6);
        ctx.lineTo(eyeL.x + 2, eyeL.y - 7);
        ctx.moveTo(eyeR.x - 2, eyeR.y - 7);
        ctx.lineTo(eyeR.x + 3, eyeR.y - 6);
        ctx.stroke();
      }
      if (age >= 80) {
        ctx.fillStyle = "#1f5c3d";
        ctx.strokeStyle = "#1c130d";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-9, -14.5, 19, 5, 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(-13, -11, 9, 3, 1.5);
        ctx.fill();
        ctx.stroke();
      }
    };

    const draw = () => {
      const w = world.current;
      const sprites = spritesRef.current;
      if (!sprites) return;
      const floor = LIFELINE.height - LIFELINE.groundHeight;
      const age = Math.floor(ageAt(w.t, w.bonus));
      const dying = phaseRef.current === "dying" || phaseRef.current === "dead";

      ctx.save();
      if (phaseRef.current === "dying" && w.deathT < 0.28) {
        ctx.translate((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7);
      }

      ctx.fillStyle = "#fbf4ec";
      ctx.fillRect(-8, -8, LIFELINE.width + 16, LIFELINE.height + 16);
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
            ctx.fillRect(
              c.x - halfW + 2,
              bottom + (floor - bottom) / 2 - 14,
              halfW * 2 - 4,
              28,
            );
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
        ctx.drawImage(sprite, c.x - sprite.width / 2, top - sprite.height - 4);
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

      /* Daily ghost: your best run today, racing you at 30Hz. */
      if (phaseRef.current === "playing" && ghostRef.current) {
        const gi = Math.floor(w.t * 30);
        if (gi < ghostRef.current.length) {
          ctx.globalAlpha = 0.3;
          ctx.drawImage(
            sprites.heartDown,
            LIFELINE.playerX - sprites.heartDown.width / 2,
            ghostRef.current[gi] - sprites.heartDown.height / 2,
          );
          ctx.globalAlpha = 1;
        }
      }

      /* ECG trace; on death it flatlines and sweeps across the monitor. */
      const traceY = dying ? w.deathY : w.y + 4;
      ctx.strokeStyle = "#c63d08";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, traceY);
      ctx.lineTo(
        dying
          ? Math.min(LIFELINE.width, LIFELINE.playerX + w.deathT * 700)
          : LIFELINE.playerX - 14,
        traceY,
      );
      ctx.stroke();

      const suffix =
        skinRef.current === "gold" ? "Gold" : skinRef.current === "chalk" ? "Chalk" : "";
      const heart = w.wingT > 0 ? sprites[`heartUp${suffix}`] : sprites[`heartDown${suffix}`];
      ctx.save();
      ctx.translate(LIFELINE.playerX, w.y);
      ctx.rotate(
        dying
          ? w.spin
          : Math.max(-0.45, Math.min(0.9, (w.vy / LIFELINE.terminalFall) * 1.1)),
      );
      // A beat, not a flap: the whole heart pops uniformly on each pump.
      const pop = w.squashT * 1.3;
      ctx.scale(1 + pop, 1 + pop);
      ctx.drawImage(heart, -heart.width / 2, -heart.height / 2);
      drawFace(age, dying);
      ctx.restore();
      if (!dying && (w.shield || w.invulnT > 0)) {
        ctx.strokeStyle = "#1f5c3d";
        ctx.lineWidth = 2;
        ctx.setLineDash(w.invulnT > 0 ? [4, 4] : []);
        ctx.beginPath();
        ctx.arc(LIFELINE.playerX, w.y, 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (w.slowT > 0) {
        ctx.fillStyle = "rgba(198, 61, 8, 0.06)";
        ctx.fillRect(0, 0, LIFELINE.width, LIFELINE.height);
      }

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
      if (w.bigToast && phaseRef.current === "playing") {
        ctx.globalAlpha = Math.min(1, w.bigToast.ttl * 1.6);
        ctx.fillStyle = "#1c130d";
        ctx.font = "bold 30px monospace";
        ctx.textAlign = "center";
        ctx.fillText(w.bigToast.text, LIFELINE.width / 2, 150);
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
      else if (phaseRef.current === "dying") stepDying(dt);
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
    if (current === "dying") return;
    if (
      current === "dead" &&
      performance.now() - deadAtRef.current < RESTART_GUARD_MS
    ) {
      return;
    }
    if (!synthRef.current && typeof AudioContext !== "undefined") {
      try {
        synthRef.current = { ctx: new AudioContext(), muted };
      } catch {
        /* no audio — the game plays silent */
      }
    }
    if (current === "dead" || current === "ready") {
      const ch = challengeRef.current;
      world.current = freshWorld(ch ? ch.seed : dailySeed(todayISO()));
      ghostRef.current = null;
      if (!ch) {
        try {
          const raw = localStorage.getItem(GHOST_KEY_PREFIX + todayISO());
          if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (
              Array.isArray(parsed) &&
              parsed.every((n): n is number => typeof n === "number")
            ) {
              ghostRef.current = parsed;
            }
          }
        } catch {
          /* no ghost today */
        }
      }
      trackEvent({
        name: "lifeline_run_started",
        params: { mode: "daily" },
      });
      setPhaseBoth("playing");
    } else if (current === "paused") {
      setPhaseBoth("playing");
    }
    const w = world.current;
    w.vy = LIFELINE.flapImpulse;
    w.wingT = 0.18;
    w.squashT = 0.1;
    // A low thump per pump — the tap sound is itself a heartbeat.
    beep(synthRef.current, 150, 55, "sine", 0.06);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flap reads refs only
  }, []);

  const medal = medalFor(finalAge);
  /* Render-scope copy of the daily modifier (same pure expression as
     modifierRef — refs must not be read during render). */
  const todaysModifier = MODIFIERS[dailySeed(todayISO()) % MODIFIERS.length];
  const puzzleNo = dailyPuzzleNumber(todayISO());
  const fact = FACTS[finalAge % FACTS.length];

  const shareText = challenge
    ? `Lifeline · flatlined at ${finalAge} · cause: ${causeLabel}`
    : `Lifeline #${puzzleNo} · flatlined at ${finalAge} · cause: ${causeLabel}`;
  const share = () => {
    try {
      // The same URL replays the course AND unfurls as the score card
      // (the page's generateMetadata reads these params).
      const url =
        window.location.origin +
        lifelineSharePath({ seed: finalSeed, beat: finalAge, cause: causeId });
      void navigator.clipboard.writeText(`${shareText} · beat me: ${url}`);
      setCopied(true);
    } catch {
      /* clipboard unavailable — button just doesn't confirm */
    }
  };

  /* Screenshot-grade PNG of the death card — the card markets the game. */
  const saveCard = () => {
    const sprites = spritesRef.current;
    const card = document.createElement("canvas");
    card.width = 1080;
    card.height = 1080;
    const cctx = card.getContext("2d");
    if (!cctx) return;
    cctx.imageSmoothingEnabled = false;
    cctx.fillStyle = "#fbf4ec";
    cctx.fillRect(0, 0, 1080, 1080);
    cctx.strokeStyle = "#1c130d";
    cctx.lineWidth = 14;
    cctx.strokeRect(24, 24, 1032, 1032);
    const anton = getComputedStyle(document.documentElement)
      .getPropertyValue("--font-anton")
      .trim();
    const display = anton ? `${anton}, monospace` : "monospace";
    cctx.textAlign = "center";
    cctx.fillStyle = "#1c130d";
    cctx.font = "bold 44px monospace";
    cctx.fillText("LIFELINE", 540, 120);
    if (sprites) {
      const h = sprites.heartDown;
      cctx.drawImage(h, 540 - h.width * 4, 160, h.width * 8, h.height * 8);
    }
    cctx.fillStyle = "#c63d08";
    cctx.font = "bold 36px monospace";
    cctx.fillText(
      challenge ? "FLATLINED AT" : `DAILY #${puzzleNo} · FLATLINED AT`,
      540,
      430,
    );
    cctx.fillStyle = "#ff531a";
    cctx.font = `400 320px ${display}`;
    cctx.fillText(String(finalAge), 540, 740);
    cctx.fillStyle = "#1c130d";
    cctx.font = "bold 28px monospace";
    cctx.fillText(cause.toUpperCase().slice(0, 56), 540, 850);
    if (medal !== "none") {
      cctx.fillStyle = "#1f5c3d";
      cctx.font = "bold 30px monospace";
      cctx.fillText(MEDAL_STYLE[medal].label, 540, 920);
    }
    cctx.fillStyle = "#6e5b4d";
    cctx.font = "bold 24px monospace";
    cctx.fillText("FITTOOLS · EVERY FORMULA CITED", 540, 1000);
    card.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `lifeline-${finalAge}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[420px] select-none"
      onPointerDown={(e) => {
        // Any tap on the game frame flaps/starts — except real controls.
        const target = e.target;
        if (target instanceof HTMLElement && target.closest("button, a")) return;
        e.preventDefault();
        flap();
      }}
    >
      <canvas
        ref={canvasRef}
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          <p className="font-display text-4xl uppercase">Lifeline</p>
          <p className="max-w-[16rem] font-mono text-xs font-bold uppercase tracking-[0.12em]">
            Every tap is a heartbeat. Dodge the risk factors. Grow old.
          </p>
          {challenge ? (
            <p className="rounded-full border-2 border-foreground bg-warning-bg px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
              Challenge · beat {challenge.beat} on their course
            </p>
          ) : null}
          <p className="max-w-[17rem] font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {challenge
              ? "Their course, your heart"
              : `Daily #${puzzleNo} · ${todaysModifier.label.toLowerCase()}`}
          </p>
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
            {dailyBest > 0
              ? `Best today: ${dailyBest}`
              : "Same course for everyone today"}
            {best > 0 ? ` · all-time: ${best}` : ""}
          </p>
          <div className="flex gap-2">
            {SKINS.map((s) => {
              const unlocked = skins.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!unlocked}
                  title={s.hint}
                  onClick={() => {
                    skinRef.current = s.id;
                    setSkinState(s.id);
                    try {
                      localStorage.setItem(SKIN_KEY, s.id);
                    } catch {
                      /* fine */
                    }
                  }}
                  className={`rounded-full border-2 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                    skin === s.id
                      ? "border-foreground bg-foreground text-background"
                      : unlocked
                        ? "border-foreground bg-surface"
                        : "border-border bg-surface text-muted opacity-60"
                  }`}
                >
                  {s.label}
                  {unlocked ? "" : " · locked"}
                </button>
              );
            })}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Tap anywhere to start
          </p>
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
              {challenge ? "Flatlined at" : `Daily #${puzzleNo} · flatlined at`}
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
              {challenge ? (
                finalAge > challenge.beat ? (
                  <span className="sticker-slap inline-block rotate-2 rounded-full border-2 border-good bg-good-soft px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-good">
                    Challenge beaten ✓
                  </span>
                ) : (
                  <span className="inline-block rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    Target: {challenge.beat} — still standing
                  </span>
                )
              ) : null}
              {newSkin ? (
                <span className="sticker-slap inline-block -rotate-2 rounded-full border-2 border-foreground bg-warning-bg px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
                  Skin unlocked: {newSkin}
                </span>
              ) : null}
            </div>
            {lastRuns.length > 1 ? (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Last lives: {lastRuns.join(" · ")}
              </p>
            ) : null}
            <p className="mt-3 border-t border-dashed border-border pt-3 text-xs text-muted">
              {fact.text}{" "}
              <Link
                href={fact.href}
                className="font-semibold text-primary underline underline-offset-2 hover:text-foreground"
              >
                {fact.label} →
              </Link>
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={flap}
                className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 text-sm font-bold text-background"
              >
                Go again
              </button>
              <button
                type="button"
                onClick={share}
                className="riso-press rounded-full border-2 border-foreground bg-good px-5 py-2 text-sm font-bold text-background"
              >
                {copied ? "Copied ✓" : "Challenge a mate"}
              </button>
              <button
                type="button"
                onClick={saveCard}
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Save card
              </button>
              <Link
                href="/heart-age-calculator"
                className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 text-sm font-bold"
              >
                Real heart age →
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
