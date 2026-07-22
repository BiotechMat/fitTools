"use client";

import { PULSE_CATEGORIES, PULSE_CATEGORY_LABELS } from "@/lib/pulse/types";
import type { PulseCategory } from "@/lib/pulse/types";

/**
 * Sticky category chip bar (PULSE.md §7). Multi-select toggles; active state in
 * Blaze. "All" clears the filter. Honours prefers-reduced-motion (no motion
 * used here beyond colour). Chips are toggle buttons with aria-pressed.
 */
export function PulseFilterBar({
  active,
  onToggle,
  onClear,
}: {
  active: Set<PulseCategory>;
  onToggle: (category: PulseCategory) => void;
  onClear: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-10 -mx-4 mb-4 overflow-x-auto border-b border-border bg-background/95 px-4 py-3 backdrop-blur"
      role="group"
      aria-label="Filter Pulse by category"
    >
      <div className="flex w-max gap-2">
        <button
          type="button"
          aria-pressed={active.size === 0}
          onClick={onClear}
          className={chipClass(active.size === 0)}
        >
          All
        </button>
        {PULSE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={active.has(c)}
            onClick={() => onToggle(c)}
            className={chipClass(active.has(c))}
          >
            {PULSE_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
    </div>
  );
}

function chipClass(activeState: boolean): string {
  return `whitespace-nowrap rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
    activeState
      ? "border-foreground bg-primary-strong text-white"
      : "border-border bg-surface text-muted hover:bg-surface-deep"
  }`;
}
