"use client";

/**
 * The save affordance (ACCOUNTS.md §8.5): "Save to my stack" on supplement
 * pages, "Save exercise" on the library, "Bookmark" on tools.
 *
 * Saving requires an account (Mat, 2026-07-24 — saving is an account
 * feature): signed out, the button IS the signup prompt — tapping it goes
 * to /signin with a return path, and nothing is stored until you're in.
 * Signed in, saves land instantly in this device's store and the sync
 * engine carries them to the account (stack behind the health consent,
 * per §6.2).
 *
 * Rendered as a small client island on otherwise-static pages; reads via
 * useSyncExternalStore so every instance stays live across tabs.
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  favouritesStore,
  hasItem,
  parseCollection,
  stackStore,
  toggleItem,
  trainingStore,
  type CollectionStore,
} from "@/lib/account/collections";
import { ACCOUNT_CHANGE_EVENT, hasAccountHint } from "@/lib/auth/session-probe";

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

const pillClass =
  "rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0_0_var(--color-foreground)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-foreground)]";

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
  const pathname = usePathname();

  // null until hydration so the server markup and first client render match.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const check = (): void => setSignedIn(hasAccountHint());
    check();
    window.addEventListener(ACCOUNT_CHANGE_EVENT, check);
    return () => window.removeEventListener(ACCOUNT_CHANGE_EVENT, check);
  }, []);

  const toggle = useCallback((): void => {
    store.update((current) => toggleItem(current, id));
  }, [store, id]);

  if (signedIn === false) {
    // The tap is the prompt: saving needs a free account.
    return (
      <Link
        href={`/signin?next=${encodeURIComponent(pathname)}`}
        className={`${pillClass} bg-background`}
        aria-label={`${labels.save} — sign in first`}
        title="Saving needs a free account"
      >
        {labels.save}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={toggle}
      disabled={signedIn === null}
      className={`${pillClass} ${saved ? "bg-good-soft" : "bg-background"}`}
    >
      {saved ? labels.saved : labels.save}
    </button>
  );
}
