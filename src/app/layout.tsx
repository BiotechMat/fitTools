import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { toolsForHub } from "@/registry/tools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3"
          >
            <Link href="/" className="text-lg font-bold text-primary-strong">
              {SITE_NAME}
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
            </ul>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-border">
          <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-sm text-muted">
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
      </body>
    </html>
  );
}
