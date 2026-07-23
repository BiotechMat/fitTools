import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { PlateBuilder } from "@/components/tools/PlateBuilder";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";

export const metadata: Metadata = {
  title: "Plate Builder: Stack Foods, Watch Protein Add Up",
  description:
    "Build a meal from real reference foods and watch protein and calories total live against your targets. Typical portions, honest numbers, no sign-up.",
  alternates: { canonical: "/tools/plate-builder" },
  // Per-page manifest so add-to-home-screen saves THIS page, not the root.
  manifest: "/api/page-manifest?page=plate-builder",
  appleWebApp: { capable: true, title: "Plate Builder" },
};

export default function PlateBuilderPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Plate builder", path: "/tools/plate-builder" },
  ]);

  return (
    <div>
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
        <span>Plate builder</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Plate builder
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Stack real foods onto a plate, typical portions from the food
        reference, and watch protein and energy add up against your meal
        targets. The quickest way to see why the chicken-and-rice crowd hits
        their protein and the toast crowd doesn&rsquo;t.
      </p>

      <div className="mt-6">
        <PlateBuilder />
      </div>
      <AddToHomeScreen toolName="the plate builder" />

      <p className="mt-6 max-w-prose text-sm text-muted">
        All numbers come from the{" "}
        <Link
          href="/nutrition/reference"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          food reference
        </Link>,{" "}
        protein and calories per typical portion, the same figures behind the
        protein tables.
      </p>
    </div>
  );
}
