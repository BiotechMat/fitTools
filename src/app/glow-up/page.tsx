import type { Metadata } from "next";
import Link from "next/link";
import { glowUpClusters, glowUpMyths } from "@/registry/glowup-content";
import { BodyImageResources } from "@/components/BodyImageResources";
import { breadcrumbJsonLd } from "@/lib/schema-org";

const TITLE = "The Glow-Up, Peer-Reviewed";
const DESCRIPTION =
  "Evidence-based self-improvement, not looksmaxxing hype. What actually changes how you look — skin, sun, sleep and body composition — sorted by evidence, with the dangerous trends debunked. No face rating, ever.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glow-up" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: "/glow-up" },
};

export default function GlowUpHubPage() {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Glow-up", path: "/glow-up" },
  ]);

  return (
    <div className="space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-good">
          Evidence-based self-improvement
        </p>
        <h1 className="font-display text-4xl uppercase sm:text-5xl">{TITLE}</h1>
        <p className="max-w-prose text-muted">
          &ldquo;Looksmaxxing&rdquo; is one of the biggest health search
          categories — and almost all of it is grifters, forums and influencers
          selling jaw trainers and tanning. Here&rsquo;s the honest version:
          skin, sleep, body composition and grooming, sorted by what the
          evidence actually supports. Every claim is tiered and cited, the
          dangerous trends are debunked, and we never rate anyone&rsquo;s face.
        </p>
      </header>

      <section aria-labelledby="glowup-clusters">
        <h2 id="glowup-clusters" className="font-display text-2xl uppercase">Start here</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {glowUpClusters.map((c) => (
            <li key={c.slug} className="rounded-2xl border-2 border-foreground bg-surface p-5 shadow-[4px_4px_0_0_var(--color-foreground)]">
              <Link href={`/glow-up/${c.slug}`} className="font-display text-xl uppercase text-primary">
                {c.title}
              </Link>
              <p className="mt-2 text-sm text-muted">{c.pillarValueLine}</p>
            </li>
          ))}
          <li className="rounded-2xl border-2 border-foreground bg-primary-soft p-5 shadow-[4px_4px_0_0_var(--color-foreground)]">
            <Link href="/glow-up/looksmaxxing-myths" className="font-display text-xl uppercase text-primary">
              Looksmaxxing Myths, Rated
            </Link>
            <p className="mt-2 text-sm text-foreground">
              {glowUpMyths.length} viral trends — from mewing to bone-smashing —
              rated against the evidence, each with a link to what actually
              works.
            </p>
          </li>
        </ul>
      </section>

      <BodyImageResources />
    </div>
  );
}
