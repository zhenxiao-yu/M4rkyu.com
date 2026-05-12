import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const runtime = "edge";
export const alt = "Logs — writing and devlog — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function LogsOg() {
  return await renderOgImage({
    eyebrow: "FIELD NOTES",
    title: "Writing & devlog",
    subtitle:
      "Short, dated, opinionated. Engineering notes, devlog entries, and process essays — added as content ships.",
    footer: "m4rkyu.com/logs",
  });
}
