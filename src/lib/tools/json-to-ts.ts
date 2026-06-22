// Pure JSON → TypeScript interface inference, shared by the json-to-ts tool.
// No React, no DOM — unit-tested in tests/unit/tools/json-to-ts.test.ts.
//
// The public entry point is `jsonToTs(json, rootName)`. It NEVER throws: a
// malformed JSON string returns `{ ok: false, error }` with a stable error
// code the UI maps to a localized message. Inference handles nested objects,
// arrays (empty → `unknown[]`), `null` (folded into a `| null` union), and
// mixed-type arrays (merged into a union). Object shapes inside an array are
// structurally merged: keys present in some-but-not-all elements become
// optional.

/** Internal type-tree the renderer walks. */
type TS =
  | { kind: "primitive"; name: "string" | "number" | "boolean" }
  | { kind: "array"; inner: TS }
  | { kind: "object"; fields: Field[] }
  | { kind: "union"; members: TS[] }
  | { kind: "null" }
  | { kind: "unknown" };

interface Field {
  name: string;
  type: TS;
  optional: boolean;
}

/** Stable, locale-agnostic error codes. The UI maps these to messages. */
export type JsonToTsError = "syntax" | "empty";

export type JsonToTsResult =
  | { ok: true; output: string }
  | { ok: false; error: JsonToTsError };

/** Identifier rule for an interface name / safe object key. */
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Coerce an arbitrary string into a valid PascalCase TypeScript identifier.
 * Empty / all-invalid input falls back to `Root`, and a leading digit is
 * prefixed so the result always parses as an identifier.
 */
export function sanitizeInterfaceName(name: string, fallback = "Root"): string {
  const cleaned = name
    .trim()
    .replace(/[^A-Za-z0-9_$]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) =>
      i === 0 && /^[A-Za-z_$]/.test(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1),
    )
    .join("");
  if (!cleaned) return fallback;
  return IDENTIFIER.test(cleaned) ? cleaned : `_${cleaned}`;
}

/** True when `name` is already a valid identifier and needs no sanitizing. */
export function isValidIdentifier(name: string): boolean {
  return IDENTIFIER.test(name.trim());
}

function infer(value: unknown): TS {
  if (value === null) return { kind: "null" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: "array", inner: { kind: "unknown" } };
    return { kind: "array", inner: mergeAll(value.map(infer)) };
  }
  if (typeof value === "object") {
    const fields: Field[] = Object.entries(value as Record<string, unknown>).map(
      ([name, v]) => ({ name, type: infer(v), optional: false }),
    );
    return { kind: "object", fields };
  }
  if (typeof value === "string") return { kind: "primitive", name: "string" };
  if (typeof value === "number") return { kind: "primitive", name: "number" };
  if (typeof value === "boolean") return { kind: "primitive", name: "boolean" };
  return { kind: "unknown" };
}

function mergeAll(types: TS[]): TS {
  return types.reduce((acc, t) => merge(acc, t));
}

function merge(a: TS, b: TS): TS {
  if (a.kind === "unknown") return b;
  if (b.kind === "unknown") return a;
  if (a.kind === "null" && b.kind === "null") return a;
  if (
    a.kind === "primitive" &&
    b.kind === "primitive" &&
    a.name === b.name
  ) {
    return a;
  }
  if (a.kind === "array" && b.kind === "array") {
    return { kind: "array", inner: merge(a.inner, b.inner) };
  }
  if (a.kind === "object" && b.kind === "object") {
    const names = new Set([
      ...a.fields.map((f) => f.name),
      ...b.fields.map((f) => f.name),
    ]);
    const fields = Array.from(names).map<Field>((name) => {
      const fa = a.fields.find((f) => f.name === name);
      const fb = b.fields.find((f) => f.name === name);
      const type = fa && fb ? merge(fa.type, fb.type) : (fa?.type ?? fb!.type);
      return { name, type, optional: !fa || !fb || fa.optional || fb.optional };
    });
    return { kind: "object", fields };
  }
  return unionOf(a, b);
}

/** Flatten nested unions and de-dupe structurally-identical members. */
function unionOf(a: TS, b: TS): TS {
  const members: TS[] = [];
  const push = (t: TS) => {
    if (t.kind === "union") {
      t.members.forEach(push);
    } else if (!members.some((m) => sameShape(m, t))) {
      members.push(t);
    }
  };
  push(a);
  push(b);
  return members.length === 1 ? members[0] : { kind: "union", members };
}

function sameShape(a: TS, b: TS): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "primitive" && b.kind === "primitive") return a.name === b.name;
  if (a.kind === "array" && b.kind === "array") {
    return sameShape(a.inner, b.inner);
  }
  return a.kind === "null" || a.kind === "unknown";
}

function safeKey(name: string): string {
  return IDENTIFIER.test(name) ? name : JSON.stringify(name);
}

/** Order union members so `null` always trails (e.g. `string | null`). */
function orderUnion(members: TS[]): TS[] {
  return [...members].sort((x, y) => {
    if (x.kind === "null") return 1;
    if (y.kind === "null") return -1;
    return 0;
  });
}

function render(ts: TS, indent: number): string {
  const pad = "  ".repeat(indent);
  switch (ts.kind) {
    case "primitive":
      return ts.name;
    case "null":
      return "null";
    case "unknown":
      return "unknown";
    case "array": {
      const inner = render(ts.inner, indent);
      // Wrap unions so the `[]` binds to the whole union, not the last member.
      return ts.inner.kind === "union" ? `(${inner})[]` : `${inner}[]`;
    }
    case "union":
      return orderUnion(ts.members)
        .map((m) => render(m, indent))
        .join(" | ");
    case "object": {
      if (ts.fields.length === 0) return "Record<string, unknown>";
      const lines = ts.fields.map(
        (f) =>
          `${pad}  ${safeKey(f.name)}${f.optional ? "?" : ""}: ${render(
            f.type,
            indent + 1,
          )};`,
      );
      return `{\n${lines.join("\n")}\n${pad}}`;
    }
  }
}

/**
 * Infer a TypeScript `interface` (or `type` alias for non-object roots) from a
 * JSON sample. Total: malformed input returns `{ ok: false }` instead of
 * throwing, and an empty/whitespace string returns the `empty` code.
 */
export function jsonToTs(json: string, rootName: string): JsonToTsResult {
  if (!json.trim()) return { ok: false, error: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "syntax" };
  }

  const name = sanitizeInterfaceName(rootName);
  const tree = infer(parsed);

  if (tree.kind === "object") {
    return { ok: true, output: `interface ${name} ${render(tree, 0)}` };
  }
  // Non-object roots (array, primitive, null) can't be an `interface`, so emit
  // a `type` alias instead.
  return { ok: true, output: `type ${name} = ${render(tree, 0)};` };
}
