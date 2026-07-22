/**
 * "What moves the needle" (DESIGN.md mockups §03): the modifiable-driver
 * list that must accompany any deficit-framed result (§4 positive-frame
 * rules). Entries are computed by the calling calculator — always a real
 * re-run of the tool's own equation, never a hand-written estimate.
 */

export interface NeedleEntry {
  label: string;
  /** Win chip text, e.g. "−2.4 yrs" or "banked ✓". */
  win: string;
}

export function WhatMovesIt({
  entries,
  footnote,
}: {
  entries: NeedleEntry[];
  footnote?: string;
}) {
  if (entries.length === 0) return null;
  return (
    <section
      data-testid="what-moves-it"
      aria-label="What moves the needle"
      className="rounded-xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
    >
      <h3 className="font-display text-lg uppercase">What moves the needle</h3>
      <ul className="mt-1">
        {entries.map((entry) => (
          <li
            key={entry.label}
            className="flex items-center gap-3 border-t border-dashed border-border py-2 text-sm first:border-t-0"
          >
            <span>{entry.label}</span>
            <span className="ml-auto whitespace-nowrap rounded-full border border-good bg-good-soft px-2.5 py-0.5 font-mono text-xs font-bold text-good">
              {entry.win}
            </span>
          </li>
        ))}
      </ul>
      {footnote ? <p className="mt-2 text-xs text-muted">{footnote}</p> : null}
    </section>
  );
}
