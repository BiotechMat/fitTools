import { describe, expect, it } from "vitest";
import {
  allPicksFor,
  isLivePick,
  recommendationsBySurface,
  recommendationsFor,
  type ProductPick,
} from "@/registry/affiliates";
import { supplements } from "@/registry/supplements";
import { recoveryClusters } from "@/registry/recovery-content";
import { glowUpClusters } from "@/registry/glowup-content";
import { allTools } from "@/registry/tools";

/**
 * "Our recommendation" registry invariants (SPEC §10; CONTENT.md §4.2/§6).
 * Every surface key must resolve to a real page, picks must be complete and
 * honest-by-construction, and the editorial guard (no selling what our own
 * copy calls a marketing claim) is enforced here, not by convention.
 */

const surfaceKeys = Object.keys(recommendationsBySurface);

function resolves(surface: string): boolean {
  const [ns, rest] = surface.split(":", 2);
  switch (ns) {
    case "tool":
      return allTools.some((t) => t.slug === rest);
    case "supplement":
      return supplements.some((s) => s.slug === rest);
    case "recovery": {
      const [cluster, article] = rest.split("/", 2);
      const c = recoveryClusters.find((x) => x.slug === cluster);
      if (!c) return false;
      return article === undefined || c.satellites.some((a) => a.slug === article);
    }
    case "glowup": {
      const [cluster, article] = rest.split("/", 2);
      const c = glowUpClusters.find((x) => x.slug === cluster);
      if (!c) return false;
      return article === undefined || c.satellites.some((a) => a.slug === article);
    }
    default:
      return false;
  }
}

describe("recommendations registry", () => {
  it("every surface key resolves to a real page", () => {
    for (const key of surfaceKeys) {
      expect(resolves(key), `unresolvable surface key: ${key}`).toBe(true);
    }
  });

  it("every pick is complete and its URL is either pending or https", () => {
    for (const key of surfaceKeys) {
      for (const pick of allPicksFor(key)) {
        expect(pick.offerId.length).toBeGreaterThan(0);
        expect(pick.name.length).toBeGreaterThan(0);
        expect(pick.why.length).toBeGreaterThan(0);
        expect(
          pick.url === "" || pick.url.startsWith("https://"),
          `${key}/${pick.offerId}: url must be "" (pending) or https`,
        ).toBe(true);
      }
    }
  });

  it("offerIds are unique within each surface", () => {
    for (const key of surfaceKeys) {
      const ids = allPicksFor(key).map((p) => p.offerId);
      expect(new Set(ids).size, `duplicate offerId on ${key}`).toBe(ids.length);
    }
  });

  it("only live picks are rendered, and unknown surfaces render nothing", () => {
    const pending: ProductPick = { offerId: "x", name: "X", why: "y", url: "" };
    const live: ProductPick = { ...pending, url: "https://example.com/x" };
    expect(isLivePick(pending)).toBe(false);
    expect(isLivePick(live)).toBe(true);
    for (const key of surfaceKeys) {
      for (const pick of recommendationsFor(key)) {
        expect(isLivePick(pick)).toBe(true);
      }
    }
    expect(recommendationsFor("supplement:does-not-exist")).toEqual([]);
  });

  it("never recommends products on marketing-claim supplement pages", () => {
    for (const s of supplements.filter((x) => x.headlineTier === "marketing-claim")) {
      expect(
        allPicksFor(`supplement:${s.slug}`),
        `supplement:${s.slug} is marketing-claim tier and must have no picks`,
      ).toEqual([]);
    }
  });

  it("tool surfaces only target tools with affiliates enabled", () => {
    for (const key of surfaceKeys.filter((k) => k.startsWith("tool:"))) {
      const tool = allTools.find((t) => t.slug === key.slice("tool:".length));
      expect(tool?.monetization.affiliates, `${key} needs monetization.affiliates`).toBe(true);
    }
  });
});
