import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <PageShell locale={locale}>
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading title={t("title")} description={t("intro")} />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{profile.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>{profile.intro}</p>
              <p>
                Contact: <a className="text-foreground underline" href={`mailto:${profile.email}`}>{profile.email}</a>
              </p>
              <p>Location: {profile.location}</p>
            </CardContent>
          </Card>
          <Card>
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
            </CardContent>
          </Card>
        </div>
      </section>
    </PageShell>
  );
}
