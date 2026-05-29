import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Resources — tools & links — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ResourcesOg() {
  return await renderOgImage({
    eyebrow: "RESOURCES",
    title: "Tools & links",
    subtitle:
      "In-browser tools and a curated reference shelf — the kit behind the work, free to use.",
    footer: "m4rkyu.com/resources",
  });
}
