import { expect, test } from "@playwright/test";

/**
 * Share loop (ROADMAP.md E1): a shared result URL lands on /share (previews the
 * card, routes into the tool), its OG image is the dynamic /api/share-card, and
 * composite-index results expose a share button.
 */

test("the /share page previews the card and routes into the tool", async ({ page }) => {
  await page.goto("/share?tool=metabolic-fitness-index&value=72");
  await expect(page.getByTestId("share-card")).toBeVisible();
  await expect(page.getByTestId("share-card")).toContainText("72");
  await expect(page.getByRole("heading", { name: /calculate yours/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /metabolic fitness/i }).first(),
  ).toHaveAttribute("href", "/metabolic-fitness-index");

  // OG image points at the dynamic card endpoint (unfurls on social).
  const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(og ?? "").toContain("/api/share-card");
});

test("an invalid /share URL 404s (no arbitrary-text cards)", async ({ page }) => {
  const res = await page.goto("/share?value=72"); // no tool
  expect(res?.status()).toBe(404);
});

test("the card image endpoint returns a PNG for valid params, 400 otherwise", async ({
  request,
}) => {
  const ok = await request.get("/api/share-card?tool=metabolic-fitness-index&value=72");
  expect(ok.status()).toBe(200);
  expect(ok.headers()["content-type"]).toContain("image/png");

  const bad = await request.get("/api/share-card?tool=not-a-real-tool&value=72");
  expect(bad.status()).toBe(400);
});

test("composite-index results expose a share button", async ({ page }) => {
  await page.goto("/metabolic-fitness-index");
  // Default inputs compute a result on load, so the share button is present.
  await expect(page.getByTestId("share-result")).toBeVisible();
});
