import { describe, expect, it } from "vitest";
import {
  REACTION,
  averageMs,
  delayFor,
  formatMs,
  reactionBlocks,
  reactionShareText,
  reactionTier,
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
    expect(text).toContain("🟩🟩🟩🟩🟩");
    expect(text).toContain("Blink");
  });
});
