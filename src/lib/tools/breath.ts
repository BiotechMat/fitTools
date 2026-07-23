/**
 * Breath coach cycle maths (MICROTOOLS.md §3) — pure and unit-tested.
 * Patterns are standard paced-breathing protocols stated plainly; the tool
 * makes no therapeutic claims (citations live in the recovery cluster).
 */

export interface BreathPhase {
  name: "Breathe in" | "Hold" | "Breathe out";
  seconds: number;
  /** Orb target: 1 = fully expanded, 0 = fully contracted. */
  orb: 0 | 1;
}

export interface BreathPattern {
  id: "box" | "478" | "coherent";
  name: string;
  description: string;
  phases: BreathPhase[];
}

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: "box",
    name: "Box 4-4-4-4",
    description: "In, hold, out, hold — four counts each. The steady classic.",
    phases: [
      { name: "Breathe in", seconds: 4, orb: 1 },
      { name: "Hold", seconds: 4, orb: 1 },
      { name: "Breathe out", seconds: 4, orb: 0 },
      { name: "Hold", seconds: 4, orb: 0 },
    ],
  },
  {
    id: "478",
    name: "4-7-8",
    description: "In for 4, hold for 7, out for 8. A long, slowing exhale.",
    phases: [
      { name: "Breathe in", seconds: 4, orb: 1 },
      { name: "Hold", seconds: 7, orb: 1 },
      { name: "Breathe out", seconds: 8, orb: 0 },
    ],
  },
  {
    id: "coherent",
    name: "Coherent 5.5",
    description: "Even 5.5s in, 5.5s out — about five and a half breaths a minute.",
    phases: [
      { name: "Breathe in", seconds: 5.5, orb: 1 },
      { name: "Breathe out", seconds: 5.5, orb: 0 },
    ],
  },
];

export function cycleSeconds(pattern: BreathPattern): number {
  return pattern.phases.reduce((sum, phase) => sum + phase.seconds, 0);
}

export interface BreathState {
  phase: BreathPhase;
  phaseIndex: number;
  /** 0..1 progress through the current phase. */
  phaseProgress: number;
  /** Completed full cycles so far. */
  cycles: number;
}

export function breathStateAt(pattern: BreathPattern, elapsedMs: number): BreathState {
  const cycle = cycleSeconds(pattern);
  const elapsed = Math.max(0, elapsedMs / 1000);
  const cycles = Math.floor(elapsed / cycle);
  let inCycle = elapsed - cycles * cycle;
  for (let i = 0; i < pattern.phases.length; i++) {
    const phase = pattern.phases[i];
    if (inCycle < phase.seconds) {
      return {
        phase,
        phaseIndex: i,
        phaseProgress: inCycle / phase.seconds,
        cycles,
      };
    }
    inCycle -= phase.seconds;
  }
  const last = pattern.phases[pattern.phases.length - 1];
  return { phase: last, phaseIndex: pattern.phases.length - 1, phaseProgress: 1, cycles };
}

/** Orb scale for the current moment: eases between contracted and expanded. */
export function orbScaleAt(pattern: BreathPattern, elapsedMs: number): number {
  const { phase, phaseIndex, phaseProgress } = breathStateAt(pattern, elapsedMs);
  const MIN = 0.55;
  const prev =
    pattern.phases[(phaseIndex - 1 + pattern.phases.length) % pattern.phases.length];
  const from = prev.orb === 1 ? 1 : MIN;
  const to = phase.orb === 1 ? 1 : MIN;
  if (phase.name === "Hold") return to;
  const eased = 0.5 - Math.cos(Math.PI * phaseProgress) / 2;
  return from + (to - from) * eased;
}
