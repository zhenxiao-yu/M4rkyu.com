import { ArrowRight, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/sections/hero-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProjectCard } from "@/components/cards/project-card";
import { ArchiveCard } from "@/components/cards/archive-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { PlaceholderVideo } from "@/components/placeholders/placeholder-video";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { featuredProjects } from "@/content/projects";
import { galleryCollections, galleryItems } from "@/content/gallery";
import { resources } from "@/content/resources";
import { posts } from "@/content/posts";
import { games } from "@/content/games";
import { mediaItems } from "@/content/media";
import { services } from "@/content/services";
import { profile } from "@/content/profile";

const identityStats = [
  ["01", "Frontend systems", "Draft architecture complete"],
  ["02", "Game dev", "Placeholder archive lanes"],
  ["03", "Digital art", "Gallery media TBD"],
  ["04", "Bilingual shell", "English and Simplified Chinese"],
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return (
    <PageShell locale={locale}>
      <HeroSection locale={locale} />

      <section className="border-b bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
          {identityStats.map(([index, label, detail]) => (
            <div key={label} className="rounded-md border bg-background/70 p-4">
              <p className="font-mono text-xs text-muted-foreground">{index}</p>
              <h2 className="mt-2 text-base font-semibold">{label}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="selected systems"
            title={t("featured")}
            description="Draft case-study cards are visually complete now. Replace placeholder outcomes, screenshots, and implementation notes as final content is approved."
          />
          <Button asChild variant="outline">
            <Link href="/projects" locale={locale}>
              Full archive
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {featuredProjects.slice(0, 3).map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="archive pulse"
            title={t("latest")}
            description="Short, realistic placeholder content keeps the reading rhythm honest without inventing final claims."
          />
          <Tabs defaultValue="writing" className="mt-8">
            <TabsList>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
            </TabsList>
            <TabsContent value="writing">
              <div className="grid gap-4 md:grid-cols-3">
                {posts.map((post) => (
                  <ArchiveCard
                    key={post.slug}
                    title={post.title}
                    description={post.excerpt}
                    eyebrow={post.category}
                    status={post.status}
                    mediaLabel="POST COVER TBD"
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="resources">
              <div className="grid gap-4 md:grid-cols-3">
                {resources.slice(0, 3).map((resource) => (
                  <Card key={resource.slug} className="bg-card/80">
                    <CardHeader>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{resource.category}</Badge>
                        <Badge variant="warning">{resource.status}</Badge>
                      </div>
                      <CardTitle>{resource.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-6 text-muted-foreground">
                      {resource.why}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="games">
              <div className="grid gap-4 md:grid-cols-3">
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
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionHeading
            eyebrow="visual archive"
            title={t("gallery")}
            description="A gallery-under-construction should still feel like an exhibit. Placeholder frames use monochrome texture, contact-sheet structure, and explicit status labels."
          />
          <Button asChild variant="outline" className="mt-8">
            <Link href="/gallery" locale={locale}>
              Open gallery
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {galleryCollections.slice(0, 2).map((collection) => (
            <ArchiveCard
              key={collection.slug}
              title={collection.title}
              description={collection.description}
              eyebrow={`${collection.count} frames`}
              status={collection.status}
              href={`/gallery/${collection.slug}`}
              locale={locale}
              mediaLabel="GALLERY MEDIA TBD"
            />
          ))}
          <Card className="bg-card/80 sm:col-span-2">
            <CardHeader>
              <ContentPendingLabel label="CONTACT SHEET PLACEHOLDER" />
              <CardTitle>{galleryItems[0]?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <PlaceholderImage label="CONTACT SHEET TBD" aspect="aspect-[21/9]" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="media lane"
              title={t("media")}
              description="Video and process pages are presentationally ready without autoplay or heavy media. Final posters and clips can replace these frames later."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {mediaItems.slice(0, 2).map((item) => (
                <Card key={item.slug} className="bg-card/80">
                  <CardHeader>
                    <Badge variant="warning">{item.status}</Badge>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <PlaceholderVideo label="HOMEPAGE REEL TBD" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="collaboration"
            title={t("collab")}
            description="The contact experience is visually complete, but no backend is overbuilt yet. Replace the draft service language after scope is confirmed."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {services.map((service) => (
              <Card key={service.slug} className="bg-card/80">
                <CardHeader>
                  <Badge variant="warning">{service.status}</Badge>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-muted-foreground">
                  {service.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/contact" locale={locale}>
              Start a conversation
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={`mailto:${profile.email}`}>
              <Mail className="size-4" />
              Email
            </a>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
