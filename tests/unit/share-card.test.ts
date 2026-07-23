import { describe, expect, it } from "vitest";
import {
  parseShareCardParams,
  shareImagePath,
  shareUrl,
} from "@/lib/share-card";

/**
 * Share-card params (ROADMAP.md E1). The card is tied to a real tool slug and
 * bounded values, so a shared URL can only ever present a genuine, size-limited
 * FitTools result — never arbitrary brand-impersonating text.
 */

describe("shareUrl / shareImagePath", () => {
  it("builds the /share and /api/share-card URLs with encoded params", () => {
    const p = { tool: "heart-age-calculator", value: "55", unit: "years", label: "On track" };
    expect(shareUrl(p)).toBe(
      "/share?tool=heart-age-calculator&value=55&unit=years&label=On+track",
    );
    expect(shareImagePath(p)).toBe(
      "/api/share-card?tool=heart-age-calculator&value=55&unit=years&label=On+track",
    );
  });

  it("omits optional params when absent", () => {
    expect(shareUrl({ tool: "metabolic-fitness-index", value: "72" })).toBe(
      "/share?tool=metabolic-fitness-index&value=72",
    );
  });
});

describe("parseShareCardParams", () => {
  it("accepts a well-formed card", () => {
    expect(
      parseShareCardParams({ tool: "metabolic-fitness-index", value: "72", unit: "/ 100" }),
    ).toEqual({ tool: "metabolic-fitness-index", value: "72", unit: "/ 100" });
  });

  it("rejects a missing or malformed tool slug", () => {
    expect(parseShareCardParams({ value: "72" })).toBeNull();
    expect(parseShareCardParams({ tool: "Not A Slug!", value: "72" })).toBeNull();
  });

  it("rejects a missing or non-numeric-ish value (blocks arbitrary text)", () => {
    expect(parseShareCardParams({ tool: "heart-age-calculator" })).toBeNull();
    expect(
      parseShareCardParams({ tool: "heart-age-calculator", value: "drink bleach" }),
    ).toBeNull();
  });

  it("clips over-long label and unit", () => {
    const long = "x".repeat(200);
    const parsed = parseShareCardParams({
      tool: "heart-age-calculator",
      value: "55",
      unit: long,
      label: long,
    });
    expect(parsed?.unit?.length).toBeLessThanOrEqual(16);
    expect(parsed?.label?.length).toBeLessThanOrEqual(60);
  });

  it("takes the first value when a param is duplicated", () => {
    expect(
      parseShareCardParams({ tool: ["heart-age-calculator", "x"], value: "55" }),
    ).toEqual({ tool: "heart-age-calculator", value: "55" });
  });
});
