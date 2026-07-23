/**
 * Dashboard metric registry (DASHBOARD.md §5.3) — the single source of truth
 * for every metric the personal dashboard can display and trend. Same
 * single-source-of-truth pattern as tools / biomarkers / daily: this list drives
 * the headline scores row, the saved-calculations grid and (later) the
 * Trajectory picker.
 *
 * This registry is an AGGREGATOR, not a source of science (DASHBOARD.md §0). It
 * carries no formulas and no coefficients — only *display* metadata: where a
 * value comes from, its unit, how many decimals to show, and the valence used
 * to frame a change positively (reusing `MetricDirection` / `frameDelta` from
 * history.ts). Score bands / "On track" pills are deliberately NOT here: those
 * thresholds are METHODOLOGY science and are added when that doc defines them
 * (kept out of D0 to honour "no new science").
 *
 * Direction is chosen conservatively. Biological/heart age uses "down" (younger
 * is a win). Composite indices use "up" (higher = more favourable, per the
 * index engine). Body-composition metrics are "none" (valence-free) on purpose:
 * calling a body number "better" or "worse" is a value judgement the positive-
 * frame guardrails (DESIGN §4, ROADMAP §2) keep the site out of.
 *
 * A metric may be defined before the tool that feeds it actually persists a
 * result — the dashboard renders an empty state until data arrives. Units and
 * direction here are the intended contract those tools reconcile to when they
 * are wired to save (today only TDEE and 1RM persist; see history.ts callers).
 */

import type { MetricDirection } from "@/lib/history";
import { getTool } from "@/registry/tools";
import { biomarkersById } from "@/registry/biomarkers";

export const METRICS_LAST_REVIEWED = "2026-07-23";

/** Layout grouping on the dashboard (DASHBOARD.md §6). */
export type MetricGroup = "score" | "longevity" | "energy" | "fitness" | "body";

/**
 * Where a metric's value comes from. `tool` reads the existing per-tool history
 * (history.ts, keyed by slug); `biomarker` reads a dated reading from the
 * dashboard store (gated, §8). Both are validated against their registries so a
 * dead cross-link fails the build (DASHBOARD.md §5.3, mirroring biomarkers.ts).
 */
export type MetricSource =
  | { kind: "tool"; slug: string }
  | { kind: "biomarker"; id: string };

export interface DashboardMetric {
  /** Stable dashboard id — anchors, Trajectory keys, MetricPoint.metric. */
  key: string;
  /** Display label, e.g. "Heart age". */
  label: string;
  group: MetricGroup;
  /** Headline scores row (§6.2) when true; saved-calculations grid otherwise. */
  featured: boolean;
  source: MetricSource;
  /** Display unit shown in Space Mono after the value. May be "". */
  unit: string;
  /** Decimal places at display time (values are stored full-precision). */
  precision: number;
  /** Valence for positive-frame delta chips (reuses history.ts framing). */
  direction: MetricDirection;
  /** Noise floor in the stored unit — changes within it read as "level". */
  epsilon: number;
  /** One-line context for the tile / empty state. */
  blurb: string;
}

