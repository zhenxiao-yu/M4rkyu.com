import type { Locale } from "@/i18n/routing";
import type { Resource, Project } from "@/content/schemas";
import type { Product } from "@/content/shop";
import type { DevtoArticleListItem } from "@/lib/blog/devto";
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

// Blog graph for a feed index (e.g. /notes). Honest about structure:
// describes the feed itself; we don't mint fake per-item URLs for the
// microblog notes, which have no canonical detail page.
export function buildBlogJsonLd(
  locale: Locale,
  opts: { name: string; description: string; path: string },
) {
  const url = `${SITE_URL}/${locale}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: opts.name,
    description: opts.description,
    url,
    inLanguage: locale,
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

// BlogPosting graph for a single /logs/[slug] post. Logs are
// syndicated from dev.to, so the canonical entity points at the dev.to
// URL — matching the page's <link rel="canonical"> — to avoid claiming
// duplicate authorship of the original. We are a republished copy.
export function buildArticleJsonLd(
  post: DevtoArticleListItem,
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: post.canonical_url,
    mainEntityOfPage: { "@type": "WebPage", "@id": post.canonical_url },
    datePublished: post.published_at,
    inLanguage: locale,
    ...(post.cover_image ? { image: post.cover_image } : {}),
    ...(post.reading_time_minutes
      ? { timeRequired: `PT${post.reading_time_minutes}M` }
      : {}),
    keywords: post.tag_list.join(", "),
    author: { "@id": `${SITE_URL}/#person` },
    publisher: { "@id": `${SITE_URL}/#person` },
  };
}

// CreativeWork graph for a single /work/[slug] case study. First-party
// content (canonical = our site), so the entity URL is the in-site page.
export function buildProjectJsonLd(project: Project, locale: Locale) {
  const url = `${SITE_URL}/${locale}/work/${project.slug}`;
  const sameAs = [project.liveUrl, project.githubUrl].filter(
    (href): href is string => Boolean(href),
  );
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.seo.title,
    description: project.seo.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: locale,
    dateCreated: project.year,
    about: project.category,
    keywords: project.tags.join(", "),
    creator: { "@id": `${SITE_URL}/#person` },
    author: { "@id": `${SITE_URL}/#person` },
    ...(project.screenshots[0] ? { image: project.screenshots[0].src } : {}),
    ...(sameAs.length ? { sameAs } : {}),
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

// CollectionPage + ItemList for an aggregation page (e.g. a topic hub).
// `items` are absolute URLs already resolved by the caller (internal
// items get SITE_URL/locale-prefixed; external items pass through).
export function buildCollectionPageJsonLd(
  locale: Locale,
  opts: {
    name: string;
    description: string;
    path: string;
    items: Array<{ name: string; url: string }>;
  },
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}/${locale}${opts.path}`,
    inLanguage: locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
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
