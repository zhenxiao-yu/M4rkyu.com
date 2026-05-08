import type { Metadata } from "next";
import { ArchiveCard } from "@/components/cards/archive-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { games } from "@/content/games";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Games",
  description: "Draft game-development archive for M4rkyu.com.",
};

export default async function GamesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-35" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <SectionHeading
            eyebrow="game systems"
            title="Games"
            description="Draft game archive for prototypes, Unreal studies, and future interactive work. All uncertain details are marked TBD or Placeholder."
          />
          <PlaceholderVideo label="GAME REEL TBD" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {games.map((game) => (
            <ArchiveCard
              key={game.slug}
              title={game.title}
              description={game.pitch}
              eyebrow={game.engine}
              status={game.status}
              href={`/games/${game.slug}`}
              locale={locale}
              mediaLabel="GAME CAPTURE TBD"
            />
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Card className="bg-card/80">
          <CardHeader>
            <Badge variant="warning">Draft</Badge>
            <CardTitle>Game-page acceptance notes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm leading-6 text-muted-foreground md:grid-cols-3">
            <p>No WebGL is loaded on this route.</p>
            <p>Gameplay media is represented by static placeholder frames.</p>
            <p>Final engine details and claims remain TBD until verified.</p>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
