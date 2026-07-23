import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Looksmaxxing myths, rated against the evidence";

export default function Image() {
  return ogCard(
    "Looksmaxxing myths, rated",
    "Mewing, bone-smashing, tanmaxxing, mouth-taping, SARMs — rated honestly against the evidence. We rate the claim, never a person.",
    { kicker: "Glow-up · the debunks" },
  );
}
