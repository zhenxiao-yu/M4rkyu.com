import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Resources — in-browser tools — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ResourcesToolsOg() {
  return await renderOgImage({
    eyebrow: "RESOURCES · TOOLS",
    title: "In-browser tools",
    subtitle:
      "Small, fast utilities that run client-side — no install, no account, no tracking.",
    footer: "m4rkyu.com/resources/tools",
  });
}
