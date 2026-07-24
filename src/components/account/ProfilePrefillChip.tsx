"use client";

/**
 * The transparency chip for profile-prefilled calculators (PROFILE.md §5:
 * "a prefilled value shows its provenance inline"). Space Mono receipts
 * voice; links to the dashboard where the profile is edited.
 */

import Link from "next/link";

export function ProfilePrefillChip(): React.ReactElement {
  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1 rounded-full border border-foreground bg-good-soft px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] hover:translate-x-0.5 hover:translate-y-0.5"
    >
      Prefilled from your profile · edit
    </Link>
  );
}
