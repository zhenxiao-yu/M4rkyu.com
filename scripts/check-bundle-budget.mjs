// Client-bundle regression guardrail.
//
// Next 16 builds with Turbopack, which (a) no longer prints the classic
// "First Load JS" table and (b) does not emit a per-route webpack chunk
// manifest — every route's build-manifest shares the same `rootMainFiles`.
// So per-route first-load budgets aren't reliably derivable from static
// output anymore. What IS stable and high-leverage is the *shared baseline*
// that loads on every route, plus the total emitted client JS.
//
// This script measures both (gzipped) from an existing production build and
// compares them against a committed baseline (scripts/bundle-baseline.json).
// It fails when either grows past the tolerance — catching "someone pulled a
// heavy dep into the shared graph" before it ships. Run `--update` to record
// a new intentional baseline.
//
// Usage:
//   node scripts/check-bundle-budget.mjs [--dist=.next-budgets] [--update] [--tolerance=10]
//
// Typically via npm: `npm run budget:build` (build) then `npm run budget`.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

const root = process.cwd();
const args = process.argv.slice(2);
const getFlag = (name) =>
  args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const getValue = (name, fallback) => {
  const flag = getFlag(name);
  if (!flag) return fallback;
  const [, value] = flag.split("=");
  return value ?? fallback;
};

const distDir =
  getValue("dist", process.env.NEXT_DIST_DIR ?? ".next-budgets");
const shouldUpdate = Boolean(getFlag("update"));
const baselinePath = path.resolve(root, "scripts/bundle-baseline.json");

const distPath = path.resolve(root, distDir);
if (!existsSync(path.join(distPath, "build-manifest.json"))) {
  console.error(
    `✗ No build found in "${distDir}". Run a production build first ` +
      `(e.g. \`npm run budget:build\`).`,
  );
  process.exit(1);
}

const KB = 1024;
const toKB = (bytes) => Number((bytes / KB).toFixed(1));
const gzipBytes = (file) => {
  try {
    return gzipSync(readFileSync(path.join(distPath, file))).length;
  } catch {
    return 0;
  }
};

// Shared baseline: rootMainFiles + polyfills load on every route.
const buildManifest = JSON.parse(
  readFileSync(path.join(distPath, "build-manifest.json"), "utf8"),
);
const sharedFiles = [
  ...(buildManifest.rootMainFiles ?? []),
  ...(buildManifest.polyfillFiles ?? []),
];
const sharedBaselineKB = toKB(
  sharedFiles.reduce((sum, f) => sum + gzipBytes(f), 0),
);

// Total emitted client JS — a coarse signal for "how much JS exists" that
// catches a large new dependency even when it lands in a lazy chunk.
let totalBytes = 0;
let chunkCount = 0;
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js"))
      (totalBytes += gzipSync(readFileSync(full)).length), chunkCount++;
  }
};
walk(path.join(distPath, "static", "chunks"));
const totalClientJsKB = toKB(totalBytes);

const current = { sharedBaselineKB, totalClientJsKB };

if (shouldUpdate || !existsSync(baselinePath)) {
  const tolerancePct = Number(
    getValue(
      "tolerance",
      existsSync(baselinePath)
        ? JSON.parse(readFileSync(baselinePath, "utf8")).tolerancePct
        : 10,
    ),
  );
  const baseline = {
    ...current,
    tolerancePct,
    chunkCount,
    note: "Gzipped. Regenerate with `npm run budget:update` after an intentional size change.",
  };
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + "\n");
  console.log(
    `${existsSync(baselinePath) ? "Updated" : "Wrote"} baseline → scripts/bundle-baseline.json`,
  );
  console.log(
    `  shared baseline: ${sharedBaselineKB} KB · total client JS: ${totalClientJsKB} KB (${chunkCount} chunks)`,
  );
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const tolerancePct = Number(getValue("tolerance", baseline.tolerancePct ?? 10));

const metrics = [
  { key: "sharedBaselineKB", label: "Shared baseline (every route)" },
  { key: "totalClientJsKB", label: "Total client JS (all chunks)" },
];

let failed = false;
const rows = metrics.map(({ key, label }) => {
  const now = current[key];
  const base = baseline[key] ?? now;
  const limit = Number((base * (1 + tolerancePct / 100)).toFixed(1));
  const deltaPct = base ? ((now - base) / base) * 100 : 0;
  const ok = now <= limit;
  if (!ok) failed = true;
  return { label, now, base, limit, deltaPct, ok };
});

console.log(
  `Bundle budget · gzipped · tolerance ±${tolerancePct}% · dist "${distDir}"\n`,
);
for (const r of rows) {
  const arrow = r.deltaPct > 0 ? "+" : "";
  console.log(
    `${r.ok ? "✓" : "✗"} ${r.label.padEnd(32)} ${String(r.now).padStart(8)} KB` +
      `  (baseline ${r.base} KB, limit ${r.limit} KB, ${arrow}${r.deltaPct.toFixed(1)}%)`,
  );
}

if (failed) {
  console.error(
    `\n✗ Client bundle grew past the ${tolerancePct}% tolerance. ` +
      `If this growth is intentional, run \`npm run budget:update\` to rebase.`,
  );
  process.exit(1);
}
console.log("\n✓ Within budget.");
