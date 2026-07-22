/**
 * Local result history — the "since last time" return-visit loop
 * (DESIGN.md §6; SPEC §10's HistoryProvider note: localStorage now, can
 * swap to authed storage later without changing callers).
 *
 * Pure core (node-testable) + a thin guarded localStorage wrapper at the
 * bottom. Values are stored in canonical SI units only (SPEC §3); display
 * conversion stays at the call site.
 *
 * Framing rules (DESIGN.md §4, ROADMAP §2): the baseline is always a
 * PREVIOUS calendar day — a same-session recalculation is never "progress"
 * — and a worse number is reported neutrally ("behind"), never as a
 * verdict; copy stays positive at the component layer.
 */

export const HISTORY_STORAGE_KEY = "fittools.history.v1";
export const FIRST_WIN_STORAGE_KEY = "fittools.first-win.v1";
export const HISTORY_LIMIT_PER_TOOL = 30;
/** Same-tab change notification, mirroring the units pattern (UnitInput). */
export const HISTORY_CHANGE_EVENT = "fittools:history-change";

/** Whether a bigger number is an improvement for this metric. */
export type MetricDirection = "up" | "down" | "none";

export interface StoredResult {
  /** Tool slug from the registry, e.g. "one-rep-max-calculator". */
  tool: string;
  /** Canonical SI value (kg, kcal/day, years…). */
  value: number;
  /** ISO datetime of the save. */
  savedAt: string;
}

export interface HistoryFile {
  version: 1;
  results: StoredResult[];
}

export type FramedDelta =
  | { kind: "better"; deltaAbs: number }
  | { kind: "behind"; deltaAbs: number }
  | { kind: "changed"; deltaAbs: number; direction: "up" | "down" }
  | { kind: "level" };

const EMPTY: HistoryFile = { version: 1, results: [] };

function isStoredResult(candidate: unknown): candidate is StoredResult {
  if (typeof candidate !== "object" || candidate === null) return false;
  const record = candidate as Record<string, unknown>; // narrowed field-by-field below
  return (
    typeof record.tool === "string" &&
    typeof record.value === "number" &&
    Number.isFinite(record.value) &&
    typeof record.savedAt === "string" &&
    !Number.isNaN(Date.parse(record.savedAt))
  );
}

/** Tolerant parse: corrupt or foreign storage never breaks a calculator. */
export function parseHistory(raw: string | null): HistoryFile {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const record = parsed as Record<string, unknown>; // shape checked below
    if (record.version !== 1 || !Array.isArray(record.results)) return EMPTY;
    return { version: 1, results: record.results.filter(isStoredResult) };
  } catch {
    return EMPTY;
  }
}

export function serializeHistory(history: HistoryFile): string {
  return JSON.stringify(history);
}

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Add a result. Same tool + same local calendar day replaces (latest of the
 * day wins) so a session of recalculating collapses to one entry; per-tool
 * count is capped, oldest dropped.
 */
export function upsertResult(history: HistoryFile, entry: StoredResult): HistoryFile {
  const entryDay = new Date(entry.savedAt);
  const kept = history.results.filter(
    (r) => !(r.tool === entry.tool && sameLocalDay(new Date(r.savedAt), entryDay)),
  );
  const results = [...kept, entry];
  const forTool = results.filter((r) => r.tool === entry.tool);
  if (forTool.length <= HISTORY_LIMIT_PER_TOOL) return { version: 1, results };
  const oldest = forTool[0];
  return { version: 1, results: results.filter((r) => r !== oldest) };
}

/**
 * The comparison baseline: the most recent entry for this tool saved on an
 * EARLIER local day than `now`. Entries from today are ignored so the chip
 * always means "since your last visit", never "since you nudged an input".
 */
export function latestBefore(
  history: HistoryFile,
  tool: string,
  now: Date,
): StoredResult | null {
  for (let i = history.results.length - 1; i >= 0; i--) {
    const candidate = history.results[i];
    if (candidate.tool !== tool) continue;
    if (!sameLocalDay(new Date(candidate.savedAt), now)) return candidate;
  }
  return null;
}

/**
 * Frame a change per the positive-frame rules. `epsilon` is the metric's
 * noise floor: differences at or below it read as "level" — consistency,
 * not failure.
 */
export function frameDelta(
  direction: MetricDirection,
  epsilon: number,
  previous: number,
  current: number,
): FramedDelta {
  const diff = current - previous;
  if (Math.abs(diff) <= epsilon) return { kind: "level" };
  if (direction === "none") {
    return { kind: "changed", deltaAbs: Math.abs(diff), direction: diff > 0 ? "up" : "down" };
  }
  const improved = direction === "up" ? diff > 0 : diff < 0;
  return improved
    ? { kind: "better", deltaAbs: Math.abs(diff) }
    : { kind: "behind", deltaAbs: Math.abs(diff) };
}

/* ------------------------------------------------------------------ */
/* Browser storage wrapper — guarded: private mode, quota or disabled  */
/* storage silently degrade to "no history", never to a broken tool.   */
/* ------------------------------------------------------------------ */

export function readHistory(): HistoryFile {
  if (typeof window === "undefined") return EMPTY;
  try {
    return parseHistory(window.localStorage.getItem(HISTORY_STORAGE_KEY));
  } catch {
    return EMPTY;
  }
}

export function readRawHistory(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(HISTORY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeHistory(history: HistoryFile): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, serializeHistory(history));
    window.dispatchEvent(new Event(HISTORY_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function clearToolHistory(tool: string): void {
  const history = readHistory();
  writeHistory({ version: 1, results: history.results.filter((r) => r.tool !== tool) });
}

/** Day-1 win (ROADMAP E3): true only for the first result ever saved. */
export function claimFirstWin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(FIRST_WIN_STORAGE_KEY) !== null) return false;
    window.localStorage.setItem(FIRST_WIN_STORAGE_KEY, new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}
