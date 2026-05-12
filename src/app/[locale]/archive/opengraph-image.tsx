import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "Gallery — visual archive — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ArchiveOg() {
  return await renderOgImage({
    eyebrow: "VISUAL ARCHIVE",
    title: "Contact sheet",
    subtitle:
      "Black-and-white photography, digital art, and contact sheets. Lightbox-ready frames, keyboard navigable.",
    footer: "m4rkyu.com/archive",
  });
}
