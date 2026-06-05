import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  // visitor-local state paths — explicit per-locale disallow for crawlers that ignore wildcards.
  const savedPaths = routing.locales.map(
    (locale) => `/${locale}/archive/saved`,
  );

  // Privileged / personal areas. These already require auth and the
  // layouts emit `noindex`, but an explicit robots disallow is
  // defense-in-depth — listed both bare and per-locale for crawlers
  // that don't honour wildcards.
  const privatePaths = routing.locales.flatMap((locale) => [
    `/${locale}/admin`,
    `/${locale}/account`,
    `/${locale}/auth`,
  ]);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/auth/",
          ...privatePaths,
          ...savedPaths,
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
