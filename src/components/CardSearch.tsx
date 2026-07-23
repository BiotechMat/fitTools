"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { matchesSearch } from "@/lib/search-filter";

/**
 * Type-to-filter search over a server-rendered card list. Wrap the list (it
 * stays a server component, passed as children) and mark each card with
 * `data-search-item="searchable text"`; a section wrapper marked
 * `data-search-group` hides whenever none of its cards match, taking its
 * heading with it. Matching is word-prefix (src/lib/search-filter.ts), so
 * typing "c" narrows to cards starting with C.
 */
export function CardSearch({
  label,
  placeholder,
  className,
  children,
}: {
  /** Accessible name for the input, e.g. "Search supplements". */
  label: string;
  /** Defaults to the label with an ellipsis. */
  placeholder?: string;
  className?: string;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-search-item]");
    const groups = root.querySelectorAll<HTMLElement>("[data-search-group]");
    const active = query.trim() !== "";

    let count = 0;
    for (const item of items) {
      const text = item.dataset.searchItem || item.textContent || "";
      const hit = !active || matchesSearch(text, query);
      item.hidden = !hit;
      if (hit) count += 1;
    }
    for (const group of groups) {
      const anyVisible = Array.from(
        group.querySelectorAll<HTMLElement>("[data-search-item]"),
      ).some((item) => !item.hidden);
      group.hidden = !anyVisible;
    }
    setMatchCount(active ? count : null);
  }, [query]);

  return (
    <div ref={rootRef} className={className}>
      <div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={label}
          placeholder={placeholder ?? `${label}…`}
          autoComplete="off"
          data-testid="card-search"
          className="w-full max-w-md rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        />
        {/* Always rendered at fixed height (zero-CLS) so aria-live announces. */}
        <p aria-live="polite" className="mt-1 h-5 text-sm text-muted">
          {matchCount === null
            ? ""
            : matchCount === 0
              ? `No matches for “${query.trim()}”.`
              : `${matchCount} ${matchCount === 1 ? "match" : "matches"}`}
        </p>
      </div>
      {children}
    </div>
  );
}
