import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Latest — newest across the site — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function LatestOg() {
  return await renderOgImage({
    eyebrow: "LATEST",
    title: "Newest across the site",
    subtitle:
      "The most recent projects, games, notes, and gallery work — all in one feed.",
    footer: "m4rkyu.com/latest",
  });
}
