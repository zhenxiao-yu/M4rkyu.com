import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";
import { AdminNav } from "./_components/admin-nav";

// Content types an admin creates + manages. `newHref` is omitted for the
// singleton profile editor (no "New" action).
const MANAGE_SECTIONS = [
  { key: "projects", href: "/admin/projects", newHref: "/admin/projects/new" },
  { key: "games", href: "/admin/games", newHref: "/admin/games/new" },
  { key: "media", href: "/admin/media", newHref: "/admin/media/new" },
  { key: "gallery", href: "/admin/gallery", newHref: "/admin/gallery/new" },
  { key: "resources", href: "/admin/resources", newHref: "/admin/resources/new" },
  { key: "notes", href: "/admin/notes", newHref: "/admin/notes/new" },
  { key: "shop", href: "/admin/shop", newHref: "/admin/shop/new" },
  { key: "profile", href: "/admin/profile", newHref: null },
] as const;

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

        <section className="mt-10 grid gap-4">
          <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("manageHeading")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {MANAGE_SECTIONS.map((section) => (
              <Card key={section.key} className="bg-card/80">
                <CardContent className="flex items-center justify-between gap-2 py-4">
                  <Link
                    href={section.href}
                    locale={locale}
                    className="text-sm font-semibold text-foreground hover:text-ring"
                  >
                    {t(section.key)}
                  </Link>
                  {section.newHref ? (
                    <Button asChild variant="outline" size="sm" className="h-7 gap-1 px-2">
                      <Link href={section.newHref} locale={locale}>
                        <Plus aria-hidden="true" className="size-3.5" />
                        {t("manageNew")}
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                      <Link href={section.href} locale={locale}>
                        {t("manageOpen")}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </PageSection>
    </PageShell>
  );
}
