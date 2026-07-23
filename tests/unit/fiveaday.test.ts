import { describe, expect, it } from "vitest";
import {
  FIVEADAY,
  JUNK,
  PRODUCE,
  burstSizeFor,
  comboBonusFor,
  comboLabelFor,
  escapedCause,
  junkChanceFor,
  launch,
  pickJunk,
  pickProduce,
  segmentHitsCircle,
  shareText,
  spawnIntervalFor,
  unlockedProduceCount,
  validateRoster,
} from "@/lib/fiveaday";
import { mulberry32 } from "@/lib/lifeline";

describe("the roster (FIVEADAY.md §4)", () => {
  it("validates clean", () => {
    expect(validateRoster()).toEqual([]);
  });

  it("flags a roster that breaks the rules", () => {
    expect(
      validateRoster(
        [{ id: "a", label: "Apple", kind: "fruit" }],
        [{ id: "a", label: "", cause: "you did this" }],
      ),
    ).not.toEqual([]);
  });

  it("junk gags never target the player", () => {
    for (const j of JUNK) {
      expect(j.cause).not.toMatch(/\byour?\b/i);
      expect(j.cause.length).toBeGreaterThan(10);
    }
  });

  it("serves fruit and veg from the opening eight", () => {
    const early = PRODUCE.slice(0, 8);
    expect(early.filter((p) => p.kind === "fruit").length).toBeGreaterThanOrEqual(3);
    expect(early.filter((p) => p.kind === "veg").length).toBeGreaterThanOrEqual(2);
  });
});

describe("the difficulty ramp", () => {
  it("unlocks the roster front to back, capped at the roster", () => {
    expect(unlockedProduceCount(0)).toBe(8);
    for (let w = 1; w < 12; w++) {
      expect(unlockedProduceCount(w)).toBeGreaterThanOrEqual(unlockedProduceCount(w - 1));
    }
    expect(unlockedProduceCount(50)).toBe(PRODUCE.length);
  });

  it("spawn interval tightens monotonically and floors", () => {
    for (let w = 1; w < 12; w++) {
      expect(spawnIntervalFor(w)).toBeLessThanOrEqual(spawnIntervalFor(w - 1));
    }
    expect(spawnIntervalFor(0)).toBe(1.5);
    expect(spawnIntervalFor(50)).toBe(0.55);
  });

  it("bursts stay small at wave 0, reach 3 only from wave 3, never exceed 3", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 500; i++) {
      expect([1, 2]).toContain(burstSizeFor(0, rng));
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

  it("junk chance starts rare, rises with the wave, caps below a third", () => {
    expect(junkChanceFor(0)).toBeCloseTo(0.1);
    for (let w = 1; w < 12; w++) {
      expect(junkChanceFor(w)).toBeGreaterThanOrEqual(junkChanceFor(w - 1));
    }
    expect(junkChanceFor(50)).toBe(0.3);
  });

  it("pickProduce only deals unlocked kinds; pickJunk deals the junk roster", () => {
    const rng = mulberry32(17);
    for (let i = 0; i < 400; i++) {
      expect(PRODUCE.slice(0, 8)).toContain(pickProduce(rng, 0));
      expect(JUNK).toContain(pickJunk(rng));
    }
    const late = new Set<string>();
    for (let i = 0; i < 800; i++) late.add(pickProduce(rng, 10).id);
    expect(late.size).toBe(PRODUCE.length);
  });
});

describe("the toss", () => {
  it("arcs hang sliceably and stay on the canvas", () => {
    const rng = mulberry32(29);
    for (let i = 0; i < 200; i++) {
      const l = launch(rng);
      let { x0: x, y0: y } = l;
      const { vx } = l;
      let { vy } = l;
      let apexY = y;
      const dt = 1 / 120;
      while (y <= FIVEADAY.height + 40) {
        x += vx * dt;
        y += vy * dt;
        vy += FIVEADAY.gravity * dt;
        apexY = Math.min(apexY, y);
        expect(x).toBeGreaterThan(-30);
        expect(x).toBeLessThan(FIVEADAY.width + 30);
        if (vy > 0 && y > FIVEADAY.height + 40) break;
      }
      expect(apexY).toBeLessThan(260);
      expect(apexY).toBeGreaterThan(40);
    }
  });
});

describe("the blade", () => {
  it("segment-vs-circle hits crossings and spares near-misses", () => {
    expect(segmentHitsCircle(60, 100, 140, 100, 100, 100, 24)).toBe(true);
    expect(segmentHitsCircle(60, 100, 140, 100, 100, 60, 24)).toBe(false);
    expect(segmentHitsCircle(0, 0, 80, 0, 100, 0, 24)).toBe(true);
    expect(segmentHitsCircle(50, 50, 50, 50, 60, 50, 15)).toBe(true);
    expect(segmentHitsCircle(50, 50, 50, 50, 90, 50, 15)).toBe(false);
  });
});

describe("scoring", () => {
  it("combo pays one bonus portion per extra item, from a double up", () => {
    expect(comboBonusFor(0)).toBe(0);
    expect(comboBonusFor(1)).toBe(0);
    expect(comboBonusFor(2)).toBe(1);
    expect(comboBonusFor(5)).toBe(4);
  });

  it("all-veg swipes are a chopped salad; anything else blends", () => {
    expect(comboLabelFor(["veg", "veg"])).toBe("CHOPPED SALAD");
    expect(comboLabelFor(["fruit", "fruit", "fruit"])).toBe("SMOOTHIE");
    expect(comboLabelFor(["fruit", "veg"])).toBe("SMOOTHIE");
    expect(comboLabelFor([])).toBe("SMOOTHIE");
  });
});

describe("the fail state", () => {
  it("escape gags carry the produce and read mid-sentence", () => {
    expect(escapedCause("broccoli")).toBe("the broccoli got away");
  });

  it("share text carries portions, plants and the cause line", () => {
    const text = shareText(87, 23, "the cigarette. It was never food.");
    expect(text).toContain("FIVE A DAY");
    expect(text).toContain("87 portions");
    expect(text).toContain("23 different plants");
    expect(text).toContain("cause: the cigarette");
    expect(text).toContain("Never the junk.");
    expect(shareText(1, 1, "x")).toContain("1 portion · 1 different plant");
  });
});
