import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import type { Locale } from "@/i18n/routing";
import { getDbGames } from "@/lib/games/db";
import {
  duplicateGameAction,
  reorderGameAction,
  setGameStatusAction,
} from "@/lib/games/admin";
import { AdminNav } from "../_components/admin-nav";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, gameList] = await Promise.all([
    getTranslations({ locale, namespace: "AdminGames" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbGames(),
  ]);

  const items: AdminListItem[] = gameList.map((game) => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    status: game.status,
    badges: [game.engine, game.year].filter(Boolean),
    subtitle: game.pitch || undefined,
    viewHref: `/${locale}/games/${game.slug}`,
  }));

  const statusOptions = [
    { value: "ready", label: t("status.ready") },
    { value: "draft", label: t("status.draft") },
    { value: "placeholder", label: t("status.placeholder") },
    { value: "coming-soon", label: t("status.comingSoon") },
  ];

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="PLAY"
      />
      <PageSection>
        <AdminNav locale={locale} />
        <AdminList
          items={items}
          locale={locale}
          editBase="/admin/games"
          newHref="/admin/games/new"
          statusOptions={statusOptions}
          setStatusAction={setGameStatusAction}
          reorderAction={reorderGameAction}
          duplicateAction={duplicateGameAction}
          labels={{
            searchPlaceholder: tAdmin("list.search"),
            statusAll: tAdmin("list.allStatuses"),
            edit: t("edit"),
            view: tAdmin("list.view"),
            duplicate: tAdmin("list.duplicate"),
            moveUp: tAdmin("list.moveUp"),
            moveDown: tAdmin("list.moveDown"),
            statusAria: tAdmin("list.status"),
            noMatches: tAdmin("list.noMatches"),
            results: tAdmin("list.results"),
            newLabel: t("newGame"),
            countLabel: t("count", { count: items.length }),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
          }}
        />
      </PageSection>
    </PageShell>
  );
}
