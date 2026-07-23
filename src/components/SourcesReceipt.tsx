/**
 * Receipt-print citations (DESIGN.md §8): the tool's sources presented as a
 * till receipt that unrolls (details/summary — no JS, works everywhere; the
 * unroll animation is CSS and reduced-motion safe). "Receipts" is the
 * site's citation voice (DESIGN.md §2) — this makes it literal. Links stay
 * real anchors in the DOM for crawlers and the print stylesheet.
 */

interface Source {
  url: string;
  label: string;
}

export function SourcesReceipt({ sources }: { sources: Source[] }) {
  return (
    <details className="receipt not-prose mt-2">
      <summary className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-good-soft px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em]">
        Pull the receipts, {sources.length} cited{" "}
        {sources.length === 1 ? "source" : "sources"}
      </summary>
      <div className="receipt-paper mt-3 max-w-xl rounded-t-xl p-4 text-sm">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.3em]">
          FitTools · sources
        </p>
        <ol className="mt-3 space-y-3">
          {sources.map((source, i) => (
            <li key={source.url} className="border-t border-dashed border-border pt-2">
              <span className="text-xs text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>{" "}
              <a
                href={source.url}
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-foreground"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-dashed border-border pt-2 text-center text-[11px] uppercase tracking-[0.2em] text-good">
          Every formula cited ✓
        </p>
      </div>
    </details>
  );
}
