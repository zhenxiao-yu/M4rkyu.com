"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { isToolSlug, type ToolSlug } from "./tool-registry";

// Client-only dynamic imports. Each tool ships its own chunk; the
// index route loads zero tool JS until the visitor opens a tool.
// `ssr: false` is required because the tools use browser-only APIs
// (clipboard, color picker, native range input live preview) and
// gain nothing from SSR'd markup.
const RENDERERS: Record<ToolSlug, ComponentType> = {
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

export function ToolRenderer({ slug }: { slug: string }) {
  if (!isToolSlug(slug)) return null;
  const Tool = RENDERERS[slug];
  return <Tool />;
}
