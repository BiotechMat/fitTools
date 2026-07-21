import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How affiliate links work on FitTools: clear labelling, no influence on calculator results, and no live offers at present.",
  alternates: { canonical: "/legal/affiliate-disclosure" },
};

export default function AffiliateDisclosurePage() {
  return (
    <article className="prose">
      <h1 className="text-2xl font-bold sm:text-3xl">Affiliate disclosure</h1>
      <p className="mt-1 text-sm text-muted">Last updated: 21 July 2026</p>
      <p>
        FitTools may include affiliate links — links to products or
        services where we earn a commission if you make a purchase, at no
        extra cost to you. At the time of writing, no affiliate offers are
        live on the site; this disclosure exists so the rules are public
        before any appear.
      </p>
      <h2>Our commitments</h2>
      <ul>
        <li>
          Every affiliate placement is accompanied by a visible disclosure
          line, and affiliate links are marked with{" "}
          <code>rel=&quot;sponsored&quot;</code> so search engines see them
          for what they are.
        </li>
        <li>
          Affiliate relationships never influence calculator formulas,
          results, editorial conclusions or which tools we build. Formulas
          are locked to their published sources and tested against them.
        </li>
        <li>
          We only consider recommending products of the kind we would use
          ourselves, and clearly separate recommendations from calculator
          output.
        </li>
      </ul>
      <p>
        Questions about a specific placement are welcome via the
        site&rsquo;s contact details.
      </p>
    </article>
  );
}
