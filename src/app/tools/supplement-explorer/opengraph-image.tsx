import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools supplement evidence explorer: every tier, every receipt";

export default function Image() {
  return ogCard(
    "Supplement evidence explorer",
    "Every supplement we cover, laid out by evidence tier: well-supported, preliminary, or marketing claim. Honest one-liners, full cited reviews.",
    { kicker: "Micro-tool" },
  );
}
