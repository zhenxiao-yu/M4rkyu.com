import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { profile } from "@/content/profile";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <SectionHeading title={t("title")} description={t("intro")} />
          <PlaceholderImage label="PORTRAIT OR STUDIO IMAGE TBD" aspect="aspect-[4/5]" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <Card className="bg-card/80">
            <CardHeader>
              <ContentPendingLabel label="SAFE BIO DRAFT" />
              <CardTitle>{profile.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>{profile.intro}</p>
              <p>
                Draft: final biography should expand the China to Canada story, Western University
                software engineering path, J.D. Power internship, game development, and digital-art
                practice without exposing private phone or home address details.
              </p>
              <p>Location: {profile.location}</p>
            </CardContent>
          </Card>
          <Card className="bg-card/80">
            <CardHeader>
              <Badge variant="warning">Draft</Badge>
              <CardTitle>Values</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {profile.values.map((value) => (
                <div key={value} className="rounded-md border bg-background/50 p-3 text-sm">
                  {value}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>Current focus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>Draft: Next.js portfolio platform, structured case studies, game archive, and visual gallery.</p>
              <p>TBD: replace with final availability and current project focus before launch.</p>
              <Button asChild className="mt-3">
                <Link href="/contact" locale={locale}>
                  Contact
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              {profile.timeline.map((item) => (
                <div key={item.label} className="border-l pl-4">
                  <p className="font-mono text-xs text-muted-foreground">{item.date}</p>
                  <h3 className="mt-1 font-semibold">{item.label}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
              <div className="border-l pl-4">
                <p className="font-mono text-xs text-muted-foreground">TBD</p>
                <h3 className="mt-1 font-semibold">Creative systems engineer</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Placeholder: add final current-focus details after content review.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
