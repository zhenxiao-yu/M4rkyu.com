import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentPendingLabel } from "@/components/placeholders/content-pending-label";
import { services } from "@/content/services";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { ContactForm } from "./_contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("contactTitle"),
    description: tMeta("contactDescription"),
    alternates: buildAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <PageShell locale={locale}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cyber-grid opacity-25" aria-hidden="true" />
        <div className="archive-vignette absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            as="h1"
            eyebrow={t("eyebrow")}
            title={tMeta("contactTitle")}
            description={tMeta("contactDescription")}
          />
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="grid gap-5">
          {services.map((service) => (
            <Card key={service.slug} className="bg-card/80">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{t("projectTypeBadge")}</Badge>
                  <Badge variant="warning">{service.status}</Badge>
                </div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{service.description}</p>
                <div className="flex flex-wrap gap-2">
                  {service.fit.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card/80">
          <CardHeader>
            <ContentPendingLabel label={t("formProviderTbd")} />
            <CardTitle>{t("inquiryTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm email={profile.email} />
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
