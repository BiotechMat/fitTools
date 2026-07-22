import type { Metadata } from "next";
import Link from "next/link";
import { hubMeta } from "@/registry/hubs";
import { HubPage } from "@/components/HubPage";
import { recoveryClusters } from "@/registry/recovery-content";

const meta = hubMeta.recovery;

export const metadata: Metadata = {
  title: `${meta.title} calculators`,
  description: meta.description,
  alternates: { canonical: meta.path },
};

export default function RecoveryHubPage() {
  return (
    <div className="space-y-12">
      <HubPage hub="recovery" />
      <section aria-labelledby="recovery-guides">
        <h2 id="recovery-guides" className="font-display text-xl uppercase">
          Recovery &amp; wellness guides
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Evidence-tiered explainers on popular recovery practices — what the
          research actually supports, and what&rsquo;s marketing.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {recoveryClusters.map((c) => (
            <li key={c.slug} className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]">
              <Link
                href={`/recovery/${c.slug}`}
                className="font-semibold text-primary underline underline-offset-2"
              >
                {c.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{c.pillarValueLine}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
