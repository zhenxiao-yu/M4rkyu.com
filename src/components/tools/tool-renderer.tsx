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
  gradient: dynamic(
    () => import("./gradient/Tool").then((m) => m.GradientGenerator),
    { ssr: false },
  ),
  "css-triangle": dynamic(
    () => import("./css-triangle/Tool").then((m) => m.CssTriangle),
    { ssr: false },
  ),
  bezier: dynamic(() => import("./bezier/Tool").then((m) => m.CubicBezier), {
    ssr: false,
  }),
  glassmorphism: dynamic(
    () => import("./glassmorphism/Tool").then((m) => m.Glassmorphism),
    { ssr: false },
  ),
  "border-radius": dynamic(
    () => import("./border-radius/Tool").then((m) => m.BorderRadius),
    { ssr: false },
  ),
  "box-model": dynamic(
    () => import("./box-model/Tool").then((m) => m.BoxModel),
    { ssr: false },
  ),
  "color-palette": dynamic(
    () => import("./color-palette/Tool").then((m) => m.ColorPalette),
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
  "utm-builder": dynamic(
    () => import("./utm-builder/Tool").then((m) => m.UtmBuilder),
    { ssr: false },
  ),
  "cron-explainer": dynamic(
    () => import("./cron-explainer/Tool").then((m) => m.CronExplainer),
    { ssr: false },
  ),
  "http-status": dynamic(
    () => import("./http-status/Tool").then((m) => m.HttpStatus),
    { ssr: false },
  ),
  "mime-finder": dynamic(
    () => import("./mime-finder/Tool").then((m) => m.MimeFinder),
    { ssr: false },
  ),
  "regex-tester": dynamic(
    () => import("./regex-tester/Tool").then((m) => m.RegexTester),
    { ssr: false },
  ),
  "text-diff": dynamic(
    () => import("./text-diff/Tool").then((m) => m.TextDiff),
    { ssr: false },
  ),
  "csv-json": dynamic(
    () => import("./csv-json/Tool").then((m) => m.CsvJson),
    { ssr: false },
  ),
  "json-to-ts": dynamic(
    () => import("./json-to-ts/Tool").then((m) => m.JsonToTs),
    { ssr: false },
  ),
  "sql-formatter": dynamic(
    () => import("./sql-formatter/Tool").then((m) => m.SqlFormatter),
    { ssr: false },
  ),
  morse: dynamic(() => import("./morse/Tool").then((m) => m.Morse), {
    ssr: false,
  }),
  "ascii-art": dynamic(
    () => import("./ascii-art/Tool").then((m) => m.AsciiArt),
    { ssr: false },
  ),
  roman: dynamic(() => import("./roman/Tool").then((m) => m.RomanNumeral), {
    ssr: false,
  }),
  "random-number": dynamic(
    () => import("./random-number/Tool").then((m) => m.RandomNumber),
    { ssr: false },
  ),
};

export function ToolRenderer({ slug }: { slug: string }) {
  if (!isToolSlug(slug)) return null;
  const Tool = RENDERERS[slug];
  return <Tool />;
}
