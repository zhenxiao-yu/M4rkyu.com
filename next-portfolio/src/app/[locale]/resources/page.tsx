import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resources } from "@/content/resources";
import type { Locale } from "@/i18n/routing";

export default async function ResourcesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="tool library" title="Resources" description="A searchable reference library skeleton with typed resource cards." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.slug}>
              <CardHeader>
                <Badge variant="outline">{resource.category}</Badge>
                <CardTitle>{resource.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{resource.description}</p>
                <p>{resource.why}</p>
                <a className="text-foreground underline" href={resource.link}>
                  Visit
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
