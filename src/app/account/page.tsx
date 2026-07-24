import type { Metadata } from "next";
import Link from "next/link";
import { AccountView } from "@/components/account/AccountView";

/**
 * The account page (ACCOUNTS.md §8.2) — the §7.3 data controls, first-class
 * from day one: consent state, export everything, delete everything. Its own
 * code-split chunk (the auth client loads here and on /signin only).
 * Personal surface: noindexed, not in the sitemap.
 */
export const metadata: Metadata = {
  title: "Your account",
  description:
    "Manage your FitTools account: what's stored, consent, export and delete — all in one place.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span>Account</span>
      </nav>

      <header className="mt-4">
        <h1 className="font-display text-4xl uppercase sm:text-5xl">
          Your{" "}
          <span className="inline-block -rotate-1 rounded-lg bg-primary-strong px-2 text-background">
            account
          </span>
        </h1>
      </header>

      <AccountView />
    </div>
  );
}
