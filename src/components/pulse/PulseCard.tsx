"use client";

import { useState } from "react";
import Link from "next/link";
import { EvidenceTier } from "@/components/EvidenceTier";
import { PULSE_CATEGORY_LABELS } from "@/lib/pulse/types";
import type { PulseCard as Card } from "@/lib/pulse/types";

/**
 * A single Pulse card (PULSE.md §7). Espresso/paper card, ink border + hard
 * shadow like the tool cards; category accent, EvidenceTier badge, action row
 * (like / save / share / source), optional expand, and cross-links. Every card
 * carries a real source (§2.1) — always shown, never behind a tap.
 */
export function PulseCard({
  card,
  liked,
  saved,
  onLike,
  onSave,
  onShare,
  onSource,
  onExpand,
  onRelated,
  hero = false,
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
  hero?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article
      data-testid="pulse-card"
      data-category={card.category}
      className={`flex flex-col gap-3 rounded-lg border border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)] ${
        hero ? "sm:p-6" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
          {PULSE_CATEGORY_LABELS[card.category]}
        </span>
        <EvidenceTier tier={card.tier} basis={card.basis} />
        {hero ? (
          <span className="ml-auto rounded-full border border-good bg-good-soft px-2 py-0.5 text-xs font-semibold text-good">
            Fact of the day
          </span>
        ) : null}
      </div>

      <p className={hero ? "text-xl font-medium sm:text-2xl" : "text-lg font-medium"}>
        {card.fact}
      </p>

      {card.detail ? (
        <div>
          <button
            type="button"
            className="text-sm text-primary underline underline-offset-2"
            aria-expanded={open}
            onClick={() => {
              const next = !open;
              setOpen(next);
              if (next) onExpand();
            }}
          >
            {open ? "Less" : "More"}
          </button>
          {open ? <p className="mt-2 text-sm text-muted">{card.detail}</p> : null}
        </div>
      ) : null}

      {(card.relatedTool || card.relatedContent) ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {card.relatedTool ? (
            <Link
              href={card.relatedTool}
              className="text-primary underline underline-offset-2"
              onClick={() => onRelated(card.relatedTool!)}
            >
              Try the calculator →
            </Link>
          ) : null}
          {card.relatedContent ? (
            <Link
              href={card.relatedContent}
              className="text-primary underline underline-offset-2"
              onClick={() => onRelated(card.relatedContent!)}
            >
              Read more →
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-1 flex items-center gap-1 border-t border-border pt-3">
        <ActionButton
          label={liked ? "Unlike this fact" : "Like this fact"}
          pressed={liked}
          onClick={onLike}
        >
          <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
        </ActionButton>
        <ActionButton
          label={saved ? "Remove from saved" : "Save this fact"}
          pressed={saved}
          onClick={onSave}
        >
          <span aria-hidden="true">{saved ? "★" : "☆"}</span>
        </ActionButton>
        <ActionButton label="Share this fact" onClick={onShare}>
          <span aria-hidden="true">↗</span>
        </ActionButton>
        <a
          href={card.source.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={onSource}
          className="ml-auto max-w-[65%] truncate text-right font-mono text-xs text-muted underline underline-offset-2 hover:text-foreground"
          title={card.source.label}
        >
          {card.source.label}
        </a>
      </div>
    </article>
  );
}

function ActionButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg transition-colors hover:bg-surface-deep ${
        pressed ? "text-primary" : "text-muted"
      }`}
    >
      {children}
    </button>
  );
}
