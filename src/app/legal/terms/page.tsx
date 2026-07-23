import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that govern your use of FitTools: informational estimates, no medical advice, and sensible limits on liability.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <article className="prose">
      <h1 className="font-display text-3xl uppercase sm:text-4xl">Terms of use</h1>
      <p className="mt-1 text-sm text-muted">Last updated: 21 July 2026</p>
      <p>
        By using FitTools you agree to these terms. If you do not agree,
        please do not use the site.
      </p>
      <h2>What the site provides</h2>
      <p>
        FitTools provides calculators and editorial content for general
        information and education. Results are estimates produced by
        published formulas and are provided &ldquo;as is&rdquo;, without
        warranty of any kind. The site does not provide medical advice,
        see the{" "}
        <Link href="/legal/medical-disclaimer">medical disclaimer</Link>,
        which forms part of these terms.
      </p>
      <h2>Your responsibilities</h2>
      <p>
        You are responsible for how you use the estimates this site
        produces, including decisions about training loads, diet and
        recovery. Do not rely on the site for medical decisions, and do not
        use it where an error in an estimate could cause harm.
      </p>
      <h2>Liability</h2>
      <p>
        To the fullest extent permitted by law, we exclude liability for
        any loss or damage arising from use of the site or reliance on its
        content. Nothing in these terms excludes liability that cannot be
        excluded under the law of England and Wales, which governs these
        terms.
      </p>
      <h2>Content and intellectual property</h2>
      <p>
        Site content, design and code are our intellectual property or used
        under licence. You may link to any page freely. The published
        formulas themselves belong to science; our implementations,
        editorial and presentation belong to us.
      </p>
      <h2>Changes</h2>
      <p>
        We may update these terms and will change the date above when we
        do. Continued use after a change constitutes acceptance.
      </p>
    </article>
  );
}
