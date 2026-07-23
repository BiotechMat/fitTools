"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Odometer-style digit roll for score values (v2 effects prototype).
 *
 * The server renders the plain value. After hydration, a value change swaps
 * each digit for a rolling column, then settles back to plain text — so
 * aria-live regions and e2e text assertions always end on the real value.
 * The rolling markup is aria-hidden with an sr-only copy of the value.
 *
 * Zero-CLS: slots are 1ch wide and exactly one display line tall, and cell
 * height matches the .font-display line-height. Skipped entirely under
 * prefers-reduced-motion.
 */

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;
/** Must match the .font-display line-height so the line box never grows. */
const CELL_EM = 0.95;
const ROLL_MS = 650;
const STAGGER_MS = 65;

function isDigit(ch: string | undefined): ch is string {
  return ch !== undefined && ch >= "0" && ch <= "9";
}

interface RollState {
  target: string[];
  /** Previous value's characters when shapes align; empty on first roll. */
  from: string[];
}

export function RollingNumber({ value }: { value: string }) {
  const [roll, setRoll] = useState<RollState | null>(null);
  const [landed, setLanded] = useState(false);
  const prev = useRef<string | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = [...value];
    setRoll({
      target,
      from: from !== null && from.length === value.length ? [...from] : [],
    });
    setLanded(false);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setLanded(true)),
    );
    if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(
      () => setRoll(null),
      ROLL_MS + target.length * STAGGER_MS + 150,
    );
    return () => cancelAnimationFrame(raf);
  }, [value]);

  useEffect(
    () => () => {
      if (settleTimer.current !== null) clearTimeout(settleTimer.current);
    },
    [],
  );

  if (roll === null) return <>{value}</>;

  return (
    <>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="inline-flex items-baseline">
        {roll.target.map((ch, i) => {
          if (!isDigit(ch)) return <span key={i}>{ch}</span>;
          const start = isDigit(roll.from[i]) ? Number(roll.from[i]) : 0;
          const shown = landed ? Number(ch) : start;
          return (
            <span
              key={i}
              className="relative inline-block"
              style={{ width: "1ch", height: `${CELL_EM}em` }}
            >
              {/* Zero-width strut so the slot keeps a real text baseline. */}
              {"\u200B"}
              <span className="absolute inset-0 overflow-hidden text-center">
                <span
                  className="block"
                  style={{
                    transform: `translateY(${-shown * CELL_EM}em)`,
                    transition: landed
                      ? `transform ${ROLL_MS}ms cubic-bezier(0.2, 0.85, 0.35, 1.04) ${i * STAGGER_MS}ms`
                      : "none",
                  }}
                >
                  {DIGITS.map((d) => (
                    <span
                      key={d}
                      className="block"
                      style={{
                        height: `${CELL_EM}em`,
                        lineHeight: `${CELL_EM}em`,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </span>
              </span>
            </span>
          );
        })}
      </span>
    </>
  );
}
