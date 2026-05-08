import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { EmptyArchiveState } from "@/components/placeholders/empty-archive-state";
import { resources } from "@/content/resources";
import type { Locale } from "@/i18n/routing";
import { ResourcesClient } from "./_client";

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
        <ResourcesClient resources={resources} categories={categories} />
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
