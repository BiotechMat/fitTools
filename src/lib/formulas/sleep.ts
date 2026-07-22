/**
 * Sleep cycle calculator (SPEC §7): bedtime = wake time − n × 90-minute
 * cycles − 15 minutes to fall asleep, presented for 6, 5 and 4 cycles.
 * All times are minutes-of-day (0–1439) and wrap across midnight. The page
 * notes that real cycle length varies between people and across the night.
 */

export const CYCLE_MINUTES = 90;
export const LATENCY_MINUTES = 15;
export const MINUTES_PER_DAY = 1440;

export interface BedtimeOption {
  cycles: number;
  bedtimeMinutes: number;
  sleepMinutes: number;
}

export function bedtimesForWake(wakeMinutes: number): BedtimeOption[] {
  return [6, 5, 4].map((cycles) => {
    const raw = wakeMinutes - cycles * CYCLE_MINUTES - LATENCY_MINUTES;
    const bedtimeMinutes = ((raw % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return { cycles, bedtimeMinutes, sleepMinutes: cycles * CYCLE_MINUTES };
  });
}

export function formatMinutesOfDay(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}
