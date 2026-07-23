import { describe, expect, it } from "vitest";
import {
  BREATH_PATTERNS,
  breathStateAt,
  cycleSeconds,
  orbScaleAt,
} from "@/lib/tools/breath";

const box = BREATH_PATTERNS[0];
const four78 = BREATH_PATTERNS[1];

describe("breath cycles (MICROTOOLS.md §3)", () => {
  it("cycle lengths match their patterns", () => {
    expect(cycleSeconds(box)).toBe(16);
    expect(cycleSeconds(four78)).toBe(19);
  });

  it("walks box phases in order and counts cycles", () => {
    expect(breathStateAt(box, 0).phase.name).toBe("Breathe in");
    expect(breathStateAt(box, 5_000).phase.name).toBe("Hold");
    expect(breathStateAt(box, 9_000).phase.name).toBe("Breathe out");
    expect(breathStateAt(box, 13_000).phase.name).toBe("Hold");
    const secondCycle = breathStateAt(box, 17_000);
    expect(secondCycle.phase.name).toBe("Breathe in");
    expect(secondCycle.cycles).toBe(1);
  });

  it("orb expands on the inhale, holds steady, and contracts on the exhale", () => {
    expect(orbScaleAt(box, 0)).toBeCloseTo(0.55, 2);
    expect(orbScaleAt(box, 4_000)).toBe(1);
    expect(orbScaleAt(box, 6_000)).toBe(1);
    const midExhale = orbScaleAt(box, 10_000);
    expect(midExhale).toBeGreaterThan(0.55);
    expect(midExhale).toBeLessThan(1);
    expect(orbScaleAt(box, 13_000)).toBe(0.55);
  });
});
