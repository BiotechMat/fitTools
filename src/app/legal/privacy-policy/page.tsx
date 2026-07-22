import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How FitTools handles your data: calculations run entirely in your browser, nothing you enter is transmitted, and no tracking runs without consent.",
  alternates: { canonical: "/legal/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose">
      <h1 className="font-display text-3xl uppercase sm:text-4xl">Privacy policy</h1>
      <p className="mt-1 text-sm text-muted">Last updated: 21 July 2026</p>
      <p>
        FitTools is operated from the United Kingdom by Mathew Beale
        (&ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy explains what data
        the site handles and the choices you have. The short version: the
        numbers you type into calculators never leave your device, and no
        analytics or advertising runs without your consent.
      </p>
      <h2>Calculator inputs</h2>
      <p>
        All calculations run entirely in your browser. Your inputs — weight,
        height, measurements and the rest — are not transmitted to us or to
        anyone else, and we could not read them if we wanted to.
      </p>
      <h2>Preferences stored on your device</h2>
      <p>
        The site stores small functional preferences in your browser&rsquo;s
        local storage: your unit system (metric or imperial) and, on the
        plate calculator, your plate inventory. These stay on your device,
        are not cookies, are sent to no one, and clearing your browser data
        removes them.
      </p>
      <h2>Analytics and advertising</h2>
      <p>
        The site currently sets no analytics or advertising cookies. If and
        when analytics (Google Analytics 4) and advertising are activated,
        they will run only after you give consent through a consent banner
        that defaults to &ldquo;denied&rdquo; for UK and EEA visitors, in
        line with UK GDPR and PECR. You will be able to change your choice
        at any time from a link in the footer.
      </p>
      <h2>Email</h2>
      <p>
        If we introduce an email newsletter, sign-up will be double opt-in
        and addresses will be used solely to send what you subscribed to,
        with a working unsubscribe link in every message.
      </p>
      <h2>Your rights</h2>
      <p>
        Under UK GDPR you have rights of access, rectification, erasure,
        restriction, portability and objection. Because we hold no personal
        data about visitors today, most requests will have a short answer —
        but you can exercise these rights, or raise any privacy question,
        via the site&rsquo;s contact details. You also have the right to
        complain to the Information Commissioner&rsquo;s Office
        (ico.org.uk).
      </p>
      <p>
        See also the{" "}
        <Link href="/legal/cookie-policy">cookie policy</Link> and{" "}
        <Link href="/legal/terms">terms of use</Link>.
      </p>
    </article>
  );
}
