import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/schema-org";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { BloodTestCta } from "@/components/blood-test/BloodTestCta";
import {
  BIOMARKER_GROUPS,
  biomarkers,
  biomarkersInGroup,
} from "@/registry/biomarkers";
import { getTool } from "@/registry/tools";

export const metadata: Metadata = {
  title: "At-Home Blood Test — Know Your Numbers, Powered by Evidence",
  description:
    "An at-home blood test that measures the biomarkers behind your metabolic, heart and longevity health — with results that flow straight into your FitTools dashboard and calculators.",
  alternates: { canonical: "/blood-test" },
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Order your test",
    body: "Choose your panel and we send a simple, at-home finger-prick kit — or book a clinic draw if you prefer.",
  },
  {
    step: "02",
    title: "Give your sample",
    body: "Collect at home in a few minutes and post it back in the prepaid envelope. An accredited lab does the analysis.",
  },
  {
    step: "03",
    title: "Your tools light up",
    body: "Results land in your private dashboard and auto-fill the calculators that use them — your heart age, metabolic and biological-age scores, populated from your real numbers.",
  },
];

const FAQ = [
  {
    q: "Is this a medical diagnosis?",
    a: "No. A blood test with us is for information and self-tracking, not a diagnosis. Results are analysed by an accredited laboratory, but interpreting them in the context of your health is a job for a qualified clinician — and anything outside the normal range should be discussed with your GP.",
  },
  {
    q: "How do the results connect to the calculators?",
    a: "Several of our tools — heart age, phenotypic (biological) age, the metabolic fitness index — normally ask you to type in blood values. When you test through us, those fields fill in automatically from your results, so the scores reflect your real numbers rather than estimates.",
  },
  {
    q: "Which biomarkers are included?",
    a: "The panel below lists every marker, grouped by what it tells you — metabolic, heart and lipids, inflammation, liver and kidney, full blood count, hormones, and vitamins and minerals. The exact final panel is being confirmed with our testing partner.",
  },
  {
    q: "What happens to my data?",
    a: "Your results are sensitive personal health data. They will be stored securely in your private account, used only to populate your own dashboard and tools, and never sold. Full detail will be in the privacy policy before the test goes on sale.",
  },
  {
    q: "When can I buy one?",
    a: "We're finalising our accredited testing partner now. Join the early-access list and we'll email you the moment it launches.",
  },
];

