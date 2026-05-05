import { ArchiveCard } from "@/components/cards/archive-card";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { posts } from "@/content/posts";
import type { Locale } from "@/i18n/routing";

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-30" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="mdx lane"
            title="Writing / Devlogs"
            description="Draft writing archive for technical notes, remake logs, and project essays. MDX is wired; final posts can replace these placeholders without changing the layout."
          />
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {["All", "Devlog", "Writing", "Game dev", "Drafts"].map((category) => (
            <Badge key={category} variant={category === "All" ? "success" : "outline"}>
              {category}
            </Badge>
          ))}
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <ArchiveCard
              key={post.slug}
              title={post.title}
              description={post.excerpt}
              eyebrow={`${post.category} / ${post.readingTime}`}
              status={post.status}
              mediaLabel="POST COVER TBD"
            />
          ))}
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <Card className="bg-card/80">
          <CardHeader>
            <Badge variant="warning">Draft</Badge>
            <CardTitle>Desktop table of contents placeholder</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            TBD: article detail pages will include a server-rendered heading map and a collapsed mobile TOC.
          </CardContent>
        </Card>
        <EmptyArchiveState
          title="No published MDX yet"
          description="Draft state: final posts will appear here after case-study copy and image assets are reviewed."
        />
      </section>
    </PageShell>
  );
}
