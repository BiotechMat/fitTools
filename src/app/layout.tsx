import type { Metadata } from "next";
import { Anton, Figtree, Space_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE_CONFIGURED, SITE_NAME, SITE_URL } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { toolsForHub } from "@/registry/tools";
import { ConsentBanner } from "@/components/ConsentBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { ThirdPartyScripts } from "@/components/ThirdPartyScripts";

// v2 type roles (DESIGN.md §2): Anton shouts, Figtree explains, Space Mono
// handles the receipts. Self-hosted via next/font — zero CLS (SPEC §13).
const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Evidence-based fitness calculators`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free fitness and health calculators built on published, peer-reviewed formulas. Every tool cites its sources.",
  robots: SITE_CONFIGURED ? undefined : { index: false, follow: false },
};

// Only hubs with live tools appear in navigation — no dead links.
const liveHubs = Object.values(hubMeta).filter(
  (meta) => toolsForHub(meta.hub).length > 0,
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${anton.variable} ${figtree.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b-2 border-foreground bg-background">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3"
          >
            <Link
              href="/"
              className="font-display text-xl uppercase tracking-wide"
            >
              {SITE_NAME.endsWith("Tools") ? (
                <>
                  {SITE_NAME.slice(0, -5)}
                  <span className="ml-0.5 inline-block -rotate-2 rounded-md bg-primary-strong px-1.5 pb-0.5 text-foreground">
                    Tools
                  </span>
                </>
              ) : (
                SITE_NAME
              )}
            </Link>
            <ul className="flex gap-4 text-sm">
              {liveHubs.map((meta) => (
                <li key={meta.hub}>
                  <Link
                    href={meta.path}
                    className="text-muted hover:text-foreground"
                  >
                    {meta.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/labs" className="text-muted hover:text-foreground">
                  Labs
                </Link>
              </li>
              <li>
                <Link href="/exercises" className="text-muted hover:text-foreground">
                  Exercises
                </Link>
              </li>
              <li>
                <Link href="/supplements" className="text-muted hover:text-foreground">
                  Supplements
                </Link>
              </li>
              <li>
                <Link href="/learn/peptides" className="text-muted hover:text-foreground">
                  Peptides
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="text-muted hover:text-foreground">
                  Glossary
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t-2 border-foreground bg-surface-deep">
          <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 text-sm text-muted">
            <nav aria-label="Legal and site information">
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                <li><Link href="/legal/privacy-policy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/legal/cookie-policy" className="hover:text-foreground">Cookies</Link></li>
                <li><Link href="/legal/terms" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="/legal/affiliate-disclosure" className="hover:text-foreground">Affiliate disclosure</Link></li>
                <li><Link href="/legal/medical-disclaimer" className="hover:text-foreground">Medical disclaimer</Link></li>
                <li><Link href="/author/mathew-beale" className="hover:text-foreground">About the author</Link></li>
                <li><Link href="/labs" className="hover:text-foreground">Labs</Link></li>
                <li><Link href="/nutrition/reference" className="hover:text-foreground">Food reference</Link></li>
                <li><Link href="/reference" className="hover:text-foreground">Reference tables</Link></li>
                <li><CookieSettingsButton /></li>
              </ul>
            </nav>
            <p>
              © {new Date().getFullYear()} {SITE_NAME}. Calculators provide
              estimates for general information only and are not medical advice.
            </p>
            <p>
              Formulas are implemented from published, peer-reviewed sources,
              cited on each tool&rsquo;s page.
            </p>
          </div>
        </footer>
        <ConsentBanner />
        <ThirdPartyScripts />
      </body>
    </html>
  );
}
