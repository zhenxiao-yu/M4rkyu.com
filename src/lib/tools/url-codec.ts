// Pure URL encode/decode logic shared by the url-codec tool. No React, no
// DOM — unit-tested in tests/unit/tools/url-codec.test.ts.
//
// `encodeURIComponent` never throws, but `decodeURIComponent` / `decodeURI`
// throw `URIError` on malformed input (a lone `%`, `%zz`, a truncated
// `%E0`…). We catch that here and return a typed result so the UI can show a
// localized error instead of crashing.

export type CodecMode = "encode" | "decode";

/**
 * `component` → `encodeURIComponent` / `decodeURIComponent` (escapes
 * reserved chars like `&`, `?`, `/`). `uri` → `encodeURI` / `decodeURI`
 * (leaves a full URI's structural chars intact).
 */
export type CodecScope = "component" | "uri";

export type CodecResult =
  | { ok: true; output: string; empty: boolean }
  | { ok: false; reason: "malformed" };

/**
 * Run a single encode/decode pass. Empty input is a valid, non-error state
 * (`empty: true`); malformed decode input yields `{ ok: false }` rather than
 * throwing.
 */
export function runUrlCodec(
  input: string,
  mode: CodecMode,
  scope: CodecScope,
): CodecResult {
  if (input === "") return { ok: true, output: "", empty: true };
  try {
    let output: string;
    if (mode === "encode") {
      output = scope === "component" ? encodeURIComponent(input) : encodeURI(input);
    } else {
      output = scope === "component" ? decodeURIComponent(input) : decodeURI(input);
    }
    return { ok: true, output, empty: false };
  } catch {
    // Only decode throws (URIError); encode is total.
    return { ok: false, reason: "malformed" };
  }
}
