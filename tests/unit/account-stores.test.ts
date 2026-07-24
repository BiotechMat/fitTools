import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  addItem,
  hasItem,
  mergeCollections,
  parseCollection,
  removeItem,
  serializeCollection,
  setItemNote,
  stackStore,
  toggleItem,
  trainingStore,
  favouritesStore,
  type SavedCollection,
} from "@/lib/account/collections";
import {
  collectArcadeDoc,
  distributeArcadeDoc,
  mergeArcadeDocs,
  parseArcadeDoc,
  serializeArcadeDoc,
  type ArcadeDoc,
} from "@/lib/account/arcade-doc";
import {
  collectPrefsDoc,
  distributePrefsDoc,
  mergePrefsDocs,
  parsePrefsDoc,
} from "@/lib/account/prefs-doc";

const NOW = new Date("2026-07-24T12:00:00.000Z");

function collection(items: SavedCollection["items"]): SavedCollection {
  return { version: 1, items };
}

/**
 * The unit environment is node (no DOM). The stores only need
 * `window.localStorage` + the event methods, so stub a minimal window —
 * a Map-backed Storage on an EventTarget — rather than pulling in a DOM
 * environment dependency.
 */
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

beforeAll(() => {
  const target = new EventTarget();
  const stub = {
    localStorage: new MemoryStorage(),
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  };
  vi.stubGlobal("window", stub);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("saved collections — pure core (stack / training / favourites)", () => {
  it("tolerant parse: garbage degrades to empty; foreign entries dropped; dupes deduped", () => {
    expect(parseCollection(null).items).toEqual([]);
    expect(parseCollection("{nope").items).toEqual([]);
    expect(parseCollection(JSON.stringify({ version: 2, items: [] })).items).toEqual([]);
    const raw = JSON.stringify({
      version: 1,
      items: [
        { id: "creatine", addedAt: "2026-07-01T10:00:00.000Z" },
        { id: "", addedAt: "2026-07-01T10:00:00.000Z" }, // invalid id
        { id: "creatine", addedAt: "2026-07-10T10:00:00.000Z" }, // dupe — first wins
        { id: 42, addedAt: "2026-07-01T10:00:00.000Z" }, // wrong type
        { id: "magnesium", addedAt: "not a date" }, // bad date
      ],
    });
    const parsed = parseCollection(raw);
    expect(parsed.items.map((i) => i.id)).toEqual(["creatine"]);
    expect(parsed.items[0].addedAt).toBe("2026-07-01T10:00:00.000Z");
  });

  it("add is idempotent, remove/toggle round-trip, note set/clear", () => {
    let c = addItem(collection([]), "creatine", NOW);
    c = addItem(c, "creatine", new Date("2027-01-01"));
    expect(c.items).toHaveLength(1);
    expect(c.items[0].addedAt).toBe(NOW.toISOString());
    c = setItemNote(c, "creatine", "5g with breakfast");
    expect(c.items[0].note).toBe("5g with breakfast");
    c = setItemNote(c, "creatine", "");
    expect(c.items[0].note).toBeUndefined();
    c = toggleItem(c, "creatine");
    expect(hasItem(c, "creatine")).toBe(false);
    expect(removeItem(c, "missing").items).toEqual([]);
  });

  it("merge unions by id: earliest addedAt kept, overlay note wins", () => {
    const a = collection([
      { id: "creatine", addedAt: "2026-07-01T10:00:00.000Z", note: "old note" },
      { id: "vitamin-d", addedAt: "2026-07-02T10:00:00.000Z" },
    ]);
    const b = collection([
      { id: "creatine", addedAt: "2026-06-01T10:00:00.000Z", note: "new note" },
      { id: "magnesium", addedAt: "2026-07-03T10:00:00.000Z" },
    ]);
    const merged = mergeCollections(a, b);
    expect(merged.items.map((i) => i.id).sort()).toEqual([
      "creatine",
      "magnesium",
      "vitamin-d",
    ]);
    const creatine = merged.items.find((i) => i.id === "creatine");
    expect(creatine?.addedAt).toBe("2026-06-01T10:00:00.000Z"); // earliest save
    expect(creatine?.note).toBe("new note"); // overlay's note
  });

  it("store instances read/write through guarded localStorage with distinct keys", () => {
    stackStore.update((c) => addItem(c, "creatine", NOW));
    trainingStore.update((c) => addItem(c, "back-squat", NOW));
    favouritesStore.update((c) => addItem(c, "tdee-calculator", NOW));
    expect(hasItem(stackStore.read(), "creatine")).toBe(true);
    expect(hasItem(stackStore.read(), "back-squat")).toBe(false);
    expect(hasItem(trainingStore.read(), "back-squat")).toBe(true);
    expect(hasItem(favouritesStore.read(), "tdee-calculator")).toBe(true);
    expect(
      new Set([stackStore.storageKey, trainingStore.storageKey, favouritesStore.storageKey]).size,
    ).toBe(3);
  });
});

describe("arcade doc — collect / merge / distribute (never lowers a best)", () => {
  const doc = (partial: Partial<ArcadeDoc>): ArcadeDoc => ({
    version: 1,
    bests: {},
    dailyBests: {},
    skins: [],
    ...partial,
  });

  it("tolerant parse drops unknown games, bad dates and non-numbers", () => {
    const raw = JSON.stringify({
      version: 1,
      bests: { lifeline: 72, notagame: 9, maxout: "240" },
      dailyBests: { "2026-07-20": 61, "20-07-2026": 50, "2026-07-21": Number.NaN },
      skins: ["gold", 7],
      selectedSkin: "gold",
    });
    const parsed = parseArcadeDoc(raw);
    expect(parsed.bests).toEqual({ lifeline: 72, maxout: 240 });
    expect(parsed.dailyBests).toEqual({ "2026-07-20": 61 });
    expect(parsed.skins).toEqual(["gold"]);
    expect(parsed.selectedSkin).toBe("gold");
    expect(parseArcadeDoc("{bad").bests).toEqual({});
  });

  it("merge takes max per best, unions skins, overlay-wins selection", () => {
    const a = doc({ bests: { lifeline: 72, maxout: 240 }, skins: ["classic"], selectedSkin: "classic" });
    const b = doc({ bests: { lifeline: 68, powerhouse: 9000 }, skins: ["gold"], selectedSkin: "gold" });
    const merged = mergeArcadeDocs(a, b);
    expect(merged.bests).toEqual({ lifeline: 72, maxout: 240, powerhouse: 9000 });
    expect(merged.skins.sort()).toEqual(["classic", "gold"]);
    expect(merged.selectedSkin).toBe("gold");
  });

  it("collect reads the games' real keys; distribute only ever raises", () => {
    window.localStorage.setItem("fittools.lifeline.best", "72");
    window.localStorage.setItem("fittools.maxout.best", "240");
    window.localStorage.setItem("fittools.lifeline.daily.2026-07-24", "61");
    window.localStorage.setItem("fittools.lifeline.skins", JSON.stringify(["classic"]));
    const collected = collectArcadeDoc();
    expect(collected.bests).toEqual({ lifeline: 72, maxout: 240 });
    expect(collected.dailyBests).toEqual({ "2026-07-24": 61 });

    distributeArcadeDoc(
      doc({
        bests: { lifeline: 68, maxout: 300 }, // 68 must NOT lower 72
        dailyBests: { "2026-07-24": 80 },
        skins: ["gold"],
        selectedSkin: "gold",
      }),
    );
    expect(window.localStorage.getItem("fittools.lifeline.best")).toBe("72");
    expect(window.localStorage.getItem("fittools.maxout.best")).toBe("300");
    expect(window.localStorage.getItem("fittools.lifeline.daily.2026-07-24")).toBe("80");
    expect(JSON.parse(window.localStorage.getItem("fittools.lifeline.skins") ?? "[]").sort()).toEqual([
      "classic",
      "gold",
    ]);
    // No local selection existed → adopt the synced one.
    expect(window.localStorage.getItem("fittools.lifeline.skin")).toBe("gold");
  });

  it("distribute never overwrites an existing local skin selection", () => {
    window.localStorage.setItem("fittools.lifeline.skin", "chalk");
    distributeArcadeDoc(doc({ selectedSkin: "gold" }));
    expect(window.localStorage.getItem("fittools.lifeline.skin")).toBe("chalk");
  });

  it("bounds daily bests to the most recent 30 dates", () => {
    const dailyBests: Record<string, number> = {};
    for (let i = 1; i <= 40; i++) {
      dailyBests[`2026-06-${String(i).padStart(2, "0")}`] = i;
    }
    const merged = mergeArcadeDocs(doc({ dailyBests }), doc({}));
    expect(Object.keys(merged.dailyBests)).toHaveLength(30);
    expect(merged.dailyBests["2026-06-40"]).toBe(40);
    expect(merged.dailyBests["2026-06-01"]).toBeUndefined();
  });
});

describe("prefs doc — units follow the account (LWW)", () => {
  it("parses tolerantly and merges overlay-wins", () => {
    expect(parsePrefsDoc("{bad")).toEqual({ version: 1 });
    expect(parsePrefsDoc(JSON.stringify({ version: 1, units: "furlongs" }))).toEqual({
      version: 1,
    });
    expect(
      mergePrefsDocs({ version: 1, units: "metric" }, { version: 1, units: "imperial" }).units,
    ).toBe("imperial");
    expect(mergePrefsDocs({ version: 1, units: "metric" }, { version: 1 }).units).toBe("metric");
  });

  it("collect reads the real units key; distribute writes it and fires the event", () => {
    window.localStorage.setItem("fittools:units", "imperial");
    expect(collectPrefsDoc().units).toBe("imperial");
    let fired = 0;
    const onChange = (): void => {
      fired++;
    };
    window.addEventListener("fittools:units-change", onChange);
    distributePrefsDoc({ version: 1, units: "metric" });
    expect(window.localStorage.getItem("fittools:units")).toBe("metric");
    expect(fired).toBe(1);
    // No-op write does not fire again.
    distributePrefsDoc({ version: 1, units: "metric" });
    expect(fired).toBe(1);
    window.removeEventListener("fittools:units-change", onChange);
  });
});

describe("collection wire format", () => {
  it("serialise/parse round-trips", () => {
    const c = collection([{ id: "creatine", addedAt: NOW.toISOString(), note: "am" }]);
    expect(parseCollection(serializeCollection(c))).toEqual(c);
    const a: ArcadeDoc = {
      version: 1,
      bests: { lifeline: 72 },
      dailyBests: {},
      skins: ["classic"],
    };
    expect(parseArcadeDoc(serializeArcadeDoc(a))).toEqual(a);
  });
});
