import { describe, expect, it } from "vitest";
import {
  arcadeCardPath,
  ballparkSharePath,
  labReactionSharePath,
  labRecallSharePath,
  labSwitchSharePath,
  labTrackSharePath,
  labVigilSharePath,
  lifelineCauseLabel,
  lifelineSharePath,
  maxOutSharePath,
  mythSharePath,
  parseArcadeResult,
  parseCardParams,
  parseDailyResult,
  parseLabResult,
  fiveADaySharePath,
  powerhouseSharePath,
  powerhouseZonePhrase,
  resultDescription,
  resultTitle,
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

describe("five-a-day and powerhouse shares", () => {
  it("round-trip their scores", () => {
    const five = fiveADaySharePath({ portions: 12, plants: 7 });
    expect(parseArcadeResult("five-a-day", query(five))).toEqual({
      game: "five-a-day",
      portions: 12,
      plants: 7,
    });
    const power = powerhouseSharePath({ atp: 5400, zone: 3 });
    expect(parseArcadeResult("powerhouse", query(power))).toEqual({
      game: "powerhouse",
      atp: 5400,
      zone: 3,
    });
  });

  it("requires both numbers", () => {
    expect(parseArcadeResult("five-a-day", { portions: "12" })).toBeNull();
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

describe("performance lab shares", () => {
  it("round-trips a Reaction average with its speed row", () => {
    const path = labReactionSharePath({ avg: 231, row: "ggygr" });
    expect(path).toBe("/performance-lab/reaction?avg=231&row=ggygr");
    expect(parseLabResult("lab-reaction", query(path))).toEqual({
      game: "lab-reaction",
      avg: 231,
      row: "ggygr",
    });
  });

  it("drops a malformed row but keeps the average", () => {
    expect(parseLabResult("lab-reaction", { avg: "231", row: "ggx" })).toEqual({
      game: "lab-reaction",
      avg: 231,
    });
    expect(
      parseLabResult("lab-reaction", { avg: "231", row: "gggggg" }),
    ).toEqual({ game: "lab-reaction", avg: 231 });
  });

  it("rejects implausible or non-numeric scores", () => {
    expect(parseLabResult("lab-reaction", { avg: "49" })).toBeNull();
    expect(parseLabResult("lab-reaction", { avg: "2001" })).toBeNull();
    expect(parseLabResult("lab-reaction", { avg: "fast" })).toBeNull();
    expect(parseLabResult("lab-recall", { span: "0" })).toBeNull();
    expect(parseLabResult("lab-recall", { span: "41" })).toBeNull();
    expect(parseLabResult("lab-track", { ms: "412" })).toBeNull(); // needs pts
    expect(parseLabResult("lab-track", { ms: "412", acc: "101" })).toBeNull();
  });

  it("round-trips Recall and Track", () => {
    expect(parseLabResult("lab-recall", query(labRecallSharePath({ span: 8 })))).toEqual({
      game: "lab-recall",
      span: 8,
    });
    expect(
      parseLabResult("lab-track", query(labTrackSharePath({ ms: 412, pts: 236 }))),
    ).toEqual({ game: "lab-track", ms: 412, pts: 236 });
  });

  it("round-trips the second wave: Vigil and Switch", () => {
    expect(parseLabResult("lab-vigil", query(labVigilSharePath({ pct: 94 })))).toEqual({
      game: "lab-vigil",
      pct: 94,
    });
    expect(
      parseLabResult("lab-switch", query(labSwitchSharePath({ cost: 180, err: 3 }))),
    ).toEqual({ game: "lab-switch", cost: 180, err: 3 });
    expect(parseLabResult("lab-vigil", { pct: "101" })).toBeNull();
    expect(parseLabResult("lab-switch", { cost: "180" })).toBeNull(); // needs err
  });

  it("titles the second wave with the server-derived tier", () => {
    expect(resultTitle({ game: "lab-vigil", pct: 94 })).toBe(
      "Vigil: held 94% · FOCUSED",
    );
    expect(resultTitle({ game: "lab-switch", cost: 180, err: 3 })).toBe(
      "Switch: 180 ms cost · HUMAN",
    );
    expect(resultTitle({ game: "lab-switch", cost: 50, err: 40 })).toContain(
      "BUTTON MASHER",
    );
  });

  it("maps legacy Track accuracy links onto ring points", () => {
    expect(parseLabResult("lab-track", { ms: "412", acc: "93" })).toEqual({
      game: "lab-track",
      ms: 412,
      pts: 233, // 93% of 250
    });
    expect(parseLabResult("lab-track", { ms: "412", pts: "251" })).toBeNull(); // over max
  });

  it("titles carry the score AND the server-derived tier", () => {
    expect(resultTitle({ game: "lab-reaction", avg: 231 })).toBe(
      "Reaction: 231 ms · CAFFEINATED",
    );
    expect(resultTitle({ game: "lab-recall", span: 8 })).toBe(
      "Recall: span 8 · DOLPHIN",
    );
    expect(resultTitle({ game: "lab-track", ms: 412, pts: 236 })).toBe(
      "Track: 236/250 · SNIPER",
    );
    // Spraying wide caps at Stormtrooper on the unfurl too.
    expect(resultTitle({ game: "lab-track", ms: 300, pts: 100 })).toContain(
      "STORMTROOPER",
    );
  });

  it("descriptions carry the score", () => {
    expect(resultDescription({ game: "lab-reaction", avg: 231 })).toContain("231 ms");
    expect(resultDescription({ game: "lab-recall", span: 8 })).toContain("span 8");
    expect(resultDescription({ game: "lab-track", ms: 412, pts: 236 })).toContain(
      "236 of 250",
    );
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
      { game: "five-a-day", portions: 9, plants: 5 },
      { game: "powerhouse", atp: 12000, zone: 6 },
      { game: "ballpark", puzzle: 7, tiers: ["bullseye"] },
      { game: "myth", puzzle: 2, correct: 0, total: 5 },
      { game: "lab-reaction", avg: 231, row: "ggygr" },
      { game: "lab-recall", span: 8 },
      { game: "lab-track", ms: 412, pts: 236 },
      { game: "lab-vigil", pct: 94 },
      { game: "lab-switch", cost: 180, err: 3 },
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
