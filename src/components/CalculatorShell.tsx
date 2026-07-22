import type { ReactNode } from "react";

/**
 * Card wrapper for the interactive calculator (SPEC §8). Sits directly
 * under the H1 so the tool is usable without scrolling on a 390 px
 * viewport; fixed structure, nothing loads late inside it (zero CLS).
 */
export function CalculatorShell({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Calculator"
      className="rounded-xl border border-border bg-surface p-4 sm:p-6"
    >
      {children}
    </section>
  );
}
