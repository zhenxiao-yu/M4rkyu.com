import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { MediaFrame } from "@/components/placeholders/media-frame";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { games } from "@/content/games";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function generateStaticParams() {
  return games.flatMap((game) => [
    { locale: "en", slug: game.slug },
    { locale: "zh", slug: game.slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  return {
    title: game ? game.title : "Game",
    description: game ? game.pitch : "Draft game archive page.",
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) notFound();

  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/games" locale={locale} className="text-sm text-muted-foreground hover:text-foreground">
          / games
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_24rem]">
          <SectionHeading eyebrow="game archive" title={game.title} description={game.pitch} />
          <Card className="bg-card/80">
            <CardHeader>
              <DraftBadge label={game.status} />
              <CardTitle>Build facts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground">
              <p>Engine: {game.engine}</p>
              <p>Year: {game.year}</p>
              <p>Role: {game.role}</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <MediaFrame eyebrow="gameplay" label="CAPTURE TBD">
            <PlaceholderVideo label="GAMEPLAY VIDEO TBD" />
          </MediaFrame>
          <Card className="bg-card/80">
            <CardHeader>
              <Badge variant="outline">Design notes</Badge>
              <CardTitle>Content pending</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-sm leading-6 text-muted-foreground">
                {game.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
