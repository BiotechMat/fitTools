import type { Metadata } from "next";
import {
  arcadeCardPath,
  resultDescription,
  resultTitle,
  type HeroCard,
  type ShareResultPayload,
} from "@/lib/arcade-share";

/**
 * Metadata for a game page whose URL may carry a shared result. Without
 * params the page unfurls as its own hero card; with a validated result the
 * same URL unfurls as the score card from `/api/arcade-card` — the reason a
 * "beat me" link shows the score, not the generic site image.
 */

export interface GamePageCopy {
  title: string;
  description: string;
  canonical: string;
  hero: HeroCard;
}

export function gameMetadata(
  copy: GamePageCopy,
  result: ShareResultPayload | null,
): Metadata {
  const title = result ? resultTitle(result) : copy.title;
  const description = result ? resultDescription(result) : copy.description;
  const image = arcadeCardPath(
    result ? { kind: "result", result } : { kind: "hero", game: copy.hero },
  );
  return {
    title,
    description,
    alternates: { canonical: copy.canonical },
    // Add-to-home-screen identity: a per-page manifest with an explicit
    // start_url (WebKit saves the site root without one — field-tested),
    // and the iOS title so the saved icon is named after the game.
    manifest: `/api/page-manifest?page=${copy.hero}`,
    appleWebApp: { capable: true, title: copy.title.split(":")[0].trim() },
    // A shared result URL is an ephemeral permalink, not content to index.
    ...(result ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      url: copy.canonical,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
