import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
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

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("contactTitle")}
        description={tMeta("contactDescription")}
        decorativeWord="SEND"
      />

      <PageSection innerClassName="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <>
          <div className="grid gap-5">
            {services.map((service) => (
              <Card
                key={service.slug}
                className="bg-card/80 hover:border-ring/50 hover:shadow-md"
              >
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

          <Card className="bg-card/80 shadow-lg shadow-black/5 dark:shadow-black/20">
            <CardHeader>
              <ContentPendingLabel label={t("formProviderTbd")} />
              <CardTitle>{t("inquiryTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm email={profile.email} />
            </CardContent>
          </Card>
        </>
      </PageSection>
    </PageShell>
  );
}
