"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  applyEngagement,
  isLiked,
  isSaved,
  parsePulseStore,
  readRawPulseStore,
  subscribePulseStore,
  toggleLike,
  toggleSave,
  updatePulseStore,
} from "@/lib/pulse-store";
import type { PulseBatchResponse, PulseCard as Card } from "@/lib/pulse/types";
import { PulseCard } from "./PulseCard";

/**
 * Fact of the day (PULSE.md §7, locked §11). One deterministic, date-seeded hero
 * card — the same fact for every visitor on a given day, doubling as the E5
 * newsletter unit-of-one. Fetched from /api/pulse with `daily: true`.
 */
export function PulseDaily() {
  const [card, setCard] = useState<Card | null>(null);
  const rawStore = useSyncExternalStore(subscribePulseStore, readRawPulseStore, () => null);
  const store = useMemo(() => parsePulseStore(rawStore), [rawStore]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/pulse", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ daily: true }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as PulseBatchResponse;
        if (!cancelled && data.cards[0]) setCard(data.cards[0]);
      } catch {
        // leave the hero absent on failure — the scroll below still works
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!card) {
    // Reserve height (zero CLS) while the hero loads.
    return <div className="mb-6 h-48 animate-pulse rounded-lg border border-border bg-surface-deep" aria-hidden="true" />;
  }

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/pulse` : "/pulse";
    const text = `${card.fact} — via FitTools`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) await navigator.share({ text, url });
      else if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      /* dismissed */
    }
    trackEvent({ name: "pulse_card_shared", params: { id: card.id } });
  };

  return (
    <div className="mb-6">
      <PulseCard
        card={card}
        hero
        liked={isLiked(store, card.id)}
        saved={isSaved(store, card.id)}
        onLike={() => {
          updatePulseStore((st) => applyEngagement(toggleLike(st, card.id), card.category, "like"));
          trackEvent({ name: "pulse_card_liked", params: { id: card.id } });
        }}
        onSave={() => {
          updatePulseStore((st) => applyEngagement(toggleSave(st, card.id), card.category, "save"));
          trackEvent({ name: "pulse_card_saved", params: { id: card.id } });
        }}
        onShare={() => void share()}
        onSource={() => {
          updatePulseStore((st) => applyEngagement(st, card.category, "source"));
          trackEvent({ name: "pulse_source_click", params: { id: card.id } });
        }}
        onExpand={() => updatePulseStore((st) => applyEngagement(st, card.category, "expand"))}
        onRelated={(target) => trackEvent({ name: "pulse_related_click", params: { id: card.id, target } })}
      />
    </div>
  );
}
