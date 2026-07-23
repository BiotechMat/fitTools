import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { DashboardView } from "@/components/dashboard/DashboardView";

/**
 * The personal dashboard (DASHBOARD.md). A private, per-person surface — not an
 * SEO page — so it is noindexed and kept out of the sitemap. D0 ships the
 * anonymous, local-first scaffold: it aggregates what the calculators already
 * saved on this device; identified profiles and blood-test biomarkers arrive
 * with accounts behind the §8 data-protection gate.
 */
export const metadata: Metadata = {
  title: "Your numbers — FitTools dashboard",
  description:
    "Your saved calculations, health scores and blood-test biomarkers in one private place — tracked over time, stored on your device.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Dashboard</span>
      </nav>

      <header className="mt-4">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">
          Your{" "}
          <span className="inline-block -rotate-1 rounded-lg bg-primary-strong px-2 text-background">
            dashboard
          </span>
        </h1>
      </header>

      <DashboardView />

      <div className="mt-12 mb-4">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
