import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { exercises, exercisePatterns } from "../../src/registry/exercises";

/**
 * Exercise library (CONTENT-reference.md §3, §9): the hub and pattern hubs list
 * every exercise, each exercise page carries HowTo + Article + Breadcrumb
 * schema, the medical disclaimer, and cross-links to the strength calculators.
 */

test("exercise library is linked from the workout section and lists every pattern and exercise", async ({ page }) => {
  // 2026-07-23 restructure: the Exercises nav item moved inside the Workout
  // topic section (plus a footer link) rather than sitting at the top level.
  await page.goto("/workout");
  await expect(
    page.getByRole("link", { name: /Browse the full exercise library/ }),
  ).toHaveAttribute("href", "/exercises");

  await page.goto("/exercises");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Exercise library");
  for (const e of exercises) {
    await expect(
      page.getByRole("link", { name: e.name, exact: true }).first(),
    ).toHaveAttribute("href", `/exercises/${e.pattern}/${e.slug}`);
  }
});

test("a pattern hub lists its exercises", async ({ page }) => {
  const legs = exercisePatterns.find((p) => p.slug === "legs")!;
  await page.goto(`/exercises/${legs.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Legs");
  const legExercises = exercises.filter((e) => e.pattern === "legs");
  for (const e of legExercises) {
    await expect(
      page.getByRole("link", { name: e.name, exact: true }).first(),
    ).toHaveAttribute("href", `/exercises/legs/${e.slug}`);
  }
});

test("an exercise page carries HowTo schema, disclaimer and calculator cross-links", async ({
  page,
}) => {
  await page.goto("/exercises/legs/back-squat");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Back squat");
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /one.rep max/i }).first(),
  ).toHaveAttribute("href", "/one-rep-max-calculator");

  const jsonLdTypes = (
    await page.locator('script[type="application/ld+json"]').allInnerTexts()
  ).map((b) => (JSON.parse(b) as { "@type": string })["@type"]);
  expect(jsonLdTypes).toEqual(
    expect.arrayContaining(["Article", "HowTo", "FAQPage", "BreadcrumbList"]),
  );
});

test("every exercise page serves with a How-to section and disclaimer", async ({ page }) => {
  for (const e of exercises) {
    await page.goto(`/exercises/${e.pattern}/${e.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(e.name);
    await expect(page.getByRole("heading", { name: "How to perform it" })).toBeVisible();
    await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
  }
});

test("exercise pages have no critical accessibility violations", async ({ page }) => {
  await page.goto("/exercises");
  const hub = await new AxeBuilder({ page }).analyze();
  expect(hub.violations.filter((v) => v.impact === "critical")).toEqual([]);

  await page.goto("/exercises/legs/conventional-deadlift");
  const detail = await new AxeBuilder({ page }).analyze();
  expect(detail.violations.filter((v) => v.impact === "critical")).toEqual([]);
});
