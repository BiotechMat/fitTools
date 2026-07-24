/**
 * Saved-item collection stores (ACCOUNTS.md §3.1/§6.2): `stack` (supplements
 * the user takes), `training` (exercises saved from the library) and
 * `favourites` (bookmarked tools/pages). Three identical local-first stores —
 * a list of registry ids with an added date and (stack only) an optional
 * note — so one pure core is parameterised three times rather than written
 * three times. Same guarantees as history.ts: versioned, tolerant-parsed,
 * guarded wrapper, change event, sync-ready.
 *
 * Deliberate shape notes: `stack` has NO dosing fields — it records *what*,
 * never *how much* (the no-dosing editorial discipline, CONTENT-peptides §0).
 * Ids are plain strings; resolvability against the supplement/exercise/tool
 * registries is the UI's concern (unknown ids render nothing), keeping these
 * stores dependency-free.
 */

export interface SavedItem {
  /** Registry id / slug (supplement id, exercise id, tool slug). */
  id: string;
  /** ISO datetime of the first save. */
  addedAt: string;
  /** Free-text note (stack only in v1 UI; harmless elsewhere). */
  note?: string;
}

export interface SavedCollection {
  version: 1;
  items: SavedItem[];
}

const EMPTY: SavedCollection = { version: 1, items: [] };

function isSavedItem(v: unknown): v is SavedItem {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.addedAt === "string" &&
    !Number.isNaN(Date.parse(r.addedAt)) &&
    (r.note === undefined || typeof r.note === "string")
  );
}

/** Tolerant parse: corrupt/foreign storage degrades to empty, never throws. */
export function parseCollection(raw: string | null): SavedCollection {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY;
    const r = parsed as Record<string, unknown>;
    if (r.version !== 1 || !Array.isArray(r.items)) return EMPTY;
    // De-duplicate defensively (first occurrence wins — the earliest save).
    const seen = new Set<string>();
    const items: SavedItem[] = [];
    for (const item of r.items.filter(isSavedItem)) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        items.push(item);
      }
    }
    return { version: 1, items };
  } catch {
    return EMPTY;
  }
}

export function serializeCollection(collection: SavedCollection): string {
  return JSON.stringify(collection);
}

export function hasItem(collection: SavedCollection, id: string): boolean {
  return collection.items.some((i) => i.id === id);
}

/** Add (idempotent — keeps the original addedAt if already present). */
export function addItem(
  collection: SavedCollection,
  id: string,
  now: Date = new Date(),
): SavedCollection {
  if (hasItem(collection, id)) return collection;
  return {
    version: 1,
    items: [...collection.items, { id, addedAt: now.toISOString() }],
  };
}

export function removeItem(collection: SavedCollection, id: string): SavedCollection {
  return { version: 1, items: collection.items.filter((i) => i.id !== id) };
}

export function toggleItem(
  collection: SavedCollection,
  id: string,
  now: Date = new Date(),
): SavedCollection {
  return hasItem(collection, id) ? removeItem(collection, id) : addItem(collection, id, now);
}

/** Set/clear the note on an item (no-op if the item isn't saved). */
export function setItemNote(
  collection: SavedCollection,
  id: string,
  note: string | undefined,
): SavedCollection {
  return {
    version: 1,
    items: collection.items.map((i) =>
      i.id === id ? { ...i, ...(note === undefined || note === "" ? { note: undefined } : { note }) } : i,
    ),
  };
}

/**
 * Union two collections (ACCOUNTS §6.2: union by id). On an exact-id tie the
 * earlier addedAt is kept (when it was first saved) and the overlay's note
 * wins when it carries one.
 */
export function mergeCollections(
  base: SavedCollection,
  overlay: SavedCollection,
): SavedCollection {
  const byId = new Map<string, SavedItem>();
  for (const item of base.items) byId.set(item.id, item);
  for (const item of overlay.items) {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
    } else {
      byId.set(item.id, {
        id: item.id,
        addedAt: Date.parse(item.addedAt) < Date.parse(existing.addedAt) ? item.addedAt : existing.addedAt,
        ...(item.note !== undefined
          ? { note: item.note }
          : existing.note !== undefined
            ? { note: existing.note }
            : {}),
      });
    }
  }
  return { version: 1, items: [...byId.values()] };
}

/* ------------------------------------------------------------------ */
/* Store instances — one per collection, guarded like history.ts.      */
/* ------------------------------------------------------------------ */

export interface CollectionStore {
  storageKey: string;
  changeEvent: string;
  read: () => SavedCollection;
  readRaw: () => string | null;
  write: (collection: SavedCollection) => boolean;
  update: (fn: (collection: SavedCollection) => SavedCollection) => SavedCollection;
  subscribe: (onChange: () => void) => () => void;
}

function makeCollectionStore(storageKey: string, changeEvent: string): CollectionStore {
  const read = (): SavedCollection => {
    if (typeof window === "undefined") return EMPTY;
    try {
      return parseCollection(window.localStorage.getItem(storageKey));
    } catch {
      return EMPTY;
    }
  };
  const readRaw = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };
  const write = (collection: SavedCollection): boolean => {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(storageKey, serializeCollection(collection));
      window.dispatchEvent(new Event(changeEvent));
      return true;
    } catch {
      return false;
    }
  };
  return {
    storageKey,
    changeEvent,
    read,
    readRaw,
    write,
    update: (fn) => {
      const next = fn(read());
      write(next);
      return next;
    },
    subscribe: (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(changeEvent, onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(changeEvent, onChange);
      };
    },
  };
}

/** Supplements the user takes ("Save to my stack") — health-flavoured (§6.2). */
export const stackStore = makeCollectionStore("fittools.stack.v1", "fittools:stack-change");
/** Exercises saved from the library. */
export const trainingStore = makeCollectionStore(
  "fittools.training.v1",
  "fittools:training-change",
);
/** Bookmarked tools/pages. */
export const favouritesStore = makeCollectionStore(
  "fittools.favourites.v1",
  "fittools:favourites-change",
);
