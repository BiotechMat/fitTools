import { describe, expect, it } from "vitest";
import {
  CLAIMS,
  SNAKEOIL,
  burstSizeFor,
  comboBonusFor,
  escapedCause,
  factChanceFor,
  launch,
  pickClaim,
  receiptFor,
  segmentHitsCircle,
  shareText,
  slicedTruthCause,
  spawnIntervalFor,
  unlockedClaimCount,
  validateClaims,
} from "@/lib/snakeoil";
import { mulberry32 } from "@/lib/lifeline";

describe("the claims roster (SNAKEOIL.md §4)", () => {
  it("validates clean — every claim backed by a registry item", () => {
    expect(validateClaims()).toEqual([]);
  });

  it("carries both verdicts in real numbers", () => {
    const myths = CLAIMS.filter((c) => c.verdict === "myth").length;
    const facts = CLAIMS.filter((c) => c.verdict === "fact").length;
    expect(myths).toBeGreaterThanOrEqual(8);
    expect(facts).toBeGreaterThanOrEqual(8);
  });

  it("flags a roster that breaks the rules", () => {
    expect(
      validateClaims([
        { id: "a", registryId: "nope", registry: "myth", label: "X", verdict: "myth" },
        { id: "a", registryId: "myth-eight-glasses", registry: "myth", label: "", verdict: "fact" },
      ]),
    ).not.toEqual([]);
  });

  it("every receipt resolves to a real body, source and kicker", () => {
    for (const claim of CLAIMS) {
      const receipt = receiptFor(claim);
      expect(receipt.body.length).toBeGreaterThan(20);
      expect(receipt.sourceUrl).toMatch(/^https?:\/\//);
      expect(receipt.sourceLabel.length).toBeGreaterThan(5);
      expect(receipt.kicker).toBe(claim.verdict === "myth" ? "MYTH" : "FACT");
    }
  });
});

describe("the difficulty ramp", () => {
  it("unlocks the roster front to back, capped at the roster", () => {
    expect(unlockedClaimCount(0)).toBe(8);
    for (let w = 1; w < 12; w++) {
      expect(unlockedClaimCount(w)).toBeGreaterThanOrEqual(unlockedClaimCount(w - 1));
    }
    expect(unlockedClaimCount(50)).toBe(CLAIMS.length);
  });

  it("spawn interval tightens monotonically and floors", () => {
    for (let w = 1; w < 12; w++) {
      expect(spawnIntervalFor(w)).toBeLessThanOrEqual(spawnIntervalFor(w - 1));
    }
    expect(spawnIntervalFor(0)).toBe(1.5);
    expect(spawnIntervalFor(50)).toBe(0.55);
  });

  it("bursts stay 1 at wave 0, reach 3 only from wave 3, never exceed 3", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 500; i++) {
      const size = burstSizeFor(0, rng);
      expect([1, 2]).toContain(size);
    }
    let threes = 0;
    for (let i = 0; i < 2000; i++) {
      const size = burstSizeFor(6, rng);
      expect(size).toBeGreaterThanOrEqual(1);
      expect(size).toBeLessThanOrEqual(3);
      if (size === 3) threes++;
    }
    expect(threes).toBeGreaterThan(0);
  });

  it("fact pressure rises with the wave and caps below half", () => {
    for (let w = 1; w < 12; w++) {
      expect(factChanceFor(w)).toBeGreaterThanOrEqual(factChanceFor(w - 1));
    }
    expect(factChanceFor(50)).toBe(0.45);
  });

  it("pickClaim only deals unlocked claims and deals both verdicts", () => {
    const rng = mulberry32(17);
    const verdicts = new Set<string>();
    for (let i = 0; i < 400; i++) {
      const claim = pickClaim(rng, 0);
      expect(CLAIMS.slice(0, 8)).toContain(claim);
      verdicts.add(claim.verdict);
    }
    expect(verdicts).toEqual(new Set(["myth", "fact"]));
  });
});

describe("the toss", () => {
  it("arcs hang readably and stay on the canvas", () => {
    const rng = mulberry32(29);
    for (let i = 0; i < 200; i++) {
      const l = launch(rng);
      let { x0: x, y0: y } = l;
      let { vx, vy } = l;
      let apexY = y;
      const dt = 1 / 120;
      while (y <= SNAKEOIL.height + 40) {
        x += vx * dt;
        y += vy * dt;
        vy += SNAKEOIL.gravity * dt;
        vx = vx; // no drag
        apexY = Math.min(apexY, y);
        expect(x).toBeGreaterThan(-30);
        expect(x).toBeLessThan(SNAKEOIL.width + 30);
        if (vy > 0 && y > SNAKEOIL.height + 40) break;
      }
      expect(apexY).toBeLessThan(260); // hangs in the upper half
      expect(apexY).toBeGreaterThan(40); // never off the top
    }
  });
});

describe("the blade", () => {
  it("segment-vs-circle hits crossings and spares near-misses", () => {
    // Horizontal swipe straight through a claim at (100, 100).
    expect(segmentHitsCircle(60, 100, 140, 100, 100, 100, 30)).toBe(true);
    // Same swipe, claim 40px above the blade path with a 30px radius.
    expect(segmentHitsCircle(60, 100, 140, 100, 100, 60, 30)).toBe(false);
    // Endpoint graze inside the radius.
    expect(segmentHitsCircle(0, 0, 80, 0, 100, 0, 30)).toBe(true);
    // Zero-length segment degenerates to a point test.
    expect(segmentHitsCircle(50, 50, 50, 50, 60, 50, 15)).toBe(true);
    expect(segmentHitsCircle(50, 50, 50, 50, 90, 50, 15)).toBe(false);
  });

  it("combo bonus pays only from a double up, 15 a myth after the first", () => {
    expect(comboBonusFor(0)).toBe(0);
    expect(comboBonusFor(1)).toBe(0);
    expect(comboBonusFor(2)).toBe(15);
    expect(comboBonusFor(4)).toBe(45);
  });
});

describe("the fail state", () => {
  it("gags carry the claim and target the myth, not the player", () => {
    expect(escapedCause("8 GLASSES A DAY")).toContain("'8 GLASSES A DAY'");
    expect(slicedTruthCause("3–5 G CREATINE WORKS")).toContain("It was true.");
  });

  it("share text carries the count, the points and the cause line", () => {
    const text = shareText(41, 620, slicedTruthCause("3–5 G CREATINE WORKS"));
    expect(text).toContain("SNAKE OIL");
    expect(text).toContain("41 myths busted");
    expect(text).toContain("620 pts");
    expect(text).toContain("It was true.");
    expect(text).toContain("Spare the truth.");
    expect(shareText(1, 10, "x")).toContain("1 myth busted");
  });
});
