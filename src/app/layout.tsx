import type { Metadata } from "next";
import { Anton, Figtree, Space_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE_CONFIGURED, SITE_NAME, SITE_URL } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { tier4Tools, toolPath, toolsForHub } from "@/registry/tools";
import { ConsentBanner } from "@/components/ConsentBanner";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { ThirdPartyScripts } from "@/components/ThirdPartyScripts";
import { SiteNav, type NavItem, type NavLink } from "@/components/SiteNav";
import { AccountNavLink } from "@/components/account/AccountNavLink";
import AccountSync from "@/components/account/AccountSync";

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
    default: `${SITE_NAME}: Evidence-based fitness calculators`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free fitness and health calculators built on published, peer-reviewed formulas. Every tool cites its sources.",
  robots: SITE_CONFIGURED ? undefined : { index: false, follow: false },
  // Home-screen saves open app-like (manifest.ts pairs with this; the
  // micro-tools carry the visible "add to home screen" affordance).
  appleWebApp: { capable: true, title: "FitTools", statusBarStyle: "default" },
};

// Only hubs with live tools appear in navigation — no dead links.
const liveHubs = Object.values(hubMeta).filter(
  (meta) => toolsForHub(meta.hub).length > 0,
);

// Menu labels use the short tool name — the part before the SEO suffix —
// matching the share-page convention.
const shortTitle = (title: string) => title.split(":")[0].trim();

// Main nav, rendered responsively by <SiteNav /> (horizontal on desktop,
// hamburger dropdown below lg). Emphasised links are the primary
// destinations. "Calculators" is an expanding menu listing every calculator
// by category (registry-driven, so a new tool appears automatically), while
// the topic sections — Nutrition, Workout, Recovery — keep their own
// top-level items carrying calculators plus the wider content of each domain.
const navItems: NavItem[] = [
  { href: "/pulse", label: "Pulse", emphasis: true },
  { href: "/arcade", label: "Arcade", emphasis: true },
  { href: "/tools", label: "Tools", emphasis: true },
  { href: "/dashboard", label: "Dashboard", emphasis: true },
  {
    label: "Calculators",
    lead: { href: "/calculators", label: "All calculators" },
    sections: [
      ...liveHubs.map((meta) => ({
        label: meta.title,
        items: toolsForHub(meta.hub).map((tool) => ({
          href: toolPath(tool),
          label: shortTitle(tool.title),
        })),
      })),
      {
        label: "Peptides",
        items: tier4Tools().map((tool) => ({
          href: toolPath(tool),
          label: shortTitle(tool.title),
        })),
      },
    ],
  },
  ...liveHubs.map((meta) => ({ href: meta.path, label: meta.title })),
  { href: "/supplements", label: "Supplements" },
  { href: "/glow-up", label: "Glow-up" },
  { href: "/learn/peptides", label: "Peptides" },
  { href: "/glossary", label: "Glossary" },
];
const bloodTestCta: NavLink = { href: "/blood-test", label: "Order blood test" };

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
        <header className="relative border-b-2 border-foreground bg-background">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3"
          >
            <Link
              href="/"
              className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center font-display text-3xl uppercase tracking-wide lg:static lg:translate-x-0 lg:text-xl"
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
            <SiteNav items={navItems} cta={bloodTestCta} />
            <AccountNavLink />
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
                <li><Link href="/calculators" className="hover:text-foreground">All calculators</Link></li>
                <li><Link href="/exercises" className="hover:text-foreground">Exercise library</Link></li>
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
        <AccountSync />
      </body>
    </html>
  );
}
