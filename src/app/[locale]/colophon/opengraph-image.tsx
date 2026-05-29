import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Colophon — how this site is built — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ColophonOg() {
  return await renderOgImage({
    eyebrow: "COLOPHON",
    title: "How this site is built",
    subtitle:
      "The stack and tooling behind m4rkyu.com — Next.js, React, Tailwind, Supabase, and more.",
    footer: "m4rkyu.com/colophon",
  });
}
