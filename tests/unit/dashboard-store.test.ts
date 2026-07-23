import { describe, expect, it } from "vitest";
import {
  parseDashboard,
  serializeDashboard,
  setProfile,
  upsertMetricPoint,
  upsertBiomarkerReading,
  pointsForMetric,
  deriveAge,
  readDashboard,
  writeDashboard,
  DASHBOARD_LIMIT_PER_METRIC,
  type DashboardProfile,
  type MetricPoint,
} from "@/lib/dashboard-store";
import { frameDelta } from "@/lib/history";
import { metricsByKey } from "@/registry/metrics";

const EMPTY: DashboardProfile = { version: 1, profile: {}, metrics: [], biomarkers: [] };

describe("dashboard store — tolerant parse (DASHBOARD.md §5.2)", () => {
  it("returns empty for null, non-JSON, non-object and wrong version", () => {
    expect(parseDashboard(null)).toEqual(EMPTY);
    expect(parseDashboard("{not json")).toEqual(EMPTY);
    expect(parseDashboard("42")).toEqual(EMPTY);
    expect(parseDashboard(JSON.stringify({ version: 2, metrics: [] }))).toEqual(EMPTY);
  });

  it("drops foreign / malformed entries but keeps valid ones", () => {
    const raw = JSON.stringify({
      version: 1,
      profile: { sex: "male", heightCm: 180, junk: "x", weightKg: "nope" },
      metrics: [
        { metric: "tdee", value: 2500, savedAt: "2026-07-20T10:00:00.000Z" },
        { metric: "bad", value: "NaN", savedAt: "nope" },
      ],
      biomarkers: [
        { marker: "apob", value: 0.9, unit: "g/L", takenAt: "2026-07-01", source: "manual" },
        { marker: "x", value: 1, unit: "g/L", takenAt: "2026-07-01", source: "hacker" },
      ],
    });
    const doc = parseDashboard(raw);
    expect(doc.profile).toEqual({ sex: "male", heightCm: 180 }); // junk + bad weight dropped
    expect(doc.metrics).toHaveLength(1);
    expect(doc.metrics[0].metric).toBe("tdee");
    expect(doc.biomarkers).toHaveLength(1);
    expect(doc.biomarkers[0].marker).toBe("apob");
  });

  it("round-trips through serialize", () => {
    const doc = upsertMetricPoint(EMPTY, {
      metric: "tdee",
      value: 2400,
      savedAt: "2026-07-20T10:00:00.000Z",
    });
    expect(parseDashboard(serializeDashboard(doc))).toEqual(doc);
  });
});

describe("dashboard store — multi-metric upsert (DASHBOARD.md §5.2)", () => {
  const day = (iso: string, metric: string, value: number): MetricPoint => ({
    metric,
    value,
    savedAt: iso,
  });

  it("keeps distinct metrics saved on the same day (no collision)", () => {
    let doc = upsertMetricPoint(EMPTY, day("2026-07-20T09:00:00.000Z", "tdee", 2500));
    doc = upsertMetricPoint(doc, day("2026-07-20T09:01:00.000Z", "one-rep-max", 100));
    expect(doc.metrics).toHaveLength(2);
  });

  it("collapses same metric + same local day to the latest value", () => {
    let doc = upsertMetricPoint(EMPTY, day("2026-07-20T09:00:00.000Z", "tdee", 2500));
    doc = upsertMetricPoint(doc, day("2026-07-20T18:00:00.000Z", "tdee", 2600));
    const tdee = pointsForMetric(doc, "tdee");
    expect(tdee).toHaveLength(1);
    expect(tdee[0].value).toBe(2600);
  });

  it("keeps different days for the same metric and sorts oldest → newest", () => {
    let doc = upsertMetricPoint(EMPTY, day("2026-07-19T09:00:00.000Z", "tdee", 2500));
    doc = upsertMetricPoint(doc, day("2026-07-20T09:00:00.000Z", "tdee", 2550));
    const tdee = pointsForMetric(doc, "tdee");
    expect(tdee.map((p) => p.value)).toEqual([2500, 2550]);
  });

  it("caps points per metric, dropping the oldest", () => {
    let doc = EMPTY;
    for (let i = 0; i < DASHBOARD_LIMIT_PER_METRIC + 5; i++) {
      // Distinct calendar days so none collapse.
      const date = new Date(Date.UTC(2026, 0, 1 + i, 12)).toISOString();
      doc = upsertMetricPoint(doc, day(date, "tdee", 2000 + i));
    }
    const tdee = pointsForMetric(doc, "tdee");
    expect(tdee).toHaveLength(DASHBOARD_LIMIT_PER_METRIC);
    // Oldest five dropped: series now starts at value 2005.
    expect(tdee[0].value).toBe(2005);
  });
});

