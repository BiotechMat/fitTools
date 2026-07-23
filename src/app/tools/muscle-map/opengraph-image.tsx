import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools muscle map: tap a muscle, find the exercises";

export default function Image() {
  return ogCard(
    "The muscle map",
    "Pick any muscle group and see every exercise in the library that trains it, directly or along the way. Full form guides one tap away.",
    { kicker: "Micro-tool" },
  );
}
