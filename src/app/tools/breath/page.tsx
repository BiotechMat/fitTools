import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd } from "@/lib/schema-org";
import { BreathCoach } from "@/components/tools/BreathCoach";
import { AddToHomeScreen } from "@/components/tools/AddToHomeScreen";

export const metadata: Metadata = {
  title: "Breath Coach — Box, 4-7-8 & Coherent Breathing",
  description:
    "A free breathing pacer: box breathing, 4-7-8 and coherent breathing with a calm visual orb and gentle haptics. One to five minutes, in your browser, nothing stored.",
  alternates: { canonical: "/tools/breath" },
};

export default function BreathPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Breath coach", path: "/tools/breath" },
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
        <span>Breath coach</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
        Breath coach
      </h1>
      <p className="mt-2 max-w-prose text-muted">
        Pick a pattern, follow the orb. Slow, paced breathing is one of the
        simplest ways to downshift between sets, before bed, or whenever the
        day gets loud.
      </p>

      <div className="mt-6">
        <BreathCoach />
      </div>
      <AddToHomeScreen toolName="the breath coach" />

      <p className="mt-6 max-w-prose text-sm text-muted">
        Curious what the evidence actually says about breathwork and recovery?
        The{" "}
        <Link
          href="/recovery/breathwork"
          className="text-primary underline underline-offset-2 hover:text-foreground"
        >
          breathwork guide
        </Link>{" "}
        covers it honestly, citations included — this tool is a pacer, not a
        treatment.
      </p>
    </div>
  );
}
