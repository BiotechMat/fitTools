import type { Metadata } from "next";
import { hubMeta } from "@/registry/hubs";
import { HubPage } from "@/components/HubPage";

const meta = hubMeta.nutrition;

export const metadata: Metadata = {
  title: `${meta.title} calculators`,
  description: meta.description,
  alternates: { canonical: meta.path },
};

export default function NutritionHubPage() {
  return <HubPage hub="nutrition" />;
}
