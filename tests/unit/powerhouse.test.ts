import { describe, expect, it } from "vitest";
import {
  BOSS,
  ENEMY_KINDS,
  POWERHOUSE,
  POWERUP_KINDS,
  ZONES,
  bossHpFor,
  bpmFor,
  hitsCircle,
  multiplierFor,
  rollDrop,
  shareText,
  spawnIntervalFor,
  speedMulFor,
  unlockedKinds,
  zoneName,
} from "@/lib/powerhouse";
import { mulberry32 } from "@/lib/lifeline";

describe("zone ladder (POWERHOUSE.md §4)", () => {
  it("has five named zones, then endless REDLINE", () => {
    expect(ZONES).toHaveLength(5);
    expect(zoneName(0)).toBe("WARM-UP");
    expect(zoneName(4)).toBe("VO₂ MAX");
    expect(zoneName(5)).toBe("REDLINE");
    expect(zoneName(12)).toBe("REDLINE");
  });

  it("heartbeat BPM rises with the zone and caps in REDLINE", () => {
    for (let i = 1; i < 8; i++) {
      expect(bpmFor(i)).toBeGreaterThanOrEqual(bpmFor(i - 1));
    }
    expect(bpmFor(0)).toBe(70);
    expect(bpmFor(5)).toBe(185);
    expect(bpmFor(20)).toBe(185);
  });

  it("spawn interval falls monotonically and floors so REDLINE stays playable", () => {
    for (let i = 1; i < 12; i++) {
      expect(spawnIntervalFor(i)).toBeLessThanOrEqual(spawnIntervalFor(i - 1));
    }
    expect(spawnIntervalFor(0)).toBe(1.35);
    expect(spawnIntervalFor(50)).toBe(0.45);
  });

  it("enemy speed multiplier rises and caps", () => {
    for (let i = 1; i < 12; i++) {
      expect(speedMulFor(i)).toBeGreaterThanOrEqual(speedMulFor(i - 1));
    }
    expect(speedMulFor(0)).toBe(1);
    expect(speedMulFor(50)).toBe(2);
  });

  it("boss HP grows every zone, including repeat REDLINE cans", () => {
    for (let i = 1; i < 10; i++) {
      expect(bossHpFor(i)).toBeGreaterThan(bossHpFor(i - 1));
    }
    expect(bossHpFor(0)).toBe(ZONES[0].bossHp);
  });

  it("unlocks enemy kinds gradually and never past the roster", () => {
    expect(unlockedKinds(0)).toBe(2);
    for (let i = 1; i < 10; i++) {
      expect(unlockedKinds(i)).toBeGreaterThanOrEqual(unlockedKinds(i - 1));
      expect(unlockedKinds(i)).toBeLessThanOrEqual(ENEMY_KINDS.length);
    }
    expect(unlockedKinds(9)).toBe(ENEMY_KINDS.length);
  });
});

describe("scoring", () => {
  it("streak multiplier steps every 8 kills and caps at ×5", () => {
    expect(multiplierFor(0)).toBe(1);
    expect(multiplierFor(7)).toBe(1);
    expect(multiplierFor(8)).toBe(2);
    expect(multiplierFor(16)).toBe(3);
    expect(multiplierFor(32)).toBe(5);
    expect(multiplierFor(999)).toBe(5);
  });

  it("every enemy pays ATP and carries a bonk gag (the shareable bit)", () => {
    for (const kind of ENEMY_KINDS) {
      expect(kind.atp).toBeGreaterThan(0);
      expect(kind.cause.length).toBeGreaterThan(10);
    }
    expect(BOSS.atp).toBeGreaterThan(Math.max(...ENEMY_KINDS.map((k) => k.atp)));
    expect(BOSS.cause.length).toBeGreaterThan(10);
  });
});

describe("drops", () => {
  it("drops on roughly the configured rate", () => {
    const rng = mulberry32(7);
    let drops = 0;
    for (let i = 0; i < 2000; i++) {
      if (rollDrop(rng, 2) !== null) drops++;
    }
    // dropRate 0.09 → expect ~180 of 2000; wide deterministic-safe band.
    expect(drops).toBeGreaterThan(110);
    expect(drops).toBeLessThan(260);
  });

  it("never rolls water at full hearts, does when hurt", () => {
    const full = mulberry32(11);
    for (let i = 0; i < 5000; i++) {
      expect(rollDrop(full, POWERHOUSE.maxHearts)).not.toBe("water");
    }
    const hurt = mulberry32(11);
    let water = 0;
    for (let i = 0; i < 5000; i++) {
      if (rollDrop(hurt, 1) === "water") water++;
    }
    expect(water).toBeGreaterThan(0);
  });

  it("only ever rolls real power-up ids", () => {
    const ids = new Set(POWERUP_KINDS.map((p) => p.id));
    const rng = mulberry32(23);
    for (let i = 0; i < 2000; i++) {
      const drop = rollDrop(rng, 1);
      if (drop !== null) expect(ids.has(drop)).toBe(true);
    }
  });
});

describe("collision", () => {
  it("circle-vs-circle hits and misses", () => {
    expect(hitsCircle(100, 100, 10, 115, 100, 6)).toBe(true);
    expect(hitsCircle(100, 100, 10, 117, 100, 6)).toBe(false);
    expect(hitsCircle(0, 0, 5, 3, 4, 1)).toBe(true); // dist 5 < 6
    expect(hitsCircle(0, 0, 2, 3, 4, 2)).toBe(false); // dist 5 > 4
  });
});

describe("share text", () => {
  it("names the zone, formats ATP, and lands the meme", () => {
    const text = shareText(12480, 3);
    expect(text).toContain("ZONE 4");
    expect(text).toContain("THRESHOLD");
    expect(text).toContain("12,480 ATP");
    expect(text).toContain("powerhouse of the cell");
  });

  it("REDLINE runs share as REDLINE, no zone number", () => {
    const text = shareText(21000, 7);
    expect(text).toContain("REDLINE");
    expect(text).not.toContain("ZONE 8");
  });
});
