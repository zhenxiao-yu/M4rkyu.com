import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Resources — curated links — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ResourcesLinksOg() {
  return await renderOgImage({
    eyebrow: "RESOURCES · LINKS",
    title: "Curated links",
    subtitle:
      "A reference shelf of docs, guides, and tools worth bookmarking — the sources I actually use.",
    footer: "m4rkyu.com/resources/links",
  });
}
