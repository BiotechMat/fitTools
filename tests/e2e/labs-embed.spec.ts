import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** M4 acceptance: labs serve no ads and gate on acknowledgement; embeds are < 50 kB and link back. */

test.describe("labs", () => {
  test("peptide page: enhanced disclaimer, acknowledgement gate, no ads", async ({ page }) => {
    await page.goto("/labs/peptide-reconstitution");
    await expect(page.getByTestId("labs-disclaimer")).toBeVisible();
    // Gate first: calculator hidden until acknowledged.
    await expect(page.getByTestId("labs-ack-gate")).toBeVisible();
    await expect(page.getByTestId("peptide-units")).toHaveCount(0);
    const cont = page.getByTestId("labs-ack-continue");
    await expect(cont).toBeDisabled();
    await page.getByTestId("labs-ack-checkbox").check();
    await cont.click();
    // Calculator now visible with the default arithmetic: 5 mg / 2 ml,
    // 250 mcg → 0.1 ml → 10 units.
    await expect(page.getByTestId("peptide-units")).toContainText("10.0");
    await expect(page.getByTestId("peptide-ml")).toContainText("0.100 ml");
    // No ad slot, ever, on labs pages.
    await expect(page.locator("[data-ad-slot]")).toHaveCount(0);
  });

  test("acknowledgement persists across reloads", async ({ page }) => {
    await page.goto("/labs/peptide-reconstitution");
    await page.getByTestId("labs-ack-checkbox").check();
    await page.getByTestId("labs-ack-continue").click();
    await page.reload();
    await expect(page.getByTestId("labs-ack-gate")).toHaveCount(0);
    await expect(page.getByTestId("peptide-units")).toContainText("10.0");
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
