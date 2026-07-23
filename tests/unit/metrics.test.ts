import { describe, expect, it } from "vitest";
import {
  dashboardMetrics,
  metricsByKey,
  validateMetrics,
  featuredMetrics,
  savedCalcMetrics,
  metricForToolSlug,
  formatMetricValue,
  type DashboardMetric,
} from "@/registry/metrics";

/**
 * The dashboard metric registry must satisfy the invariants it owns (DASHBOARD.md
 * §5.3, §12): unique keys, real display copy, sane display numbers, a valid
 * valence, and — the load-bearing one — that every source cross-link resolves to
 * a real tool or biomarker. A dead cross-link must fail the build.
 */
describe("dashboard metric registry", () => {
  it("passes structural validation (incl. live source cross-links)", () => {
    expect(validateMetrics()).toEqual([]);
  });

  it("has metrics and every one carries display copy", () => {
    expect(dashboardMetrics.length).toBeGreaterThan(0);
    for (const m of dashboardMetrics) {
      expect(m.label.trim().length).toBeGreaterThan(0);
      expect(m.blurb.trim().length).toBeGreaterThan(0);
      expect(metricsByKey.get(m.key)).toBe(m);
    }
  });

  it("splits into featured scores and saved-calculation metrics", () => {
    expect(featuredMetrics().length).toBeGreaterThan(0);
    expect(savedCalcMetrics().length).toBeGreaterThan(0);
    expect(featuredMetrics().length + savedCalcMetrics().length).toBe(dashboardMetrics.length);
  });

  it("resolves a metric from the tool slug that feeds it", () => {
    expect(metricForToolSlug("tdee-calculator")?.key).toBe("tdee");
    expect(metricForToolSlug("one-rep-max-calculator")?.key).toBe("one-rep-max");
    expect(metricForToolSlug("not-a-real-tool")).toBeUndefined();
  });

  it("catches a broken tool cross-link", () => {
    const broken: DashboardMetric[] = [
      {
        key: "x",
        label: "X",
        group: "body",
        featured: false,
        source: { kind: "tool", slug: "ghost-tool" },
        unit: "kg",
        precision: 0,
        direction: "none",
        epsilon: 1,
        blurb: "x",
      },
    ];
    expect(validateMetrics(broken)).toContain(
      "x: source tool 'ghost-tool' is not a registered tool",
    );
  });

  it("catches a duplicate key and a bad precision", () => {
    const dupe: DashboardMetric = {
      key: "dupe",
      label: "Dupe",
      group: "body",
      featured: false,
      source: { kind: "tool", slug: "bmi-calculator" },
      unit: "",
      precision: -1,
      direction: "none",
      epsilon: 1,
      blurb: "d",
    };
    const problems = validateMetrics([dupe, { ...dupe }]);
    expect(problems).toContain("duplicate key: dupe");
    expect(problems).toContain("dupe: precision must be a non-negative integer");
  });

  it("formats values to the metric's precision in British locale", () => {
    const tdee = metricsByKey.get("tdee")!;
    const orm = metricsByKey.get("one-rep-max")!;
    expect(formatMetricValue(tdee, 3200)).toBe("3,200");
    expect(formatMetricValue(orm, 102.47)).toBe("102.5");
  });
});
