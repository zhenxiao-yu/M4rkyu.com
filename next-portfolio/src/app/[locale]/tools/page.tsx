import { Settings2 } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComingSoonBlock } from "@/components/placeholders/coming-soon-block";
import { resources } from "@/content/resources";
import type { Locale } from "@/i18n/routing";

export default async function ToolsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const toolLike = resources.filter((item) =>
    ["Framework", "UI foundation", "Testing", "Search"].includes(item.category),
  );

  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="utility index"
          title="Tools"
          description="Placeholder utility directory for small tools, implementation notes, and creative systems. Final tool pages can be added without changing the shell."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {toolLike.map((tool) => (
            <Card key={tool.slug} className="bg-card/80">
              <CardHeader>
                <span className="grid size-10 place-items-center rounded-md border bg-background/70">
                  <Settings2 className="size-5" aria-hidden="true" />
                </span>
                <Badge variant="warning">{tool.status}</Badge>
                <CardTitle>{tool.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {tool.why}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10">
          <ComingSoonBlock
            title="Interactive tools coming soon"
            description="TBD: future utilities may include theme previews, content search helpers, or small creative-system experiments."
          />
        </div>
      </section>
    </PageShell>
  );
}
