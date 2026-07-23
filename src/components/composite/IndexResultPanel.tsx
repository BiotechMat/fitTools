import type { IndexResult } from "@/lib/composite/index-engine";
import { RadarBreakdown } from "@/components/composite/RadarBreakdown";
import { ScoreCard } from "@/components/ScoreCard";
import { ShareResult } from "@/components/ShareResult";

const TIER_TEXT: Record<string, string> = {
  T1: "T1 · strong evidence",
  T2: "T2 · moderate evidence",
  T3: "T3 · mechanistic",
};

/**
 * Mandatory presentation for every Layer 2 index (METHODOLOGY.md §4.6):
 * headline index PLUS the full sub-score radar and table (the headline
 * never appears alone), each input's weight and evidence tier, the version,
 * a "what this is / what it isn't" panel, and the standard non-medical line.
 */
export function IndexResultPanel({
  result,
  version,
  /** Optional centred "pace"-style display transform of the same index (§4.4). */
  paceLabel,
  paceValue,
  scoreLabel = "index",
  shareTool,
  whatItIs,
  whatItIsnt,
}: {
  result: IndexResult;
  version: string;
  paceLabel?: string;
  paceValue?: string;
  scoreLabel?: string;
  /** Registry tool slug — when set, renders a "share result" button (E1). */
  shareTool?: string;
  whatItIs: string;
  whatItIsnt: string;
}) {
  return (
    <div data-testid="index-result">
      <ScoreCard
        label={`Your ${scoreLabel}`}
        value={String(Math.round(result.index))}
        unit="/ 100"
        valueTestId="index-value"
        secondary={
          paceValue
            ? { label: paceLabel ?? "pace", value: paceValue, testId: "pace-value" }
            : undefined
        }
      />

      {shareTool ? (
        <div className="mt-3">
          <ShareResult
            tool={shareTool}
            value={String(Math.round(result.index))}
            unit="/ 100"
            title={scoreLabel}
          />
        </div>
      ) : null}

      {result.reducedConfidence ? (
        <p className="mt-2 rounded-md border border-warning-border bg-warning-bg p-2 text-sm">
          Reduced confidence, some inputs were left blank, so the score is
          based only on what you entered ({Math.round(result.usedWeightTotal)}%
          of the full weighting).
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <RadarBreakdown subScores={result.subScores} />
        <table className="w-full self-center text-sm">
          <caption className="sr-only">Sub-scores, weights and evidence tiers</caption>
          <thead>
            <tr className="border-b border-border text-left">
              <th scope="col" className="py-1 font-semibold">Input</th>
              <th scope="col" className="py-1 text-right font-semibold">Score</th>
              <th scope="col" className="py-1 text-right font-semibold">Weight</th>
            </tr>
          </thead>
          <tbody>
            {result.subScores.map((s) => (
              <tr key={s.key} className="border-b border-border last:border-0">
                <td className="py-1">
                  {s.label}
                  <span className="block text-xs text-muted">{TIER_TEXT[s.tier]}</span>
                </td>
                <td className="py-1 text-right tabular-nums">{Math.round(s.score)}</td>
                <td className="py-1 text-right tabular-nums">
                  {Math.round(s.effectiveWeight)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-3 text-sm">
          <p className="font-semibold">What this is</p>
          <p className="mt-1 text-muted">{whatItIs}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3 text-sm">
          <p className="font-semibold">What this isn&rsquo;t</p>
          <p className="mt-1 text-muted">{whatItIsnt}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-muted">
        Transparent composite index {version}. It is not a medical test and has
        not been validated against health outcomes. The full formula, weights
        and evidence tiers are shown above and in the methodology below.
      </p>
    </div>
  );
}
