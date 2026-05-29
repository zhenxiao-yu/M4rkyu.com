import { notFound } from "next/navigation";
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";
import { getGallerySource } from "@/lib/gallery/source";
import { routing } from "@/i18n/routing";

export const alt = "Gallery collection — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Pre-declare one OG per (locale, collection) so Next can statically
// generate at build time. CJK glyphs are supported via the bundled
// Noto Sans SC subset in `renderOgImage`.
export async function generateImageMetadata() {
  const { collections } = await getGallerySource();
  return collections.flatMap((collection) =>
    routing.locales.map((locale) => ({
      id: `${locale}-${collection.slug}`,
      alt: `${collection.title} — gallery`,
      contentType: OG_CONTENT_TYPE,
      size: OG_IMAGE_SIZE,
    })),
  );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const { collections } = await getGallerySource();
  const item = collections.find((entry) => entry.slug === collection);
  if (!item) notFound();
  return await renderOgImage({
    eyebrow: "VISUAL ARCHIVE",
    title: item.title,
    subtitle: item.description,
    footer: `m4rkyu.com / archive / ${item.slug}`,
  });
}
