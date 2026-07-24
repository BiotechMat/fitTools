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

test("a Lifeline challenge link unfurls as the score card", async ({ page }) => {
  await page.goto("/lifeline?seed=20260723&beat=57&cause=allnighters");
  const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(og ?? "").toContain("/api/arcade-card");
  expect(og ?? "").toContain("beat=57");
  const title = await page.locator('meta[property="og:title"]').first().getAttribute("content");
  expect(title ?? "").toContain("beat 57");
});

test("a game page without result params keeps its hero card", async ({ page }) => {
  await page.goto("/max-out");
  const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(og ?? "").toContain("/api/arcade-card?game=max-out");
  expect(og ?? "").not.toContain("kg=");
});

test("a shared daily result unfurls as the day's card", async ({ page }) => {
  await page.goto("/daily?g=mf&p=30&c=4&t=5");
  const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
  expect(og ?? "").toContain("/api/arcade-card");
  expect(og ?? "").toContain("game=myth");
});

test("the arcade card endpoint returns a PNG for valid params, 400 otherwise", async ({
  request,
}) => {
  const score = await request.get(
    "/api/arcade-card?game=lifeline&beat=57&cause=allnighters&challenge=1",
  );
  expect(score.status()).toBe(200);
  expect(score.headers()["content-type"]).toContain("image/png");

  const hero = await request.get("/api/arcade-card?game=powerhouse");
  expect(hero.status()).toBe(200);
  expect(hero.headers()["content-type"]).toContain("image/png");

  const daily = await request.get("/api/arcade-card?game=ballpark&p=203&r=cwhb");
  expect(daily.status()).toBe(200);

  const bad = await request.get("/api/arcade-card?game=lifeline&beat=banana");
  expect(bad.status()).toBe(400);
  const unknown = await request.get("/api/arcade-card?game=tetris");
  expect(unknown.status()).toBe(400);
});

test("section and content pages unfurl with their own card, not the site default", async ({
  page,
}) => {
  for (const [path, expected] of [
    ["/arcade", "/arcade/opengraph-image"],
    ["/supplements/creatine-monohydrate", "/supplements/creatine-monohydrate/opengraph-image"],
    ["/tdee-calculator", "/tdee-calculator/opengraph-image"],
  ] as const) {
    await page.goto(path);
    const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(og ?? "", `og:image for ${path}`).toContain(expected);
  }
});
