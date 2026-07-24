import { describe, expect, it } from "vitest";
import { ballparkShareText, mythShareText } from "@/lib/daily/share";
import { ballparkItems, mythItems } from "@/registry/daily";

/**
 * The share payload must be spoiler-free (DAILY-GAMES.md §7): never the
 * question, the answer, or the guess — only game, puzzle number and score.
 */
describe("ballparkShareText", () => {
  it("includes the puzzle number and an emoji form row", () => {
    const text = ballparkShareText(203, ["cold", "warm", "hot", "bullseye"]);
    expect(text).toContain("Ballpark #203");
    expect(text).toContain("🎯");
    expect(text.split("\n")).toHaveLength(3);
  });

  it("leaks no answer, question text, or unit", () => {
    const text = ballparkShareText(0, ["hot"]);
    for (const item of ballparkItems) {
      expect(text).not.toContain(String(item.answer));
      expect(text.toLowerCase()).not.toContain(item.question.toLowerCase().slice(0, 20));
    }
  });
});

describe("mythShareText", () => {
  it("shows the score as hearts and the puzzle number, no statements", () => {
    const text = mythShareText(30, 4, 5);
    expect(text).toContain("Myth or Fact? #30: 4/5");
    expect(text).toContain("💚💚💚💚🖤");
    for (const item of mythItems) {
      expect(text).not.toContain(item.statement.slice(0, 20));
    }
  });

  it("handles a perfect and a zero score", () => {
    expect(mythShareText(1, 5, 5)).toContain("💚💚💚💚💚");
    expect(mythShareText(1, 0, 5)).toContain("🖤🖤🖤🖤🖤");
  });
});

describe("share links", () => {
  it("carry the score as bounded params so the URL unfurls as the result card", () => {
    expect(ballparkShareText(203, ["cold", "warm", "hot", "bullseye"])).toContain(
      "https://tools.fit/daily?g=bp&p=203&r=cwhb",
    );
    expect(mythShareText(30, 4, 5)).toContain(
      "https://tools.fit/daily?g=mf&p=30&c=4&t=5",
    );
  });
});
