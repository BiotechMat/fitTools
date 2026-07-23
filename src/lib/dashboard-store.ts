/**
 * Dashboard profile store (DASHBOARD.md §5). The richer profile document that
 * sits AROUND the existing per-tool history (history.ts) — it holds what a
 * dashboard needs and history does not: the person's vitals (§3.1), timestamped
 * multi-metric points (§3.2/§3.4), and dated blood-test biomarker readings
 * (§3.3). It does not replace history.ts and does not change it.
 *
 * Same local-first, guarded, sync-ready shape as history.ts / pulse-store.ts /
 * daily-store.ts: a pure, node-testable core plus a thin localStorage wrapper at
 * the bottom. This IS the SPEC §10 `HistoryProvider` seam — every read/write
 * goes through here, so promoting local → authed storage when accounts land
 * (ROADMAP E0) is one central change, not a caller sweep.
 *
 * Privacy contract (DASHBOARD.md §8): biomarker readings and identified vitals
 * are special-category data. This module is the *shape*; persisting real blood
 * values or an identified profile to an account is gated behind the §8 data-
 * protection posture. Age is derived from `birthDate`, never stored. Values are
 * canonical SI (SPEC §3); display conversion stays at the call site.
 */

export const DASHBOARD_STORAGE_KEY = "fittools.dashboard.v1";
export const DASHBOARD_CHANGE_EVENT = "fittools:dashboard-change";
/** Cap timestamped points per metric, oldest dropped (mirrors history.ts). */
export const DASHBOARD_LIMIT_PER_METRIC = 60;

export type Sex = "male" | "female";

export interface ProfileVitals {
  sex?: Sex;
  /** ISO date (YYYY-MM-DD). Age is derived from this, never stored. */
  birthDate?: string;
  heightCm?: number;
  weightKg?: number;
  restingHr?: number;
  /** ISO datetime of the last vitals edit. */
  updatedAt?: string;
}

/** A timestamped metric value keyed by the metric registry (metrics.ts). */
export interface MetricPoint {
  /** DashboardMetric.key. */
  metric: string;
  /** Canonical SI / registry unit. */
  value: number;
  savedAt: string;
  /** Provenance: tool slug or "blood-test". */
  source?: string;
}

/** A dated blood-test / manual biomarker reading (biomarkers.ts id). GATED §8. */
export interface BiomarkerReading {
  marker: string;
  value: number;
  /** Assay unit snapshot at capture time. */
  unit: string;
  /** ISO date of the blood draw. */
  takenAt: string;
  source: "blood-test" | "manual";
}

export interface DashboardProfile {
  version: 1;
  profile: ProfileVitals;
  metrics: MetricPoint[];
  biomarkers: BiomarkerReading[];
}

const EMPTY: DashboardProfile = {
  version: 1,
  profile: {},
  metrics: [],
  biomarkers: [],
};

/* ------------------------------------------------------------------ */
/* Pure, node-testable core                                            */
/* ------------------------------------------------------------------ */

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

function isMetricPoint(candidate: unknown): candidate is MetricPoint {
  if (typeof candidate !== "object" || candidate === null) return false;
  const r = candidate as Record<string, unknown>;
  return (
    typeof r.metric === "string" &&
    isFiniteNumber(r.value) &&
    isIsoDate(r.savedAt) &&
    (r.source === undefined || typeof r.source === "string")
  );
}

function isBiomarkerReading(candidate: unknown): candidate is BiomarkerReading {
  if (typeof candidate !== "object" || candidate === null) return false;
  const r = candidate as Record<string, unknown>;
  return (
    typeof r.marker === "string" &&
    isFiniteNumber(r.value) &&
    typeof r.unit === "string" &&
    isIsoDate(r.takenAt) &&
    (r.source === "blood-test" || r.source === "manual")
  );
}

/** Keep only the vitals fields we recognise, dropping anything foreign. */
function sanitiseProfile(raw: unknown): ProfileVitals {
  if (typeof raw !== "object" || raw === null) return {};
  const r = raw as Record<string, unknown>;
  const profile: ProfileVitals = {};
  if (r.sex === "male" || r.sex === "female") profile.sex = r.sex;
  if (isIsoDate(r.birthDate)) profile.birthDate = r.birthDate as string;
  if (isFiniteNumber(r.heightCm)) profile.heightCm = r.heightCm;
  if (isFiniteNumber(r.weightKg)) profile.weightKg = r.weightKg;
  if (isFiniteNumber(r.restingHr)) profile.restingHr = r.restingHr;
  if (isIsoDate(r.updatedAt)) profile.updatedAt = r.updatedAt as string;
  return profile;
}

