import { expect, test } from "@playwright/test";

/**
 * Type-to-filter card search on the hub pages (CardSearch component).
 * Matching is word-prefix: typing "c" on /supplements narrows to entries
 * with a word starting with C (Creatine, Caffeine), hiding the rest and any
 * evidence-grade section left empty. Clearing the box restores everything.
 */

test("supplements hub filters as you type and restores on clear", async ({ page }) => {
  await page.goto("/supplements");
  const search = page.getByTestId("card-search");
  await expect(search).toBeVisible();

  const creatine = page.getByRole("link", { name: "Creatine monohydrate" });
  const ashwagandha = page.getByRole("link", { name: "Ashwagandha" });
  await expect(creatine).toBeVisible();
  await expect(ashwagandha).toBeVisible();

  await search.fill("c");
  await expect(creatine).toBeVisible();
  await expect(page.getByRole("link", { name: "Caffeine" })).toBeVisible();
  await expect(ashwagandha).toBeHidden();

  await search.fill("");
  await expect(ashwagandha).toBeVisible();
});

test("an empty evidence-grade section hides, and no-matches is announced", async ({ page }) => {
  await page.goto("/supplements");
  const search = page.getByTestId("card-search");

  // "Ashwagandha" sits in a lower grade than "Creatine monohydrate"; filtering
  // to it should hide the top-grade section heading entirely.
  const topGrade = page.getByRole("heading", { level: 2 }).first();
  const topGradeName = await topGrade.textContent();
  await search.fill("ashwagandha");
  await expect(page.getByRole("link", { name: "Ashwagandha" })).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 2, name: topGradeName ?? "" }),
  ).toBeHidden();

  await search.fill("zzzz");
  await expect(page.getByText(/No matches for/)).toBeVisible();
});

test("calculators index filters tools across categories", async ({ page }) => {
  await page.goto("/calculators");
  const search = page.getByTestId("card-search");
  await search.fill("protein");
  await expect(
    page.getByRole("link", { name: /protein/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /BMI Calculator/ })).toBeHidden();
});

test("glossary filters by term and aka", async ({ page }) => {
  await page.goto("/glossary");
  const search = page.getByTestId("card-search");
  await search.fill("vo2");
  const matches = page.locator("[data-search-item]:visible");
  expect(await matches.count()).toBeGreaterThan(0);
  await expect(matches.first()).toContainText(/VO₂/i);
});
