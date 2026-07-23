import type { Page } from "@playwright/test";

/**
 * The main nav collapses to a hamburger below lg, hiding its links from the
 * accessibility tree — open it first so nav assertions hold on the mobile
 * project as well as desktop.
 */
export async function openMainNav(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: "Open menu" });
  if (await toggle.isVisible()) await toggle.click();
}
