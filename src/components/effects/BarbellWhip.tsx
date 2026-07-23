"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Barbell whip (DESIGN.md §8): a side-view bar that bends elastically in
 * proportion to the 1RM, settling with a damped spring oscillation when the
 * number changes. Decorative (aria-hidden); the bend is a clamped visual
 * mapping, not a physical model. Static at target under
 * prefers-reduced-motion; fixed SVG box, zero-CLS.
 */

const MAX_BEND = 24;

function bendFor(loadKg: number): number {
  return Math.min(1, Math.max(0, (loadKg - 60) / 240)) * MAX_BEND;
}

export function BarbellWhip({ loadKg }: { loadKg: number }) {
  const target = bendFor(loadKg);
  const [bend, setBend] = useState(target);
  const cur = useRef(target);
  const vel = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Snap straight to target — scheduled a frame out, same as the spring
      // path, because the repo lint bans synchronous setState in effects.
      cur.current = target;
      raf.current = requestAnimationFrame(() => setBend(target));
      return () => cancelAnimationFrame(raf.current);
    }
    const step = () => {
      vel.current += (target - cur.current) * 0.09;
      vel.current *= 0.88;
      cur.current += vel.current;
      setBend(cur.current);
      if (Math.abs(vel.current) > 0.01 || Math.abs(target - cur.current) > 0.05) {
        raf.current = requestAnimationFrame(step);
      } else {
        cur.current = target;
        setBend(target);
      }
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  const tipY = 42 + bend;
  const midY = 42 - bend * 0.2;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 84"
      className="mt-3 h-auto w-full max-w-sm"
      fill="none"
    >
      <path
        d={`M 10 ${tipY.toFixed(2)} C 90 ${midY.toFixed(2)}, 230 ${midY.toFixed(2)}, 310 ${tipY.toFixed(2)}`}
        stroke="var(--foreground)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {[10, 310].map((x) => (
        <g key={x} transform={`translate(${x} ${tipY.toFixed(2)})`}>
          <rect
            x={x === 10 ? 2 : -9}
            y={-21}
            width={7}
            height={42}
            rx={2}
            fill="var(--primary-strong)"
            stroke="var(--foreground)"
            strokeWidth={2}
          />
          <rect
            x={x === 10 ? 10 : -17}
            y={-27}
            width={7}
            height={54}
            rx={2}
            fill="var(--primary)"
            stroke="var(--foreground)"
            strokeWidth={2}
          />
        </g>
      ))}
    </svg>
  );
}
