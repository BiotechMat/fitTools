import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allPeptides } from "../../src/registry/peptides";

/**
 * Peptides educational cluster (CONTENT-peptides.md §6 Definition of Done):
 * every page carries the safety/legality box and medical disclaimer, shows
 * evidence tiers, carries no ads or product sales, and — critically —
 * contains no dosing/protocol/sourcing information.
 */

// Terms that would indicate dosing / protocol / administration content,
// which is forbidden on every page in this cluster.
const FORBIDDEN_DOSING = [
  /\bmcg per\b/i,
  /\bmg per (day|week)\b/i,
  /\bdosage\s*:/i,
  /how to (dose|inject|reconstitute)/i,
  /\btwice daily\b/i,
  /\bmg\/kg\b/i,
  /\binjection protocol\b/i,
];

test("pillar page: safety box, no-dosing framing, lists compounds", async ({ page }) => {
  await page.goto("/learn/peptides");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Peptides in fitness");
  await expect(page.getByTestId("safety-callout")).toBeVisible();
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
  // Explicit no-dosing stance stated.
  await expect(page.locator("body")).toContainText(/We do not give doses, protocols/i);
  // Lists every compound.
  for (const p of allPeptides) {
    await expect(page.getByRole("link", { name: p.name, exact: false }).first()).toBeVisible();
  }
});

test("header navigation includes a Peptides tab", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Peptides" })).toHaveAttribute(
    "href",
    "/learn/peptides",
  );
});

for (const peptide of allPeptides) {
  test.describe(`peptide: ${peptide.slug}`, () => {
    test("has safety box, disclaimer, evidence tier, article schema, no ads/affiliate", async ({
      page,
    }) => {
      await page.goto(`/learn/peptides/${peptide.slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(peptide.name);
      await expect(page.getByTestId("safety-callout")).toBeVisible();
      await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
      // Evidence tier present (header + inline in the evidence section).
      expect(await page.getByTestId("evidence-tier").count()).toBeGreaterThan(0);

      const jsonLdTypes = (
        await page.locator('script[type="application/ld+json"]').allInnerTexts()
      ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
      expect(jsonLdTypes).toEqual(
        expect.arrayContaining(["Article", "FAQPage", "BreadcrumbList"]),
      );

      // Educational layer stays clean: no ad slots, no affiliate blocks.
      await expect(page.locator("[data-ad-slot]")).toHaveCount(0);
      await expect(page.locator('[aria-label="Recommended products"]')).toHaveCount(0);
    });

    test("contains no dosing, protocol or administration content", async ({ page }) => {
      await page.goto(`/learn/peptides/${peptide.slug}`);
      const text = await page.locator("main").innerText();
      for (const pattern of FORBIDDEN_DOSING) {
        expect(text, `forbidden dosing pattern ${pattern} on ${peptide.slug}`).not.toMatch(
          pattern,
        );
      }
    });
  });
}

test("peptide pages have no critical accessibility violations", async ({ page }) => {
  await page.goto("/learn/peptides/tesamorelin");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
