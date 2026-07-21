"use client";

import { useEffect, useRef, useState } from "react";
import { useAdConsent } from "@/lib/consent";

/**
 * Ad slot (SPEC §10). Renders nothing at all unless NEXT_PUBLIC_ADS_ENABLED
 * is "true" AND consent has been granted. When active it reserves fixed
 * dimensions immediately (zero CLS) and lazy-mounts the ad only when the
 * slot approaches the viewport. Never placed above the calculator.
 */
export function AdSlot({ slotId }: { slotId: string }) {
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const consented = useAdConsent();
  const active = adsEnabled && consented;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active || !containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      data-ad-slot={slotId}
      aria-hidden="true"
      // Fixed reservation: 300×250 plus label line. The ad network mounts
      // into this box; the box never resizes (zero-CLS rule).
      className="mx-auto my-6 flex min-h-[266px] w-[300px] flex-col items-center justify-center rounded border border-border bg-surface text-xs text-muted"
    >
      <span>Advertisement</span>
      {visible ? <div id={`ad-${slotId}`} className="h-[250px] w-[300px]" /> : null}
    </div>
  );
}
