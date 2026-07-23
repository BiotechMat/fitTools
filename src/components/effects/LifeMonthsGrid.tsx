"use client";

import { formatNumber } from "@/components/calculators/styles";

/**
 * "Time made visible" (v2 effects prototype): the published five-factor gap
 * from Li 2018 drawn as one square per month of average life expectancy.
 *
 * The grid only ever fills for the all-five state — the paper publishes no
 * intermediate figures, so a partial fill would invent data (see
 * src/lib/formulas/life-expectancy.ts). Squares are decorative and
 * aria-hidden; the caption carries the content. Fixed min-height reserves
 * the grid's space (zero-CLS); the cascade honours prefers-reduced-motion.
 */

interface LifeMonthsGridProps {
  /** The paper's reported average gain, all five factors vs none. */
  gainYears: number;
  /** All five factors ticked — the only published fill state. */
  filled: boolean;
}

export function LifeMonthsGrid({ gainYears, filled }: LifeMonthsGridProps) {
  const months = Math.round(gainYears * 12);
  const years = formatNumber(gainYears, 1);
  return (
    <div className="mt-4" data-testid="life-months-grid">
      <div
        aria-hidden="true"
        className="flex min-h-[5.5rem] flex-wrap content-start gap-[3px]"
      >
        {Array.from({ length: months }, (_, i) => (
          <span
            key={`${filled}-${i}`}
            className={
              filled
                ? "month-pop size-2 rounded-[2px] border border-good bg-fresh"
                : "size-2 rounded-[2px] border border-border"
            }
            style={filled ? { animationDelay: `${i * 6}ms` } : undefined}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        {filled
          ? `All five ✓ — that's the study's reported average gap of about ${years} years (${months} months) versus meeting none.`
          : `Each square is a month of the ~${years}-year average gap the study reported between meeting all five factors and none. Tick all five to see it fill in.`}
      </p>
    </div>
  );
}
