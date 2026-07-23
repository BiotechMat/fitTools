"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { markActiveToday } from "@/lib/activity-store";
import { trackEvent } from "@/lib/analytics";
import {
  applyEngagement,
  isLiked,
  isSaved,
  parsePulseStore,
  readPulseStore,
  readRawPulseStore,
  recordSeen,
  subscribePulseStore,
  toggleLike,
  toggleSave,
  updatePulseStore,
} from "@/lib/pulse-store";
import type { PulseBatchResponse, PulseCard as Card, PulseCategory } from "@/lib/pulse/types";
import { PulseCard } from "./PulseCard";
import { PulseFilterBar } from "./PulseFilterBar";

const BATCH = 6;
const DWELL_LONG_MS = 2500;
const SCROLL_PAST_MS = 800;

/**
 * The endless Pulse scroll (PULSE.md §7). The parent owns only the filter; the
 * feed list is a keyed child so a filter change remounts it — resetting cards
 * without a synchronous setState-in-effect (repo lint / React-compiler rule).
 */
export function PulseScroller() {
  const [active, setActive] = useState<Set<PulseCategory>>(new Set());
  const [freshOnly, setFreshOnly] = useState(false);

  const toggleCategory = (c: PulseCategory) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      trackEvent({ name: "pulse_filter_applied", params: { categories: Array.from(next).join(",") } });
      return next;
    });
  };

  const toggleFresh = () => {
    setFreshOnly((prev) => {
      const next = !prev;
      trackEvent({ name: "pulse_filter_applied", params: { categories: next ? "fresh" : "" } });
      return next;
    });
  };

  const clear = () => {
    setActive(new Set());
    setFreshOnly(false);
    trackEvent({ name: "pulse_filter_applied", params: { categories: "" } });
  };

  const categories = Array.from(active);
  const key = `${categories.slice().sort().join(",") || "all"}|${freshOnly ? "fresh" : "all"}`;

  return (
    <div>
      <PulseFilterBar
        active={active}
        freshOnly={freshOnly}
        onToggle={toggleCategory}
        onToggleFresh={toggleFresh}
        onClear={clear}
      />
      <PulseFeed key={key} categories={categories} freshOnly={freshOnly} />
    </div>
  );
}

