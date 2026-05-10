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
  // `.first()` because Phase 3 surfaces the same controls in the
  // hero's GameHud strip as well as the header — both are valid
  // entry points; the test only needs to confirm at least one is
  // reachable. Mirrors the `.first()` pattern used on line 45.
  await expect(
    page.locator('[data-testid="language-switcher"]:visible').first(),
  ).toBeVisible();
  await expect(
    page.locator('[data-testid="theme-toggle"]:visible').first(),
  ).toBeVisible();
});

test("theme toggle flips data-theme on click", async ({ page }) => {
  await page.goto("/en");
  // Theme toggle lives in the header rail at every breakpoint, so it
  // is always directly clickable — no sheet to open. Opening the
  // mobile sheet would actually break this test, because the sheet's
  // backdrop overlay intercepts pointer events on the header.
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
