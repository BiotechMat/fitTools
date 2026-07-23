/**
 * Plate-loading physics for the plate calculator (DESIGN.md §8): the
 * per-side stack rendered as plates that slide onto the sleeve with a
 * staggered settle (CSS .plate-slide; static under prefers-reduced-motion).
 * Purely decorative — the text stack remains the accessible result. Fixed
 * container height reserves space (zero-CLS). Remount (key) to replay.
 */

function plateHeight(kg: number): number {
  return Math.round(Math.min(88, 24 + kg * 2.6));
}

function plateWidth(kg: number): number {
  if (kg >= 15) return 13;
  if (kg >= 5) return 11;
  return 9;
}

/* Brand-token plate colours, biggest = loudest (visual only, not IPF). */
function plateColour(kg: number): string {
  if (kg >= 25) return "var(--primary-strong)";
  if (kg >= 20) return "var(--primary)";
  if (kg >= 15) return "var(--warning-border)";
  if (kg >= 10) return "var(--good)";
  if (kg >= 5) return "var(--surface-deep)";
  if (kg >= 2.5) return "var(--primary-soft)";
  return "var(--good-soft)";
}

export function BarbellLoad({ perSide }: { perSide: number[] }) {
  return (
    <div aria-hidden="true" className="mt-4 flex h-28 items-center">
      <div className="h-2 w-8 rounded-l-sm bg-foreground" />
      <div className="h-7 w-2 rounded-sm bg-foreground" />
      {perSide.map((kg, i) => (
        <div
          key={`${i}-${kg}`}
          className="plate-slide mx-px rounded-[3px] border-2 border-foreground"
          style={{
            height: plateHeight(kg),
            width: plateWidth(kg),
            background: plateColour(kg),
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
      <div className="h-2 w-16 rounded-r-sm bg-foreground" />
    </div>
  );
}
