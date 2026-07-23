import { describe, expect, it } from "vitest";
import {
  type EvidenceGrade,
  evidenceGrade,
  GRADE_LABELS,
} from "@/registry/peptides";
import { supplements, supplementsByGrade } from "@/registry/supplements";

/**
 * The evidence medal ladder (DESIGN.md §3): a presentation grade derived from
 * the stored tier + basis. A medal always means genuine evidence — oversold
 * ("Unproven") and contradicted ("Not supported") claims earn none — and the
 * Silver/Bronze split tracks human vs animal/in-vitro evidence.
 */

describe("evidenceGrade (the medal derivation)", () => {
  it("awards Gold to well-supported regardless of basis", () => {
    expect(evidenceGrade("well-supported", "human")).toBe("gold");
    expect(evidenceGrade("well-supported", undefined)).toBe("gold");
  });

  it("splits preliminary into Silver (human/mixed) vs Bronze (animal/in-vitro)", () => {
    expect(evidenceGrade("preliminary", "human")).toBe("silver");
    expect(evidenceGrade("preliminary", "mixed")).toBe("silver");
    expect(evidenceGrade("preliminary", undefined)).toBe("silver");
    expect(evidenceGrade("preliminary", "animal")).toBe("bronze");
    expect(evidenceGrade("preliminary", "in-vitro")).toBe("bronze");
  });

  it("never medals the oversold or contradicted tiers", () => {
    // The credibility guardrail: hype never wears a medal.
    const medals: EvidenceGrade[] = ["gold", "silver", "bronze"];
    expect(medals).not.toContain(evidenceGrade("marketing-claim", "human"));
    expect(medals).not.toContain(evidenceGrade("not-supported", "human"));
    expect(evidenceGrade("marketing-claim", "human")).toBe("unproven");
    expect(evidenceGrade("not-supported", "human")).toBe("not-supported");
  });

  it("labels every grade", () => {
    for (const grade of [
      "gold",
      "silver",
      "bronze",
      "unproven",
      "not-supported",
    ] as const) {
      expect(GRADE_LABELS[grade]).toBeTruthy();
    }
  });
});

describe("supplementsByGrade (medal board grouping)", () => {
  const grouped = supplementsByGrade();

  it("places every supplement in exactly one grade group", () => {
    const flat = grouped.flatMap(([, list]) => list);
    expect(flat).toHaveLength(supplements.length);
    expect(new Set(flat.map((s) => s.slug)).size).toBe(supplements.length);
  });

  it("orders groups by the medal ladder and drops empty ones", () => {
    const order: EvidenceGrade[] = [
      "gold",
      "silver",
      "bronze",
      "unproven",
      "not-supported",
    ];
    const seen = grouped.map(([g]) => g);
    expect(seen).toStrictEqual(
      order.filter((g) => seen.includes(g)),
    );
    for (const [, list] of grouped) expect(list.length).toBeGreaterThan(0);
  });

  it("sorts entries A→Z within each group and matches each group's grade", () => {
    for (const [grade, list] of grouped) {
      const names = list.map((s) => s.name);
      expect(names).toStrictEqual([...names].sort((a, b) => a.localeCompare(b, "en-GB")));
      for (const s of list) {
        expect(evidenceGrade(s.headlineTier, s.headlineBasis)).toBe(grade);
      }
    }
  });
});
