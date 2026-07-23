import type { ReactNode } from "react";
import { recommendationsFor } from "@/registry/affiliates";
import { RecommendationCard } from "@/components/RecommendationCard";

/**
 * Layout shell for surfaces carrying the "Our recommendation" card
 * (SPEC §10): below lg the card renders after the wrapped content, exactly
 * as before; on desktop (lg+) it moves into its own sticky right-hand
 * column. Surfaces with no picks render children unchanged — no empty rail
 * is ever reserved. Pass `surface: null` to opt out entirely (e.g. tools
 * with monetization.affiliates off).
 */
export function RecommendationRail({
  surface,
  children,
}: {
  surface: string | null;
  children: ReactNode;
}) {
  if (!surface || recommendationsFor(surface).length === 0) {
    return <>{children}</>;
  }
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-8">
      <div className="min-w-0 space-y-8">{children}</div>
      <div className="mt-8 lg:sticky lg:top-6 lg:mt-0">
        <RecommendationCard surface={surface} />
      </div>
    </div>
  );
}
