import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import type { Locale } from "@/i18n/routing";

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="mdx lane"
          title="Writing / Devlogs"
          description="MDX content architecture is installed; posts will move in after the first project case study is polished."
        />
      </section>
    </PageShell>
  );
}
