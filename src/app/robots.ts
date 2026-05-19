import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  // visitor-local state paths — explicit per-locale disallow for crawlers that ignore wildcards.
  const savedPaths = routing.locales.map(
    (locale) => `/${locale}/archive/saved`,
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
