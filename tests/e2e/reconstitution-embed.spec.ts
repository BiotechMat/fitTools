import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openMainNav } from "./helpers";

/**
 * M4 acceptance, updated for the 2026-07-23 restructure: the reconstitution
 * calculator lives inside the peptides section (the /labs route is retired
 * and redirects), keeps its enhanced disclaimer and serves no ads; embeds
 * are < 50 kB and link back.
 */

const TOOL_PATH = "/learn/peptides/peptide-reconstitution";

test.describe("peptide reconstitution calculator", () => {
  // Acknowledgement gate removed at Mat's direction 2026-07-21 (recorded in
  // SPEC §7); the enhanced disclaimer remains mandatory and is asserted here.
  test("tool page: enhanced disclaimer visible, calculator direct, no ads", async ({ page }) => {
    await page.goto(TOOL_PATH);
    await expect(page.getByTestId("enhanced-disclaimer")).toBeVisible();
    await expect(page.getByTestId("enhanced-disclaimer")).toContainText("arithmetic only");
    // Calculator renders directly with the default arithmetic:
    // 5 mg / 2 ml, 250 mcg → 0.1 ml → 10 units.
    await expect(page.getByTestId("peptide-units")).toContainText("10.0");
    await expect(page.getByTestId("peptide-ml")).toContainText("0.100 ml");
    // No ad slot, ever, on the reconstitution calculator.
    await expect(page.locator("[data-ad-slot]")).toHaveCount(0);
  });

  test("peptides pillar page links to the calculator; no Labs tab remains", async ({ page }) => {
    await page.goto("/learn/peptides");
    await expect(
      page.getByRole("link", { name: /Peptide Reconstitution/ }),
    ).toHaveAttribute("href", TOOL_PATH);
    await openMainNav(page);
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Labs", exact: true })).toHaveCount(0);
  });

  test("homepage has a Peptides section linking to the calculator", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", {
      has: page.getByRole("heading", { name: "Peptides" }),
    });
    await expect(section.getByRole("link", { name: /Peptide Reconstitution/ })).toHaveAttribute(
      "href",
      TOOL_PATH,
    );
    await expect(section).toContainText("enhanced disclaimer");
  });

  test("retired /labs URLs redirect permanently into the peptides section", async ({ request }) => {
    const index = await request.get("/labs", { maxRedirects: 0 });
    expect(index.status()).toBe(308);
    expect(index.headers()["location"]).toContain("/learn/peptides");

    const tool = await request.get("/labs/peptide-reconstitution", { maxRedirects: 0 });
    expect(tool.status()).toBe(308);
    expect(tool.headers()["location"]).toContain(TOOL_PATH);
  });

  test("tool page has no critical axe violations", async ({ page }) => {
    await page.goto(TOOL_PATH);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "critical")).toEqual([]);
  });
});

test.describe("embeds", () => {
  for (const slug of ["tdee-calculator", "bmi-calculator", "one-rep-max-calculator"]) {
    test(`${slug} embed: < 50 kB, attribution link, computes`, async ({ page, request }) => {
      const response = await request.get(`/embed/${slug}`);
      expect(response.status()).toBe(200);
      const body = await response.body();
      expect(body.byteLength).toBeLessThan(50 * 1024);
      expect(body.toString()).toContain(`/${slug}?utm_source=embed`);

      await page.goto(`/embed/${slug}`);
      // No framework JS: page must make no /_next/ requests.
      const nextRequests: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("/_next/")) nextRequests.push(r.url());
      });
      await expect(page.locator("output")).not.toBeEmpty();
      expect(nextRequests).toEqual([]);
    });
  }

  test("embed computes on input (TDEE)", async ({ page }) => {
    await page.goto("/embed/tdee-calculator");
    await expect(page.locator("output")).toContainText("2,711");
    await page.locator("#age").fill("40");
    await expect(page.locator("output")).toContainText("2,633");
  });

  test("tool page shows copy-embed block for embeddable tools only", async ({ page }) => {
    await page.goto("/tdee-calculator");
    await expect(page.getByTestId("copy-embed")).toBeVisible();
    await page.goto("/macro-calculator");
    await expect(page.getByTestId("copy-embed")).toHaveCount(0);
  });
});
