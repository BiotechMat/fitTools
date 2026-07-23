import { describe, expect, it } from "vitest";
import { lewisAveragePowerW, sayersPeakPowerW } from "@/lib/formulas/jump-power";

/**
 * Sayers 1999 squat-jump equation: PP(W) = 60.7·jump(cm) + 45.3·mass(kg)
 * − 2055. Lewis average power: √4.9 × mass × √jump(m) × 9.81.
 */

describe("sayersPeakPowerW", () => {
  it("45 cm jump at 80 kg → 4,300.5 W", () => {
    expect(sayersPeakPowerW(45, 80)).toBeCloseTo(
      60.7 * 45 + 45.3 * 80 - 2055,
      10,
    );
    expect(sayersPeakPowerW(45, 80)).toBeCloseTo(4300.5, 6);
  });

  it("60 cm jump at 75 kg → 4,984.5 W", () => {
    expect(sayersPeakPowerW(60, 75)).toBeCloseTo(4984.5, 6);
  });
});

describe("lewisAveragePowerW", () => {
  it("45 cm jump at 80 kg → ≈ 1,165 W", () => {
    const expected = Math.sqrt(4.9) * 80 * Math.sqrt(0.45) * 9.81;
    expect(lewisAveragePowerW(45, 80)).toBeCloseTo(expected, 10);
    expect(expected).toBeCloseTo(1165.37, 2);
  });

  it("scales with the square root of jump height", () => {
    const one = lewisAveragePowerW(25, 70);
    const four = lewisAveragePowerW(100, 70);
    expect(four / one).toBeCloseTo(2, 10);
  });
});
