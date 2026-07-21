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
  // Mifflin male 30/80/175 → 1748.75 ≈ 1,749.
  "bmr-calculator": { results: { "bmr-value": "1,749" } },
  // Boer male 80 kg / 180 cm → 61.42.
  "lean-body-mass-calculator": { results: { "lbm-value": "61.4 kg" } },
  // 80 kg, 15% BF, 180 cm → FFM 68 → FFMI 20.99.
  "ffmi-calculator": { results: { "ffmi-value": "21.0" } },
  // EFSA male, no exercise → 2.5 L.
  "water-intake-calculator": { results: { "water-value": "2.5" } },
  // Running 6 mph (9.3 MET), 80 kg, 30 min → 390.6 ≈ 391.
  "calories-burned-calculator": { results: { "burn-value": "391" } },
  // Male 175 cm, 80 kg, 10,000 steps, moderate → 482.96 ≈ 483.
  "steps-to-calories-calculator": { results: { "steps-kcal": "483" } },
  // 80 kg × 0.3 g/kg → 24 g/day.
  "creatine-calculator": {
    results: { "creatine-loading": "24", "creatine-maintenance": "3–5 g/day" },
  },
  // 100 kg work set → 60 kg × 3 as the third ramp step.
  "warmup-calculator": { results: { "warmup-row-2": "60.0 kg" } },
  // Defaults 6–8 @ 50 kg, reps 8,8,8 → 52.5 kg × 6.
  "double-progression-planner": { results: { "progression-next": "52.5 kg × 6" } },
  // 3 × 8 × 100 → 2,400 kg tonnage.
  "training-volume-calculator": { results: { "tonnage-value": "2,400" } },
  // Male squat, 91 kg BW, 150 kg 1RM → intermediate (Kilgore 20–29).
  "strength-standards": { results: { "standard-level": "Intermediate" } },
  // Male 93 kg BW, 700 kg total → DOTS 445.4 (OPL coefficients).
  "dots-calculator": { results: { "dots-value": "445.4" } },
  // 10 km in 50:00 → 5:00 /km.
  "running-pace-calculator": { results: { "pace-value": "5:00" } },
  // Riegel from 50:00 10 km → HM 1:50:19.
  "race-time-predictor": { results: { "riegel-hm": "1:50:19" } },
  // 200 mg → 50 mg at t½ 5 h → 10 hours.
  "caffeine-calculator": { results: { "caffeine-threshold": "10.0" } },
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
