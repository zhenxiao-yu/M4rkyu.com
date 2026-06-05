import { routing, type Locale } from "@/i18n/routing";

/**
 * Build canonical + hreflang `alternates` for a per-route
 * `generateMetadata` call.
 *
 * `path` is the locale-relative pathname starting with "/" (e.g.
 * "/work/nimbus"). The active locale's URL becomes the
 * canonical; all routing locales are emitted as `languages` for
 * `<link rel="alternate" hreflang="…">` tags. The active locale is
 * intentionally included in `languages` — Google recommends a
 * self-referential hreflang on every variant.
 *
 * Pass an empty string for the homepage.
 */
export function buildAlternates(
  locale: Locale,
  path: "" | `/${string}` = "",
) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((entry) => [entry, `/${entry}${path}`]),
      ),
      // x-default points crawlers at the default locale for any language
      // we don't explicitly target (Google's recommended catch-all).
      "x-default": `/${routing.defaultLocale}${path}`,
    } as Record<string, string>,
    types: {
      "application/rss+xml": "/feed.xml",
      "application/feed+json": "/feed.json",
    },
  };
}
