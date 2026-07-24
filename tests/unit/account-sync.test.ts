import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startAccountSync, stopAccountSync } from "@/lib/account/sync";
import { serializeHistory, type HistoryFile } from "@/lib/history";
import { ACCOUNT_HINT_KEY } from "@/lib/auth/session-probe";

/** Minimal window stub (node env) — storage + events, as the stores need. */
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  clear(): void {
    this.map.clear();
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  get length(): number {
    return this.map.size;
  }
}

interface RecordedPut {
  namespace: string;
  ifMatch: string | null;
  body: string;
}

function historyDoc(results: HistoryFile["results"]): string {
  return serializeHistory({ version: 1, results });
}

const SERVER_RESULT = {
  tool: "tdee-calculator",
  value: 2400,
  savedAt: "2026-07-20T08:00:00.000Z",
};
const LOCAL_RESULT = {
  tool: "one-rep-max-calculator",
  value: 140,
  savedAt: "2026-07-22T08:00:00.000Z",
};

let storage: MemoryStorage;
let puts: RecordedPut[];
let putResponders: ((put: RecordedPut) => Response | null)[];
let pullResponse: () => Response;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  storage = new MemoryStorage();
  storage.setItem(ACCOUNT_HINT_KEY, "1");
  const target = new EventTarget();
  vi.stubGlobal("window", {
    localStorage: storage,
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  });
  puts = [];
  putResponders = [];
  pullResponse = () =>
    jsonResponse({
      documents: {
        history: { doc: historyDoc([SERVER_RESULT]), updatedAt: "2026-07-20T09:00:00.000Z" },
      },
      consents: { healthStorage: true, bloodworkStorage: false },
    });
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/account/stores" && (init?.method ?? "GET") === "GET") {
        return pullResponse();
      }
      const match = url.match(/^\/api\/account\/stores\/([a-z]+)$/);
      if (match && init?.method === "PUT") {
        const headers = new Headers(init.headers);
        const put: RecordedPut = {
          namespace: match[1],
          ifMatch: headers.get("If-Match"),
          body: String(init.body),
        };
        puts.push(put);
        for (const responder of putResponders) {
          const response = responder(put);
          if (response !== null) return response;
        }
        return jsonResponse({ updatedAt: `pushed-${puts.length}` });
      }
      return jsonResponse({ error: "unexpected" }, 500);
    }),
  );
});

afterEach(() => {
  stopAccountSync();
  vi.unstubAllGlobals();
});

async function waitForPuts(count: number): Promise<void> {
  await vi.waitFor(() => {
    expect(puts.length).toBeGreaterThanOrEqual(count);
  });
}

