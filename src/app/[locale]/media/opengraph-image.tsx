import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Media — video, reels & posters — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function MediaOg() {
  return await renderOgImage({
    eyebrow: "MEDIA",
    title: "Video, reels & posters",
    subtitle:
      "Motion work, short reels, and printed pieces — added as content ships.",
    footer: "m4rkyu.com/media",
  });
}
