"use client";

import { useState } from "react";
import { shareUrl, type ShareCardParams } from "@/lib/share-card";

/**
 * "Share this result" button (ROADMAP.md E1). Builds the `/share` permalink
 * (which unfurls as the branded card) and offers it via the Web Share sheet,
 * falling back to copy-to-clipboard. Wins-only surface — callers pass a
 * flattering value/label; no personal data leaves the device beyond the
 * presentation strings the user chose to share.
 */
export function ShareResult({
  tool,
  value,
  unit,
  label,
  title,
}: ShareCardParams & { title: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url =
      (typeof window !== "undefined" ? window.location.origin : "") +
      shareUrl({ tool, value, unit, label });
    const shareData = {
      title: `${title}: ${value}${unit ? ` ${unit}` : ""}`,
      text: `My ${title} result from FitTools — every formula cited.`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to copy
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op, never a broken UI
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      data-testid="share-result"
      className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-surface px-4 py-1.5 text-sm font-semibold shadow-[2px_2px_0_0_var(--color-foreground)] hover:bg-primary hover:text-background"
    >
      {copied ? "Link copied ✓" : "Share result ↗"}
    </button>
  );
}