describe("account sync engine (ACCOUNTS §6.1)", () => {
  it("initial sync merges server + local, adopts locally, pushes with the server etag", async () => {
    storage.setItem("fittools.history.v1", historyDoc([LOCAL_RESULT]));
    startAccountSync();
    await waitForPuts(1);
    const historyPut = puts.find((p) => p.namespace === "history");
    expect(historyPut).toBeDefined();
    expect(historyPut?.ifMatch).toBe("2026-07-20T09:00:00.000Z");
    // The pushed document carries BOTH devices' results.
    const pushed = JSON.parse(historyPut?.body ?? "{}") as HistoryFile;
    expect(pushed.results.map((r) => r.tool).sort()).toEqual([
      "one-rep-max-calculator",
      "tdee-calculator",
    ]);
    // And the local store adopted the merge.
    const local = JSON.parse(storage.getItem("fittools.history.v1") ?? "{}") as HistoryFile;
    expect(local.results).toHaveLength(2);
  });

  it("resolves a 409 by re-merging against the returned document and retrying once", async () => {
    storage.setItem("fittools.history.v1", historyDoc([LOCAL_RESULT]));
    const newerServer = {
      tool: "bmi-calculator",
      value: 23.4,
      savedAt: "2026-07-23T08:00:00.000Z",
    };
    let conflicted = false;
    putResponders.push((put) => {
      if (put.namespace === "history" && !conflicted) {
        conflicted = true;
        return jsonResponse(
          {
            error: "conflict",
            current: {
              doc: historyDoc([SERVER_RESULT, newerServer]),
              updatedAt: "2026-07-23T09:00:00.000Z",
            },
          },
          409,
        );
      }
      return null;
    });
    startAccountSync();
    await vi.waitFor(() => {
      expect(puts.filter((p) => p.namespace === "history")).toHaveLength(2);
    });
    const retry = puts.filter((p) => p.namespace === "history")[1];
    expect(retry.ifMatch).toBe("2026-07-23T09:00:00.000Z"); // the fresh etag
    const pushed = JSON.parse(retry.body) as HistoryFile;
    // Nothing lost: both server entries AND the local one survive the race.
    expect(pushed.results.map((r) => r.tool).sort()).toEqual([
      "bmi-calculator",
      "one-rep-max-calculator",
      "tdee-calculator",
    ]);
  });

  it("never sends health-flavoured namespaces without consent; fun namespaces still sync", async () => {
    storage.setItem("fittools.history.v1", historyDoc([LOCAL_RESULT]));
    storage.setItem(
      "fittools.favourites.v1",
      JSON.stringify({
        version: 1,
        items: [{ id: "tdee-calculator", addedAt: "2026-07-22T08:00:00.000Z" }],
      }),
    );
    pullResponse = () =>
      jsonResponse({ documents: {}, consents: { healthStorage: false, bloodworkStorage: false } });
    startAccountSync();
    await waitForPuts(1);
    // Give any stray pushes a moment, then assert the gate held.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(puts.some((p) => p.namespace === "favourites")).toBe(true);
    expect(puts.some((p) => p.namespace === "history")).toBe(false);
    expect(puts.some((p) => p.namespace === "dashboard")).toBe(false);
    expect(puts.some((p) => p.namespace === "stack")).toBe(false);
    expect(puts.some((p) => p.namespace === "bloodwork")).toBe(false);
  });

  it("bloodwork syncs only under its own consent — health consent alone is not enough", async () => {
    // Local blood reading exists; health granted, bloodwork NOT.
    storage.setItem(
      "fittools.dashboard.v1",
      JSON.stringify({
        version: 1,
        profile: {},
        metrics: [
          { metric: "tdee.kcal", value: 2400, savedAt: "2026-07-20T08:00:00.000Z" },
        ],
        biomarkers: [
          { marker: "apob", value: 0.9, unit: "g/L", takenAt: "2026-06-01", source: "manual" },
        ],
      }),
    );
    pullResponse = () =>
      jsonResponse({ documents: {}, consents: { healthStorage: true, bloodworkStorage: false } });
    startAccountSync();
    await waitForPuts(1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    // The dashboard document goes up WITHOUT the readings; bloodwork stays home.
    const dashboardPut = puts.find((p) => p.namespace === "dashboard");
    expect(dashboardPut).toBeDefined();
    expect((JSON.parse(dashboardPut?.body ?? "{}") as { biomarkers: unknown[] }).biomarkers).toEqual([]);
    expect(puts.some((p) => p.namespace === "bloodwork")).toBe(false);
  });

  it("with the bloodwork consent, readings sync under the bloodwork namespace", async () => {
    storage.setItem(
      "fittools.dashboard.v1",
      JSON.stringify({
        version: 1,
        profile: {},
        metrics: [],
        biomarkers: [
          { marker: "apob", value: 0.9, unit: "g/L", takenAt: "2026-06-01", source: "manual" },
        ],
      }),
    );
    pullResponse = () =>
      jsonResponse({ documents: {}, consents: { healthStorage: true, bloodworkStorage: true } });
    startAccountSync();
    await vi.waitFor(() => {
      expect(puts.some((p) => p.namespace === "bloodwork")).toBe(true);
    });
    const bloodworkPut = puts.find((p) => p.namespace === "bloodwork");
    const doc = JSON.parse(bloodworkPut?.body ?? "{}") as { readings: { marker: string }[] };
    expect(doc.readings.map((r) => r.marker)).toEqual(["apob"]);
  });

  it("a 401 pull stops the engine and clears the device hint", async () => {
    pullResponse = () => jsonResponse({ error: "unauthorised" }, 401);
    startAccountSync();
    await vi.waitFor(() => {
      expect(storage.getItem(ACCOUNT_HINT_KEY)).toBeNull();
    });
    expect(puts).toHaveLength(0);
  });

  it("does not upload canonical empty documents on first login", async () => {
    // No local data at all; server empty → nothing should be pushed.
    pullResponse = () => jsonResponse({ documents: {}, healthConsented: true });
    startAccountSync();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(puts).toHaveLength(0);
  });
});
