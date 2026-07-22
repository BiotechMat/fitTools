import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { glossaryEntries } from "../../src/registry/glossary";

/**
 * Glossary section (CONTENT-reference.md §6, §9 Definition of Done): the hub
 * lists every term, each term page carries the medical disclaimer, author box,
 * Article/Breadcrumb schema, and cross-links out to its related tools/terms.
 */

test("glossary is in the header nav and the hub lists every term", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Glossary" }),
  ).toHaveAttribute("href", "/glossary");

  await page.goto("/glossary");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("glossary");
  for (const e of glossaryEntries) {
    await expect(
      page.getByRole("link", { name: e.term, exact: false }).first(),
    ).toHaveAttribute("href", `/glossary/${e.slug}`);
  }
});

test("a representative term page renders with disclaimer, schema and cross-links", async ({
  page,
}) => {
  // ApoB links out to the heart-age calculator and to the Lp(a) term.
  await page.goto("/glossary/apob");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ApoB");
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();

  await expect(
    page.getByRole("link", { name: /Heart Age/i }).first(),
  ).toHaveAttribute("href", "/heart-age-calculator");
  await expect(
    page.getByRole("link", { name: "Lp(a)", exact: false }).first(),
  ).toHaveAttribute("href", "/glossary/lp-a");

  const jsonLdTypes = (
    await page.locator('script[type="application/ld+json"]').allInnerTexts()
  ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
  expect(jsonLdTypes).toEqual(expect.arrayContaining(["Article", "BreadcrumbList"]));
});

test("every glossary term page serves and carries the disclaimer", async ({ page }) => {
  for (const e of glossaryEntries) {
    await page.goto(`/glossary/${e.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(e.term);
    await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
  }
});

test("glossary pages have no critical accessibility violations", async ({ page }) => {
  await page.goto("/glossary");
  const hub = await new AxeBuilder({ page }).analyze();
  expect(hub.violations.filter((v) => v.impact === "critical")).toEqual([]);

  await page.goto("/glossary/hypertrophy");
  const term = await new AxeBuilder({ page }).analyze();
  expect(term.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
