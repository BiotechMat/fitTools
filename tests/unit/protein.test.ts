import { describe, expect, it } from "vitest";
import {
  PROTEIN_BANDS_G_PER_KG,
  perMealG,
  proteinRangeG,
  rdaG,
} from "@/lib/formulas/protein";

/**
 * Bands are lifted verbatim from the cited literature (never invented):
 * general 1.4–2.0 (Jäger 2017), build 1.6–2.2 (Morton 2018), cut 1.8–2.0
 * (Phillips & Van Loon 2011), older 1.2–1.5 (Bauer 2013); per-meal 0.4 g/kg
 * (Schoenfeld & Aragon 2018); RDA 0.8 g/kg.
 */

describe("protein bands", () => {
  it("matches the published g/kg ranges exactly", () => {
    expect(PROTEIN_BANDS_G_PER_KG.general).toEqual({ min: 1.4, max: 2.0 });
    expect(PROTEIN_BANDS_G_PER_KG.build).toEqual({ min: 1.6, max: 2.2 });
    expect(PROTEIN_BANDS_G_PER_KG.cut).toEqual({ min: 1.8, max: 2.0 });
    expect(PROTEIN_BANDS_G_PER_KG.older).toEqual({ min: 1.2, max: 1.5 });
  });
});

describe("proteinRangeG", () => {
  it("80 kg building muscle → 128–176 g/day (1.6–2.2 g/kg)", () => {
    const range = proteinRangeG(80, "build");
    expect(range.minG).toBeCloseTo(128, 6);
    expect(range.maxG).toBeCloseTo(176, 6);
  });

  it("80 kg general training → 112–160 g/day", () => {
    const range = proteinRangeG(80, "general");
    expect(range.minG).toBeCloseTo(112, 6);
    expect(range.maxG).toBeCloseTo(160, 6);
  });

  it("70 kg cutting → 126–140 g/day (1.8–2.0 g/kg)", () => {
    const range = proteinRangeG(70, "cut");
    expect(range.minG).toBeCloseTo(126, 6);
    expect(range.maxG).toBeCloseTo(140, 6);
  });

  it("65 kg older adult → 78–97.5 g/day (1.2–1.5 g/kg)", () => {
    const range = proteinRangeG(65, "older");
    expect(range.minG).toBeCloseTo(78, 6);
    expect(range.maxG).toBeCloseTo(97.5, 6);
  });
});

describe("per-meal and RDA anchors", () => {
  it("0.4 g/kg per meal: 80 kg → 32 g", () => {
    expect(perMealG(80)).toBeCloseTo(32, 6);
  });

  it("RDA baseline 0.8 g/kg: 80 kg → 64 g", () => {
    expect(rdaG(80)).toBeCloseTo(64, 6);
  });
});
