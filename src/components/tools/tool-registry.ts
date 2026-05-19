// Server-safe registry: just the known tool slugs. The actual dynamic
// imports live in tool-renderer.tsx (client component) because Next 16
// disallows `ssr: false` from server-component import graphs.
//
// To add a tool: append the slug here AND add a branch in tool-renderer.tsx.

export const TOOL_SLUGS = [
  // CSS / design
  "contrast-checker",
  "color-converter",
  "shadow-generator",
  // dev utilities
  "json-formatter",
  "base64",
  "url-codec",
  "jwt-decoder",
  "uuid",
  "password-generator",
  "hash-generator",
  "px-rem",
  "case-converter",
  "slug",
  "lorem-ipsum",
  "timestamp",
  "word-counter",
  "base-converter",
  "html-entities",
] as const;

export type ToolSlug = (typeof TOOL_SLUGS)[number];

export function isToolSlug(value: string): value is ToolSlug {
  return (TOOL_SLUGS as readonly string[]).includes(value);
}
