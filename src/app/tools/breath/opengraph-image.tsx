import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools breath coach: box, 4-7-8 and coherent breathing";

export default function Image() {
  return ogCard(
    "Breath coach",
    "A free breathing pacer: box breathing, 4-7-8 and coherent breathing with a calm visual orb. One to five minutes, nothing stored.",
    { kicker: "Micro-tool" },
  );
}
