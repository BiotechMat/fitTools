import type { ReactNode } from "react";

/**
 * The v2 result card (DESIGN.md §3, mockups §03): the panel flips to
 * espresso ink so the Blaze number detonates against it — the one place
 * the palette goes full volume. Rendered inside ResultsPanel, which keeps
 * the aria-live announcement duty.
 */

interface ScoreCardProps {
  /** Eyebrow, e.g. "Your estimated heart age". */
  label: string;
  /** Display value, unit excluded unless it's part of the figure. */
  value: string;
  /** Unit rendered after the value in mono, e.g. "kcal/day". */
  unit?: string;
  /** data-testid for the value element (existing e2e contracts). */
  valueTestId?: string;
  /** Smaller companion stat shown beside the value. */
  secondary?: { label: string; value: string; testId?: string };
  /** Judgement pill under the value. Blaze = attention, good = win. */
  delta?: { text: string; tone: "blaze" | "good"; testId?: string };
  children?: ReactNode;
}

const DELTA_TONES = {
  blaze: "bg-primary-strong text-foreground",
  good: "bg-fresh text-foreground",
} as const;

export function ScoreCard({
  label,
  value,
  unit,
  valueTestId,
  secondary,
  delta,
  children,
}: ScoreCardProps) {
  return (
    <div className="rounded-xl bg-foreground p-5 text-background shadow-[4px_4px_0_0_rgba(28,19,13,0.35)]">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background/70">
        {label}
      </p>
      <div className="mt-1 flex flex-wrap items-end gap-x-8 gap-y-2">
        <p
          className="font-display text-5xl uppercase tabular-nums text-primary-strong"
          data-testid={valueTestId}
        >
          {value}
          {unit ? (
            <>
              {" "}
              <span className="font-mono text-base font-normal normal-case tracking-normal text-background/70">
                {unit}
              </span>
            </>
          ) : null}
        </p>
        {secondary ? (
          <div className="pb-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-background/70">
              {secondary.label}
            </p>
            <p className="text-xl font-bold" data-testid={secondary.testId}>
              {secondary.value}
            </p>
          </div>
        ) : null}
      </div>
      {delta ? (
        <p className="mt-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${DELTA_TONES[delta.tone]}`}
            data-testid={delta.testId}
          >
            {delta.text}
          </span>
        </p>
      ) : null}
      {children}
    </div>
  );
}
