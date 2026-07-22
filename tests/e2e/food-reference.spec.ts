import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { foodReferencePages } from "../../src/registry/food-reference";

/**
 * Nutrition / food reference (CONTENT-reference.md §5, §9): a hub of
 * bookmarkable tables, each carrying the medical disclaimer, an author box,
 * Article/Breadcrumb schema and a cross-link to the relevant calculator.
 */

test("the hub lists every food-reference page", async ({ page }) => {
  await page.goto("/nutrition/reference");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/food reference/i);
  for (const p of foodReferencePages) {
    await expect(
      page.getByRole("link", { name: p.title, exact: false }).first(),
    ).toHaveAttribute("href", `/nutrition/reference/${p.slug}`);
  }
});

test("the protein table renders rows and cross-links to the macro calculator", async ({
  page,
}) => {
  await page.goto("/nutrition/reference/protein-content-of-foods");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Protein Content");
  await expect(page.getByRole("table").first()).toBeVisible();
  await expect(page.getByRole("cell", { name: "Chicken breast (cooked)" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /macro calculator/i }).first(),
  ).toHaveAttribute("href", "/macro-calculator");
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();

  const jsonLdTypes = (
    await page.locator('script[type="application/ld+json"]').allInnerTexts()
  ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
  expect(jsonLdTypes).toEqual(expect.arrayContaining(["Article", "FAQPage", "BreadcrumbList"]));
});

test("every food-reference page serves with a table and disclaimer", async ({ page }) => {
  for (const p of foodReferencePages) {
    await page.goto(`/nutrition/reference/${p.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(p.title.split(" ")[0]);
    await expect(page.getByRole("table").first()).toBeVisible();
    await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
  }
});

test("food-reference pages have no critical accessibility violations", async ({ page }) => {
  await page.goto("/nutrition/reference/high-protein-foods");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
