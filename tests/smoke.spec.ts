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
  await expect(page.locator('[data-testid="theme-toggle"]:visible')).toBeVisible();
});

test("theme toggle flips data-theme on click", async ({ page }) => {
  await page.goto("/en");
  // Open the mobile sheet if the toggle is hidden behind it.
  const menu = page.getByRole("button", { name: /open menu/i });
  if (await menu.isVisible()) {
    await menu.click();
  }
  const toggle = page.locator('[data-testid="theme-toggle"]:visible').first();
  await expect(toggle).toBeVisible();

  const before = await page.locator("html").getAttribute("data-theme");
  await toggle.click();
  await expect
    .poll(async () => page.locator("html").getAttribute("data-theme"))
    .not.toBe(before);
  const after = await page.locator("html").getAttribute("data-theme");
  expect(["dark", "light"]).toContain(after);
});
