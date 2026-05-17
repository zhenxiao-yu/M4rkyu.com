import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { galleryItems } from "@/content/gallery";
import type { Locale } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSavedKeysOfType } from "@/lib/social/saves";
import { SavedGalleryClient } from "./_client";

export const dynamic = "force-dynamic";

export default async function SavedGalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Gallery" });

  const user = await getCurrentUser();
  const signedIn = Boolean(user);
  const savedSlugs = signedIn ? await getSavedKeysOfType("gallery") : [];
  const savedSet = new Set(savedSlugs);
  const savedItems = galleryItems.filter((item) => savedSet.has(item.slug));

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("savedEyebrow")}
        title={t("saved")}
        description={t("savedDescription")}
        decorativeWord="SAVED"
      />
      <PageSection>
        <SavedGalleryClient
          locale={locale}
          signedIn={signedIn}
          items={savedItems}
        />
      </PageSection>
    </PageShell>
  );
}
