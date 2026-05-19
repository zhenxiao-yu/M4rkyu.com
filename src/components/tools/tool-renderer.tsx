"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { isToolSlug, type ToolSlug } from "./tool-registry";

// Client-only dynamic imports. Each tool ships its own chunk; the
// index route loads zero tool JS until the visitor opens one. The
// `ssr: false` flag is required for client-only crypto / clipboard /
// color picker APIs and gives nothing up — these tools have no
// useful SSR'd state.

const RENDERERS: Record<ToolSlug, ComponentType> = {
  "contrast-checker": dynamic(
    () => import("./contrast-checker/Tool").then((m) => m.ContrastChecker),
    { ssr: false },
  ),
  "color-converter": dynamic(
    () => import("./color-converter/Tool").then((m) => m.ColorConverter),
    { ssr: false },
  ),
  "shadow-generator": dynamic(
    () => import("./shadow-generator/Tool").then((m) => m.ShadowGenerator),
    { ssr: false },
  ),
  "json-formatter": dynamic(
    () => import("./json-formatter/Tool").then((m) => m.JsonFormatter),
    { ssr: false },
  ),
  base64: dynamic(() => import("./base64/Tool").then((m) => m.Base64), {
    ssr: false,
  }),
  "url-codec": dynamic(
    () => import("./url-codec/Tool").then((m) => m.UrlCodec),
    { ssr: false },
  ),
  "jwt-decoder": dynamic(
    () => import("./jwt-decoder/Tool").then((m) => m.JwtDecoder),
    { ssr: false },
  ),
  uuid: dynamic(() => import("./uuid/Tool").then((m) => m.UuidGenerator), {
    ssr: false,
  }),
  "password-generator": dynamic(
    () => import("./password-generator/Tool").then((m) => m.PasswordGenerator),
    { ssr: false },
  ),
  "hash-generator": dynamic(
    () => import("./hash-generator/Tool").then((m) => m.HashGenerator),
    { ssr: false },
  ),
  "px-rem": dynamic(
    () => import("./px-rem/Tool").then((m) => m.PxRemConverter),
    { ssr: false },
  ),
  "case-converter": dynamic(
    () => import("./case-converter/Tool").then((m) => m.CaseConverter),
    { ssr: false },
  ),
  slug: dynamic(() => import("./slug/Tool").then((m) => m.SlugGenerator), {
    ssr: false,
  }),
  "lorem-ipsum": dynamic(
    () => import("./lorem-ipsum/Tool").then((m) => m.LoremIpsum),
    { ssr: false },
  ),
  timestamp: dynamic(
    () => import("./timestamp/Tool").then((m) => m.TimestampConverter),
    { ssr: false },
  ),
  "word-counter": dynamic(
    () => import("./word-counter/Tool").then((m) => m.WordCounter),
    { ssr: false },
  ),
  "base-converter": dynamic(
    () => import("./base-converter/Tool").then((m) => m.BaseConverter),
    { ssr: false },
  ),
  "html-entities": dynamic(
    () => import("./html-entities/Tool").then((m) => m.HtmlEntities),
    { ssr: false },
  ),
};

export function ToolRenderer({ slug }: { slug: string }) {
  if (!isToolSlug(slug)) return null;
  const Tool = RENDERERS[slug];
  return <Tool />;
}
