import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "The FitTools Performance Lab: test your reaction, memory and aim";

export default function Image() {
  return ogCard(
    "Test yourself. Then beat yourself.",
    "Reaction · Recall · Track. Real protocols, thirty-second runs, tiers built for the group chat. Free in the browser, no sign-up.",
    { kicker: "The Performance Lab" },
  );
}
