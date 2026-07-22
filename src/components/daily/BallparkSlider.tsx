"use client";

import { formatWithUnit } from "@/lib/daily/format";
import { positionFromValue, roundToStep, valueFromPosition } from "@/lib/daily/score";
import type { BallparkItem } from "@/lib/daily/types";

const STEPS = 1000; // slider travel resolution; value is mapped (log-aware)

/**
 * The guess slider (DAILY-GAMES.md §11). A real range input driven in
 * position space so log-scaled items work uniformly; the value readout uses
 * Anton, the unit Space Mono. Keyboard-steppable, with `aria-valuetext`
 * carrying the human value + unit so screen-reader users hear "400 mg", not
 * "637".
 */
export function BallparkSlider({
  item,
  value,
  onChange,
  disabled,
}: {
  item: BallparkItem;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const position = Math.round(positionFromValue(item, value) * STEPS);

  const setFromPosition = (pos: number) => {
    const raw = valueFromPosition(item, pos / STEPS);
    onChange(roundToStep(item, raw));
  };

  return (
    <div>
      <div className="mb-3 text-center">
        <span className="font-display text-4xl tabular-nums sm:text-5xl">{formatWithUnit(value, item.unit)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS}
        step={1}
        value={position}
        disabled={disabled}
        onChange={(e) => setFromPosition(Number(e.target.value))}
        aria-label={item.question}
        aria-valuetext={formatWithUnit(value, item.unit)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-deep accent-[var(--color-primary)] disabled:cursor-not-allowed"
      />
      <div className="mt-1 flex justify-between font-mono text-xs text-muted">
        <span>{formatWithUnit(item.sliderMin, item.unit)}</span>
        <span>{formatWithUnit(item.sliderMax, item.unit)}</span>
      </div>
    </div>
  );
}
