import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";
import type { Product } from "@/content/shop";
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

// Product graph for a single /shop/[slug] page so search engines can
// render price + availability rich results. Money is integer cents in
// the catalog; schema.org wants a decimal string.
export function buildProductJsonLd(product: Product, locale: Locale) {
  const url = `${SITE_URL}/${locale}/shop/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.summary,
    category: product.category,
    ...(product.image ? { image: product.image.src } : {}),
    url,
    brand: { "@type": "Brand", name: "M4rkyu" },
    offers: {
      "@type": "Offer",
      url,
      price: (product.priceInCents / 100).toFixed(2),
      priceCurrency: product.currency.toUpperCase(),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#person` },
    },
  };
}

// BreadcrumbList for a detail page so search engines render the
// hierarchy in results. `trail` is ordered root→current; paths are
// locale-less (e.g. "/shop", "/shop/foo").
export function buildBreadcrumbJsonLd(
  locale: Locale,
  trail: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}/${locale}${crumb.path}`,
    })),
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
