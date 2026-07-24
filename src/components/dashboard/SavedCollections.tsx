"use client";

/**
 * "My stack / My exercises / Bookmarks" dashboard cards (ACCOUNTS.md §8.5,
 * DASHBOARD §3.2 grid language). Pure presentation over the collection
 * stores — local-first, live via useSyncExternalStore, synced by the
 * account engine when signed in. Unknown ids (a registry entry renamed or
 * removed) render nothing rather than a broken link.
 */

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  favouritesStore,
  parseCollection,
  removeItem,
  stackStore,
  trainingStore,
  type CollectionStore,
  type SavedItem,
} from "@/lib/account/collections";
import { getSupplement } from "@/registry/supplements";
import { getExercise } from "@/registry/exercises";
import { getTool, toolPath } from "@/registry/tools";

interface ResolvedItem {
  id: string;
  label: string;
  href: string;
}

function resolveStack(item: SavedItem): ResolvedItem | null {
  const s = getSupplement(item.id);
  return s ? { id: item.id, label: s.name, href: `/supplements/${s.slug}` } : null;
}

function resolveTraining(item: SavedItem): ResolvedItem | null {
  const e = getExercise(item.id);
  return e ? { id: item.id, label: e.name, href: `/exercises/${e.pattern}/${e.slug}` } : null;
}

function resolveFavourite(item: SavedItem): ResolvedItem | null {
  const t = getTool(item.id);
  return t ? { id: item.id, label: t.title.split(":")[0].trim(), href: toolPath(t) } : null;
}

function CollectionCard({
  title,
  emptyCopy,
  store,
  resolve,
  browseHref,
  browseLabel,
}: {
  title: string;
  emptyCopy: string;
  store: CollectionStore;
  resolve: (item: SavedItem) => ResolvedItem | null;
  browseHref: string;
  browseLabel: string;
}): React.ReactElement {
  const raw = useSyncExternalStore(store.subscribe, store.readRaw, () => null);
  const items = parseCollection(raw)
    .items.map(resolve)
    .filter((r): r is ResolvedItem => r !== null);

  const remove = useCallback(
    (id: string): void => {
      store.update((current) => removeItem(current, id));
    },
    [store],
  );

  return (
    <section
      aria-label={title}
      className="rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[4px_4px_0_0_var(--color-foreground)]"
    >
      <h3 className="font-display text-lg uppercase">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted">
          {emptyCopy}{" "}
          <Link href={browseHref} className="underline hover:text-foreground">
            {browseLabel}
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
              <Link href={item.href} className="font-semibold underline-offset-2 hover:underline">
                {item.label}
              </Link>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.label}`}
                className="rounded-full border border-foreground px-2 text-xs font-bold text-muted hover:text-foreground"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function SavedCollections(): React.ReactElement {
  return (
    <section aria-labelledby="dash-saved" className="mt-10">
      <h2 id="dash-saved" className="font-display text-xl uppercase">
        Saved for later
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <CollectionCard
          title="My stack"
          emptyCopy="Supplements you save land here."
          store={stackStore}
          resolve={resolveStack}
          browseHref="/supplements"
          browseLabel="Browse supplements"
        />
        <CollectionCard
          title="My exercises"
          emptyCopy="Exercises you save land here."
          store={trainingStore}
          resolve={resolveTraining}
          browseHref="/exercises"
          browseLabel="Browse the library"
        />
        <CollectionCard
          title="Bookmarked tools"
          emptyCopy="Calculators you bookmark land here."
          store={favouritesStore}
          resolve={resolveFavourite}
          browseHref="/calculators"
          browseLabel="All calculators"
        />
      </div>
    </section>
  );
}
