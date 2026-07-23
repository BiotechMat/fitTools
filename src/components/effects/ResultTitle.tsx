"use client";

import { useEffect, useRef } from "react";

/**
 * The browser tab carries your number (DESIGN.md §8): while a result is on
 * screen, document.title leads with it ("55 years · Your estimated heart
 * age · …"). The original title is restored on unmount so navigation and
 * history stay clean. Rendered by ScoreCard; renders nothing.
 */
export function ResultTitle({ text }: { text: string }) {
  const original = useRef<string | null>(null);

  useEffect(() => {
    if (original.current === null) original.current = document.title;
    document.title = `${text} · ${original.current}`;
  }, [text]);

  useEffect(
    () => () => {
      if (original.current !== null) document.title = original.current;
    },
    [],
  );

  return null;
}
