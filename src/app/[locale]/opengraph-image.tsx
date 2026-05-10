import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "M4rkyu.com — software, games, art";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// OG content is Latin-only because next/og's default font does not
// cover CJK glyphs. Both /en and /zh share the same image; the
// expanded social card lands the visitor on the correct locale.
export default async function OpengraphImage() {
  return renderOgImage({
    eyebrow: "M4RKYU.COM · 2027",
    title: "Software · Games · Digital Art",
    subtitle:
      "ZhenXiao Mark Yu — engineering, game development, and visual systems.",
  });
}
