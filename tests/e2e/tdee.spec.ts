import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * TDEE tool smoke tests (SPEC §14): load, enter defaults, assert a
 * plausible result, no console errors, disclaimer visible, zero critical
 * axe violations, JSON-LD present.
 */

const TOOL_PATH = "/tdee-calculator";

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

test("loads with defaults and shows the expected estimate", async ({ page }) => {
  const errors = collectConsoleErrors(page);
  await page.goto(TOOL_PATH);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("TDEE");

  // Defaults: male, 30 y, 80 kg, 175 cm, moderate, Mifflin–St Jeor.
  // BMR = 800 + 1093.75 − 150 + 5 = 1748.75; TDEE = 1748.75 × 1.55 ≈ 2711.
  await expect(page.getByTestId("tdee-value")).toContainText("2,711");

  // Disclaimer must be visible on every tool page (SPEC §2).
  await expect(page.getByTestId("disclaimer-banner")).toBeVisible();
  await expect(page.getByTestId("disclaimer-banner")).toContainText(
    "not medical advice",
  );

  expect(errors).toEqual([]);
});

test("recalculates when inputs change", async ({ page }) => {
  await page.goto(TOOL_PATH);
  await page.getByLabel("Age (years)").fill("40");
  // Male, 80 kg, 175 cm, 40 y → BMR 1698.75 → ×1.55 ≈ 2633.
  await expect(page.getByTestId("tdee-value")).toContainText("2,633");

  await page.getByRole("radio", { name: "Female" }).check();
  // Female, 80 kg, 175 cm, 40 y → BMR 1532.75 → ×1.55 ≈ 2376.
  await expect(page.getByTestId("tdee-value")).toContainText("2,376");
});

test("rejects out-of-range input with a plain-English message", async ({ page }) => {
  await page.goto(TOOL_PATH);
  await page.getByLabel("Age (years)").fill("12");
  await expect(page.getByTestId("results-panel")).toContainText(
    "Enter a valid age",
  );
});

test("supports imperial units without changing the estimate", async ({ page }) => {
  await page.goto(TOOL_PATH);
  await page.getByRole("radio", { name: "Imperial" }).check({ force: true });
  // 80 kg → 176.4 lb; 175 cm → 5 ft 9 in; canonical SI values unchanged.
  await expect(page.getByLabel("Weight (pounds)")).toHaveValue("176.4");
  await expect(page.getByTestId("tdee-value")).toContainText("2,711");
});

test("emits WebApplication, FAQPage and BreadcrumbList JSON-LD", async ({ page }) => {
  await page.goto(TOOL_PATH);
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allInnerTexts();
  const types = blocks.map(
    (block) => (JSON.parse(block) as { "@type": string })["@type"],
  );
  expect(types).toEqual(
    expect.arrayContaining(["WebApplication", "FAQPage", "BreadcrumbList"]),
  );
});

test("has no critical accessibility violations", async ({ page }) => {
  await page.goto(TOOL_PATH);
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter(
    (violation) => violation.impact === "critical",
  );
  expect(critical).toEqual([]);
});

test("calculator is keyboard operable", async ({ page }) => {
  await page.goto(TOOL_PATH);
  const age = page.getByLabel("Age (years)");
  await age.focus();
  await age.press("ControlOrMeta+a");
  await age.pressSequentially("25");
  // Male, 80 kg, 175 cm, 25 y → BMR 1773.75 → ×1.55 ≈ 2749.
  await expect(page.getByTestId("tdee-value")).toContainText("2,749");
});