describe("dashboard store — delta framing reuses history.ts (DASHBOARD.md §5.4)", () => {
  it("frames a metric change with its registry direction + epsilon", () => {
    const orm = metricsByKey.get("one-rep-max")!; // direction "up"
    // +5 kg on a 100 kg 1RM, above the 0.25 kg noise floor → a win.
    expect(frameDelta(orm.direction, orm.epsilon, 100, 105)).toEqual({
      kind: "better",
      deltaAbs: 5,
    });
    // Younger biological age is a win (direction "down").
    const bio = metricsByKey.get("phenotypic-age")!;
    expect(frameDelta(bio.direction, bio.epsilon, 42, 40).kind).toBe("better");
    // Within epsilon reads as level, not regression.
    expect(frameDelta(orm.direction, orm.epsilon, 100, 100.1).kind).toBe("level");
  });
});

describe("dashboard store — profile & derived age", () => {
  it("merges vitals and stamps updatedAt without mutating input", () => {
    const now = new Date("2026-07-23T12:00:00.000Z");
    const doc = setProfile(EMPTY, { sex: "female", heightCm: 165 }, now);
    expect(doc.profile.sex).toBe("female");
    expect(doc.profile.heightCm).toBe(165);
    expect(doc.profile.updatedAt).toBe(now.toISOString());
    const doc2 = setProfile(doc, { weightKg: 60 }, now);
    expect(doc2.profile.heightCm).toBe(165); // preserved
    expect(doc2.profile.weightKg).toBe(60);
    expect(EMPTY.profile).toEqual({}); // input untouched
  });

  it("derives whole-year age and never stores it", () => {
    const now = new Date("2026-07-23T12:00:00.000Z");
    expect(deriveAge("1990-07-23", now)).toBe(36);
    expect(deriveAge("1990-07-24", now)).toBe(35); // birthday not yet reached
    expect(deriveAge("not-a-date", now)).toBeNull();
    const doc = setProfile(EMPTY, { birthDate: "1990-07-23" }, now);
    expect("age" in doc.profile).toBe(false);
  });
});

describe("dashboard store — biomarker readings (gated shape)", () => {
  it("replaces a reading for the same marker + draw date", () => {
    let doc = upsertBiomarkerReading(EMPTY, {
      marker: "apob",
      value: 0.9,
      unit: "g/L",
      takenAt: "2026-07-01",
      source: "manual",
    });
    doc = upsertBiomarkerReading(doc, {
      marker: "apob",
      value: 0.8,
      unit: "g/L",
      takenAt: "2026-07-01",
      source: "manual",
    });
    expect(doc.biomarkers).toHaveLength(1);
    expect(doc.biomarkers[0].value).toBe(0.8);
  });
});

describe("dashboard store — graceful degradation with no window (DASHBOARD.md §12)", () => {
  it("reads empty and reports write failure in a non-browser env", () => {
    // Node test environment: `window` is undefined.
    expect(readDashboard()).toEqual(EMPTY);
    expect(writeDashboard(EMPTY)).toBe(false);
  });
});
