/** Shared field styling for calculator components. */

export const inputClass =
  "mt-1 w-full rounded-xl border-2 border-foreground bg-background px-3 py-2 text-base focus:outline-2 focus:outline-offset-2 focus:outline-primary";

export const labelClass = "block text-sm font-semibold";

export const warningClass =
  "mt-3 rounded-xl border-2 border-warning-border bg-warning-bg p-3 text-sm";

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Seconds → "h:mm:ss" (or "m:ss" under an hour). */
export function formatDuration(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const mmss = `${minutes}:${String(seconds).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : mmss;
}
