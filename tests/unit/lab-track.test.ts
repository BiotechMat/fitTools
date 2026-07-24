import { describe, expect, it } from "vitest";
import {
  TRACK,
  accuracyFor,
  averageHitMs,
  positionFor,
  radiusFor,
  trackShareText,
  trackTier,
} from "@/lib/lab/track";
import { mulberry32 } from "@/lib/lifeline";

describe("the targets (PERFORMANCE-LAB.md §4.6)", () => {
  it("shrink across the run and floor at the touch-safe minimum", () => {
    expect(radiusFor(0)).toBe(TRACK.startRadius);
    expect(radiusFor(TRACK.targets - 1)).toBe(TRACK.minRadius);
    for (let i = 1; i < TRACK.targets; i++) {
      expect(radiusFor(i)).toBeLessThanOrEqual(radiusFor(i - 1));
    }
    /* Two logical px shy of the 44px touch target, drawn with a ring —
       the tappable button is the full diameter. */
    expect(TRACK.minRadius * 2).toBeGreaterThanOrEqual(36);
  });

  it("spawn inside the margins and always demand real hand travel", () => {
    const rng = mulberry32(17);
    let prev = positionFor(rng, null);
    for (let i = 0; i < 300; i++) {
      const next = positionFor(rng, prev);
      expect(next.x).toBeGreaterThanOrEqual(TRACK.margin);
      expect(next.x).toBeLessThanOrEqual(TRACK.width - TRACK.margin);
      expect(next.y).toBeGreaterThanOrEqual(TRACK.margin);
      expect(next.y).toBeLessThanOrEqual(TRACK.height - TRACK.margin);
      expect(Math.hypot(next.x - prev.x, next.y - prev.y)).toBeGreaterThanOrEqual(
        TRACK.minJump,
      );
      prev = next;
    }
  });
});

describe("the score", () => {
  it("averages hit times to whole ms", () => {
    expect(averageHitMs([400, 420, 440])).toBe(420);
    expect(averageHitMs([])).toBe(0);
  });

  it("computes accuracy as hits over taps", () => {
    expect(accuracyFor(25, 0)).toBe(1);
    expect(accuracyFor(25, 25)).toBe(0.5);
    expect(accuracyFor(0, 0)).toBe(0);
  });
});

describe("the tier ladder", () => {
  it("caps spray-and-pray at Stormtrooper no matter the speed", () => {
    expect(trackTier(300, 0.5).name).toBe("STORMTROOPER");
    expect(trackTier(300, 0.9).name).toBe("AIMBOT");
  });

  it("sorts clean runs by speed, Aimbot → Butter Fingers", () => {
    expect(trackTier(320, 1).name).toBe("AIMBOT");
    expect(trackTier(400, 1).name).toBe("SNIPER");
    expect(trackTier(500, 1).name).toBe("SHARPSHOOTER");
    expect(trackTier(600, 1).name).toBe("HUMAN");
    expect(trackTier(700, 1).name).toBe("CASUAL");
    expect(trackTier(1000, 1).name).toBe("BUTTER FINGERS");
  });

  it("has a blurb at every speed", () => {
    for (let avg = 100; avg <= 1500; avg += 50) {
      expect(trackTier(avg, 1).blurb.length).toBeGreaterThan(4);
    }
  });
});

describe("the share block", () => {
  it("carries speed, accuracy, tier and the kicker", () => {
    const text = trackShareText(2, 412);
    expect(text).toContain("THE LAB · TRACK");
    expect(text).toContain("412 ms");
    expect(text).toContain("93%"); // 25 hits, 2 strays
    expect(text).toContain("SNIPER");
    expect(text).toContain("Every stray tap counts.");
  });
});
