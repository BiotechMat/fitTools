import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import { GLOWUP_LAST_REVIEWED, glowUpMyths } from "@/registry/glowup-content";
import { AuthorBox } from "@/components/AuthorBox";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { BodyImageResources } from "@/components/BodyImageResources";
import { VerdictStamp } from "@/components/VerdictStamp";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

const TITLE = "Looksmaxxing Myths, Rated";
const DESCRIPTION =
  "The viral looksmaxxing trends — mewing, bone-smashing, tanmaxxing, mouth-taping, SARMs — rated honestly against the evidence, each with a link to what actually works. We rate the claim, never a person.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/glow-up/looksmaxxing-myths" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "article", url: "/glow-up/looksmaxxing-myths" },
};

export default function LooksmaxxingMythsPage() {
  const jsonLd = [
    articleJsonLd({
      title: TITLE,
      description: DESCRIPTION,
      path: "/glow-up/looksmaxxing-myths",
      lastReviewed: GLOWUP_LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Glow-up", path: "/glow-up" },
      { name: TITLE, path: "/glow-up/looksmaxxing-myths" },
    ]),
  ];

  return (
    <article className="space-y-8">
      {jsonLd.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
      ))}
      <div>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/glow-up" className="hover:text-foreground">Glow-up</Link>
        </nav>
        <h1 className="mt-2 font-display text-3xl uppercase sm:text-4xl">{TITLE}</h1>
        <p className="mt-2 max-w-prose text-muted">
          The looksmaxxing world is full of confident claims. Here they are,
          rated against the evidence — with a route to what actually works next
          to each. Some of these are just unproven; some are dangerous, and we
          say so plainly rather than pretending there are two sides.
        </p>
      </div>

      <ul className="space-y-4">
        {glowUpMyths.map((m) => (
          <li
            key={m.slug}
            data-testid="myth-card"
            className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[4px_4px_0_0_var(--color-foreground)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-prose text-lg font-semibold">
                <s className="text-muted">{m.claim}</s>
              </p>
              <VerdictStamp tier={m.verdict} basis={m.basis} />
            </div>
            <p className="mt-2 max-w-prose text-sm">{m.verdictLine}</p>
            <p className="mt-3 text-sm">
              <span className="font-mono text-xs uppercase tracking-wider text-good">Instead → </span>
              <Link href={m.honestAlternative.href} className="text-primary underline underline-offset-2">
                {m.honestAlternative.title}
              </Link>
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {m.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} rel="noopener noreferrer" className="underline underline-offset-2">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <BodyImageResources />
      <AuthorBox lastReviewed={GLOWUP_LAST_REVIEWED} />
      <DisclaimerBanner />
    </article>
  );
}
