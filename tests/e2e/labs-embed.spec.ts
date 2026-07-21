import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** M4 acceptance: labs serve no ads and gate on acknowledgement; embeds are < 50 kB and link back. */

test.describe("labs", () => {
  // Acknowledgement gate removed at Mat's direction 2026-07-21 (recorded in
  // SPEC §7); the enhanced disclaimer remains mandatory and is asserted here.
  test("peptide page: enhanced disclaimer visible, calculator direct, no ads", async ({ page }) => {
    await page.goto("/labs/peptide-reconstitution");
    await expect(page.getByTestId("labs-disclaimer")).toBeVisible();
    await expect(page.getByTestId("labs-disclaimer")).toContainText("arithmetic only");
    // Calculator renders directly with the default arithmetic:
    // 5 mg / 2 ml, 250 mcg → 0.1 ml → 10 units.
    await expect(page.getByTestId("peptide-units")).toContainText("10.0");
    await expect(page.getByTestId("peptide-ml")).toContainText("0.100 ml");
    // No ad slot, ever, on labs pages.
    await expect(page.locator("[data-ad-slot]")).toHaveCount(0);
  });

  test("header navigation includes a Labs tab", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Labs" })).toHaveAttribute("href", "/labs");
    await nav.getByRole("link", { name: "Labs" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Labs");
  });

  test("homepage has a Labs section linking to the peptide tool", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", {
      has: page.getByRole("heading", { name: "Labs" }),
    });
    await expect(section.getByRole("link", { name: /Peptide Reconstitution/ })).toHaveAttribute(
      "href",
      "/labs/peptide-reconstitution",
    );
    await expect(section).toContainText("enhanced disclaimers");
  });

  test("labs index lists the tool; no critical axe violations", async ({ page }) => {
    await page.goto("/labs");
    await expect(
      page.getByRole("link", { name: /Peptide Reconstitution/ }),
    ).toBeVisible();
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
