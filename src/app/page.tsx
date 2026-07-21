import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { hubMeta } from "@/registry/hubs";
import { labsTools, toolsForHub } from "@/registry/tools";

export default function HomePage() {
  const hubsWithTools = Object.values(hubMeta)
    .map((meta) => ({ meta, tools: toolsForHub(meta.hub) }))
    .filter(({ tools }) => tools.length > 0);

  return (
    <div>
      <section className="py-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Evidence-based fitness calculators
        </h1>
        <p className="mt-2 max-w-prose text-lg text-muted">
          {SITE_NAME} builds every calculator on published, peer-reviewed
          formulas — with the sources cited on the page, so you can check our
          working.
        </p>
      </section>
      {hubsWithTools.map(({ meta, tools }) => (
        <section key={meta.hub} className="py-4" aria-labelledby={`hub-${meta.hub}`}>
          <h2 id={`hub-${meta.hub}`} className="text-xl font-bold">
            <Link href={meta.path} className="hover:text-primary-strong">
              {meta.title}
            </Link>
          </h2>
          <p className="mt-1 max-w-prose text-sm text-muted">{meta.description}</p>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {tools.map((tool) => (
              <li key={tool.slug} className="rounded-lg border border-border p-4">
                <Link
                  href={`/${tool.slug}`}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  {tool.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{tool.metaDescription}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <section className="py-4" aria-labelledby="hub-labs">
        <h2 id="hub-labs" className="text-xl font-bold">
          <Link href="/labs" className="hover:text-primary-strong">
            Labs
          </Link>
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Advanced tools with enhanced disclaimers — arithmetic only on
          values you supply, no advertising, and a one-time acknowledgement
          before use.
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {labsTools().map((tool) => (
            <li key={tool.slug} className="rounded-lg border border-border p-4">
              <Link
                href={`/labs/${tool.slug}`}
                className="font-semibold text-primary underline underline-offset-2"
              >
                {tool.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{tool.metaDescription}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
