import { describe, expect, it } from "vitest";
import {
  BOARD_RADIUS,
  MAX_POINTS,
  TRACK,
  averageHitMs,
  pointsRatio,
  positionFor,
  ringPointsFor,
  trackShareText,
  trackTier,
} from "@/lib/lab/track";
import { mulberry32 } from "@/lib/lifeline";

describe("the range (PERFORMANCE-LAB.md §4.6 — v2, ring-scored)", () => {
  it("rings are concentric, descending in points, bullseye innermost", () => {
    for (let i = 1; i < TRACK.rings.length; i++) {
      expect(TRACK.rings[i].radius).toBeGreaterThan(TRACK.rings[i - 1].radius);
      expect(TRACK.rings[i].points).toBeLessThan(TRACK.rings[i - 1].points);
    }
    expect(BOARD_RADIUS).toBe(TRACK.rings[TRACK.rings.length - 1].radius);
    expect(MAX_POINTS).toBe(TRACK.targets * TRACK.rings[0].points);
  });

  it("the board is generous — no touch-hostile shrinking anywhere", () => {
    /* The full board is fixed-size across the run and comfortably bigger
       than a 44 px touch circle at phone scaling (logical 420 ≈ 390 CSS). */
    expect(BOARD_RADIUS * 2 * 0.93).toBeGreaterThanOrEqual(44);
  });

  it("scores every arrow by ring, wide arrows nought — but never a miss", () => {
    expect(ringPointsFor(0)).toBe(10);
    expect(ringPointsFor(12)).toBe(10);
    expect(ringPointsFor(12.1)).toBe(7);
    expect(ringPointsFor(26)).toBe(7);
    expect(ringPointsFor(40)).toBe(4);
    expect(ringPointsFor(44)).toBe(4);
    expect(ringPointsFor(45)).toBe(0);
    expect(ringPointsFor(999)).toBe(0);
  });

  it("ratio clamps 0..1 for the tier gate", () => {
    expect(pointsRatio(0)).toBe(0);
    expect(pointsRatio(MAX_POINTS)).toBe(1);
    expect(pointsRatio(MAX_POINTS / 2)).toBeCloseTo(0.5);
    expect(pointsRatio(9999)).toBe(1);
  });

  it("boards spawn inside the margins and always demand real hand travel", () => {
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
  it("averages arrow times to whole ms", () => {
    expect(averageHitMs([400, 420, 440])).toBe(420);
    expect(averageHitMs([])).toBe(0);
  });
});

describe("the tier ladder", () => {
  it("caps wide spraying at Stormtrooper no matter the speed", () => {
    expect(trackTier(300, 0.5).name).toBe("STORMTROOPER");
    expect(trackTier(300, 0.9).name).toBe("AIMBOT");
  });

  it("sorts grouped runs by speed, Aimbot → Butter Fingers", () => {
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
  it("carries points, speed, tier and the kicker", () => {
    const text = trackShareText(236, 412);
    expect(text).toContain("THE LAB · TRACK");
    expect(text).toContain("236/250");
    expect(text).toContain("412 ms");
    expect(text).toContain("SNIPER");
    expect(text).toContain("Grouping tells the truth.");
  });
});
