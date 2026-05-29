import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Work — selected projects & case studies — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function WorkOg() {
  return await renderOgImage({
    eyebrow: "SELECTED WORK",
    title: "Projects & case studies",
    subtitle:
      "Shipped software, game UI, and interface systems — the build log behind each project.",
    footer: "m4rkyu.com/work",
  });
}
