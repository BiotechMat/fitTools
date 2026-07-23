import { describe, expect, it } from "vitest";
import {
  ballparkItems,
  mythItems,
  validateDailyRegistry,
  ballparkById,
  mythById,
} from "@/registry/daily";

/**
 * The daily-games registry must satisfy the invariants the games own
 * (DAILY-GAMES.md §4): unique ids, a REAL source on every item (a scored game
 * with a wrong answer is a trust incident — §2.1), a scoreable slider with the
 * answer strictly inside it, and well-formed internal routes.
 */
describe("daily games registry", () => {
  it("passes structural validation", () => {
    expect(validateDailyRegistry()).toEqual([]);
  });

  it("has items and every item carries a real source url", () => {
    expect(ballparkItems.length).toBeGreaterThan(0);
    expect(mythItems.length).toBeGreaterThan(0);
    for (const item of [...ballparkItems, ...mythItems]) {
      expect(item.source.url).toMatch(/^https?:\/\//);
      expect(item.source.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps every Ballpark answer strictly within its slider bounds", () => {
    for (const b of ballparkItems) {
      expect(b.sliderMin).toBeLessThan(b.answer);
      expect(b.answer).toBeLessThan(b.sliderMax);
    }
  });

  it("indexes every item by id", () => {
    expect(ballparkById.size).toBe(ballparkItems.length);
    expect(mythById.size).toBe(mythItems.length);
  });

  it("catches a bad item in validation", () => {
    const problems = validateDailyRegistry(
      [
        {
          id: "bad",
          question: "q",
          answer: 100, // outside bounds
          unit: "x",
          sliderMin: 0,
          sliderMax: 10,
          context: "c",
          tier: "well-supported",
          source: { label: "", url: "" }, // missing source
          lastReviewed: "2026-07-23",
        },
      ],
      [],
    );
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.some((p) => p.includes("must lie strictly within"))).toBe(true);
    expect(problems.some((p) => p.includes("missing source url"))).toBe(true);
  });
});
