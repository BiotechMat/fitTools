import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { SupplementExplorer } from "@/components/tools/SupplementExplorer";

export const metadata: Metadata = {
  title: "Supplement Evidence Explorer — Every Tier, Every Receipt",
  description:
    "Every supplement we cover, laid out by evidence tier: well-supported, preliminary, or marketing claim. Search the shelf, read the honest one-liner, pull the full cited review.",
  alternates: { canonical: "/tools/supplement-explorer" },
};

export default function SupplementExplorerPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Supplement explorer", path: "/tools/supplement-explorer" },
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
        <span>Supplement explorer</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Supplement explorer
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        The whole shelf at a glance, sorted by what the evidence actually
        supports — not by what the label promises. Tap anything for the honest
        one-liner, safety flags and the fully cited review. Tiers are the
        point: we grade evidence, we don&rsquo;t invent effect sizes.
      </p>

      <div className="mt-6">
        <SupplementExplorer />
      </div>

      <p className="mt-6 max-w-prose text-sm text-muted">
        Prefer the long way round? Browse the{" "}
        <Link
          href="/supplements"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          full supplement reference
        </Link>{" "}
        with methodology and FAQs on every page.
      </p>
    </div>
  );
}
