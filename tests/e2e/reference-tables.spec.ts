import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { referenceTablePages } from "../../src/registry/reference-tables";

/**
 * Reference tables & charts (CONTENT-reference.md §7, §9): a hub of static
 * charts, each rendering a table, carrying the medical disclaimer + author box,
 * Article/Breadcrumb schema, and linking to its interactive calculator.
 */

test("the hub lists every reference table", async ({ page }) => {
  await page.goto("/reference");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/reference tables/i);
  for (const p of referenceTablePages) {
    await expect(
      page.getByRole("link", { name: p.title, exact: false }).first(),
    ).toHaveAttribute("href", `/reference/${p.slug}`);
  }
});

test("the HR-zone chart renders a table and links to the calculator", async ({ page }) => {
  await page.goto("/reference/heart-rate-zones-by-age");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Heart Rate Zones");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Zone 2" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /heart.?rate zone/i }).first(),
  ).toHaveAttribute("href", "/heart-rate-zone-calculator");
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
});

test("every reference table serves with a table and disclaimer", async ({ page }) => {
  for (const p of referenceTablePages) {
    await page.goto(`/reference/${p.slug}`);
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
    const jsonLdTypes = (
      await page.locator('script[type="application/ld+json"]').allInnerTexts()
    ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
    expect(jsonLdTypes).toEqual(expect.arrayContaining(["Article", "BreadcrumbList"]));
  }
});

test("reference-table pages have no critical accessibility violations", async ({ page }) => {
  await page.goto("/reference/plate-loading-chart");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