export default function BloodTestPage() {
  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blood test", path: "/blood-test" },
    ]),
    faqPageJsonLd({ faq: FAQ }),
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Blood test</span>
      </nav>

      {/* Hero */}
      <section className="mt-4">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Coming soon · powered by your own blood
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase sm:text-5xl">
          Stop guessing.{" "}
          <span className="inline-block -rotate-1 rounded-lg bg-primary-strong px-2 text-background">
            Know your numbers
          </span>
        </h1>
        <p className="mt-4 max-w-prose text-lg text-muted">
          Order a simple at-home blood test through FitTools and your results flow
          straight into your dashboard — automatically filling the calculators that
          turn raw numbers into your heart age, metabolic health and biological
          age. The same evidence-first approach as every tool on the site, now
          running on <em>your</em> data.
        </p>

        <div className="mt-6">
          <BloodTestCta />
        </div>
      </section>

      {/* How it works */}
      <section className="mt-12" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="font-display text-2xl uppercase">
          How it works
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((s) => (
            <li
              key={s.step}
              className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
            >
              <span className="font-mono text-xs font-bold text-primary">{s.step}</span>
              <h3 className="mt-1 font-display text-lg uppercase">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Panel */}
      <section className="mt-12 scroll-mt-24" id="panel" aria-labelledby="panel-heading">
        <h2 id="panel-heading" className="font-display text-2xl uppercase">
          What we measure
        </h2>
        <p className="mt-2 max-w-prose text-muted">
          {biomarkers.length} biomarkers across seven areas of health. Each one is a
          number worth knowing on its own — and several feed directly into the tools
          you already use.
        </p>
        <p className="mt-1 text-xs text-muted">
          Final panel and units are being confirmed with our testing partner.
        </p>

        <div className="mt-6 flex flex-col gap-8">
          {BIOMARKER_GROUPS.map((group) => (
            <div key={group.category}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-display text-xl uppercase">{group.label}</h3>
                <span
                  className={`inline-block rounded-full border border-foreground px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] ${group.chip}`}
                >
                  {biomarkersInGroup(group.category).length} markers
                </span>
              </div>
              <p className="mt-1 max-w-prose text-sm text-muted">{group.blurb}</p>

              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {biomarkersInGroup(group.category).map((b) => {
                  const tool = b.feedsTool ? getTool(b.feedsTool) : undefined;
                  return (
                    <li
                      key={b.id}
                      id={b.id}
                      className="scroll-mt-24 rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-bold">{b.name}</h4>
                        <span className="shrink-0 font-mono text-xs text-muted">{b.unit}</span>
                      </div>
                      {b.aka?.length ? (
                        <p className="font-mono text-xs text-muted">{b.aka.join(" · ")}</p>
                      ) : null}
                      <p className="mt-2 text-sm text-muted">{b.description}</p>

                      {tool || b.relatedContent ? (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {tool ? (
                            <Link
                              href={`/${tool.slug}`}
                              className="font-semibold text-primary underline underline-offset-2"
                            >
                              {`Feeds your ${tool.title.replace(/ (Calculator|Index).*/i, "").trim()} score`} &rarr;
                            </Link>
                          ) : null}
                          {b.relatedContent ? (
                            <Link
                              href={b.relatedContent}
                              className="text-primary underline underline-offset-2"
                            >
                              What this means &rarr;
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why it's different */}
      <section className="mt-12 rounded-2xl border-2 border-foreground bg-surface-deep p-5">
        <h2 className="font-display text-xl uppercase">The evidence-first difference</h2>
        <p className="mt-2 max-w-prose text-sm text-muted">
          Plenty of services will sell you a blood test and a scary-looking chart.
          We do the opposite: every marker above is explained in plain English, with
          no fear-mongering and no invented &ldquo;optimal&rdquo; scores. Your numbers feed
          tools built on published, cited research — so what you get back is context
          you can actually act on, not anxiety.
        </p>
      </section>

      {/* Compliance */}
      <section className="mt-8 flex flex-col gap-4" aria-label="Important information">
        <DisclaimerBanner />
        <aside
          role="note"
          aria-label="About your results and your data"
          className="rounded-xl border-2 border-warning-border bg-warning-bg p-4 text-sm"
        >
          <h2 className="font-semibold">About your results &amp; your data</h2>
          <p className="mt-1">
            A blood test bought through us is a screening and self-tracking tool, not
            a diagnostic service. Results are produced by an accredited laboratory,
            but they are <strong>not a diagnosis</strong> and are no substitute for
            assessment by a qualified clinician — please discuss anything abnormal, or
            any symptoms, with your GP. Because real blood results are sensitive
            personal health data, they will be stored securely in your private account
            and used only to populate your own dashboard and tools; the full
            data-protection detail will be published before the test goes on sale.
          </p>
        </aside>
      </section>

      {/* FAQ */}
      <section className="mt-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-2xl uppercase">
          Common questions
        </h2>
        <dl className="mt-4 space-y-4">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border-2 border-foreground bg-surface p-4 shadow-[3px_3px_0_0_var(--color-foreground)]"
            >
              <dt className="font-bold">{item.q}</dt>
              <dd className="mt-1 text-sm text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="mt-12 mb-4" aria-label="Get early access">
        <div className="rounded-2xl border-2 border-foreground bg-primary-strong p-6 text-background shadow-[3px_3px_0_0_var(--color-foreground)]">
          <h2 className="font-display text-2xl uppercase">Be first to know your numbers</h2>
          <p className="mt-2 max-w-prose text-sm">
            The test is launching soon. Join the early-access list and we&rsquo;ll email
            you the moment it&rsquo;s live.
          </p>
          <div className="mt-4">
            <BloodTestCta />
          </div>
        </div>
      </section>
    </div>
  );
}
