import { ExternalLink, Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { resources } from "@/content/resources";
import type { Locale } from "@/i18n/routing";

export default async function ResourcesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const categories = Array.from(new Set(resources.map((resource) => resource.category)));

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="tool library"
            title="Resources"
            description="A searchable reference-library prototype. Placeholder entries are explicitly marked and can later be indexed with Pagefind."
          />
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>
          <label className="grid gap-2 text-sm text-muted-foreground">
            Search
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
              <Input className="pl-9" placeholder="Placeholder search" />
            </span>
          </label>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.slug} className="bg-card/80">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{resource.category}</Badge>
                  <Badge variant="warning">{resource.status}</Badge>
                  <Badge variant="outline">{resource.pricing}</Badge>
                </div>
                <CardTitle>{resource.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{resource.description}</p>
                <p>{resource.why}</p>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    Visit
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <EmptyArchiveState
          title="Resource search index pending"
          description="TBD: Pagefind index and tag search will be wired after final resources and posts are selected."
        />
      </section>
    </PageShell>
  );
}
