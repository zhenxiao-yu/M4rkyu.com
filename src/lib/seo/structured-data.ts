import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";
import { SITE_URL } from "@/lib/seo/site";

export function buildSiteJsonLd(locale: Locale) {
  const localePath = `${SITE_URL}/${locale}`;
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: "ZhenXiao Mark Yu",
        alternateName: ["Mark Yu", "M4rkyu"],
        url: SITE_URL,
        jobTitle: [
          "Software Engineer",
          "Frontend Developer",
          "Game Developer",
          "Digital Artist",
        ],
        sameAs: [
          "https://github.com/zhenxiao-yu",
          "https://dev.to/zhenxiao_yu_a87bb6b2017f1",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "M4rkyu.com",
        url: localePath,
        inLanguage: locale,
        publisher: {
          "@id": personId,
        },
      },
      {
        "@type": "CreativeWork",
        "@id": `${SITE_URL}/#portfolio`,
        name: "M4rkyu.com Portfolio",
        url: localePath,
        inLanguage: locale,
        creator: {
          "@id": personId,
        },
        isPartOf: {
          "@id": websiteId,
        },
      },
    ],
  };
}

// SoftwareApplication graph for a single /resources/[slug] tool.
// Emitted in a <script type="application/ld+json"> on each tool route
// so search engines can render rich snippets ("Free", category, etc.).
export function buildToolJsonLd(resource: Resource, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: resource.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/${locale}/resources/${resource.slug}`,
    description: resource.description,
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    keywords: resource.tags.join(", "),
    author: { "@id": `${SITE_URL}/#person` },
  };
}

// ItemList of every ready, runnable tool. Emitted once on the
// /resources index so search engines understand the page hosts a
// curated tool collection.
export function buildToolsCollectionJsonLd(
  locale: Locale,
  tools: Resource[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Free in-browser developer tools",
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${locale}/resources/${tool.slug}`,
      name: tool.name,
    })),
  };
}
