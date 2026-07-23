import { describe, expect, it } from "vitest";
import {
  INCREMENT_LADDER,
  MAXOUT,
  MISS_CAUSES,
  aidFor,
  causeFor,
  formatKg,
  incrementFor,
  judge,
  milestoneFor,
  needleAt,
  needleSpeedFor,
  platesPerSide,
  platesPhrase,
  shareText,
  weightAfter,
  windowCentreFor,
  windowWidthFor,
} from "@/lib/maxout";
import { mulberry32 } from "@/lib/lifeline";

describe("the loading ladder (MAXOUT.md §4)", () => {
  it("jumps big early, grinds late, microloads forever", () => {
    expect(incrementFor(0)).toBe(40);
    expect(incrementFor(INCREMENT_LADDER.length - 1)).toBe(5);
    expect(incrementFor(INCREMENT_LADDER.length)).toBe(2.5);
    expect(incrementFor(99)).toBe(2.5);
    for (let i = 1; i < INCREMENT_LADDER.length; i++) {
      expect(incrementFor(i)).toBeLessThanOrEqual(incrementFor(i - 1));
    }
  });

  it("hits the whole-plate milestones on the expected reps", () => {
    expect(weightAfter(0)).toBe(60); // one plate a side
    expect(weightAfter(1)).toBe(100); // two plates
    expect(weightAfter(2)).toBe(140); // three plates
    expect(weightAfter(3)).toBe(180); // four plates
    expect(weightAfter(5)).toBe(220); // five plates
    expect(weightAfter(8)).toBe(260); // six plates
    expect(weightAfter(18)).toBe(300); // seven plates — the legend run
  });

  it("counts plates a side and phrases the flex", () => {
    expect(platesPerSide(60)).toBe(1);
    expect(platesPerSide(100)).toBe(2);
    expect(platesPerSide(300)).toBe(7);
    expect(platesPerSide(20)).toBe(0);
    expect(platesPhrase(60)).toBe("one plate a side");
    expect(platesPhrase(180)).toBe("four plates a side");
    expect(platesPhrase(20)).toBe("just the bar");
  });

  it("flags a milestone only when a rep crosses a whole-plate boundary", () => {
    expect(milestoneFor(60, 100)).toBe("TWO PLATES A SIDE");
    expect(milestoneFor(180, 200)).toBeNull(); // four plates both sides of the rep
    expect(milestoneFor(200, 220)).toBe("FIVE PLATES A SIDE");
    expect(milestoneFor(20, 60)).toBeNull(); // one plate is where you start, not a flex
  });
});

describe("the needle", () => {
  it("speeds up with weight and caps", () => {
    expect(needleSpeedFor(MAXOUT.startWeight)).toBeCloseTo(0.55);
    for (let w = 80; w <= 400; w += 20) {
      expect(needleSpeedFor(w)).toBeGreaterThanOrEqual(needleSpeedFor(w - 20));
    }
    expect(needleSpeedFor(1000)).toBe(1.6);
  });

  it("window narrows with weight and floors", () => {
    expect(windowWidthFor(MAXOUT.startWeight)).toBeCloseTo(0.26);
    for (let w = 80; w <= 400; w += 20) {
      expect(windowWidthFor(w)).toBeLessThanOrEqual(windowWidthFor(w - 20));
    }
    expect(windowWidthFor(1000)).toBe(0.09);
  });

  it("ping-pongs 0 → 1 → 0 and stays on the track", () => {
    expect(needleAt(0, 1)).toBe(0);
    expect(needleAt(0.5, 1)).toBe(0.5);
    expect(needleAt(1, 1)).toBe(1);
    expect(needleAt(1.5, 1)).toBe(0.5);
    expect(needleAt(2, 1)).toBe(0);
    for (let t = 0; t < 10; t += 0.13) {
      const pos = needleAt(t, 1.3);
      expect(pos).toBeGreaterThanOrEqual(0);
      expect(pos).toBeLessThanOrEqual(1);
    }
  });

  it("keeps the window centre clear of the track ends", () => {
    const rng = mulberry32(9);
    for (let i = 0; i < 500; i++) {
      const centre = windowCentreFor(rng);
      expect(centre - windowWidthFor(MAXOUT.startWeight) / 2).toBeGreaterThan(0);
      expect(centre + windowWidthFor(MAXOUT.startWeight) / 2).toBeLessThan(1);
    }
  });
});

describe("judging", () => {
  it("scores perfect inside the core, good inside the window, miss outside", () => {
    const centre = 0.5;
    const width = 0.2;
    expect(judge(0.5, centre, width)).toBe("perfect");
    expect(judge(0.5 + (width * MAXOUT.perfectCore) / 2 - 0.001, centre, width)).toBe("perfect");
    expect(judge(0.58, centre, width)).toBe("good");
    expect(judge(0.5 + width / 2 - 0.001, centre, width)).toBe("good");
    expect(judge(0.61, centre, width)).toBe("miss");
    expect(judge(0.1, centre, width)).toBe("miss");
  });
});

describe("earned aids", () => {
  it("chalks at 3-streaks, belts at 5-streaks, belt outranks chalk", () => {
    expect(aidFor(0)).toBeNull();
    expect(aidFor(1)).toBeNull();
    expect(aidFor(3)).toBe("chalk");
    expect(aidFor(5)).toBe("belt");
    expect(aidFor(6)).toBe("chalk");
    expect(aidFor(10)).toBe("belt");
    expect(aidFor(15)).toBe("belt"); // divisible by both — the belt wins
  });
});

describe("the fail state", () => {
  it("every cause is a gag about the cartoon or the bar, never the player", () => {
    for (const cause of MISS_CAUSES) {
      expect(cause.length).toBeGreaterThan(5);
      expect(cause.toLowerCase()).not.toContain("you");
    }
    const rng = mulberry32(3);
    for (let i = 0; i < 100; i++) {
      expect(MISS_CAUSES).toContain(causeFor(rng));
    }
  });

  it("formats kg without a trailing .0, keeping real microloads", () => {
    expect(formatKg(240)).toBe("240");
    expect(formatKg(247.5)).toBe("247.5");
    expect(formatKg(1000)).toBe("1,000");
  });

  it("share text carries the kg, the plates phrase and the cause", () => {
    const text = shareText(240, "ego lifting");
    expect(text).toContain("MAX OUT");
    expect(text).toContain("240 kg");
    expect(text).toContain("five plates a side");
    expect(text).toContain("ego lifting");
    expect(text).toContain("The bar always wins");
  });
});
