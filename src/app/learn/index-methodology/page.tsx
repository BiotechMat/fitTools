import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import { AuthorBox } from "@/components/AuthorBox";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export const metadata: Metadata = {
  title: "Open Composite Index Methodology",
  description:
    "How FitTools builds its open composite indices: sub-score normalisation, weighting and evidence tiers, missing-data handling, versioning and the public changelog.",
  alternates: { canonical: "/learn/index-methodology" },
};

const LAST_REVIEWED = "2026-07-22";

export default function IndexMethodologyPage() {
  const jsonLd = [
    articleJsonLd({
      title: "Open composite index methodology",
      description: metadata.description as string,
      path: "/learn/index-methodology",
      lastReviewed: LAST_REVIEWED,
      author: { name: AUTHOR.name, path: AUTHOR.path },
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Index methodology", path: "/learn/index-methodology" },
    ]),
  ];

  return (
    <article className="prose">
      {jsonLd.map((b, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
      ))}
      <h1 className="text-2xl font-bold sm:text-3xl">Open composite index methodology</h1>
      <p className="mt-1 text-sm text-muted">Last reviewed: 22 July 2026</p>
      <p>
        Some of our tools are <strong>open composite indices</strong> — single
        0–100 scores built from several inputs. The whole point is that they
        are transparent: we publish the inputs, how each is scored, the
        weights, and the evidence behind them. You can reconstruct any score
        yourself. That openness is the opposite of the hidden scores inside
        proprietary wearables and testing services.
      </p>

      <h2>How a score is built</h2>
      <ol>
        <li>
          <strong>Sub-scores (0–100).</strong> Each input becomes a 0–100
          sub-score where higher is always more favourable, via a documented,
          clamped linear mapping between stated anchor points.
        </li>
        <li>
          <strong>Weights and evidence tiers.</strong> Weights sum to 100%.
          Every input is tagged <strong>T1</strong> (strong, outcome-linked
          evidence), <strong>T2</strong> (moderate/surrogate) or{" "}
          <strong>T3</strong> (mechanistic). No single input exceeds ~30%, and
          a weak (T3) input never outweighs a strong (T1) one.
        </li>
        <li>
          <strong>Aggregation.</strong> The index is the weighted average of
          the sub-scores. Some tools also show a centred &ldquo;pace&rdquo;
          number, which is just a display transform of the same index.
        </li>
        <li>
          <strong>Missing data.</strong> Leave an input blank and the weights
          renormalise across what you provided, with a reduced-confidence
          flag — we never substitute a value that flatters or penalises you.
        </li>
      </ol>

      <h2>What these scores are not</h2>
      <p>
        A composite index here is a <strong>transparent tool for
        self-tracking. It is not a medical test and has not been validated
        against health outcomes.</strong> No index outputs a mortality
        estimate, life-expectancy figure or disease probability; body-
        composition inputs are capped and never dominate; and none produces
        medication or supplement advice. A low sub-score points to a
        modifiable lever — it is never a judgement on you.
      </p>

      <h2>Versioning &amp; changelog</h2>
      <p>
        Weights and mappings are part of the public contract: they never
        change silently. Every change bumps the version and is recorded here.
      </p>
      <ul>
        <li>
          <strong>Metabolic Fitness Index v1.0.0</strong> (2026-07-22) —
          initial release. See the{" "}
          <Link href="/metabolic-fitness-index">tool page</Link> for its full
          weights and anchors.
        </li>
      </ul>

      <AuthorBox lastReviewed={LAST_REVIEWED} />
    </article>
  );
}
