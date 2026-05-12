import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Contact — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ContactOg() {
  return await renderOgImage({
    eyebrow: "COLLABORATION",
    title: "Project inquiry",
    subtitle:
      "Frontend systems, app prototypes, game UI. Reply usually within a couple of working days.",
    footer: "m4rkyu.com/contact",
  });
}
