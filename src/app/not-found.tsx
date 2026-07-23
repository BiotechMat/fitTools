import Link from "next/link";

/**
 * 404 as a failed lift (DESIGN.md §8): the bar strains, tips, and the
 * right-side plates roll off (one-shot CSS animation, static under
 * prefers-reduced-motion). One easter egg site-wide, deliberately.
 */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="relative h-40 w-72" aria-hidden="true">
        <div className="lift-bar absolute left-4 right-4 top-1/2 h-2 rounded-full bg-foreground">
          <span className="absolute -top-8 left-0 h-[72px] w-4 rounded-[4px] border-2 border-foreground bg-primary-strong" />
          <span className="absolute -top-6 left-5 h-[56px] w-3.5 rounded-[4px] border-2 border-foreground bg-primary" />
          <span className="plate-fall absolute -top-8 right-0 h-[72px] w-4 rounded-[4px] border-2 border-foreground bg-primary-strong" />
          <span className="plate-fall plate-fall-late absolute -top-6 right-5 h-[56px] w-3.5 rounded-[4px] border-2 border-foreground bg-primary" />
        </div>
      </div>
      <h1 className="mt-6 font-display text-5xl uppercase">404: failed lift</h1>
      <p className="mt-3 max-w-prose text-muted">
        This page didn&rsquo;t make it off the ground. Rack the bar and try one
        of these instead.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="riso-press rounded-full border-2 border-foreground bg-primary-strong px-5 py-2 font-bold text-background"
        >
          Back to the tools
        </Link>
        <Link
          href="/daily"
          className="riso-press rounded-full border-2 border-foreground bg-surface px-5 py-2 font-bold"
        >
          Play today&rsquo;s Ballpark
        </Link>
      </div>
    </div>
  );
}
