import { describe, expect, it } from "vitest";
import {
  STEADY,
  WIRE,
  formatSeconds,
  isSparking,
  nearestOnWire,
  steadyShareText,
  steadyTier,
  wireLength,
  wirePointAt,
} from "@/lib/lab/steady";

describe("the wire (PERFORMANCE-LAB.md §4.4)", () => {
  it("stays inside the arena with corridor room to spare", () => {
    const clearance = STEADY.corridor / 2 + 4;
    for (const p of WIRE) {
      expect(p.x).toBeGreaterThanOrEqual(clearance);
      expect(p.x).toBeLessThanOrEqual(STEADY.width - clearance);
      expect(p.y).toBeGreaterThanOrEqual(clearance);
      expect(p.y).toBeLessThanOrEqual(STEADY.height - clearance);
    }
  });

  it("is long enough to mean it", () => {
    expect(wireLength()).toBeGreaterThan(1000);
  });

  it("projects points onto the centre line exactly", () => {
    /* On the wire's first segment: zero distance, early t. */
    const on = nearestOnWire(200, 420);
    expect(on.distance).toBeCloseTo(0);
    expect(on.t).toBeGreaterThan(0);
    expect(on.t).toBeLessThan(0.2);
    /* Just off the same spot: distance is the offset. */
    expect(nearestOnWire(200, 440).distance).toBeCloseTo(20);
    /* Start and end resolve to the extremes. */
    expect(nearestOnWire(WIRE[0].x, WIRE[0].y).t).toBeCloseTo(0);
    expect(
      nearestOnWire(WIRE[WIRE.length - 1].x, WIRE[WIRE.length - 1].y).t,
    ).toBeCloseTo(1);
  });

  it("walks the wire coherently: wirePointAt inverts nearestOnWire", () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const p = wirePointAt(t);
      const fix = nearestOnWire(p.x, p.y);
      expect(fix.distance).toBeCloseTo(0, 5);
      expect(fix.t).toBeCloseTo(t, 2);
    }
  });

  it("sparks past half the corridor, not inside it", () => {
    expect(isSparking(STEADY.corridor / 2 - 1)).toBe(false);
    expect(isSparking(STEADY.corridor / 2 + 1)).toBe(true);
  });

  it("the corridor is thumb-sized at phone scaling — no touch-hostile squeeze", () => {
    expect(STEADY.corridor * 0.93).toBeGreaterThanOrEqual(44);
  });
});

describe("the steadiness ladder", () => {
  it("runs SURGEON → JACKHAMMER on sparks, unrated until complete", () => {
    expect(steadyTier(0, true).name).toBe("SURGEON");
    expect(steadyTier(2, true).name).toBe("STEADY EDDIE");
    expect(steadyTier(4, true).name).toBe("HUMAN");
    expect(steadyTier(7, true).name).toBe("JITTERBUG");
    expect(steadyTier(12, true).name).toBe("ESPRESSO OVERDOSE");
    expect(steadyTier(20, true).name).toBe("JACKHAMMER");
    expect(steadyTier(0, false).name).toBe("UNRATED");
    for (let sparks = 0; sparks <= 30; sparks++) {
      expect(steadyTier(sparks, true).blurb.length).toBeGreaterThan(4);
    }
  });
});

describe("the share block", () => {
  it("carries sparks, time, tier and the kicker", () => {
    const text = steadyShareText(2, 41200);
    expect(text).toContain("THE LAB · STEADY");
    expect(text).toContain("2 sparks");
    expect(text).toContain("41.2 s");
    expect(text).toContain("STEADY EDDIE");
    expect(text).toContain("The wire always knows.");
    expect(steadyShareText(1, 30000)).toContain("1 spark ·");
    expect(formatSeconds(30000)).toBe("30.0 s");
  });
});
