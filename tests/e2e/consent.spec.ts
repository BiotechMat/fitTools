import { expect, test } from "@playwright/test";

/**
 * M3 acceptance. Default run (flags off): zero third-party requests
 * anywhere. Flags-on run (FLAGS_ON=1 with NEXT_PUBLIC_GA4_ID set at build
 * time): nothing loads before consent; tags load after accept; CLS stays
 * intact (banner is position:fixed).
 */

test("flags off: no third-party requests on a tool page", async ({ page }) => {
  test.skip(Boolean(process.env.FLAGS_ON), "flags-off assertion");
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      external.push(request.url());
    }
  });
  await page.goto("/tdee-calculator");
  await page.getByLabel("Age (years)").fill("40");
  await expect(page.getByTestId("tdee-value")).toContainText("2,633");
  expect(external).toEqual([]);
});

test("flags off: no consent banner, no cookie-settings link", async ({ page }) => {
  test.skip(Boolean(process.env.FLAGS_ON), "flags-off assertion");
  await page.goto("/");
  await expect(page.getByTestId("consent-banner")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cookie settings" })).toHaveCount(0);
});

test.describe("flags on (requires FLAGS_ON build)", () => {
  test.skip(!process.env.FLAGS_ON, "run with FLAGS_ON=1 against a flags-on build");

  test("no tags before consent; tags load only after accept; banner causes no CLS", async ({
    page,
  }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
        external.push(request.url());
      }
    });

    await page.goto("/tdee-calculator");
    await expect(page.getByTestId("consent-banner")).toBeVisible();
    // Banner visible, no choice made: nothing third-party may have fired.
    expect(external).toEqual([]);

    // Reject: still nothing.
    await page.getByTestId("consent-reject").click();
    await expect(page.getByTestId("consent-banner")).toHaveCount(0);
    await page.waitForTimeout(500);
    expect(external).toEqual([]);

    // Reopen and accept: GA4 loads. Register the listener before clicking.
    await page.getByRole("button", { name: "Cookie settings" }).click();
    const ga4Request = page.waitForRequest(
      (request) => request.url().includes("googletagmanager.com"),
      { timeout: 15_000 },
    );
    await page.getByTestId("consent-accept").click();
    await ga4Request;

    // Layout shift check: banner is fixed-position, results panel intact.
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              total += (entry as unknown as { value: number }).value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 300);
        }),
    );
    expect(cls).toBeLessThan(0.05);
  });
});
