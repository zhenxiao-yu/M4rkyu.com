import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../_components/admin-page-header";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const profiles = (data ?? []) as ProfileRow[];

  return (
    <>
      <AdminPageHeader
        eyebrow={t("eyebrow")}
        title={t("usersTitle")}
        description={t("usersDescription")}
      />
      {profiles.length === 0 ? (
          <Card className="bg-card/80">
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              {t("usersEmpty")}
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-2">
            {profiles.map((profile) => (
              <li key={profile.id}>
                <Card className="bg-card/80">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {profile.display_name ?? profile.username ?? t("usersUnnamed")}
                      </p>
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {profile.id.slice(0, 8)} ·{" "}
                        {new Date(profile.created_at).toISOString().slice(0, 10)}
                      </p>
                    </div>
                    <Badge variant={profile.role === "admin" ? "default" : "outline"}>
                      {profile.role}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      <p className="mt-6 text-[0.7rem] text-muted-foreground">
        {t("usersPromoteHint")}
      </p>
    </>
  );
}
