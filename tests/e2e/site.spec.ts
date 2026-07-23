import { expect, test } from "@playwright/test";

/**
 * Site-wide checks (M1 acceptance): internal links resolve, sitemap is
 * valid and every listed URL serves, hubs and legal pages render.
 */

test("all internal links reachable from the homepage resolve", async ({
  page,
  request,
}) => {
  // The reference-library expansion roughly doubled the crawl surface;
  // under parallel workers this legitimately exceeds the default 30s.
  test.slow();
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

  // Home + daily hub + arcade hub + lifeline + powerhouse + max-out +
  // five-a-day + blood-test +
  // pulse hub + pulse/this-week + calculators index + 3 calculator category
  // pages + 3 section hubs +
  // 32 standard tools + reconstitution calculator (in the peptides section) +
  // author + 5 legal + peptides pillar + 16 peptide pages + index-methodology +
  // 8 recovery pillars + 4 recovery satellites + glossary hub + 80 glossary
  // terms + supplements hub + 35 supplement pages + exercises hub + 3 pattern
  // hubs + 39 exercise pages + food-reference hub + 4 food-reference pages +
  // reference-tables hub + 3 reference tables + glow-up hub +
  // looksmaxxing-myths + skin pillar + 6 skin satellites.
  expect(locs.length).toBe(262);
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

test("topic sections carry a single calculators card into their category page", async ({ page }) => {
  for (const hub of ["nutrition", "workout", "recovery"]) {
    await page.goto(`/${hub}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      new RegExp(hub, "i"),
    );
    // One card, not the full grid — no direct tool links on the section page.
    const card = page.getByRole("link", {
      name: new RegExp(`^${hub} calculators$`, "i"),
    });
    await expect(card).toHaveAttribute("href", `/calculators/${hub}`);

    // The category page behind the card lists the tools themselves.
    await card.click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      new RegExp(`${hub} calculators`, "i"),
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

test("Calculators menu: full grid on desktop, nested accordion on mobile", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  const hamburger = nav.getByRole("button", { name: "Open menu" });
  const onMobile = await hamburger.isVisible();
  if (onMobile) await hamburger.click();

  // Level 1: collapsed until clicked, on desktop bar and mobile panel alike.
  const trigger = nav.getByRole("button", { name: "Calculators" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const panel = nav.locator(
    onMobile ? "#mobile-group-calculators" : "#nav-group-calculators",
  );

  if (onMobile) {
    // Mobile: nested accordion. Categories are expandable rows with no tool
    // links until opened, one category at a time.
    for (const category of ["Nutrition", "Workout", "Recovery", "Peptides"]) {
      await expect(panel.getByRole("button", { name: category })).toBeVisible();
    }
    await expect(panel.getByRole("link", { name: /TDEE/ })).toHaveCount(0);

    await panel.getByRole("button", { name: "Nutrition" }).click();
    await expect(panel.getByRole("link", { name: /TDEE/ })).toHaveAttribute(
      "href",
      "/tdee-calculator",
    );

    // One category open at a time: switching swaps the list.
    await panel.getByRole("button", { name: "Peptides" }).click();
    await expect(
      panel.getByRole("link", { name: /Peptide Reconstitution/ }),
    ).toHaveAttribute("href", "/learn/peptides/peptide-reconstitution");
    await expect(panel.getByRole("link", { name: /TDEE/ })).toHaveCount(0);
  } else {
    // Desktop: the full grid — every category heading and all of its
    // calculators are on screen at once, no per-category expansion.
    for (const category of ["Nutrition", "Workout", "Recovery", "Peptides"]) {
      await expect(panel.getByText(category, { exact: true })).toBeVisible();
    }
    // Tools from different categories are visible simultaneously.
    await expect(panel.getByRole("link", { name: /TDEE/ })).toHaveAttribute(
      "href",
      "/tdee-calculator",
    );
    await expect(
      panel.getByRole("link", { name: /Peptide Reconstitution/ }),
    ).toHaveAttribute("href", "/learn/peptides/peptide-reconstitution");
  }

  await panel.getByRole("link", { name: "All calculators" }).click();
  await expect(page).toHaveURL(/\/calculators$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Calculators");
});
