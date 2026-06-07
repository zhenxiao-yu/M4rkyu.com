import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { getProfileSource } from "@/lib/profile/source";
import { updateProfileAction } from "@/lib/profile/admin";
import { ProfileForm } from "@/components/admin/profile/profile-form";
import { AdminPageHeader } from "../_components/admin-page-header";
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
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={`/${locale}/about`} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" className="size-3.5" />
              {tAdmin("list.view")}
            </a>
          </Button>
        }
      />

      <ProfileForm
        action={updateProfileAction}
        profile={profile}
        labels={labels}
        successMessage={tAdmin("saved")}
        cancelHref={`/${locale}/admin/profile`}
      />
    </>
  );
}
