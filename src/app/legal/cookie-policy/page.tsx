import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "FitTools currently sets no cookies at all. This policy explains the functional local storage the site uses and what will change if advertising is activated.",
  alternates: { canonical: "/legal/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <article className="prose">
      <h1 className="font-display text-3xl uppercase sm:text-4xl">Cookie policy</h1>
      <p className="mt-1 text-sm text-muted">Last updated: 21 July 2026</p>
      <h2>Cookies we set today</h2>
      <p>
        None. The site currently sets no cookies of any kind, first-party
        or third-party, and makes no requests to advertising or analytics
        services.
      </p>
      <h2>Local storage</h2>
      <p>
        The site uses your browser&rsquo;s local storage for two functional
        preferences, which UK PECR treats similarly to cookies but which
        qualify as strictly necessary for a feature you invoke:
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>fittools:units</code></td>
            <td>Remembers your metric/imperial choice</td>
          </tr>
          <tr>
            <td><code>fittools:plate-inventory</code></td>
            <td>Remembers your edited plate rack on the plate calculator</td>
          </tr>
        </tbody>
      </table>
      <p>
        These values never leave your device. Clearing site data in your
        browser removes them.
      </p>
      <h2>What changes if advertising launches</h2>
      <p>
        If analytics or advertising is activated in future, a consent banner
        will appear first. It will default to &ldquo;denied&rdquo; for UK
        and EEA visitors, no advertising or analytics cookies will be set
        unless you actively agree, and a footer link will let you change
        your choice at any time. This page will be updated with a full list
        of cookies before any are set.
      </p>
      <p>
        Related: <Link href="/legal/privacy-policy">privacy policy</Link>.
      </p>
    </article>
  );
}
