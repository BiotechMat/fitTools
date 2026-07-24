/**
 * Tiny WebAudio synth for the Lab stations — the Max Out pattern, shared.
 * Created on first input only (no autoplay, ever), muted state persisted
 * under one Lab-wide key. Every station works fine in silence.
 */

export const LAB_MUTE_KEY = "fittools.lab.muted";

export interface LabSynth {
  ctx: AudioContext;
  muted: boolean;
}

export function createLabSynth(muted: boolean): LabSynth | null {
  if (typeof AudioContext === "undefined") return null;
  try {
    return { ctx: new AudioContext(), muted };
  } catch {
    return null; // no audio — the station runs silent
  }
}

export function labBeep(
  synth: LabSynth | null,
  freq: number,
  ms: number,
  type: OscillatorType = "square",
  gain = 0.045,
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

/**
 * Micro-haptics for registered inputs — a tap should feel like it landed.
 * Android Chrome vibrates; iOS Safari has no vibrate API and no-ops.
 * Haptics are silent, so they run regardless of the sound mute.
 */
export function labVibrate(pattern: number | number[]): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* blocked by permissions policy — fine */
    }
  }
}

export function readLabMuted(): boolean {
  try {
    return localStorage.getItem(LAB_MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeLabMuted(muted: boolean): void {
  try {
    localStorage.setItem(LAB_MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* private mode — mute lives for the session */
  }
}