export const dashboardMetrics: DashboardMetric[] = [
  // ---- Headline longevity & biological-age scores (§6.2) ----
  {
    key: "metabolic-fitness",
    label: "Metabolic fitness",
    group: "score",
    featured: true,
    source: { kind: "tool", slug: "metabolic-fitness-index" },
    unit: "/ 100",
    precision: 0,
    direction: "up",
    epsilon: 1,
    blurb: "Your open, transparent metabolic-health score.",
  },
  {
    key: "pace-of-aging",
    label: "Pace of aging",
    group: "score",
    featured: true,
    source: { kind: "tool", slug: "pace-of-aging-index" },
    unit: "/ 100",
    precision: 0,
    direction: "up",
    epsilon: 1,
    blurb: "A self-relative lifestyle-trajectory score.",
  },
  {
    key: "recovery-readiness",
    label: "Recovery readiness",
    group: "score",
    featured: true,
    source: { kind: "tool", slug: "recovery-readiness-index" },
    unit: "/ 100",
    precision: 0,
    direction: "up",
    epsilon: 1,
    blurb: "How recovered you are versus your own baseline.",
  },
  {
    key: "phenotypic-age",
    label: "Biological age",
    group: "longevity",
    featured: true,
    source: { kind: "tool", slug: "phenotypic-age-calculator" },
    unit: "yrs",
    precision: 0,
    direction: "down",
    epsilon: 0.5,
    blurb: "Phenotypic age estimated from your blood markers.",
  },
  {
    key: "heart-age",
    label: "Heart age",
    group: "longevity",
    featured: true,
    source: { kind: "tool", slug: "heart-age-calculator" },
    unit: "yrs",
    precision: 0,
    direction: "down",
    epsilon: 0.5,
    blurb: "Your cardiovascular age from the PREVENT equations.",
  },

  // ---- Saved calculations (§6.4) ----
  {
    key: "tdee",
    label: "TDEE",
    group: "energy",
    featured: false,
    source: { kind: "tool", slug: "tdee-calculator" },
    unit: "kcal/day",
    precision: 0,
    direction: "none",
    epsilon: 25,
    blurb: "Total daily energy expenditure.",
  },
  {
    key: "one-rep-max",
    label: "One-rep max",
    group: "fitness",
    featured: false,
    source: { kind: "tool", slug: "one-rep-max-calculator" },
    unit: "kg",
    precision: 1,
    direction: "up",
    epsilon: 0.25,
    blurb: "Estimated one-rep max for your lift.",
  },
  {
    key: "bmi",
    label: "BMI",
    group: "body",
    featured: false,
    source: { kind: "tool", slug: "bmi-calculator" },
    unit: "kg/m²",
    precision: 1,
    direction: "none",
    epsilon: 0.1,
    blurb: "Body mass index and its WHO category.",
  },
  {
    key: "body-fat",
    label: "Body fat",
    group: "body",
    featured: false,
    source: { kind: "tool", slug: "body-fat-calculator" },
    unit: "%",
    precision: 1,
    direction: "none",
    epsilon: 0.5,
    blurb: "Estimated body-fat percentage (US Navy method).",
  },
  {
    key: "ffmi",
    label: "FFMI",
    group: "body",
    featured: false,
    source: { kind: "tool", slug: "ffmi-calculator" },
    unit: "kg/m²",
    precision: 1,
    direction: "up",
    epsilon: 0.1,
    blurb: "Fat-free mass index: muscularity, height-adjusted.",
  },
];

/**
 * Structural validation (build-time, via unit test — DASHBOARD.md §12). Returns
 * problems; empty means valid. Asserts the invariants the registry owns: unique
 * keys, real display copy, sane display numbers, a valid valence, and — the
 * load-bearing one — that every source cross-link resolves to a real tool or a
 * real biomarker (a dead link must fail the build, per §5.3).
 */
export function validateMetrics(list: DashboardMetric[] = dashboardMetrics): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const directions: MetricDirection[] = ["up", "down", "none"];

  for (const m of list) {
    if (seen.has(m.key)) problems.push(`duplicate key: ${m.key}`);
    seen.add(m.key);
    if (!m.label.trim()) problems.push(`${m.key}: empty label`);
    if (!m.blurb.trim()) problems.push(`${m.key}: empty blurb`);
    if (typeof m.unit !== "string") problems.push(`${m.key}: unit must be a string`);
    if (!Number.isInteger(m.precision) || m.precision < 0) {
      problems.push(`${m.key}: precision must be a non-negative integer`);
    }
    if (!Number.isFinite(m.epsilon) || m.epsilon < 0) {
      problems.push(`${m.key}: epsilon must be a non-negative number`);
    }
    if (!directions.includes(m.direction)) {
      problems.push(`${m.key}: unknown direction ${m.direction}`);
    }
    if (m.source.kind === "tool") {
      if (!getTool(m.source.slug)) {
        problems.push(`${m.key}: source tool '${m.source.slug}' is not a registered tool`);
      }
    } else if (m.source.kind === "biomarker") {
      if (!biomarkersById.has(m.source.id)) {
        problems.push(`${m.key}: source biomarker '${m.source.id}' is not a known marker`);
      }
    } else {
      problems.push(`${m.key}: unknown source kind`);
    }
  }
  return problems;
}

export const metricsByKey: ReadonlyMap<string, DashboardMetric> = new Map(
  dashboardMetrics.map((m) => [m.key, m]),
);

/** Metric fed by a given tool slug, if any (dashboard reads history by slug). */
export function metricForToolSlug(slug: string): DashboardMetric | undefined {
  return dashboardMetrics.find((m) => m.source.kind === "tool" && m.source.slug === slug);
}

/** Headline scores (§6.2), in registry order. */
export function featuredMetrics(): DashboardMetric[] {
  return dashboardMetrics.filter((m) => m.featured);
}

/** Saved-calculation metrics (§6.4), in registry order. */
export function savedCalcMetrics(): DashboardMetric[] {
  return dashboardMetrics.filter((m) => !m.featured);
}

/**
 * Format a stored value for display: British locale, tabular-friendly, rounded
 * to the metric's precision. Rounding is display-only — stored values keep full
 * precision (SPEC §3).
 */
export function formatMetricValue(metric: DashboardMetric, value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: metric.precision,
    maximumFractionDigits: metric.precision,
  });
}
