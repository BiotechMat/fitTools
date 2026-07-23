"use client";

import { useEffect } from "react";
import {
  DAILY_CHANGE_EVENT,
  DAILY_STORAGE_KEY,
  ballparkKey,
  hasPlayed,
  parseDailyStore,
} from "@/lib/daily-store";

/**
 * Daily done-dot favicon (DESIGN.md §8): once today's Ballpark is played,
 * the tab's favicon gains a matcha tick-dot — the streak nags you from the
 * tab bar. Draws the existing favicon onto a canvas and overlays the dot;
 * silently skips on any decode/draw failure and restores the original icon
 * on unmount. Local-date keyed, same store as the game.
 */

function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function playedToday(): boolean {
  const store = parseDailyStore(window.localStorage.getItem(DAILY_STORAGE_KEY));
  return hasPlayed(store, ballparkKey(todayISO()));
}

export function DailyFavicon() {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const originalHref = link?.href ?? null;

    const apply = () => {
      if (!link || !originalHref || !playedToday()) return;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, 64, 64);
          ctx.beginPath();
          ctx.arc(48, 48, 13, 0, Math.PI * 2);
          ctx.fillStyle = "#8fbf3f";
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#1c130d";
          ctx.stroke();
          link.href = canvas.toDataURL("image/png");
        } catch {
          /* tainted canvas or draw failure — keep the original favicon */
        }
      };
      img.src = originalHref;
    };

    apply();
    window.addEventListener(DAILY_CHANGE_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(DAILY_CHANGE_EVENT, apply);
      window.removeEventListener("storage", apply);
      if (link && originalHref) link.href = originalHref;
    };
  }, []);

  return null;
}
