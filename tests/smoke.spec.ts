import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const routes = [
  "/en",
  "/zh",
  "/en/work",
  "/en/work/nimbus",
  "/en/work/politilens",
  "/en/games",
  "/en/games/descent-into-madness",
  "/en/games/pubg-unreal",
  "/en/games/last-kernel",
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

async function waitForStableLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
}

for (const route of routes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("body")).toBeVisible();
    await waitForStableLayout(page);
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

test("command palette searches and navigates to a page", async ({ page }) => {
  // The pill trigger ("Search…") only renders on the lg+ desktop rail; on
  // narrower rails search lives inside the mobile sheet. Force a desktop
  // viewport so this test exercises the pill regardless of the project width
  // (mirrors the mobile-audio test below, which forces 390).
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Search…" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  // The palette is a dynamic({ ssr: false }) import — its chunk loads on first
  // open, so give the input a generous beat to appear under the dev server.
  const input = page.getByPlaceholder("Search pages, frames, settings…");
  await expect(input).toBeVisible({ timeout: 15_000 });

  // Assert against a page entry, not content: PAGES are code-defined and
  // always present, so this stays green as src/content drifts. (Shop items
  // are all status:"draft", so the old "wallpaper" query had nothing to find.)
  await input.fill("colophon");
  await page.getByRole("option", { name: "Colophon", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/colophon$/);
});

test("command palette switches the color palette from settings", async ({ page }) => {
  // Force a desktop viewport so the pill trigger is on the rail (see note above).
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Search…" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const input = page.getByPlaceholder("Search pages, frames, settings…");
  await expect(input).toBeVisible({ timeout: 15_000 });

  // The settings group exposes the palette themes (risograph default →
  // terminal). Selecting one flips the data-palette axis on <html> — a
  // settings action with an observable effect, no auth or content needed.
  // (The old "Open audio settings" quick action no longer exists in the
  // palette; audio reachability is covered by the mobile test below.)
  await input.fill("terminal");
  await page.getByRole("option", { name: "Terminal", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "terminal");
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
