import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { recoveryClusters } from "../../src/registry/recovery-content";

/**
 * Recovery & wellness content clusters (CONTENT.md Definition of Done):
 * every physiological-intervention page carries its safety box and the
 * medical disclaimer, shows evidence tiers, commercial (buying-intent) pages
 * carry a clear affiliate disclosure while authority pages do not, and the
 * cluster is discoverable from the recovery hub.
 */

test("recovery hub lists every guide cluster", async ({ page }) => {
  await page.goto("/recovery");
  for (const c of recoveryClusters) {
    await expect(
      page.getByRole("link", { name: c.title, exact: false }).first(),
    ).toHaveAttribute("href", `/recovery/${c.slug}`);
  }
});

for (const cluster of recoveryClusters) {
  test.describe(`recovery pillar: ${cluster.slug}`, () => {
    test("has safety box, disclaimer, evidence tiers, schema and lists satellites", async ({
      page,
    }) => {
      await page.goto(`/recovery/${cluster.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        cluster.title,
      );
      await expect(page.getByTestId("safety-callout")).toBeVisible();
      await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
      expect(await page.getByTestId("evidence-tier").count()).toBeGreaterThan(0);

      const jsonLdTypes = (
        await page.locator('script[type="application/ld+json"]').allInnerTexts()
      ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
      expect(jsonLdTypes).toEqual(
        expect.arrayContaining(["Article", "FAQPage", "BreadcrumbList"]),
      );

      for (const satellite of cluster.satellites) {
        await expect(
          page.getByRole("link", { name: satellite.title, exact: false }).first(),
        ).toHaveAttribute("href", `/recovery/${cluster.slug}/${satellite.slug}`);
      }
    });
  });

  for (const satellite of cluster.satellites) {
    test.describe(`recovery satellite: ${cluster.slug}/${satellite.slug}`, () => {
      test("has safety box and disclaimer", async ({ page }) => {
        await page.goto(`/recovery/${cluster.slug}/${satellite.slug}`);
        await expect(page.getByRole("heading", { level: 1 })).toContainText(
          satellite.title,
        );
        await expect(page.getByTestId("safety-callout")).toBeVisible();
        await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
        // Authority pages make evidence-tiered health claims; commercial
        // buying guides deliberately do not, deferring to the main guide.
        if (satellite.kind !== "commercial") {
          expect(await page.getByTestId("evidence-tier").count()).toBeGreaterThan(0);
        }
      });

      test(`affiliate disclosure present iff commercial (${satellite.kind})`, async ({
        page,
      }) => {
        await page.goto(`/recovery/${cluster.slug}/${satellite.slug}`);
        await expect(page.getByTestId("affiliate-disclosure")).toHaveCount(
          satellite.kind === "commercial" ? 1 : 0,
        );
      });
    });
  }
}

test("recovery content pages have no critical accessibility violations", async ({
  page,
}) => {
  await page.goto("/recovery/cold-water-immersion");
  const pillarResults = await new AxeBuilder({ page }).analyze();
  expect(pillarResults.violations.filter((v) => v.impact === "critical")).toEqual([]);

  await page.goto("/recovery/cold-water-immersion/best-cold-plunge-tubs");
  const satelliteResults = await new AxeBuilder({ page }).analyze();
  expect(satelliteResults.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
