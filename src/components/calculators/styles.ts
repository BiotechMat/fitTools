/** Shared field styling for calculator components. */

export const inputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus:outline-2 focus:outline-primary";

export const labelClass = "block text-sm font-medium";

export const warningClass =
  "mt-3 rounded-md border border-warning-border bg-warning-bg p-3 text-sm";

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
