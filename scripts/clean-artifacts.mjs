import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

// Non-`.next` artifacts.
const staticTargets = [
  "storybook-static",
  "test-results",
  "playwright-report",
  "coverage",
  "tmp-next-dev.err.log",
  "tmp-next-dev.log",
];

// Every Next build dir: `.next` plus the `.next-*` variants (dev ports, verify
// and rollout runs, isolated NEXT_DIST_DIRs, …) that accumulate across
// sessions. Matched dynamically so the list never goes stale and grows to GBs.
let nextDirs = [];
try {
  const entries = await readdir(root, { withFileTypes: true });
  nextDirs = entries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        (entry.name === ".next" || entry.name.startsWith(".next-")),
    )
    .map((entry) => entry.name);
} catch {
  // readdir failed (unlikely at the repo root) — fall through with no dirs.
}

const targets = [...nextDirs, ...staticTargets];

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
