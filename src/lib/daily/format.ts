/**
 * Small display helpers shared by the daily-games UI. Kept out of the
 * components so the number formatting is consistent (and unit-testable).
 */

/** Format a numeric value for the slider readout / reveal. */
export function formatValue(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString("en-GB");
  return value.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Value + unit, spaced sensibly ("400 mg", "85%"). */
export function formatWithUnit(value: number, unit: string): string {
  const v = formatValue(value);
  return unit === "%" ? `${v}%` : `${v} ${unit}`;
}
