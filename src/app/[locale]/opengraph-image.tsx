import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "M4rkyu.com — software, games, art";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Both /en and /zh share the same image; the expanded social card
// lands the visitor on the correct locale. CJK glyphs are supported
// via the bundled Noto Sans SC subset in `renderOgImage`.
export default async function OpengraphImage() {
  return await renderOgImage({
    eyebrow: "M4RKYU.COM · 2027",
    title: "Software · Games · Digital Art",
    subtitle:
      "ZhenXiao Mark Yu — engineering, game development, and visual systems.",
  });
}
