import { Mail } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const types = ["Frontend systems", "Full-stack apps", "Game prototypes", "Digital art archives"];

  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="collaboration"
          title="Contact"
          description="A simple collaboration funnel first; hosted form integration can follow once the content and launch flow are stable."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {types.map((type) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle>{type}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Available for scoped collaboration discussions.
              </CardContent>
            </Card>
          ))}
        </div>
        <Button asChild size="lg" className="mt-10">
          <a href={`mailto:${profile.email}`}>
            <Mail className="size-4" />
            {profile.email}
          </a>
        </Button>
      </section>
    </PageShell>
  );
}
