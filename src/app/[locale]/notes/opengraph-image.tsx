import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Notes — short updates, reviews & lists — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function NotesOg() {
  return await renderOgImage({
    eyebrow: "NOTES",
    title: "Updates, reviews & lists",
    subtitle:
      "Short, dated entries — reposts, reviews, tier lists, and quick takes from the studio.",
    footer: "m4rkyu.com/notes",
  });
}
