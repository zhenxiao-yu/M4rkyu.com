import { getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/sections/hero-section";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProjectCard } from "@/components/cards/project-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageShell } from "@/components/layout/page-shell";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { featuredProjects } from "@/content/projects";
import { galleryCollections } from "@/content/gallery";
import { resources } from "@/content/resources";

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
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="selected systems"
            title={t("featured")}
            description="Case studies are being rewritten around problem, solution, role, architecture, and outcome."
          />
          <Button asChild variant="outline">
            <Link href="/projects" locale={locale}>
              Full archive
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      </section>
      <section className="border-y bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="archive pulse" title={t("latest")} />
          <Tabs defaultValue="writing" className="mt-8">
            <TabsList>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="devlogs">Devlogs</TabsTrigger>
            </TabsList>
            <TabsContent value="writing">
              <Card>
                <CardHeader>
                  <CardTitle>Technical notes are staged for MDX migration.</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  The blog shell exists now; long-form content enters after the first case study is
                  complete.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="resources">
              <div className="grid gap-4 md:grid-cols-3">
                {resources.map((resource) => (
                  <Card key={resource.slug}>
                    <CardHeader>
                      <CardTitle>{resource.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-6 text-muted-foreground">
                      {resource.why}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="devlogs">
              <Card>
                <CardHeader>
                  <CardTitle>Remake devlog lane reserved.</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Future entries will document design-system decisions, performance passes, and
                  visual experiments.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-20 sm:px-6 md:grid-cols-3 lg:px-8">
        {galleryCollections.map((collection) => (
          <Card key={collection.slug} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{collection.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              {collection.description}
            </CardContent>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
