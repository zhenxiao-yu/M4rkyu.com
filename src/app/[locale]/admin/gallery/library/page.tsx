import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getDbGalleryCollections,
  getDbGalleryItems,
  storageUrlFor,
} from "@/lib/gallery/db";
import {
  bulkDeleteItemsAction,
  bulkSetItemStatusAction,
  moveItemsAction,
  reorderItemAction,
  setItemFeaturedAction,
  setItemStatusAction,
} from "@/lib/gallery/admin";
import {
  CollectionItemsManager,
  type GalleryManagerItem,
} from "@/components/admin/gallery/collection-items-manager";
import { AdminPageHeader } from "../../_components/admin-page-header";

export const dynamic = "force-dynamic";

// Cross-collection "all photos" surface — organize the whole library without
// entering each collection. Reorder is off here (a mixed order is meaningless);
// move/bulk/filter/featured all work across collections.
export default async function GalleryLibraryPage({
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

  const titleById = new Map(collections.map((c) => [c.id, c.title]));
  const managerItems: GalleryManagerItem[] = allItems.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    status: item.status,
    type: item.type,
    featured: item.featured,
    alt: item.alt,
    caption: item.caption,
    imageUrl: storageUrlFor(item.storagePath),
    collectionSlug: item.collectionSlug,
    collectionTitle: titleById.get(item.collectionId) ?? "",
  }));
  const moveTargets = collections.map((c) => ({ id: c.id, title: c.title }));
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
        title={t("library.title")}
        description={t("library.description")}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/gallery" locale={locale}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              {t("backToCollections")}
            </Link>
          </Button>
        }
      />

      <CollectionItemsManager
        items={managerItems}
        collections={moveTargets}
        locale={locale}
        statusOptions={statusOptions}
        enableReorder={false}
        showCollection
        setStatusAction={setItemStatusAction}
        setFeaturedAction={setItemFeaturedAction}
        reorderAction={reorderItemAction}
        bulkStatusAction={bulkSetItemStatusAction}
        bulkDeleteAction={bulkDeleteItemsAction}
        moveAction={moveItemsAction}
      />
    </>
  );
}
