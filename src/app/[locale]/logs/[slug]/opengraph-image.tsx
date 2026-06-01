import { notFound } from "next/navigation";
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";
import { fetchDevtoArticles } from "@/lib/blog/devto";
import { DEVTO_USERNAME } from "@/lib/blog/get-posts";
import { routing } from "@/i18n/routing";

export const alt = "Field note — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// One branded card per (locale, slug). Reuses the cached dev.to article
// list (shared with the page + RelatedPosts via Next's data cache) so no
// extra upstream call, and only the listing-level title/description is
// needed — the full markdown body is never fetched for the image.
export async function generateImageMetadata() {
  const articles = await fetchDevtoArticles(DEVTO_USERNAME);
  return articles.flatMap((article) =>
    routing.locales.map((locale) => ({
      id: `${locale}-${article.slug}`,
      alt: `${article.title} — field note`,
      contentType: OG_CONTENT_TYPE,
      size: OG_IMAGE_SIZE,
    })),
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const articles = await fetchDevtoArticles(DEVTO_USERNAME);
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  return await renderOgImage({
    eyebrow: "FIELD NOTE · LOG",
    title: article.title,
    subtitle: article.description,
    footer: `m4rkyu.com / logs / ${slug}`,
  });
}
