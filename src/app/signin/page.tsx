import type { Metadata } from "next";
import Link from "next/link";
import { SignInCard } from "@/components/account/SignInCard";

/**
 * Sign-in (ACCOUNTS.md §8.1). Its own code-split chunk — this page and
 * /account are the only places the auth client loads (§4.5). Personal
 * surface: noindexed, not in the sitemap.
 */
export const metadata: Metadata = {
  title: "Sign in: keep your numbers across devices",
  description:
    "A free FitTools account keeps your saved results, streaks and arcade bests across devices. Every calculator stays free, signed in or not.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Sign in</span>
      </nav>

      <header className="mt-4">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">
          Keep your{" "}
          <span className="inline-block -rotate-1 rounded-lg bg-primary-strong px-2 text-background">
            numbers
          </span>
        </h1>
        <p className="mt-3 text-muted">
          A free account keeps your saved results, streaks and arcade bests
          across devices. Everything on FitTools stays free, signed in or not —
          and everything you store can be exported or deleted in one click.
        </p>
      </header>

      <SignInCard />

      <p className="mt-6 text-sm text-muted">
        Use the same method each time you sign in — email and Apple can give
        the same person two different addresses, which would create two
        accounts. Read how your data is handled in the{" "}
        <Link href="/legal/privacy-policy" className="underline hover:text-foreground">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
