import { expect, test } from "@playwright/test";

const routes = [
  "/en",
  "/zh",
  "/en/work",
  "/en/work/nimbus",
  "/en/games",
  "/en/games/descent-into-madness",
  "/en/archive",
  "/en/archive/black-white",
  "/en/logs",
  "/en/media",
  "/en/resources",
  "/en/resources/contrast-checker",
  "/en/resources/color-converter",
  "/en/resources/shadow-generator",
  "/en/latest",
  "/en/changelog",
  "/en/colophon",
  "/en/notes?tag=css",
  "/en/topics",
  "/en/topics/css",
  "/zh/topics",
  "/en/search",
  "/en/newsletter/confirmed?state=ok",
  "/en/about",
  "/en/contact",
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

test("command palette finds shop items and navigates", async ({ page }) => {
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Command palette" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByPlaceholder("Search pages, frames, settings…")).toBeVisible();

  await page.getByPlaceholder("Search pages, frames, settings…").fill("wallpaper");
  await page.getByRole("option", { name: /Desktop Wallpaper Pack/i }).click();
  await expect(page).toHaveURL(/\/en\/shop\/wallpaper-pack$/);
});

test("command palette opens audio settings quick action", async ({ page }) => {
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Command palette" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.getByPlaceholder("Search pages, frames, settings…")).toBeVisible();
  await page.getByPlaceholder("Search pages, frames, settings…").fill("audio");
  await page.getByRole("option", { name: /Open audio settings/i }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Ambient player" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
});

test("audio settings are directly reachable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");

  const audioButton = page.locator('button[aria-label="Audio settings"]:visible').first();
  await expect(audioButton).toBeVisible();
  await audioButton.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("search ranks a query and links to a result", async ({ page }) => {
  await page.goto("/en/search");
  const box = page.getByPlaceholder(/Search projects/i);
  await expect(box).toBeVisible();
  // "css" matches css-tagged notes (the catalog's ready content). Results
  // render instantly client-side.
  await box.fill("css");
  // Results render instantly client-side; some are external links, so we
  // assert ranked results appear rather than navigating.
  const results = page.getByTestId("search-results").getByRole("link");
  await expect(results.first()).toBeVisible();
  expect(await results.count()).toBeGreaterThan(0);
});

test("public feeds expose latest notes and logs", async ({ request }) => {
  const rss = await request.get("/feed.xml");
  expect(rss.ok()).toBe(true);
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  expect(await rss.text()).toContain("<rss");

  const json = await request.get("/feed.json");
  expect(json.ok()).toBe(true);
  expect(json.headers()["content-type"]).toContain("application/feed+json");
  const payload = await json.json();
  expect(payload.version).toBe("https://jsonfeed.org/version/1.1");
  expect(Array.isArray(payload.items)).toBe(true);
  expect(payload.items.length).toBeGreaterThan(0);
});

test("citation actions are available on readable detail pages", async ({ page }) => {
  await page.goto("/en/resources/contrast-checker");
  await expect(page.getByRole("button", { name: "Copy citation" })).toBeVisible();

  await page.goto(
    "/en/logs/the-true-cost-of-poor-data-quality-why-it-matters-and-how-to-improve-it-2epi",
  );
  await expect(page.getByRole("button", { name: "Copy citation" })).toBeVisible();
});
