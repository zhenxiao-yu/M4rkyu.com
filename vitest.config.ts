import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests only. Schemas/utilities are pure, so the default `node`
// environment is enough — no jsdom, no Next runtime. Playwright owns
// the browser-level route smoke matrix under tests/ (see playwright.config.ts,
// which ignores tests/unit/**). Keep the two runners non-overlapping.
export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig `@/*` -> `src/*` path so tests import the
      // same way app code does.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The `server-only` / `client-only` marker packages have no meaning under
      // unit tests (no bundle boundary). Stub them to a no-op so pure functions
      // in modules that transitively import server-only source readers stay
      // testable (e.g. assembleCatalog / buildTopicIndex in src/lib/search).
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
      "client-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    // Default env is `node` (pure logic). Files that need a DOM opt in with a
    // `// @vitest-environment jsdom` docblock at the top (e.g. the audio
    // provider state-machine test).
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
  },
});
