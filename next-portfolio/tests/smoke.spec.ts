import { expect, test } from "@playwright/test";

const routes = [
  "/en",
  "/zh",
  "/en/projects",
  "/en/projects/nimbus",
  "/en/games",
  "/en/games/descent-into-madness",
  "/en/gallery",
  "/en/gallery/black-white",
  "/en/blog",
  "/en/media",
  "/en/resources",
  "/en/tools",
  "/en/about",
  "/en/contact",
  "/en/portal",
];

for (const route of routes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow).toBe(false);
  });
}

test("theme and language controls are visible on desktop", async ({ page }) => {
  await page.goto("/en");
  const menu = page.getByRole("button", { name: /open menu/i });
  if (await menu.isVisible()) {
    await menu.click();
  }
  await expect(page.locator('[data-testid="language-switcher"]:visible')).toBeVisible();
  await expect(page.locator('[data-testid="theme-dark"]:visible')).toBeVisible();
});
