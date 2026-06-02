import type { MetadataRoute } from "next";
import { getProjectsSource } from "@/lib/projects/source";
import { getShopProductsSource } from "@/lib/shop/source";
import { games } from "@/content/games";
import { galleryCollections } from "@/content/gallery";
import { resources } from "@/content/resources";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";
import { getAllPostSlugs } from "@/lib/blog/get-post";
import { getAllTopics } from "@/lib/search/topics";

// Stable build-time timestamp — per-request `new Date()` would make crawlers de-weight the signal.
const BUILT_AT = new Date();

const STATIC_PATHS = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/work", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/games", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/archive", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/logs", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/media", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/shop", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/notes", changeFrequency: "weekly" as const, priority: 0.6 },
  { path: "/search", changeFrequency: "monthly" as const, priority: 0.4 },
  { path: "/topics", changeFrequency: "weekly" as const, priority: 0.5 },
  { path: "/resources", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/resources/tools", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/resources/links", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.6 },
];

function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`]),
  );
}

function entry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
) {
  const languages = languageAlternates(path);
  return routing.locales.map<MetadataRoute.Sitemap[number]>(
    (locale: Locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: BUILT_AT,
      changeFrequency,
      priority,
      alternates: { languages },
    }),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.flatMap(({ path, changeFrequency, priority }) =>
    entry(path, changeFrequency, priority),
  );

  // Only include `ready` content in the sitemap so drafts and
  // placeholders don't get crawled before they have real bodies.
  const allProjects = await getProjectsSource();
  const projectEntries = allProjects
    .filter((project) => project.contentStatus === "ready")
    .flatMap((project) => entry(`/work/${project.slug}`, "monthly", 0.7));

  const gameEntries = games
    .filter((game) => game.status === "ready")
    .flatMap((game) => entry(`/games/${game.slug}`, "monthly", 0.5));

  const galleryEntries = galleryCollections
    .filter((collection) => collection.status === "ready")
    .flatMap((collection) =>
      entry(`/archive/${collection.slug}`, "monthly", 0.6),
    );

  // Phase 8.2 — dev.to-syndicated post slugs land in the sitemap
  // so the in-site /logs/[slug] route is discoverable. The page
  // itself sets `alternates.canonical` to the dev.to URL so search
  // engines treat dev.to as the source of truth.
  const blogSlugs = await getAllPostSlugs();
  const blogEntries = blogSlugs.flatMap((slug) =>
    entry(`/logs/${slug}`, "weekly", 0.6),
  );

  // Per-tool routes — every ready, runnable tool is its own URL and
  // earns a sitemap entry so SoftwareApplication snippets index. Stays
  // below the /resources index (0.6) at 0.5 so the index page remains
  // the canonical entry point.
  const toolEntries = resources
    .filter((resource) => resource.type === "tool" && resource.status === "ready")
    .flatMap((tool) => entry(`/resources/${tool.slug}`, "monthly", 0.5));

  // Shop products — DB-first source (ready-only), so each live product
  // is its own crawlable URL alongside the /shop index.
  const products = await getShopProductsSource();
  const shopEntries = products
    .filter((product) => product.status === "ready")
    .flatMap((product) => entry(`/shop/${product.slug}`, "monthly", 0.5));

  // Cross-domain topic hubs — one indexable URL per tag shared by >= 2
  // ready items. Built from the same static catalog the page route uses.
  const topicEntries = getAllTopics().flatMap((topic) =>
    entry(`/topics/${topic.slug}`, "weekly", 0.4),
  );

  return [
    ...staticEntries,
    ...projectEntries,
    ...gameEntries,
    ...galleryEntries,
    ...blogEntries,
    ...toolEntries,
    ...shopEntries,
    ...topicEntries,
  ];
}
