import { describe, expect, it } from "vitest";

import {
  buildSiteJsonLd,
  buildArticleJsonLd,
  buildProjectJsonLd,
  buildBlogJsonLd,
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "@/lib/seo/structured-data";
import { SITE_URL } from "@/lib/seo/site";
import type { Project } from "@/content/schemas";
import type { DevtoArticleListItem } from "@/lib/blog/devto";

describe("buildSiteJsonLd", () => {
  const graph = buildSiteJsonLd("en")["@graph"];

  it("emits a connected Person + WebSite + CreativeWork graph", () => {
    const types = graph.map((n) => (n as { "@type": string })["@type"]);
    expect(types).toEqual(["Person", "WebSite", "CreativeWork"]);
  });

  it("exposes a SearchAction sitelinks searchbox on the WebSite", () => {
    const website = graph[1] as {
      potentialAction: { "@type": string; target: { urlTemplate: string } };
    };
    expect(website.potentialAction["@type"]).toBe("SearchAction");
    expect(website.potentialAction.target.urlTemplate).toBe(
      `${SITE_URL}/en/search?q={search_term_string}`,
    );
  });
});

describe("buildArticleJsonLd", () => {
  const post = {
    title: "Data Quality",
    description: "why it matters",
    slug: "data-quality",
    canonical_url: "https://dev.to/markyu/data-quality",
    cover_image: "https://img/cover.png",
    published_at: "2024-10-16T00:00:00Z",
    reading_time_minutes: 6,
    tag_list: ["database", "datascience"],
  } as unknown as DevtoArticleListItem;

  it("is a BlogPosting whose canonical entity points at dev.to (no duplicate authorship)", () => {
    const ld = buildArticleJsonLd(post, "en") as Record<string, unknown>;
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.url).toBe(post.canonical_url);
    expect((ld.mainEntityOfPage as { "@id": string })["@id"]).toBe(
      post.canonical_url,
    );
    expect(ld.datePublished).toBe(post.published_at);
    expect(ld.image).toBe(post.cover_image);
    expect(ld.timeRequired).toBe("PT6M");
  });
});

describe("buildProjectJsonLd", () => {
  const project = {
    title: "Nimbus",
    slug: "nimbus",
    year: "2026",
    category: "web-app",
    tags: ["weather"],
    seo: { title: "Nimbus — weather", description: "a weather app" },
    screenshots: [{ src: "/cover.svg", alt: "cover" }],
    liveUrl: "https://nimbus.app",
    githubUrl: "https://github.com/x/nimbus",
  } as unknown as Project;

  it("is a first-party CreativeWork with in-site URL and sameAs links", () => {
    const ld = buildProjectJsonLd(project, "en") as Record<string, unknown>;
    expect(ld["@type"]).toBe("CreativeWork");
    expect(ld.url).toBe(`${SITE_URL}/en/work/nimbus`);
    expect(ld.sameAs).toEqual([
      "https://nimbus.app",
      "https://github.com/x/nimbus",
    ]);
    expect(ld.image).toBe("/cover.svg");
  });

  it("omits sameAs when there are no external links", () => {
    const ld = buildProjectJsonLd(
      { ...project, liveUrl: undefined, githubUrl: undefined } as Project,
      "en",
    ) as Record<string, unknown>;
    expect(ld.sameAs).toBeUndefined();
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers the trail and builds locale-prefixed item URLs", () => {
    const ld = buildBreadcrumbJsonLd("zh", [
      { name: "Work", path: "/work" },
      { name: "Nimbus", path: "/work/nimbus" },
    ]) as { itemListElement: Array<Record<string, unknown>> };
    expect(ld.itemListElement).toHaveLength(2);
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].item).toBe(`${SITE_URL}/zh/work/nimbus`);
  });
});

describe("buildBlogJsonLd / buildCollectionPageJsonLd", () => {
  it("Blog describes the feed at a locale URL", () => {
    const ld = buildBlogJsonLd("en", {
      name: "Notes",
      description: "feed",
      path: "/notes",
    }) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Blog");
    expect(ld.url).toBe(`${SITE_URL}/en/notes`);
  });

  it("CollectionPage wraps an ItemList with a correct count", () => {
    const ld = buildCollectionPageJsonLd("en", {
      name: "Topic",
      description: "d",
      path: "/topics/css",
      items: [
        { name: "a", url: "https://x/a" },
        { name: "b", url: "https://x/b" },
      ],
    }) as { mainEntity: { numberOfItems: number; itemListElement: unknown[] } };
    expect(ld.mainEntity.numberOfItems).toBe(2);
    expect(ld.mainEntity.itemListElement).toHaveLength(2);
  });
});
