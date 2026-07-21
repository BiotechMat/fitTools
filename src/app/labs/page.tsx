import type { Metadata } from "next";
import Link from "next/link";
import { labsTools } from "@/registry/tools";

export const metadata: Metadata = {
  title: "Labs — advanced tools",
  description:
    "Advanced calculators that perform arithmetic on values you supply, with enhanced disclaimers and no advertising.",
  alternates: { canonical: "/labs" },
};

export default function LabsIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Labs</h1>
      <p className="mt-1 max-w-prose text-muted">
        Advanced tools with enhanced disclaimers. Labs tools carry no
        advertising and perform arithmetic only on values you supply.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
