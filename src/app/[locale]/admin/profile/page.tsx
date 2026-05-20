import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { getProfileSource } from "@/lib/profile/source";
import { updateProfileAction } from "@/lib/profile/admin";
import { ProfileForm } from "@/components/admin/profile/profile-form";
import { AdminNav } from "../_components/admin-nav";
import { buildProfileFormLabels } from "./_labels";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, profile, labels] = await Promise.all([
    getTranslations({ locale, namespace: "AdminProfile" }),
    getTranslations({ locale, namespace: "Admin" }),
    getProfileSource(),
    buildProfileFormLabels(locale),
  ]);

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="ABOUT"
      />
      <PageSection>
        <AdminNav locale={locale} />

        <div className="mb-6 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <a href={`/${locale}/about`} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" className="size-3.5" />
              {tAdmin("list.view")}
            </a>
          </Button>
        </div>

        <ProfileForm
          action={updateProfileAction}
          profile={profile}
          labels={labels}
          successMessage={tAdmin("saved")}
          cancelHref={`/${locale}/admin/profile`}
        />
      </PageSection>
    </PageShell>
  );
}
