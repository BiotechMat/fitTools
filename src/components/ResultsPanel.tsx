import type { ReactNode } from "react";

/**
 * Results container (SPEC §8, §14). aria-live so screen readers announce
 * recalculated results; fixed min-height so updates never shift layout.
 */
export function ResultsPanel({ children }: { children: ReactNode }) {
  return (
    <div
      aria-live="polite"
      data-testid="results-panel"
      className="mt-4 min-h-[16rem] rounded-lg border border-border bg-background p-4 sm:p-5"
    >
      {children}
    </div>
  );
}
