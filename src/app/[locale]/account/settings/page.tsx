import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserPreferencesRow } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";
import { AccountNav } from "../_components/account-nav";
import { ProfileForm } from "./_form";
import { NotificationPreferencesForm } from "./_notifications";
import { SecurityPanel } from "./_security";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const t = await getTranslations({ locale, namespace: "Account" });
  const supabase = await createSupabaseServerClient();
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("email_notifications,browser_notifications")
    .eq("user_id", user.id)
    .maybeSingle<
      Pick<UserPreferencesRow, "email_notifications" | "browser_notifications">
    >();

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("settingsTitle")}
        description={t("settingsDescription")}
        decorativeWord="CONFIG"
      />
      <PageSection>
        <AccountNav locale={locale} />
        <div className="grid gap-6">
          <Card className="bg-card/80">
            <CardContent className="py-6">
              <h2 className="mb-4 text-base font-medium">
                {t("profileSectionTitle")}
              </h2>
              <ProfileForm
                initial={{
                  display_name: user.profile?.display_name ?? "",
                  username: user.profile?.username ?? "",
                  bio: user.profile?.bio ?? "",
                  website: user.profile?.website ?? "",
                  public_profile: user.profile?.public_profile ?? true,
                }}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardContent className="py-6">
              <h2 className="mb-4 text-base font-medium">
                {t("notificationsSectionTitle")}
              </h2>
              <NotificationPreferencesForm
                initial={{
                  email_notifications:
                    preferences?.email_notifications ?? false,
                  browser_notifications:
                    preferences?.browser_notifications ?? false,
                }}
              />
            </CardContent>
          </Card>

          <Card className="bg-card/80">
            <CardContent className="py-6">
              <h2 className="mb-4 text-base font-medium">
                {t("securitySectionTitle")}
              </h2>
              <SecurityPanel
                locale={locale}
                email={user.email}
                identities={user.identities}
              />
            </CardContent>
          </Card>
        </div>
      </PageSection>
    </PageShell>
  );
}
