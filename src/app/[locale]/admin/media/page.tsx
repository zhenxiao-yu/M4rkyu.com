import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getDbMediaItems } from "@/lib/media/db";
import {
  bulkDeleteMediaAction,
  bulkSetMediaStatusAction,
  duplicateMediaAction,
  reorderMediaAction,
  setMediaStatusAction,
} from "@/lib/media/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, mediaList] = await Promise.all([
    getTranslations({ locale, namespace: "AdminMedia" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbMediaItems(),
  ]);

  const items: AdminListItem[] = mediaList.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    status: item.status,
    badges: [item.format],
    subtitle: item.description || undefined,
  }));

  const statusOptions = [
    { value: "ready", label: t("status.ready") },
    { value: "draft", label: t("status.draft") },
    { value: "placeholder", label: t("status.placeholder") },
    { value: "coming-soon", label: t("status.comingSoon") },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow={tAdmin("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <AdminList
          items={items}
          locale={locale}
          editBase="/admin/media"
          newHref="/admin/media/new"
          statusOptions={statusOptions}
          setStatusAction={setMediaStatusAction}
          reorderAction={reorderMediaAction}
          duplicateAction={duplicateMediaAction}
          bulkStatusAction={bulkSetMediaStatusAction}
          bulkDeleteAction={bulkDeleteMediaAction}
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
            newLabel: t("newMedia"),
            countLabel: t("count", { count: items.length }),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
          }}
        />
    </>
  );
}
