import { describe, expect, it } from "vitest";
import {
  REACTION,
  REACTION_TIERS,
  averageMs,
  delayFor,
  formatMs,
  reactionBlocks,
  reactionPercentile,
  reactionShareText,
  reactionTier,
  reactionTierRange,
} from "@/lib/lab/reaction";
import { mulberry32 } from "@/lib/lifeline";

describe("the wait (PERFORMANCE-LAB.md §4.1)", () => {
  it("stays inside the armed band, long enough to punish guessing", () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const delay = delayFor(rng);
      expect(delay).toBeGreaterThanOrEqual(REACTION.minDelayMs);
      expect(delay).toBeLessThanOrEqual(REACTION.maxDelayMs);
    }
    expect(REACTION.minDelayMs).toBeGreaterThanOrEqual(1000);
  });
});

describe("the score", () => {
  it("averages the scored taps to whole ms", () => {
    expect(averageMs([200, 220, 240, 260, 280])).toBe(240);
    expect(averageMs([231])).toBe(231);
    expect(averageMs([200.4, 200.4, 200.4])).toBe(200);
    expect(averageMs([])).toBe(0);
  });

  it("formats whole ms with the unit", () => {
    expect(formatMs(231)).toBe("231 ms");
    expect(formatMs(230.6)).toBe("231 ms");
    expect(formatMs(1042)).toBe("1,042 ms");
  });
});

describe("the tier ladder", () => {
  it("runs LIGHTNING → PING 999 as the average slows", () => {
    expect(reactionTier(150).name).toBe("LIGHTNING");
    expect(reactionTier(210).name).toBe("LOCKED IN");
    expect(reactionTier(250).name).toBe("CAFFEINATED");
    expect(reactionTier(300).name).toBe("HUMAN");
    expect(reactionTier(350).name).toBe("NPC");
    expect(reactionTier(420).name).toBe("BUFFERING");
    expect(reactionTier(600).name).toBe("PING 999");
  });

  it("has no gaps: every positive average lands a named tier with a blurb", () => {
    for (let avg = 1; avg <= 1200; avg += 7) {
      const tier = reactionTier(avg);
      expect(tier.name).not.toBe("UNRATED");
      expect(tier.blurb.length).toBeGreaterThan(4);
    }
    expect(reactionTier(0).name).toBe("UNRATED");
  });

  it("the table and the function can never disagree, and ranges tile the axis", () => {
    for (let i = 0; i < REACTION_TIERS.length; i++) {
      const band = REACTION_TIERS[i];
      const floor = i === 0 ? 1 : REACTION_TIERS[i - 1].max;
      expect(reactionTier(floor).name).toBe(band.name);
      if (band.max !== Infinity) {
        expect(reactionTier(band.max - 1).name).toBe(band.name);
      }
      expect(reactionTierRange(i).length).toBeGreaterThan(4);
    }
    expect(reactionTierRange(0)).toBe("under 190 ms");
    expect(reactionTierRange(REACTION_TIERS.length - 1)).toBe("450 ms and up");
  });
});

describe("the placeholder percentile (public-benchmark anchors)", () => {
  it("pins the Human Benchmark median and stays monotonic", () => {
    expect(reactionPercentile(273)).toBe(50); // the published median
    for (let avg = 60; avg < 1000; avg += 5) {
      expect(reactionPercentile(avg)).toBeGreaterThanOrEqual(
        reactionPercentile(avg + 5),
      );
    }
  });

  it("clamps to a 1–99 band and zeroes a missing score", () => {
    expect(reactionPercentile(1)).toBe(99);
    expect(reactionPercentile(5000)).toBe(1);
    expect(reactionPercentile(0)).toBe(0);
    for (let avg = 60; avg < 1500; avg += 13) {
      const pct = reactionPercentile(avg);
      expect(pct).toBeGreaterThanOrEqual(1);
      expect(pct).toBeLessThanOrEqual(99);
    }
  });

  it("lands the corroborated public anchors", () => {
    expect(reactionPercentile(200)).toBe(88);
    expect(reactionPercentile(400)).toBe(10);
  });
});

describe("the share block", () => {
  it("maps each tap to a block by speed", () => {
    expect(reactionBlocks([210, 300, 400])).toBe("🟩🟨🟥");
    expect(reactionBlocks([259, 260, 349, 350])).toBe("🟩🟨🟨🟥");
    expect(reactionBlocks([])).toBe("");
  });

  it("carries the average, the tier, the grid and the kicker", () => {
    const text = reactionShareText(225, [215, 220, 225, 230, 235]);
    expect(text).toContain("THE LAB · REACTION");
    expect(text).toContain("225 ms");
    expect(text).toContain("LOCKED IN");
    expect(text).toMatch(/Faster than \d+% of people/);
    expect(text).toContain("🟩🟩🟩🟩🟩");
    expect(text).toContain("Blink");
  });
});
