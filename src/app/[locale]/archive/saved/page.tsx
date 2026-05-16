import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import type { Locale } from "@/i18n/routing";
import { SavedGalleryClient } from "./_client";

export default async function SavedGalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Gallery" });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("savedEyebrow")}
        title={t("saved")}
        description={t("savedDescription")}
        decorativeWord="SAVED"
      />
      <PageSection>
        <SavedGalleryClient locale={locale} />
      </PageSection>
    </PageShell>
  );
}
