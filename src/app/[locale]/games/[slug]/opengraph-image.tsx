import { notFound } from "next/navigation";
import {
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderOgImage,
} from "@/lib/seo/og-image";
import { games, getGame } from "@/content/games";
import { routing } from "@/i18n/routing";

export const runtime = "edge";
export const alt = "Game archive entry — M4rkyu.com";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Same Latin-only constraint as the project OG: next/og's default
// font does not cover CJK, so the same render is reused per locale.
export function generateImageMetadata() {
  return games.flatMap((game) =>
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
  if (!game) notFound();
  return renderOgImage({
    eyebrow: "GAME ARCHIVE",
    title: game.title,
    subtitle: game.pitch,
    footer: `m4rkyu.com / games / ${game.slug}`,
  });
}
