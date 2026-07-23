import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "This Week in the Science — recent fitness and longevity research";

export default function Image() {
  return ogCard(
    "This week in the science",
    "The latest fitness, nutrition, recovery and longevity studies, each with a plain-English reality check — and a link to the source.",
    { kicker: "Pulse" },
  );
}
