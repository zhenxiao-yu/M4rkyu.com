import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// next-intl requires every key to exist in *both* locales (CLAUDE.md i18n
// contract). The repo enforced this by convention only; this test makes a
// missing/extra key a red build instead of a runtime "MISSING_MESSAGE".

const root = fileURLToPath(new URL("../../../", import.meta.url));

function load(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(`${root}messages/${locale}.json`, "utf8"));
}

/** Flatten to dot-paths, descending into objects (arrays are leaves). */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return prefix ? [prefix] : [];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    keyPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("messages locale parity", () => {
  const en = keyPaths(load("en")).sort();
  const zh = keyPaths(load("zh")).sort();
  const enSet = new Set(en);
  const zhSet = new Set(zh);

  it("has no keys in en.json missing from zh.json", () => {
    expect(en.filter((k) => !zhSet.has(k))).toEqual([]);
  });

  it("has no keys in zh.json missing from en.json", () => {
    expect(zh.filter((k) => !enSet.has(k))).toEqual([]);
  });
});
