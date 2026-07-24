"use client";

/**
 * The save affordance (ACCOUNTS.md §8.5): "Save to my stack" on supplement
 * pages, "Save exercise" on the library, "Bookmark" on tools. Bookmark-style
 * and local-first — works signed out from day one (the item lives in this
 * device's store); when a signed-in device syncs, the collection follows the
 * account (stack behind the health-storage consent, per §6.2).
 *
 * Rendered as a small client island on otherwise-static pages; reads via
 * useSyncExternalStore so every instance stays live across tabs.
 */

import { useCallback, useSyncExternalStore } from "react";
import {
  favouritesStore,
  hasItem,
  parseCollection,
  stackStore,
  toggleItem,
  trainingStore,
  type CollectionStore,
} from "@/lib/account/collections";

const STORES = {
  stack: stackStore,
  training: trainingStore,
  favourites: favouritesStore,
} as const;

export type SaveCollectionKey = keyof typeof STORES;

const LABELS: Record<SaveCollectionKey, { save: string; saved: string }> = {
  stack: { save: "Save to my stack", saved: "In my stack ✓" },
  training: { save: "Save exercise", saved: "Saved ✓" },
  favourites: { save: "Bookmark", saved: "Bookmarked ✓" },
};

function useCollectionRaw(store: CollectionStore): string | null {
  return useSyncExternalStore(
    store.subscribe,
    store.readRaw,
    () => null, // server snapshot: nothing saved (hydrates after mount)
  );
}

export function SaveItemButton({
  collection,
  id,
}: {
  collection: SaveCollectionKey;
  id: string;
}): React.ReactElement {
  const store = STORES[collection];
  const raw = useCollectionRaw(store);
  const saved = hasItem(parseCollection(raw), id);
  const labels = LABELS[collection];

  const toggle = useCallback((): void => {
    store.update((current) => toggleItem(current, id));
  }, [store, id]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={toggle}
      className={`rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)] ${
        saved ? "bg-good-soft" : "bg-background"
      }`}
    >
      {saved ? labels.saved : labels.save}
    </button>
  );
}
