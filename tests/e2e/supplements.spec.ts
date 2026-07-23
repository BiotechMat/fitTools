import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openMainNav } from "./helpers";
import { supplements } from "../../src/registry/supplements";

/**
 * Supplement database (CONTENT-reference.md §4, §9): the hub groups entries by
 * evidence tier, every page shows its evidence tier and the medical
 * disclaimer, safety-flagged entries carry a SafetyCallout, and pages carry no
 * ads/affiliate (neutral evidence layer).
 */

test("supplements is in the nav and the hub lists every entry", async ({ page }) => {
  await page.goto("/");
  await openMainNav(page);
  await expect(
    page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Supplements" }),
  ).toHaveAttribute("href", "/supplements");

  await page.goto("/supplements");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Supplement");
  for (const s of supplements) {
    await expect(
      page.getByRole("link", { name: s.name, exact: false }).first(),
    ).toHaveAttribute("href", `/supplements/${s.slug}`);
  }
});

test("a well-supported page shows its tier, disclaimer, schema and cross-links", async ({
  page,
}) => {
  await page.goto("/supplements/creatine-monohydrate");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Creatine");
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
  expect(await page.getByTestId("evidence-tier").count()).toBeGreaterThan(0);
  await expect(
    page.getByRole("link", { name: /creatine calculator/i }).first(),
  ).toHaveAttribute("href", "/creatine-calculator");

  const jsonLdTypes = (
    await page.locator('script[type="application/ld+json"]').allInnerTexts()
  ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
  expect(jsonLdTypes).toEqual(
    expect.arrayContaining(["Article", "FAQPage", "BreadcrumbList"]),
  );

  // Neutral evidence layer: no ads, no affiliate block.
  await expect(page.locator("[data-ad-slot]")).toHaveCount(0);
});

test("a safety-flagged supplement renders its SafetyCallout", async ({ page }) => {
  await page.goto("/supplements/caffeine");
  await expect(page.getByTestId("safety-callout")).toBeVisible();
});

test("every supplement page serves with an evidence tier and disclaimer", async ({ page }) => {
  for (const s of supplements) {
    await page.goto(`/supplements/${s.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(s.name);
    await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
    expect(await page.getByTestId("evidence-tier").count()).toBeGreaterThan(0);
    if (s.safety) {
      await expect(page.getByTestId("safety-callout")).toBeVisible();
    }
  }
});

test("supplement pages have no critical accessibility violations", async ({ page }) => {
  await page.goto("/supplements");
  const hub = await new AxeBuilder({ page }).analyze();
  expect(hub.violations.filter((v) => v.impact === "critical")).toEqual([]);

  await page.goto("/supplements/caffeine");
  const detail = await new AxeBuilder({ page }).analyze();
  expect(detail.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
