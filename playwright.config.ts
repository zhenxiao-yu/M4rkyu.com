import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  // Vitest owns tests/unit/** (pure unit tests). Keep Playwright out of it.
  testIgnore: "**/unit/**",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    env: {
      NEXT_DIST_DIR: ".next-playwright",
    },
    url: "http://127.0.0.1:3000/en",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "360", use: { viewport: { width: 360, height: 780 } } },
    { name: "390", use: { viewport: { width: 390, height: 844 } } },
    { name: "768", use: { viewport: { width: 768, height: 1024 } } },
    { name: "1280", use: { viewport: { width: 1280, height: 900 } } },
    { name: "1920", use: { viewport: { width: 1920, height: 1080 } } },
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
