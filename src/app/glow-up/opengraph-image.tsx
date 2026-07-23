import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "The Glow-Up, peer-reviewed — evidence-based self-improvement";

export default function Image() {
  return ogCard(
    "The glow-up, peer-reviewed",
    "What actually changes how you look — skin, sun, sleep and body composition — sorted by evidence, dangerous trends debunked. No face rating, ever.",
    { kicker: "Evidence, not hype" },
  );
}
