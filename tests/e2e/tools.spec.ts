import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { standardTools } from "../../src/registry/tools";

/**
 * Per-tool smoke tests (SPEC §14): every registered tool loads with
 * defaults, shows a plausible (deterministic) result, keeps the disclaimer
 * visible, logs no console errors, and has zero critical axe violations.
 * The expectations map must cover every standard tool — adding a tool
 * without a smoke expectation fails the suite.
 */

interface ToolExpectation {
  /** data-testid → text the element must contain with default inputs. */
  results: Record<string, string>;
}

const EXPECTATIONS: Record<string, ToolExpectation> = {
  // BMR 1748.75 × 1.55 ≈ 2711 (male 30 y, 80 kg, 175 cm, moderate).
  "tdee-calculator": { results: { "tdee-value": "2,711" } },
  // 80 kg × 1.8 g/kg = 144 g protein.
  "macro-calculator": { results: { "protein-g": "144 g" } },
  // 10 kg at 500 kcal/day = 77,000 / 3,500 = 22 weeks.
  "calorie-deficit-calculator": { results: { "deficit-weeks": "22" } },
  // 80 / 1.75² = 26.12 → overweight.
  "bmi-calculator": {
    results: { "bmi-value": "26.1", "bmi-category": "overweight" },
  },
  // Male, waist 85, neck 37, height 178 → 17.204%.
  "body-fat-calculator": { results: { "body-fat-value": "17.2%" } },
  // Male 175 cm: Robinson 68.11 (min) … Hamwi 72.02 (max).
  "ideal-weight-calculator": { results: { "ideal-weight-range": "68.1" } },
  // Epley 100 kg × 5 → 116.667 → 116.7.
  "one-rep-max-calculator": { results: { "one-rm-value": "116.7" } },
  // 100 kg on 20 kg bar → 25 + 15 per side.
  "plate-calculator": {
    results: { "plate-stack": "25 + 15", "plate-total": "100.0 kg" },
  },
  // Age 30 → Tanaka 187; zone 1 (%HRmax) 93.5–112.2 → 94–112.
  "heart-rate-zone-calculator": {
    results: { "hr-max": "187", "zone-1": "94–112" },
  },
  // Wake 07:00 → 6 cycles bedtime 21:45.
  "sleep-calculator": { results: { "bedtime-6": "21:45" } },
};

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

test("every standard tool has a smoke expectation", () => {
  for (const tool of standardTools()) {
    expect(EXPECTATIONS[tool.slug], `missing expectation for ${tool.slug}`).toBeDefined();
  }
});

for (const [slug, expectation] of Object.entries(EXPECTATIONS)) {
  test.describe(slug, () => {
    test("loads, computes the expected default result, disclaimer visible, no console errors", async ({
      page,
    }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(`/${slug}`);

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (const [testId, expected] of Object.entries(expectation.results)) {
        await expect(page.getByTestId(testId)).toContainText(expected);
      }
      await expect(page.getByTestId("disclaimer-banner")).toBeVisible();

      const jsonLdTypes = (
        await page.locator('script[type="application/ld+json"]').allInnerTexts()
      ).map((block) => (JSON.parse(block) as { "@type": string })["@type"]);
      expect(jsonLdTypes).toEqual(
        expect.arrayContaining(["WebApplication", "FAQPage", "BreadcrumbList"]),
      );

      expect(errors).toEqual([]);
    });

    test("has no critical accessibility violations", async ({ page }) => {
      await page.goto(`/${slug}`);
      const results = await new AxeBuilder({ page }).analyze();
      const critical = results.violations.filter(
        (violation) => violation.impact === "critical",
      );
      expect(critical).toEqual([]);
    });
  });
}
