import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "About — ZhenXiao Mark Yu — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function AboutOg() {
  return await renderOgImage({
    eyebrow: "ABOUT",
    title: "ZhenXiao Mark Yu",
    subtitle:
      "Engineer and maker — software, game development, and visual systems. The person behind the work.",
    footer: "m4rkyu.com/about",
  });
}
