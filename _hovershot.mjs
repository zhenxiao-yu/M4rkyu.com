import { chromium } from "@playwright/test";

const dir = `${process.env.TEMP}/m4shots`;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 860 },
  deviceScaleFactor: 2,
});
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://127.0.0.1:3100/en/contact", { waitUntil: "load" });
await page.waitForTimeout(1800);

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
await page.screenshot({ path: `${dir}/footer2-collapsed.png` });

const toggle = page.getByRole("button", { name: /site map/i });
await toggle.click();
await page.waitForTimeout(700);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
await page.screenshot({ path: `${dir}/footer2-expanded.png` });

await browser.close();
console.log("pageerrors:", errors.length ? errors : "none");
