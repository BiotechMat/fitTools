import { describe, expect, it } from "vitest";
import {
  CYCLE_MINUTES,
  LATENCY_MINUTES,
  bedtimesForWake,
  formatMinutesOfDay,
} from "@/lib/formulas/sleep";

/**
 * Sleep calculator (SPEC §7): bedtime = wake time − n × 90 min cycles −
 * 15 min latency, for 4–6 cycles. Times are minutes-of-day (0–1439),
 * wrapping across midnight.
 */

describe("constants", () => {
  it("uses 90-minute cycles and 15-minute latency", () => {
    expect(CYCLE_MINUTES).toBe(90);
    expect(LATENCY_MINUTES).toBe(15);
  });
});

describe("bedtimesForWake — 07:00 wake", () => {
  const wake = 7 * 60;
  const options = bedtimesForWake(wake);

  it("offers 4, 5 and 6 cycles", () => {
    expect(options.map((option) => option.cycles)).toEqual([6, 5, 4]);
  });

  it("6 cycles → 21:45 bedtime, 9 h asleep", () => {
    const six = options[0];
    expect(six.bedtimeMinutes).toBe(21 * 60 + 45);
    expect(six.sleepMinutes).toBe(540);
  });

  it("5 cycles → 23:15 bedtime (wraps past midnight)", () => {
    expect(options[1].bedtimeMinutes).toBe(23 * 60 + 15);
  });

  it("4 cycles → 00:45 bedtime (after midnight)", () => {
    expect(options[2].bedtimeMinutes).toBe(45);
  });
});

describe("bedtimesForWake — 06:30 wake", () => {
  it("5 cycles → 22:45", () => {
    const options = bedtimesForWake(6 * 60 + 30);
    const five = options.find((option) => option.cycles === 5);
    expect(five?.bedtimeMinutes).toBe(22 * 60 + 45);
  });
});

describe("formatMinutesOfDay", () => {
  it("renders 24-hour clock times", () => {
    expect(formatMinutesOfDay(45)).toBe("00:45");
    expect(formatMinutesOfDay(21 * 60 + 45)).toBe("21:45");
    expect(formatMinutesOfDay(0)).toBe("00:00");
  });
});
