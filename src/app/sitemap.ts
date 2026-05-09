import type { MetadataRoute } from "next";
import { allProjects } from "@/content/projects";
import { games } from "@/content/games";
import { galleryCollections } from "@/content/gallery";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";

// Stable timestamp computed at build time. Real `lastModified` per
// entry will land when content data carries explicit dates;
// returning `new Date()` per request makes crawlers think the whole
// site refreshes every minute and they de-weight the signal.
const BUILT_AT = new Date();

const STATIC_PATHS = [
  { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
  { path: "/projects", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/games", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/gallery", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.7 },
  { path: "/media", changeFrequency: "monthly" as const, priority: 0.5 },
  { path: "/resources", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly" as const, priority: 0.6 },
  { path: "/portal", changeFrequency: "yearly" as const, priority: 0.4 },
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

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = STATIC_PATHS.flatMap(({ path, changeFrequency, priority }) =>
    entry(path, changeFrequency, priority),
  );

  // Only include `ready` content in the sitemap so drafts and
  // placeholders don't get crawled before they have real bodies.
  const projectEntries = allProjects
    .filter((project) => project.contentStatus === "ready")
    .flatMap((project) => entry(`/projects/${project.slug}`, "monthly", 0.7));

  const gameEntries = games
    .filter((game) => game.status === "ready")
    .flatMap((game) => entry(`/games/${game.slug}`, "monthly", 0.5));

  const galleryEntries = galleryCollections
    .filter((collection) => collection.status === "ready")
    .flatMap((collection) =>
      entry(`/gallery/${collection.slug}`, "monthly", 0.6),
    );

  return [
    ...staticEntries,
    ...projectEntries,
    ...gameEntries,
    ...galleryEntries,
  ];
}
