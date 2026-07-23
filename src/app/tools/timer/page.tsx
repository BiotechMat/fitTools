import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { GymTimer } from "@/components/tools/GymTimer";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";

export const metadata: Metadata = {
  title: "Gym Timers: Rest, Intervals & EMOM",
  description:
    "Free gym timers with big digits and countdown beeps: rest timer presets, work/rest intervals with a Tabata preset, and EMOM rounds. Settings live in the URL, so bookmark your favourites.",
  alternates: { canonical: "/tools/timer" },
  // Per-page manifest so add-to-home-screen saves THIS page, not the root.
  manifest: "/api/page-manifest?page=timer",
  appleWebApp: { capable: true, title: "Gym Timers" },
};

export default function TimerPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Gym timers", path: "/tools/timer" },
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href="/tools" className="hover:text-foreground">
          Tools
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Gym timers</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Gym timers
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Rest between sets, run intervals, or hold yourself to the minute, with big
        digits, countdown beeps, and settings that live in the URL so your
        favourite protocol is one bookmark away.
      </p>

      <div className="mt-6">
        <GymTimer />
      </div>
      <AddToHomeScreen toolName="the timers" />

      <p className="mt-6 max-w-prose text-sm text-muted">
        Pair intervals with your{" "}
        <Link
          href="/heart-rate-zone-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          heart-rate zones
        </Link>{" "}
        to keep hard days hard and easy days easy, and use the{" "}
        <Link
          href="/warmup-calculator"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          warm-up calculator
        </Link>{" "}
        to plan the sets between the rests.
      </p>
    </div>
  );
}
