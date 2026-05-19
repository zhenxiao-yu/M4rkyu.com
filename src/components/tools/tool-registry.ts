import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Tool registry — each slug maps to a lazily-loaded client component.
// Adding a tool: drop a Tool.tsx into src/components/tools/[name]/,
// add a `type: "tool"` entry in src/content/resources.ts with a
// matching slug, then register here. The route at /resources/[slug]
// reads from this map.
//
// dynamic() with { ssr: false } keeps each tool in its own chunk so
// the index route loads zero tool JS until a visitor opens one.
export const TOOL_REGISTRY: Record<string, ComponentType> = {
  "contrast-checker": dynamic(
    () =>
      import("./contrast-checker/Tool").then((mod) => mod.ContrastChecker),
    { ssr: false },
  ),
  "color-converter": dynamic(
    () => import("./color-converter/Tool").then((mod) => mod.ColorConverter),
    { ssr: false },
  ),
  "shadow-generator": dynamic(
    () =>
      import("./shadow-generator/Tool").then((mod) => mod.ShadowGenerator),
    { ssr: false },
  ),
};

export const TOOL_SLUGS = Object.keys(TOOL_REGISTRY);
