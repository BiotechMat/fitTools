import { OG_SIZE, ogCard } from "@/lib/og-image";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "FitTools Arcade: quick games with a health-nerd twist";

export default function Image() {
  return ogCard(
    "Quick games with a health-nerd twist",
    "Lifeline · Powerhouse · Max Out · Five a Day · the dailies. Free in the browser, no sign-up, receipts included.",
    { kicker: "The arcade" },
  );
}
