import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// The tool components are dynamically imported with `ssr: false`, so a missing
// next-intl key never surfaces during build — only at client render, as a
// runtime "MISSING_MESSAGE". This static check parses every Tool.tsx for its
// `useTranslations("Tools.X")` bindings and asserts each `t("…")` /
// `t(`prefix.${…}`)` key it references exists in messages/en.json. It is the
// regression guard that lets the 44-tool i18n surface stay honest.

const root = fileURLToPath(new URL("../../../", import.meta.url));

function flatten(value: unknown, prefix: string, out: Set<string>): void {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    if (prefix) out.add(prefix);
    return;
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    flatten(v, prefix ? `${prefix}.${k}` : k, out);
  }
}

const messages = JSON.parse(
  readFileSync(`${root}messages/en.json`, "utf8"),
) as Record<string, unknown>;
const keyPaths = new Set<string>();
flatten(messages, "", keyPaths);

function toolFiles(): string[] {
  const base = `${root}src/components/tools`;
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => `${base}/${d.name}/Tool.tsx`);
}

describe("tool i18n keys resolve in messages/en.json", () => {
  const files = toolFiles();

  for (const file of files) {
    let src: string;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue; // not every dir has a Tool.tsx in this exact shape
    }
    if (!src.includes("useTranslations")) continue;

    it(file.replace(root, ""), () => {
      // Map translator variable -> namespace, e.g. const t = useTranslations("Tools.base64")
      const bindings = new Map<string, string>();
      const bindRe =
        /const\s+(\w+)\s*=\s*useTranslations\(\s*["']([\w.]+)["']\s*\)/g;
      for (const m of src.matchAll(bindRe)) bindings.set(m[1], m[2]);
      if (bindings.size === 0) return;

      const vars = [...bindings.keys()].sort((a, b) => b.length - a.length);
      const missing: string[] = [];

      // Static keys: t("a.b.c")
      const staticRe = new RegExp(
        `\\b(${vars.join("|")})\\(\\s*["']([^"'$\\\`]+)["']`,
        "g",
      );
      for (const m of src.matchAll(staticRe)) {
        const ns = bindings.get(m[1])!;
        const full = `${ns}.${m[2]}`;
        if (!keyPaths.has(full)) missing.push(full);
      }

      // Dynamic keys: t(`prefix.${…}`) — assert the prefix object exists.
      const dynRe = new RegExp(
        "\\b(" + vars.join("|") + ")\\(\\s*`([^`$]*)\\$\\{",
        "g",
      );
      for (const m of src.matchAll(dynRe)) {
        const ns = bindings.get(m[1])!;
        const prefix = m[2].replace(/\.$/, "");
        if (!prefix) continue; // t(`${x}`) — nothing to verify
        const needle = `${ns}.${prefix}.`;
        const exists = [...keyPaths].some((k) => k.startsWith(needle));
        if (!exists) missing.push(`${ns}.${prefix}.* (dynamic)`);
      }

      expect(missing).toEqual([]);
    });
  }
});
