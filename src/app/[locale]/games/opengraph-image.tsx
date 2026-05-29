import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";

export const alt = "Games — playable archive — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function GamesOg() {
  return await renderOgImage({
    eyebrow: "GAME ARCHIVE",
    title: "Games & prototypes",
    subtitle:
      "Playable builds, jam entries, and experiments — mechanics, systems, and the making-of.",
    footer: "m4rkyu.com/games",
  });
}