/** Tolerant parse: corrupt or foreign storage never breaks the dashboard. */
export function parseDashboard(raw: string | null): DashboardProfile {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const record = parsed as Record<string, unknown>;
    if (record.version !== 1) return EMPTY;
    return {
      version: 1,
      profile: sanitiseProfile(record.profile),
      metrics: Array.isArray(record.metrics) ? record.metrics.filter(isMetricPoint) : [],
      biomarkers: Array.isArray(record.biomarkers)
        ? record.biomarkers.filter(isBiomarkerReading)
        : [],
    };
  } catch {
    return EMPTY;
  }
}

export function serializeDashboard(doc: DashboardProfile): string {
  return JSON.stringify(doc);
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Merge vitals, stamping updatedAt. A partial update only touches the fields it
 * carries; `now` is injectable for deterministic tests.
 */
export function setProfile(
  doc: DashboardProfile,
  patch: Partial<Omit<ProfileVitals, "updatedAt">>,
  now: Date = new Date(),
): DashboardProfile {
  return {
    ...doc,
    profile: { ...doc.profile, ...patch, updatedAt: now.toISOString() },
  };
}

/**
 * Add a metric point. Same metric + same local calendar day replaces (latest of
 * the day wins), so a session of recalculating collapses to one point — the same
 * rule history.ts uses. Per-metric count is capped, oldest dropped.
 */
export function upsertMetricPoint(
  doc: DashboardProfile,
  point: MetricPoint,
): DashboardProfile {
  const pointDay = new Date(point.savedAt);
  const kept = doc.metrics.filter(
    (p) => !(p.metric === point.metric && sameLocalDay(new Date(p.savedAt), pointDay)),
  );
  const metrics = [...kept, point];
  const forMetric = metrics.filter((p) => p.metric === point.metric);
  if (forMetric.length <= DASHBOARD_LIMIT_PER_METRIC) {
    return { ...doc, metrics };
  }
  const oldest = forMetric.reduce((a, b) =>
    Date.parse(a.savedAt) <= Date.parse(b.savedAt) ? a : b,
  );
  return { ...doc, metrics: metrics.filter((p) => p !== oldest) };
}

/**
 * Add a biomarker reading (GATED §8). Same marker + same draw date replaces.
 * Kept in the pure core so the shape is testable now; persistence is gated.
 */
export function upsertBiomarkerReading(
  doc: DashboardProfile,
  reading: BiomarkerReading,
): DashboardProfile {
  const kept = doc.biomarkers.filter(
    (b) => !(b.marker === reading.marker && b.takenAt === reading.takenAt),
  );
  return { ...doc, biomarkers: [...kept, reading] };
}

/** Points for one metric, oldest → newest (Trajectory input, §3.5). */
export function pointsForMetric(doc: DashboardProfile, metric: string): MetricPoint[] {
  return doc.metrics
    .filter((p) => p.metric === metric)
    .sort((a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt));
}

/** Age in whole years from an ISO birthDate. Derived only — never stored. */
export function deriveAge(birthDate: string, now: Date = new Date()): number | null {
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  let age = now.getFullYear() - born.getFullYear();
  const monthDiff = now.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < born.getDate())) age--;
  return age >= 0 ? age : null;
}

/* ------------------------------------------------------------------ */
/* Browser storage wrapper — guarded: private mode, quota or disabled  */
/* storage silently degrade to an empty profile, never a broken page.  */
/* ------------------------------------------------------------------ */

export function readDashboard(): DashboardProfile {
  if (typeof window === "undefined") return EMPTY;
  try {
    return parseDashboard(window.localStorage.getItem(DASHBOARD_STORAGE_KEY));
  } catch {
    return EMPTY;
  }
}

/** Raw string read for reactive `useSyncExternalStore` subscribers. */
export function readRawDashboard(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(DASHBOARD_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeDashboard(doc: DashboardProfile): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(DASHBOARD_STORAGE_KEY, serializeDashboard(doc));
    window.dispatchEvent(new Event(DASHBOARD_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

/** Wipe everything the dashboard holds (the §8 "delete everything" control). */
export function clearDashboard(): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
    window.dispatchEvent(new Event(DASHBOARD_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}
