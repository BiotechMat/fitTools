"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Grab-and-fling physics for the marquee ticker (DESIGN.md §8). Dragging
 * drives the underlying CSS animation's playbackRate (throw left = spin
 * forward, right = backward); on release, friction decays the rate back to
 * cruise. Under prefers-reduced-motion the rail has no animation, so every
 * handler is a no-op. The rail markup/copy stays server-rendered as children.
 */

const MAX_RATE = 14;
const FRICTION = 0.045;

export function ThrowableTicker({ children }: { children: ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const s = useRef({ dragging: false, lastX: 0, rate: 1, raf: 0 });

  const anim = () => railRef.current?.getAnimations()[0];

  useEffect(() => {
    // Infinite animations stop dead if a backward throw drags currentTime
    // to 0 — bank ten cycles of headroom so reverse spins have runway.
    const a = anim();
    if (a && typeof a.currentTime === "number") a.currentTime += 320_000;
    const state = s.current;
    return () => cancelAnimationFrame(state.raf);
  }, []);

  const settle = () => {
    const a = anim();
    if (!a) return;
    const step = () => {
      s.current.rate += (1 - s.current.rate) * FRICTION;
      if (Math.abs(s.current.rate - 1) < 0.02) {
        s.current.rate = 1;
        a.playbackRate = 1;
        return;
      }
      a.playbackRate = s.current.rate;
      s.current.raf = requestAnimationFrame(step);
    };
    s.current.raf = requestAnimationFrame(step);
  };

  return (
    <div
      className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        if (!anim()) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        cancelAnimationFrame(s.current.raf);
        s.current.dragging = true;
        s.current.lastX = e.clientX;
      }}
      onPointerMove={(e) => {
        const a = anim();
        if (!s.current.dragging || !a) return;
        const dx = e.clientX - s.current.lastX;
        s.current.lastX = e.clientX;
        // Dragging left (dx < 0) spins the leftward marquee faster.
        const next = Math.max(-MAX_RATE, Math.min(MAX_RATE, -dx * 0.9));
        if (dx !== 0) {
          s.current.rate = next;
          a.playbackRate = next;
        }
      }}
      onPointerUp={() => {
        s.current.dragging = false;
        settle();
      }}
      onPointerCancel={() => {
        s.current.dragging = false;
        settle();
      }}
    >
      <div ref={railRef} className="ticker-rail" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
