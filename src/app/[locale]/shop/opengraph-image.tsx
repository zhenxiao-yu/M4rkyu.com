import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Shop — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage() {
  return await renderOgImage({
    eyebrow: "SHOP",
    title: "Editions & objects",
    subtitle: "Prints, posters, and digital goods. Secure checkout by Stripe.",
    footer: "m4rkyu.com / shop",
  });
}
