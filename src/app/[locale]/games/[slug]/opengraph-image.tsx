import { notFound } from "next/navigation";
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";
import { games, getGame } from "@/content/games";
import { routing } from "@/i18n/routing";

export const alt = "Game archive entry — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Pre-declare one OG per (locale, slug) so Next can statically
// generate at build time. CJK glyphs are supported via the bundled
// Noto Sans SC subset in `renderOgImage`.
export function generateImageMetadata() {
  // Only ready games have public detail pages, so only they get an OG card.
  return games
    .filter((game) => game.status === "ready")
    .flatMap((game) =>
      routing.locales.map((locale) => ({
        id: `${locale}-${game.slug}`,
        alt: `${game.title} — game archive`,
        contentType: OG_CONTENT_TYPE,
        size: OG_IMAGE_SIZE,
      })),
    );
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game || game.status !== "ready") notFound();
  return await renderOgImage({
    eyebrow: "GAME ARCHIVE",
    title: game.title,
    subtitle: game.pitch,
    footer: `m4rkyu.com / games / ${game.slug}`,
  });
}
