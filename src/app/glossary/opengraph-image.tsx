import { OG_SIZE, ogCard } from "@/lib/og-image";
import { glossaryEntries } from "@/registry/glossary";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools glossary — plain-English fitness and longevity definitions";

export default function Image() {
  return ogCard(
    "The glossary",
    `${glossaryEntries.length} training, nutrition and longevity terms in plain English — hypertrophy, TDEE, VO₂max, ApoB, HRV and more.`,
    { kicker: "Plain-English definitions" },
  );
}
