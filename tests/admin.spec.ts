import { expect, test } from "@playwright/test";

// Every /admin/* surface should 404 for unauthenticated visitors.
// 404 — not 403 — so the admin tree doesn't advertise its existence
// to drive-by traffic. Matches the requireAdmin() guard.
const adminRoutes = [
  "/en/admin",
  "/en/admin/gallery",
  "/en/admin/gallery/new",
  "/en/admin/projects",
  "/en/admin/projects/new",
  "/en/admin/comments",
  "/en/admin/users",
];

for (const route of adminRoutes) {
  test(`${route} returns 404 for anonymous visitors`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
  });
}
