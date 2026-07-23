import type { Page } from "@playwright/test";

/**
 * Below lg the main nav collapses into a hamburger (SiteNav), so its links sit
 * in an unrendered dropdown — outside the accessibility tree — until opened.
 * Open it when the toggle is visible (mobile project); a no-op on desktop,
 * where the toggle is hidden and the horizontal link row is already exposed.
 */
export async function openMainNav(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: "Open menu" });
  if (await toggle.isVisible()) await toggle.click();
}
