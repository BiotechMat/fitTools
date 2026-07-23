import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTool, toolPath } from "@/registry/tools";
import { parseShareCardParams, shareImagePath } from "@/lib/share-card";
import { HoloTilt } from "@/components/effects/HoloTilt";

/**
 * Share landing page (ROADMAP.md E1). A shared result URL lands here: the page
 * previews the achievement card and routes the visitor into the tool that made
 * it (the viral on-ramp + internal-linking payoff). Its OG image is the dynamic
 * `/api/share-card`, so the link unfurls as the branded card on social.
 */

interface ShareParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toolHref(slug: string): string {
  const tool = getTool(slug);
  if (!tool) return "/";
  return toolPath(tool);
}

export async function generateMetadata({ searchParams }: ShareParams): Promise<Metadata> {
  const params = parseShareCardParams(await searchParams);
  const tool = params ? getTool(params.tool) : undefined;
  if (!params || !tool) {
    return { title: "Share a result", robots: { index: false } };
  }
  const name = tool.title.split("—")[0].trim();
  const title = `${name}: ${params.value}${params.unit ? ` ${params.unit}` : ""}`;
  const description = `${name} result from FitTools — evidence-based, every formula cited. Calculate yours.`;
  const image = shareImagePath(params);
  return {
    title,
    description,
    // Share URLs are ephemeral result permalinks, not content to index.
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharePage({ searchParams }: ShareParams) {
  const params = parseShareCardParams(await searchParams);
  const tool = params ? getTool(params.tool) : undefined;
  if (!params || !tool) notFound();

  const name = tool.title.split("—")[0].trim();
  const href = toolHref(params.tool);

  return (
    <div className="mx-auto max-w-xl space-y-8 py-6">
      <HoloTilt>
      <div
        data-testid="share-card"
        className="flex flex-col justify-between rounded-2xl border-2 border-foreground bg-foreground p-8 text-background shadow-[4px_4px_0_0_var(--color-foreground)]"
        style={{ minHeight: "18rem" }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-80">FitTools</p>
        <div>
          <p className="mt-4 text-lg opacity-90">{name}</p>
          <p className="mt-1 flex items-end gap-2">
            <span className="font-display text-7xl leading-none text-primary sm:text-8xl">
              {params.value}
            </span>
            {params.unit ? <span className="mb-2 text-2xl opacity-60">{params.unit}</span> : null}
          </p>
          {params.label ? (
            <span className="mt-3 inline-block rounded-full bg-[color:var(--forest,#1F5C3D)] px-4 py-1 text-sm font-semibold">
              {params.label}
            </span>
          ) : null}
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-widest opacity-70">
          Evidence-based · every formula cited
        </p>
      </div>
      </HoloTilt>

      <div className="text-center">
        <h1 className="font-display text-2xl uppercase">Calculate yours</h1>
        <p className="mt-1 text-muted">
          This is a {name} result from FitTools. Run it yourself — free, in your
          browser, with the full method shown.
        </p>
        <Link
          href={href}
          className="mt-4 inline-block rounded-full border-2 border-foreground bg-primary px-6 py-2 font-semibold text-background shadow-[3px_3px_0_0_var(--color-foreground)]"
        >
          Open the {name} calculator →
        </Link>
      </div>
    </div>
  );
}
