import { describe, expect, it } from "vitest";
import {
  REGIONS,
  exercisesForRegion,
  regionForMuscle,
  unmappedRegistryMuscles,
} from "@/lib/tools/muscles";

describe("muscle map normalisation (MICROTOOLS.md §4)", () => {
  it("maps every muscle string in the exercise registry", () => {
    expect(unmappedRegistryMuscles()).toEqual([]);
  });

  it("normalises variants onto one region", () => {
    expect(regionForMuscle("Quadriceps")).toBe("quads");
    expect(regionForMuscle("Calves (gastrocnemius)")).toBe("calves");
    expect(regionForMuscle("Soleus")).toBe("calves");
    expect(regionForMuscle("Made-up muscle")).toBeNull();
  });

  it("every region resolves at least one exercise, primaries excluded from secondaries", () => {
    for (const region of REGIONS) {
      const { primary, secondary } = exercisesForRegion(region.id);
      expect(primary.length + secondary.length).toBeGreaterThan(0);
      const primarySlugs = new Set(primary.map((e) => e.slug));
      for (const entry of secondary) {
        expect(primarySlugs.has(entry.slug)).toBe(false);
      }
    }
  });
});
