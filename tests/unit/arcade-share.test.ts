import { describe, expect, it } from "vitest";
import {
  arcadeCardPath,
  ballparkSharePath,
  lifelineCauseLabel,
  lifelineSharePath,
  maxOutSharePath,
  mythSharePath,
  parseArcadeResult,
  parseCardParams,
  parseDailyResult,
  powerhouseSharePath,
  powerhouseZonePhrase,
  resultDescription,
  resultTitle,
  snakeOilSharePath,
} from "@/lib/arcade-share";
import { OBSTACLE_KINDS } from "@/lib/lifeline";
import { MISS_CAUSES } from "@/lib/maxout";
import { ZONES } from "@/lib/powerhouse";

/**
 * Arcade/daily share payloads (STATUS.md Phase 2). Same posture as the tool
 * share card: bounded numbers, fixed ids and tier letters only, so a crafted
 * URL can never place arbitrary text in the brand frame.
 */

function query(path: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(path.split("?")[1] ?? ""));
}

describe("lifeline share", () => {
  it("round-trips a challenge link through the page URL params", () => {
    const path = lifelineSharePath({ seed: 20260723, beat: 57, cause: "allnighters" });
    expect(path).toBe("/lifeline?seed=20260723&beat=57&cause=allnighters");
    expect(parseArcadeResult("lifeline", query(path))).toEqual({
      game: "lifeline",
      seed: 20260723,
      beat: 57,
      cause: "allnighters",
    });
  });

  it("rejects out-of-bounds or non-numeric scores", () => {
    expect(parseArcadeResult("lifeline", { beat: "0" })).toBeNull();
    expect(parseArcadeResult("lifeline", { beat: "200" })).toBeNull();
    expect(parseArcadeResult("lifeline", { beat: "drink bleach" })).toBeNull();
    expect(parseArcadeResult("lifeline", {})).toBeNull();
  });

  it("drops an unknown cause id but keeps the score", () => {
    expect(
      parseArcadeResult("lifeline", { beat: "57", cause: "own-goal" }),
    ).toEqual({ game: "lifeline", beat: 57 });
  });

  it("labels every roster cause plus gravity", () => {
    for (const kind of OBSTACLE_KINDS) {
      expect(lifelineCauseLabel(kind.id)).toBe(kind.label);
    }
    expect(lifelineCauseLabel("gravity")).toBe("GRAVITY");
  });
});

describe("max-out share", () => {
  it("round-trips kg in half-kilo steps with a roster cause index", () => {
    const path = maxOutSharePath({ kg: 142.5, cause: 3 });
    expect(path).toBe("/max-out?kg=142.5&cause=3");
    expect(parseArcadeResult("max-out", query(path))).toEqual({
      game: "max-out",
      kg: 142.5,
      cause: 3,
    });
  });

  it("rejects non-plate weights and drops out-of-roster causes", () => {
    expect(parseArcadeResult("max-out", { kg: "142.3" })).toBeNull();
    expect(parseArcadeResult("max-out", { kg: "10" })).toBeNull(); // below the bar
    expect(parseArcadeResult("max-out", { kg: "1001" })).toBeNull();
    expect(
      parseArcadeResult("max-out", { kg: "180", cause: String(MISS_CAUSES.length) }),
    ).toEqual({ game: "max-out", kg: 180 });
  });
});

describe("snake-oil and powerhouse shares", () => {
  it("round-trip their scores", () => {
    const snake = snakeOilSharePath({ busted: 12, points: 3400 });
    expect(parseArcadeResult("snake-oil", query(snake))).toEqual({
      game: "snake-oil",
      busted: 12,
      points: 3400,
    });
    const power = powerhouseSharePath({ atp: 5400, zone: 3 });
    expect(parseArcadeResult("powerhouse", query(power))).toEqual({
      game: "powerhouse",
      atp: 5400,
      zone: 3,
    });
  });

  it("requires both numbers", () => {
    expect(parseArcadeResult("snake-oil", { busted: "12" })).toBeNull();
    expect(parseArcadeResult("powerhouse", { atp: "5400" })).toBeNull();
  });

  it("phrases zones from the real tuning table, REDLINE past the top", () => {
    expect(powerhouseZonePhrase(3)).toBe(`ZONE 4 · ${ZONES[3].name}`);
    expect(powerhouseZonePhrase(ZONES.length)).toBe("REDLINE");
  });
});

