import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Pulse — an endless feed of cited fitness and longevity facts";

export default function Image() {
  return ogCard(
    "Pulse",
    "A bottomless, source-verified feed of bite-sized facts across training, nutrition, recovery, sleep and longevity — every card cites a real study.",
    { kicker: "The feed" },
  );
}
