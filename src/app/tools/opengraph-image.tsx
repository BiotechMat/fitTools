import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools micro-tools: timers, breath coach, muscle map and more";

export default function Image() {
  return ogCard(
    "The micro-tools",
    "Rest and interval timers, a breathing coach, a clickable muscle map, a protein plate builder and a supplement evidence explorer. Free, in your browser.",
    { kicker: "Interactive tools" },
  );
}
