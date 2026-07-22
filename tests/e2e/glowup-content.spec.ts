import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  glowUpClusters,
  glowUpMyths,
} from "../../src/registry/glowup-content";

/**
 * Glow-up section (CONTENT-looksmaxxing.md). Encodes the blueprint's binding
 * rules: every cluster/article carries its safety box, medical disclaimer and
 * evidence tiers; the section always signposts body-image support (§1.3/§6.3);
 * the debunk hub rates each myth and routes to an honest alternative (§3.5);
 * every page cross-links into the tools (§4); and there is no appearance-rating
 * anywhere (§1.1).
 */

test("glow-up hub lists the cluster, the myths hub and body-image support", async ({
  page,
}) => {
  await page.goto("/glow-up");
  for (const c of glowUpClusters) {
    await expect(
      page.getByRole("link", { name: c.title, exact: false }).first(),
    ).toHaveAttribute("href", `/glow-up/${c.slug}`);
  }
  await expect(
    page.getByRole("link", { name: /looksmaxxing myths/i }).first(),
  ).toHaveAttribute("href", "/glow-up/looksmaxxing-myths");
  await expect(page.getByTestId("body-image-resources")).toBeVisible();
});

for (const cluster of glowUpClusters) {
  test.describe(`glow-up pillar: ${cluster.slug}`, () => {
    test("has safety box, disclaimer, tiers, schema, support signpost and lists satellites", async ({
      page,
    }) => {
      await page.goto(`/glow-up/${cluster.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        cluster.title,
      );
      await expect(page.getByTestId("safety-callout")).toBeVisible();
      await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
      await expect(page.getByTestId("body-image-resources")).toBeVisible();
      expect(await page.getByTestId("evidence-tier").count()).toBeGreaterThan(0);
      // §4: the pillar must route into at least one live tool / cross-link.
      await expect(page.getByTestId("glowup-crosslinks")).toBeVisible();

      const jsonLdTypes = (
        await page.locator('script[type="application/ld+json"]').allInnerTexts()
      ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
      expect(jsonLdTypes).toEqual(
        expect.arrayContaining(["Article", "FAQPage", "BreadcrumbList"]),
      );

      for (const satellite of cluster.satellites) {
        await expect(
          page.getByRole("link", { name: satellite.title, exact: false }).first(),
        ).toHaveAttribute("href", `/glow-up/${cluster.slug}/${satellite.slug}`);
      }
    });
  });

  for (const satellite of cluster.satellites) {
    test.describe(`glow-up satellite: ${cluster.slug}/${satellite.slug}`, () => {
      test("has safety box, disclaimer and evidence tiers", async ({ page }) => {
        await page.goto(`/glow-up/${cluster.slug}/${satellite.slug}`);
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
          satellite.title,
        );
        await expect(page.getByTestId("safety-callout")).toBeVisible();
        await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
        expect(await page.getByTestId("evidence-tier").count()).toBeGreaterThan(0);
      });

      test(`debunk pages carry the support signpost (${satellite.kind})`, async ({
        page,
      }) => {
        await page.goto(`/glow-up/${cluster.slug}/${satellite.slug}`);
        await expect(page.getByTestId("body-image-resources")).toHaveCount(
          satellite.kind === "debunk" ? 1 : 0,
        );
      });
    });
  }
}

test("debunk hub rates every myth and routes to an honest alternative", async ({
  page,
}) => {
  await page.goto("/glow-up/looksmaxxing-myths");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Looksmaxxing Myths",
  );
  // One card per myth, each with a spelled-out verdict tier stamp.
  await expect(page.getByTestId("myth-card")).toHaveCount(glowUpMyths.length);
  expect(await page.getByTestId("evidence-tier").count()).toBe(glowUpMyths.length);
  for (const myth of glowUpMyths) {
    await expect(
      page.getByRole("link", { name: myth.honestAlternative.title, exact: false }).first(),
    ).toHaveAttribute("href", myth.honestAlternative.href);
  }
  await expect(page.getByTestId("body-image-resources")).toBeVisible();
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
});

test("tools reciprocate the cross-link back into the glow-up section (§4)", async ({
  page,
}) => {
  // The skin cluster routes into the sleep calculator, so the sleep tool page
  // must surface a glow-up guide back (reciprocal index in reference-links.ts).
  await page.goto("/sleep-calculator");
  const ref = page.getByTestId("related-reference");
  await expect(ref).toBeVisible();
  await expect(ref.getByRole("link", { name: /glow-up|glow up|skin/i }).first()).toBeVisible();
});

test("glow-up pages have no critical accessibility violations", async ({
  page,
}) => {
  await page.goto("/glow-up/skin");
  const pillar = await new AxeBuilder({ page }).analyze();
  expect(pillar.violations.filter((v) => v.impact === "critical")).toEqual([]);

  await page.goto("/glow-up/looksmaxxing-myths");
  const myths = await new AxeBuilder({ page }).analyze();
  expect(myths.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
