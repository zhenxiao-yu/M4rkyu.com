import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { AdminNav } from "./_components/admin-nav";

// Content types an admin creates + manages. `newHref` is omitted for the
// singleton profile editor. `table` is the Supabase table queried for the
// live item count; null for non-countable singletons.
const MANAGE_SECTIONS = [
  { key: "projects", href: "/admin/projects", newHref: "/admin/projects/new", table: "projects" },
  { key: "games", href: "/admin/games", newHref: "/admin/games/new", table: "games" },
  { key: "media", href: "/admin/media", newHref: "/admin/media/new", table: "media_items" },
  { key: "gallery", href: "/admin/gallery", newHref: "/admin/gallery/new", table: "gallery_items" },
  { key: "resources", href: "/admin/resources", newHref: "/admin/resources/new", table: "resources" },
  { key: "notes", href: "/admin/notes", newHref: "/admin/notes/new", table: "notes" },
  { key: "shop", href: "/admin/shop", newHref: "/admin/shop/new", table: "products" },
  { key: "profile", href: "/admin/profile", newHref: null, table: null },
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
  const sectionCountQueries = MANAGE_SECTIONS.map((s) =>
    s.table
      ? supabase.from(s.table).select("slug", { count: "exact", head: true })
      : Promise.resolve({ count: null as number | null }),
  );

  const [
    usersResult,
    pendingResult,
    approvedResult,
    savesResult,
    ...sectionCounts
  ] = await Promise.all([
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
    ...sectionCountQueries,
  ]);

  const stats = [
    { label: t("statUsers"), value: usersResult.count ?? 0 },
    { label: t("statPending"), value: pendingResult.count ?? 0, highlight: true },
    { label: t("statApproved"), value: approvedResult.count ?? 0 },
    { label: t("statSaves"), value: savesResult.count ?? 0 },
  ];

  const sections = MANAGE_SECTIONS.map((section, index) => ({
    ...section,
    channel: String(index + 1).padStart(2, "0"),
    count: sectionCounts[index]?.count ?? null,
  }));

  const channelRange = `01 — ${String(MANAGE_SECTIONS.length).padStart(2, "0")}`;

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

        {/* Stats — vital signs. Large pixel-font numerals make the values
         * the focal point; the highlight stat (pending) ignites in `--ring`
         * when non-zero so urgency reads without colour-coding everything. */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="glass-surface flex h-full flex-col justify-between gap-3 rounded-xl p-4"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {stat.label}
                </span>
                <span
                  aria-hidden="true"
                  className="font-pixel text-sm leading-none text-muted-foreground/60 tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <span
                className={cn(
                  "block font-pixel text-4xl leading-none tabular-nums",
                  stat.highlight && stat.value > 0
                    ? "text-ring"
                    : "text-foreground",
                )}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Manage — operator console. Each section is a numbered "channel"
         * with a live item count from the DB; vertical accent rule on the
         * left ignites to `--ring` on hover via .group + .glass-interactive
         * lift. The whole card is one anchor; the "New" chip stops
         * propagation by sitting above with its own z-index. */}
        <section className="mt-10 grid gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("manageHeading")}
            </h2>
            <span
              aria-hidden="true"
              className="font-pixel text-sm leading-none text-muted-foreground/60 tabular-nums"
            >
              CH {channelRange}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <ManageCard
                key={section.key}
                channel={section.channel}
                title={t(section.key)}
                countText={
                  section.count === null
                    ? "—"
                    : t("itemsCount", { count: section.count })
                }
                href={section.href}
                newHref={section.newHref}
                locale={locale}
                newLabel={t("manageNew")}
              />
            ))}
          </div>
        </section>
      </PageSection>
    </PageShell>
  );
}

function ManageCard({
  channel,
  title,
  countText,
  href,
  newHref,
  locale,
  newLabel,
}: {
  channel: string;
  title: string;
  countText: string;
  href: string;
  newHref: string | null;
  locale: Locale;
  newLabel: string;
}) {
  return (
    <div className="group glass-surface glass-interactive relative h-full overflow-hidden rounded-xl">
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-1/2 h-[60%] w-[2px] -translate-y-1/2 rounded-full bg-border/80",
          "transition-colors duration-(--motion-medium) ease-(--ease-premium)",
          "group-hover:bg-ring",
        )}
      />
      <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 p-4 pl-5">
        <span
          aria-hidden="true"
          className="font-pixel text-2xl leading-none text-muted-foreground/70 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground"
        >
          {channel}
        </span>
        <Link
          href={href}
          locale={locale}
          className="flex flex-col gap-0.5 text-left after:absolute after:inset-0"
        >
          <span className="text-sm font-semibold text-foreground">
            {title}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {countText}
          </span>
        </Link>
        {newHref ? (
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={newLabel}
            className="relative z-10 size-8 shrink-0 rounded-full text-muted-foreground hover:bg-ring/10 hover:text-ring"
          >
            <Link href={newHref} locale={locale}>
              <Plus aria-hidden="true" className="size-3.5" />
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
