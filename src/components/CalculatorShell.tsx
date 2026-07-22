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
      className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[5px_5px_0_0_var(--color-foreground)] sm:p-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6"
    >
      {children}
    </section>
  );
}
