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

  // Home + 3 hubs + 32 standard tools + labs tool + labs index + author + 5
  // legal + peptides pillar + 8 peptide pages + index-methodology + 2 recovery
  // pillars + 4 recovery satellites + glossary hub + 23 glossary terms +
  // supplements hub + 6 supplement pages.
  expect(locs.length).toBe(91);
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

test("all three hubs list their tools", async ({ page }) => {
  for (const hub of ["nutrition", "strength", "recovery"]) {
    await page.goto(`/${hub}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      new RegExp(hub, "i"),
    );
    const toolLinks = page.locator('ul a[href^="/"]');
    expect(await toolLinks.count()).toBeGreaterThanOrEqual(2);
  }
});
