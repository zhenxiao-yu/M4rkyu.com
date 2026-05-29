import { notFound } from "next/navigation";
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";
import { resources } from "@/content/resources";
import { routing } from "@/i18n/routing";

export const alt = "Tool — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Only `tool` entries render an in-site page (links redirect to source),
// so OGs are pre-declared per (locale, tool slug) — matching the route's
// generateStaticParams. CJK glyphs come from the bundled Noto Sans SC
// subset in `renderOgImage`.
export function generateImageMetadata() {
  return resources
    .filter((resource) => resource.type === "tool")
    .flatMap((tool) =>
      routing.locales.map((locale) => ({
        id: `${locale}-${tool.slug}`,
        alt: `${tool.name} — tool`,
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
  const tool = resources.find(
    (resource) => resource.slug === slug && resource.type === "tool",
  );
  if (!tool) notFound();
  return await renderOgImage({
    eyebrow: "RESOURCES · TOOL",
    title: tool.name,
    subtitle: tool.description,
    footer: `m4rkyu.com / resources / ${tool.slug}`,
  });
}
