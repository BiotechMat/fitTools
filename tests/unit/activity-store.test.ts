import { describe, expect, it } from "vitest";
import {
  isDoneOn,
  markActive,
  parseActivityStore,
  serializeActivityStore,
  type ActivityStore,
} from "@/lib/activity-store";

const empty = parseActivityStore(null);

describe("parseActivityStore — tolerant parse", () => {
  it("null, junk and wrong versions degrade to empty", () => {
    expect(parseActivityStore(null)).toEqual(empty);
    expect(parseActivityStore("not json {")).toEqual(empty);
    expect(parseActivityStore(JSON.stringify({ version: 2 }))).toEqual(empty);
    expect(parseActivityStore(JSON.stringify([1, 2]))).toEqual(empty);
  });

  it("filters unknown checklist sources and repairs a bad streak", () => {
    const raw = JSON.stringify({
      version: 1,
      streak: { current: "x", best: -2, freezes: 99.9, last: 42 },
      todayDate: "2026-07-23",
      todayDone: ["calc", "nonsense", "pulse"],
    });
    const store = parseActivityStore(raw);
    expect(store.streak).toEqual({ current: 0, best: 0, freezes: 3, last: null });
    expect(store.todayDone).toEqual(["calc", "pulse"]);
  });

  it("round-trips through serialize", () => {
    let store = markActive(empty, "daily", "2026-07-23");
    store = markActive(store, "pulse", "2026-07-23");
    expect(parseActivityStore(serializeActivityStore(store))).toEqual(store);
  });
});

describe("markActive — umbrella run + day checklist (TODAY.md §5)", () => {
  it("first action starts the run and the checklist", () => {
    const store = markActive(empty, "calc", "2026-07-23");
    expect(store.streak.current).toBe(1);
    expect(store.todayDate).toBe("2026-07-23");
    expect(store.todayDone).toEqual(["calc"]);
  });

  it("same-day actions accumulate sources but never double-count the day", () => {
    let store = markActive(empty, "calc", "2026-07-23");
    store = markActive(store, "daily", "2026-07-23");
    store = markActive(store, "daily", "2026-07-23");
    expect(store.streak.current).toBe(1);
    expect(store.todayDone).toEqual(["calc", "daily"]);
  });

  it("a new day rolls the checklist over and extends the run", () => {
    let store = markActive(empty, "pulse", "2026-07-22");
    store = markActive(store, "calc", "2026-07-23");
    expect(store.streak.current).toBe(2);
    expect(store.todayDate).toBe("2026-07-23");
    expect(store.todayDone).toEqual(["calc"]);
  });

  it("a backdated action leaves the current day's checklist alone", () => {
    let store = markActive(empty, "calc", "2026-07-23");
    store = markActive(store, "daily", "2026-07-22");
    expect(store.todayDate).toBe("2026-07-23");
    expect(store.todayDone).toEqual(["calc"]);
    expect(store.streak.current).toBe(1);
  });
});

describe("isDoneOn", () => {
  it("true only for a counted source on the store's current day", () => {
    const store: ActivityStore = markActive(empty, "daily", "2026-07-23");
    expect(isDoneOn(store, "daily", "2026-07-23")).toBe(true);
    expect(isDoneOn(store, "calc", "2026-07-23")).toBe(false);
    expect(isDoneOn(store, "daily", "2026-07-24")).toBe(false);
  });
});
