import type { Metadata } from "next";
import Link from "next/link";
import { AUTHOR } from "@/lib/site";
import { personJsonLd } from "@/lib/schema-org";
import { allTools } from "@/registry/tools";

export const metadata: Metadata = {
  title: "Mathew Beale — Author",
  description:
    "Mathew Beale (MSc Biotechnology, University of Reading) writes and reviews every FitTools calculator against its published primary sources.",
  alternates: { canonical: AUTHOR.path },
};

export default function AuthorPage() {
  const jsonLd = personJsonLd(AUTHOR);
  return (
    <article className="prose">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-2xl font-bold sm:text-3xl">Mathew Beale</h1>
      <p className="mt-1 text-muted">{AUTHOR.credentials}</p>
      <p>
        I build and maintain every calculator on FitTools. My background is
        in biotechnology — an MSc from the University of Reading — which
        shaped the way this site works: every formula is implemented from
        its published, peer-reviewed source, and the citation appears in the
        Methodology section of the page that uses it, so you can check the
        working yourself.
      </p>
      <h2>How tools are reviewed</h2>
      <ul>
        <li>
          Formulas are implemented exactly as published, with automated
          tests locking each one to worked examples before release.
        </li>
        <li>
          Where sources disagree, the page says so and explains which
          version is used and why.
        </li>
        <li>
          Every tool page shows a last-reviewed date; {allTools.length}{" "}
          calculators are currently live.
        </li>
      </ul>
      <p>
        FitTools provides estimates for general information — it does not
        give medical advice, and I am not a medical professional. For
        anything affecting your health, please speak to a qualified
        clinician. See the{" "}
        <Link href="/legal/medical-disclaimer">full medical disclaimer</Link>.
      </p>
    </article>
  );
}
