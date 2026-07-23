import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { MuscleMap } from "@/components/tools/MuscleMap";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";

export const metadata: Metadata = {
  title: "Muscle Map: Tap a Muscle, Find the Exercises",
  description:
    "A clickable muscle map: pick any muscle group and see every exercise in the library that trains it, directly or along the way. Free, with full form guides one tap away.",
  alternates: { canonical: "/tools/muscle-map" },
};

export default function MuscleMapPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Muscle map", path: "/tools/muscle-map" },
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
        <span>Muscle map</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Muscle map
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Tap a muscle, on the figure or the chips, and see every exercise in
        the library that trains it, with the ones that hit it directly listed
        first. Each link opens the full guide: steps, form faults and
        substitutions.
      </p>

      <div className="mt-6">
        <MuscleMap />
      </div>
      <AddToHomeScreen toolName="the muscle map" />

      <p className="mt-6 max-w-prose text-sm text-muted">
        Browsing rather than targeting? The{" "}
        <Link
          href="/exercises"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          full exercise library
        </Link>{" "}
        is organised by movement pattern instead.
      </p>
    </div>
  );
}
