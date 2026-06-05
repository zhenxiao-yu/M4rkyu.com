import {
  siNextdotjs,
  siReact,
  siTypescript,
  siJavascript,
  siTailwindcss,
  siVite,
  siVercel,
  siThreedotjs,
  siGreensock,
  siChartdotjs,
  siAppwrite,
  siSupabase,
  siNodedotjs,
  siPython,
  siUnrealengine,
  siGodotengine,
  siUnity,
  siGooglegemini,
  siShadcnui,
  siRadixui,
  siFramer,
  siWebgl,
  siReactquery,
  siExpo,
  siPostgresql,
  siMongodb,
  siFirebase,
  type SimpleIcon,
} from "simple-icons";

// Tech-name → brand glyph map for the "Built with" panel. Icons render
// monochrome (currentColor) so the page keeps a single accent per the
// visual doctrine — we only consume the SVG `path`, never the brand hex.
// Unknown names resolve to `null` and render as a plain chip. Keys are
// normalized (lowercased, punctuation stripped); add aliases freely.

type TechGlyph = { title: string; path: string };

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

// Canonical glyphs, plus aliases pointing at the same icon. The flat
// `stack` strings in src/content/projects.ts drive these keys.
const ICONS: Record<string, SimpleIcon> = {
  // frameworks / libraries
  nextjs: siNextdotjs,
  next: siNextdotjs,
  react: siReact,
  reactjs: siReact,
  react19: siReact,
  typescript: siTypescript,
  ts: siTypescript,
  javascript: siJavascript,
  js: siJavascript,
  tailwindcss: siTailwindcss,
  tailwind: siTailwindcss,
  vite: siVite,
  vercel: siVercel,
  threejs: siThreedotjs,
  reactthreefiber: siThreedotjs,
  r3f: siThreedotjs,
  gsap: siGreensock,
  greensock: siGreensock,
  chartjs: siChartdotjs,
  appwrite: siAppwrite,
  supabase: siSupabase,
  nodejs: siNodedotjs,
  node: siNodedotjs,
  python: siPython,
  unrealengine: siUnrealengine,
  unrealengine4: siUnrealengine,
  unreal: siUnrealengine,
  godot: siGodotengine,
  godotengine: siGodotengine,
  unity: siUnity,
  gemini: siGooglegemini,
  googlegemini: siGooglegemini,
  shadcnui: siShadcnui,
  shadcn: siShadcnui,
  radixui: siRadixui,
  radix: siRadixui,
  framermotion: siFramer,
  framer: siFramer,
  motion: siFramer,
  webgl: siWebgl,
  tanstackquery: siReactquery,
  reactquery: siReactquery,
  expo: siExpo,
  postgresql: siPostgresql,
  postgres: siPostgresql,
  mongodb: siMongodb,
  mongo: siMongodb,
  firebase: siFirebase,
};

/** Resolve a brand glyph for a tech name, or null when none is mapped. */
export function techIcon(name: string): TechGlyph | null {
  const icon = ICONS[normalize(name)];
  return icon ? { title: icon.title, path: icon.path } : null;
}
