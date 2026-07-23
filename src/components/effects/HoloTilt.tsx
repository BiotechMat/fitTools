"use client";

import { useRef, type ReactNode } from "react";

/**
 * Holo-card physics for the share card (DESIGN.md §8): perspective tilt
 * follows the cursor, and a sheen (`.holo-sheen`, position via --sheen-x)
 * sweeps across like a foil trading card. Pointer-driven only — nothing
 * animates unattended — and inert under prefers-reduced-motion.
 */
export function HoloTilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.removeProperty("--sheen-x");
  };

  return (
    <div
      ref={ref}
      className="holo-tilt"
      style={{ transition: "transform 180ms ease-out" }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg)`;
        el.style.setProperty("--sheen-x", `${((px + 0.5) * 100).toFixed(1)}%`);
      }}
      onPointerLeave={reset}
    >
      {children}
      <span aria-hidden="true" className="holo-sheen rounded-2xl" />
    </div>
  );
}
