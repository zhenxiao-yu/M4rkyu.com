import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  // /<locale>/gallery/saved is visitor-local state (localStorage-driven)
  // and not meaningful to crawl. Emit one explicit disallow per locale
  // so non-Google crawlers (which often don't honor the leading-slash
  // wildcard form) skip the path deterministically.
  const savedPaths = routing.locales.map(
    (locale) => `/${locale}/gallery/saved`,
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...savedPaths],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
