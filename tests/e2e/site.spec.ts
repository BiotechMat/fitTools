import { expect, test } from "@playwright/test";

/**
 * Site-wide checks (M1 acceptance): internal links resolve, sitemap is
 * valid and every listed URL serves, hubs and legal pages render.
 */

test("all internal links reachable from the homepage resolve", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const hrefs = await page
    .locator('a[href^="/"]')
    .evaluateAll((anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""),
    );

  const seen = new Set<string>(["/"]);
  const queue = hrefs.filter((href) => !seen.has(href));
  while (queue.length > 0) {
    const path = queue.pop();
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const response = await request.get(path);
    expect(response.status(), `broken internal link: ${path}`).toBe(200);
    // Crawl one level deeper from tool/hub pages to cover related links.
    if (!path.startsWith("/legal") && !path.startsWith("/author")) {
      await page.goto(path);
      const nested = await page
        .locator('a[href^="/"]')
        .evaluateAll((anchors) =>
          anchors.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""),
        );
      for (const href of nested) {
        if (!seen.has(href)) queue.push(href);
      }
    }
  }
  // Sanity: the crawl actually covered the site.
  expect(seen.size).toBeGreaterThanOrEqual(18);
});

test("sitemap lists every page and every URL serves", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  // Home + daily hub + arcade hub + lifeline + powerhouse + blood-test +
  // pulse hub + pulse/this-week + calculators index + 3 section hubs +
  // 32 standard tools + reconstitution calculator (in the peptides section) +
  // author + 5 legal + peptides pillar + 8 peptide pages + index-methodology +
  // 8 recovery pillars + 4 recovery satellites + glossary hub + 23 glossary
  // terms + supplements hub + 13 supplement pages + exercises hub + 3 pattern
  // hubs + 13 exercise pages + food-reference hub + 4 food-reference pages +
  // reference-tables hub + 3 reference tables + glow-up hub +
  // looksmaxxing-myths + skin pillar + 6 skin satellites.
  expect(locs.length).toBe(146);
  for (const loc of locs) {
    const path = new URL(loc).pathname;
    const pageResponse = await request.get(path);
    expect(pageResponse.status(), `sitemap URL failing: ${path}`).toBe(200);
  }
});

test("robots.txt serves and references the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("sitemap.xml");
});

test("all three topic sections list their tools", async ({ page }) => {
  for (const hub of ["nutrition", "workout", "recovery"]) {
    await page.goto(`/${hub}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      new RegExp(hub, "i"),
    );
    const toolLinks = page.locator('ul a[href^="/"]');
    expect(await toolLinks.count()).toBeGreaterThanOrEqual(2);
  }
});

test("topic sections carry more than calculators", async ({ page }) => {
  await page.goto("/nutrition");
  await expect(page.getByRole("heading", { name: "Food reference" })).toBeVisible();
  await page.goto("/workout");
  await expect(page.getByRole("heading", { name: "Exercise library" })).toBeVisible();
  await page.goto("/recovery");
  await expect(
    page.getByRole("heading", { name: /Recovery & wellness guides/ }),
  ).toBeVisible();
});

test("old /strength hub URL redirects permanently to /workout", async ({ request }) => {
  const response = await request.get("/strength", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toContain("/workout");
});

test("calculators index groups every category under stable anchors", async ({ page }) => {
  await page.goto("/calculators");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Calculators");
  for (const anchor of ["nutrition", "workout", "recovery", "peptides"]) {
    await expect(page.locator(`section[id="${anchor}"]`)).toHaveCount(1);
  }
  // Every registered tool is listed (32 standard + the reconstitution tool).
  const toolLinks = page.locator('section ul a[href^="/"]');
  expect(await toolLinks.count()).toBeGreaterThanOrEqual(33);
});

test("Calculators menu reaches the index (dropdown on desktop, grouped list on mobile)", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  const hamburger = nav.getByRole("button", { name: "Open menu" });
  if (await hamburger.isVisible()) {
    // Mobile: the group renders as a labelled sub-list inside the panel.
    await hamburger.click();
    const menu = page.locator("#mobile-menu");
    await expect(menu.getByText("Calculators", { exact: true })).toBeVisible();
    for (const anchor of ["nutrition", "workout", "recovery"]) {
      await expect(menu.locator(`a[href="/calculators#${anchor}"]`)).toBeVisible();
    }
    await menu.locator('a[href="/calculators"]').click();
  } else {
    // Desktop: an accessible disclosure dropdown.
    const trigger = nav.getByRole("button", { name: "Calculators" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    // Scope to the dropdown panel: the category labels also exist as
    // top-level topic links in the same nav.
    const panel = nav.locator("#nav-group-calculators");
    for (const label of ["All calculators", "Nutrition", "Workout", "Recovery", "Peptide reconstitution"]) {
      await expect(panel.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await panel.getByRole("link", { name: "All calculators" }).click();
  }
  await expect(page).toHaveURL(/\/calculators$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Calculators");
});
