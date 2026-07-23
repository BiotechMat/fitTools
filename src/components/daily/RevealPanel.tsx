"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EvidenceTier } from "@/components/EvidenceTier";
import { trackEvent } from "@/lib/analytics";
import { formatWithUnit } from "@/lib/daily/format";
import type { BallparkItem } from "@/lib/daily/types";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Count up to `target`, honouring prefers-reduced-motion (jumps straight there). */
function useCountUp(target: number, run: boolean): number {
  // Lazy initial value keeps setState out of the effect body (repo lint rule):
  // no animation, or reduced motion, starts already at the target.
  const [value, setValue] = useState<number>(() => (run && !prefersReducedMotion() ? 0 : target));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!run || prefersReducedMotion()) return; // value already sits at target
    const start = performance.now();
    const DURATION = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setValue(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, run]);

  return value;
}

/**
 * The Ballpark reveal (DAILY-GAMES.md §11). The real number counts up, then the
 * cited context, EvidenceTier badge, an always-visible source link and any
 * cross-links. `animate` is false when re-showing an already-played result, so
 * a return visit doesn't re-run the animation.
 */
export function RevealPanel({ item, animate }: { item: BallparkItem; animate: boolean }) {
  const counted = useCountUp(item.answer, animate);
  const display = Number.isInteger(item.answer) ? Math.round(counted) : counted;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">The answer</p>
      <p className="mt-1 font-display text-4xl tabular-nums sm:text-5xl" aria-live="polite">
        {formatWithUnit(display, item.unit)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <EvidenceTier tier={item.tier} basis={item.basis} />
      </div>

      <p className="mt-3 text-muted">{item.context}</p>

      {item.relatedTool || item.relatedContent ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {item.relatedTool ? (
            <Link
              href={item.relatedTool}
              className="text-primary underline underline-offset-2"
              onClick={() => trackEvent({ name: "daily_related_click", params: { id: item.id, target: item.relatedTool! } })}
            >
              Try the calculator →
            </Link>
          ) : null}
          {item.relatedContent ? (
            <Link
              href={item.relatedContent}
              className="text-primary underline underline-offset-2"
              onClick={() => trackEvent({ name: "daily_related_click", params: { id: item.id, target: item.relatedContent! } })}
            >
              Read more →
            </Link>
          ) : null}
        </div>
      ) : null}

      <a
        href={item.source.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="mt-3 block max-w-full truncate font-mono text-xs text-muted underline underline-offset-2 hover:text-foreground"
        title={item.source.label}
      >
        Source: {item.source.label}
      </a>
    </div>
  );
}