describe("daily shares", () => {
  it("round-trips a Ballpark form row as tier letters", () => {
    const path = ballparkSharePath({
      puzzle: 203,
      tiers: ["cold", "warm", "hot", "bullseye"],
    });
    expect(path).toBe("/daily?g=bp&p=203&r=cwhb");
    expect(parseDailyResult(query(path))).toEqual({
      game: "ballpark",
      puzzle: 203,
      tiers: ["cold", "warm", "hot", "bullseye"],
    });
  });

  it("clips the form row to the last seven days and rejects unknown letters", () => {
    const tiers = Array.from({ length: 10 }, () => "hot" as const);
    expect(query(ballparkSharePath({ puzzle: 1, tiers })).r).toBe("hhhhhhh");
    expect(parseDailyResult({ g: "bp", p: "1", r: "hhx" })).toBeNull();
  });

  it("round-trips Myth or Fact and caps correct at total", () => {
    const path = mythSharePath({ puzzle: 30, correct: 4, total: 5 });
    expect(parseDailyResult(query(path))).toEqual({
      game: "myth",
      puzzle: 30,
      correct: 4,
      total: 5,
    });
    expect(parseDailyResult({ g: "mf", p: "30", c: "6", t: "5" })).toBeNull();
  });
});

describe("card image params", () => {
  it("a bare game id is the page's hero card", () => {
    expect(parseCardParams({ game: "lifeline" })).toEqual({
      kind: "hero",
      game: "lifeline",
    });
    expect(parseCardParams({ game: "daily" })).toEqual({ kind: "hero", game: "daily" });
  });

  it("carries a challenge flag instead of the course seed", () => {
    const path = arcadeCardPath({
      kind: "result",
      result: { game: "lifeline", beat: 57, seed: 20260723, cause: "sofa" },
    });
    expect(path).toBe("/api/arcade-card?game=lifeline&beat=57&challenge=1&cause=sofa");
    const parsed = parseCardParams(query(path));
    expect(parsed).not.toBeNull();
    if (parsed?.kind === "result" && parsed.result.game === "lifeline") {
      expect(parsed.result.beat).toBe(57);
      expect(parsed.result.cause).toBe("sofa");
      expect(parsed.result.seed).toBeDefined();
    } else {
      throw new Error("expected a lifeline result payload");
    }
  });

  it("round-trips every result kind through the card URL", () => {
    const results = [
      { game: "max-out", kg: 180, cause: 1 },
      { game: "snake-oil", busted: 9, points: 2100 },
      { game: "powerhouse", atp: 12000, zone: 6 },
      { game: "ballpark", puzzle: 7, tiers: ["bullseye"] },
      { game: "myth", puzzle: 2, correct: 0, total: 5 },
    ] as const;
    for (const result of results) {
      const parsed = parseCardParams(query(arcadeCardPath({ kind: "result", result })));
      expect(parsed).toEqual({ kind: "result", result });
    }
  });

  it("rejects unknown games and malformed results", () => {
    expect(parseCardParams({})).toBeNull();
    expect(parseCardParams({ game: "tetris" })).toBeNull();
    expect(parseCardParams({ game: "lifeline", beat: "banana" })).toBeNull();
  });
});

describe("unfurl copy", () => {
  it("titles a challenge as a score to beat", () => {
    expect(
      resultTitle({ game: "lifeline", beat: 57, seed: 1, cause: "allnighters" }),
    ).toBe("Lifeline: beat 57");
    expect(resultTitle({ game: "lifeline", beat: 57 })).toBe(
      "Lifeline: flatlined at 57",
    );
    expect(resultTitle({ game: "myth", puzzle: 30, correct: 4, total: 5 })).toBe(
      "Myth or Fact? #30: 4/5",
    );
  });

  it("describes the run without leaking anything but the score", () => {
    const description = resultDescription({
      game: "lifeline",
      beat: 57,
      seed: 1,
      cause: "allnighters",
    });
    expect(description).toContain("57");
    expect(description).toContain("all-nighters");
    expect(description).toContain("Same course");
  });
});
