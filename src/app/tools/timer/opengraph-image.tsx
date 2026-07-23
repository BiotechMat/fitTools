import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools gym timers: rest, intervals and EMOM";

export default function Image() {
  return ogCard(
    "Gym timers",
    "Big digits and countdown beeps: rest presets, work/rest intervals with a Tabata preset, and EMOM rounds. Bookmark your favourites.",
    { kicker: "Micro-tool" },
  );
}
