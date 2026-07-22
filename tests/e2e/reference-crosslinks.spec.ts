import { expect, test } from "@playwright/test";

/**
 * Reciprocal cross-links (CONTENT-reference.md §8): calculator pages link back
 * out to the reference pages that reference them, completing the loop.
 */

test("the heart-age calculator links out to the ApoB glossary term", async ({ page }) => {
  await page.goto("/heart-age-calculator");
  const section = page.getByTestId("related-reference");
  await expect(section).toBeVisible();
  await expect(section.getByRole("link", { name: "ApoB", exact: false }).first()).toHaveAttribute(
    "href",
    "/glossary/apob",
  );
});

test("the creatine calculator links out to the creatine supplement page", async ({ page }) => {
  await page.goto("/creatine-calculator");
  const section = page.getByTestId("related-reference");
  await expect(section).toBeVisible();
  await expect(
    section.getByRole("link", { name: /creatine monohydrate/i }).first(),
  ).toHaveAttribute("href", "/supplements/creatine-monohydrate");
});

test("the one-rep-max calculator links out to exercise pages", async ({ page }) => {
  await page.goto("/one-rep-max-calculator");
  const section = page.getByTestId("related-reference");
  await expect(section).toBeVisible();
  await expect(section.getByRole("link").first()).toBeVisible();
});
