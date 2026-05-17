import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "./_components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });

  const supabase = await createSupabaseServerClient();
  const [usersResult, pendingResult, approvedResult, savesResult] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved"),
      supabase
        .from("user_saved_items")
        .select("user_id", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: t("statUsers"), value: usersResult.count ?? 0 },
    { label: t("statPending"), value: pendingResult.count ?? 0, highlight: true },
    { label: t("statApproved"), value: approvedResult.count ?? 0 },
    { label: t("statSaves"), value: savesResult.count ?? 0 },
  ];

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        decorativeWord="OPS"
      />
      <PageSection>
        <AdminNav locale={locale} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card/80">
              <CardContent className="grid gap-2 py-5">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  className={
                    stat.highlight && stat.value > 0
                      ? "text-2xl font-semibold tabular-nums text-foreground"
                      : "text-2xl font-semibold tabular-nums text-muted-foreground"
                  }
                >
                  {stat.value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>
    </PageShell>
  );
}
