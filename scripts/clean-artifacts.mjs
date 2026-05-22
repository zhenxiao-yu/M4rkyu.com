import { rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const targets = [
  ".next",
  ".next-build",
  ".next-dev-3000",
  ".next-node22",
  ".next-perf",
  ".next-rollout",
  ".next-rollout2",
  ".next-rollout3",
  ".next-shot",
  ".next-validate",
  "storybook-static",
  "test-results",
  "playwright-report",
  "coverage",
  "tmp-next-dev.err.log",
  "tmp-next-dev.log",
];

for (const target of targets) {
  const resolved = path.resolve(root, target);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`Refusing to remove path outside project: ${target}`);
  }

  try {
    await rm(resolved, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
    console.log(`cleaned ${target}`);
  } catch (error) {
    console.warn(`skipped ${target}: ${error.code ?? error.message}`);
  }
}
