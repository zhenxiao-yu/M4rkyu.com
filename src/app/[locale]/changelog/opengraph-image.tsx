import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Changelog — what shipped — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ChangelogOg() {
  return await renderOgImage({
    eyebrow: "CHANGELOG",
    title: "What shipped",
    subtitle:
      "A running log of releases, fixes, and additions across the site — dated and versioned.",
    footer: "m4rkyu.com/changelog",
  });
}
