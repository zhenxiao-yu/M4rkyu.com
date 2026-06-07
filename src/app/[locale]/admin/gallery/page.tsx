import { getTranslations } from "next-intl/server";
import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getDbGalleryCollections, getDbGalleryItems } from "@/lib/gallery/db";
import {
  duplicateCollectionAction,
  reorderCollectionAction,
  setCollectionStatusAction,
} from "@/lib/gallery/admin";
import { AdminPageHeader } from "../_components/admin-page-header";
import { AdminList, type AdminListItem } from "@/components/admin/admin-list";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [t, tAdmin, collections, allItems] = await Promise.all([
    getTranslations({ locale, namespace: "AdminGallery" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbGalleryCollections(),
    getDbGalleryItems(),
  ]);

  const countByCollection = allItems.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.collectionId] = (acc[item.collectionId] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const items: AdminListItem[] = collections.map((collection) => ({
    id: collection.id,
    slug: collection.slug,
    title: collection.title,
    status: collection.status,
    badges: [
      t("itemCount", { count: countByCollection[collection.id] ?? 0 }),
      ...collection.mood,
    ],
    subtitle: collection.description || undefined,
    viewHref: `/${locale}/archive/${collection.slug}`,
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
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/gallery/library" locale={locale}>
              <Images aria-hidden="true" className="size-4" />
              {t("library.open")}
            </Link>
          </Button>
        }
      />
      <AdminList
          items={items}
          locale={locale}
          editBase="/admin/gallery"
          newHref="/admin/gallery/new"
          statusOptions={statusOptions}
          setStatusAction={setCollectionStatusAction}
          reorderAction={reorderCollectionAction}
          duplicateAction={duplicateCollectionAction}
          labels={{
            searchPlaceholder: tAdmin("list.search"),
            statusAll: tAdmin("list.allStatuses"),
            edit: t("manage"),
            view: tAdmin("list.view"),
            duplicate: tAdmin("list.duplicate"),
            moveUp: tAdmin("list.moveUp"),
            moveDown: tAdmin("list.moveDown"),
            statusAria: tAdmin("list.status"),
            noMatches: tAdmin("list.noMatches"),
            results: tAdmin("list.results"),
            newLabel: t("newCollection"),
            countLabel: t("collectionsCount", { count: items.length }),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
          }}
        />
    </>
  );
}
