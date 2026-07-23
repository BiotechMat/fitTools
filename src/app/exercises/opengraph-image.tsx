import { OG_SIZE, ogCard } from "@/lib/og-image";
import { exercises } from "@/registry/exercises";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools exercise library: how to perform the big lifts";

export default function Image() {
  return ogCard(
    "The exercise library",
    `${exercises.length} barbell and bodyweight exercises: how to perform each, the muscles worked, the form faults and fixes, and where they fit.`,
    { kicker: "How to lift" },
  );
}