/** The card list for one filter. Remounts (fresh state) whenever the filter changes. */
function PulseFeed({ categories, freshOnly }: { categories: PulseCategory[]; freshOnly: boolean }) {
  const rawStore = useSyncExternalStore(subscribePulseStore, readRawPulseStore, () => null);
  const store = useMemo(() => parsePulseStore(rawStore), [rawStore]);

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [degraded, setDegraded] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const fetchedChunkIds = useRef<Set<string>>(new Set());
  const cardIds = useRef<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const fetchBatch = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const current = readPulseStore(); // always-fresh: seen + affinity
      const seen = Array.from(new Set([...current.seen, ...fetchedChunkIds.current]));
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ categories, count: BATCH, seen, affinity: current.affinity, seed: Date.now(), freshOnly }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as PulseBatchResponse;
      setDegraded(data.degraded);
      const fresh = data.cards.filter((c) => !cardIds.current.has(c.id));
      for (const c of fresh) {
        cardIds.current.add(c.id);
        fetchedChunkIds.current.add(c.chunkId);
      }
      if (fresh.length === 0) setExhausted(true);
      else setCards((prev) => [...prev, ...fresh]);
    } catch {
      // network failure — keep what we have; the sentinel/button can retry
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [categories, freshOnly]);

  // Initial load on mount (async setState is fine; only synchronous is flagged).
  useEffect(() => {
    void fetchBatch();
  }, [fetchBatch]);

  // Infinite-scroll sentinel.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current && !exhausted) void fetchBatch();
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fetchBatch, exhausted]);

  const handleLike = (card: Card) => {
    const next = updatePulseStore((s) => applyEngagement(toggleLike(s, card.id), card.category, "like"));
    if (isLiked(next, card.id)) markActiveToday("pulse");
    trackEvent({ name: "pulse_card_liked", params: { id: card.id } });
  };
  const handleSave = (card: Card) => {
    const next = updatePulseStore((s) => applyEngagement(toggleSave(s, card.id), card.category, "save"));
    if (isSaved(next, card.id)) markActiveToday("pulse");
    trackEvent({ name: "pulse_card_saved", params: { id: card.id } });
  };
  const handleShare = async (card: Card) => {
    // v1 share: native share / clipboard of the fact + link. The branded
    // OG-image card (PULSE.md §4, locked §11) is the E1-pipeline follow-on.
    const url = typeof window !== "undefined" ? `${window.location.origin}/pulse` : "/pulse";
    const text = `${card.fact} — via FitTools`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) await navigator.share({ text, url });
      else if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      // user dismissed the share sheet — no-op
    }
    trackEvent({ name: "pulse_card_shared", params: { id: card.id } });
  };
  const handleSource = (card: Card) => {
    updatePulseStore((s) => applyEngagement(s, card.category, "source"));
    trackEvent({ name: "pulse_source_click", params: { id: card.id } });
  };
  const handleExpand = (card: Card) => {
    updatePulseStore((s) => applyEngagement(s, card.category, "expand"));
  };
  const handleRelated = (card: Card, target: string) => {
    trackEvent({ name: "pulse_related_click", params: { id: card.id, target } });
  };
  const handleDwell = (card: Card, visibleMs: number, firstView: boolean) => {
    if (firstView) trackEvent({ name: "pulse_card_viewed", params: { id: card.id, category: card.category } });
    // Dwell → local affinity only (raw ms discarded; never transmitted, §5.1).
    const kind = visibleMs >= DWELL_LONG_MS ? "dwellLong" : visibleMs < SCROLL_PAST_MS ? "scrollPast" : null;
    updatePulseStore((s) => {
      const withSeen = recordSeen(s, card.chunkId);
      return kind ? applyEngagement(withSeen, card.category, kind) : withSeen;
    });
  };

  return (
    <div>
      {degraded ? (
        <p className="mb-4 rounded-md border border-warning-border bg-warning-bg px-3 py-2 text-sm text-foreground">
          Showing the source-verified facts directly. Fresh phrasings appear once
          the generator is switched on.
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        {cards.map((card) => (
          <TrackedCard
            key={card.id}
            card={card}
            liked={isLiked(store, card.id)}
            saved={isSaved(store, card.id)}
            onLike={() => handleLike(card)}
            onSave={() => handleSave(card)}
            onShare={() => void handleShare(card)}
            onSource={() => handleSource(card)}
            onExpand={() => handleExpand(card)}
            onRelated={(target) => handleRelated(card, target)}
            onDwell={(ms, firstView) => handleDwell(card, ms, firstView)}
          />
        ))}
      </div>

      {/* Skeletons reserve height (zero CLS) while a batch loads. */}
      {loading ? (
        <div className="mt-4 flex flex-col gap-4" aria-hidden="true">
          <div className="h-40 animate-pulse rounded-lg border border-border bg-surface-deep" />
          <div className="h-40 animate-pulse rounded-lg border border-border bg-surface-deep" />
        </div>
      ) : null}

      {exhausted ? (
        <p className="mt-6 text-center text-sm text-muted" role="status">
          You&rsquo;re all caught up. More facts are on the way.
        </p>
      ) : null}

      {cards.length === 0 && !loading && !exhausted ? (
        <p className="mt-6 text-center text-sm text-muted" role="status">
          {freshOnly
            ? "No fresh discoveries right now — check back soon."
            : "Nothing to show for this filter yet."}
        </p>
      ) : null}

      {/* Keyboard / reduced-motion fallback for scroll-only loading. */}
      {!exhausted ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => void fetchBatch()}
            disabled={loading}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted hover:bg-surface-deep disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}

      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  );
}

/** Per-card dwell measurement (PULSE.md §5.1). Local only; never transmitted. */
function TrackedCard({
  card,
  onDwell,
  ...cardProps
}: {
  card: Card;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onSource: () => void;
  onExpand: () => void;
  onRelated: (target: string) => void;
  onDwell: (visibleMs: number, firstView: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const enteredAt = useRef<number | null>(null);
  const viewed = useRef(false);
  const onDwellRef = useRef(onDwell);
  useEffect(() => {
    onDwellRef.current = onDwell;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) {
          enteredAt.current = performance.now();
        } else if (enteredAt.current !== null) {
          const ms = performance.now() - enteredAt.current;
          enteredAt.current = null;
          const firstView = !viewed.current;
          viewed.current = true;
          onDwellRef.current(ms, firstView);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <PulseCard card={card} {...cardProps} />
    </div>
  );
}
