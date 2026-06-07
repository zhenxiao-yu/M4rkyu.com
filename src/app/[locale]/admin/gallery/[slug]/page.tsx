import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  ImageUp,
  SlidersHorizontal,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  getDbCollectionBySlug,
  getDbGalleryCollections,
  getDbGalleryItems,
  storageUrlFor,
} from "@/lib/gallery/db";
import {
  bulkDeleteItemsAction,
  bulkSetItemStatusAction,
  createItemAction,
  deleteCollectionAction,
  moveItemsAction,
  reorderItemAction,
  setItemFeaturedAction,
  setItemStatusAction,
  updateCollectionAction,
} from "@/lib/gallery/admin";
import { DeleteButton } from "@/components/admin/delete-button";
import { CollectionForm } from "@/components/admin/gallery/collection-form";
import { ItemForm } from "@/components/admin/gallery/item-form";
import {
  CollectionItemsManager,
  type GalleryManagerItem,
} from "@/components/admin/gallery/collection-items-manager";
import { BatchUploadDropzone } from "@/components/admin/gallery/batch-upload-dropzone";
import { AdminPageHeader } from "../../_components/admin-page-header";
import { buildCollectionFormLabels, buildItemFormLabels } from "../_labels";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";

const panelTriggerClass = cn(
  "group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/40",
  FOCUS_RING_INSET,
);
const chevronClass =
  "size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-data-[state=open]:rotate-180";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  // Fan out: both translation namespaces, the collection row, the items
  // list, and the form label bags can all be requested in parallel.
  const [
    t,
    tAdmin,
    collection,
    allItems,
    allCollections,
    collectionLabels,
    itemLabels,
  ] = await Promise.all([
    getTranslations({ locale, namespace: "AdminGallery" }),
    getTranslations({ locale, namespace: "Admin" }),
    getDbCollectionBySlug(slug),
    getDbGalleryItems(),
    getDbGalleryCollections(),
    buildCollectionFormLabels(locale),
    buildItemFormLabels(locale),
  ]);
  if (!collection) notFound();

  const items = allItems.filter((item) => item.collectionId === collection.id);
  const managerItems: GalleryManagerItem[] = items.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    status: item.status,
    type: item.type,
    featured: item.featured,
    alt: item.alt,
    caption: item.caption,
    imageUrl: storageUrlFor(item.storagePath),
    collectionSlug: collection.slug,
    collectionTitle: collection.title,
  }));
  const otherCollections = allCollections
    .filter((c) => c.id !== collection.id)
    .map((c) => ({ id: c.id, title: c.title }));
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
        title={collection.title}
        description={collection.description || t("noDescription")}
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/gallery" locale={locale}>
                <ArrowLeft aria-hidden="true" className="size-4" />
                {t("backToCollections")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a
                href={`/${locale}/archive/${collection.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink aria-hidden="true" className="size-3.5" />
                {tAdmin("list.view")}
              </a>
            </Button>
          </>
        }
      />

      <div className="grid gap-5">
        {/* Meta strip */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge
            variant="outline"
            className="font-mono text-[0.6rem] uppercase tracking-[0.14em]"
          >
            {collection.status}
          </Badge>
          {collection.featured ? (
            <Badge variant="success" className="font-mono text-[0.6rem] uppercase">
              {t("featured")}
            </Badge>
          ) : null}
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {t("itemsHeading", { count: items.length })}
          </span>
        </div>

        {/* Tools — collapsible so the photo grid stays the focus */}
        <Collapsible
          defaultOpen
          className="overflow-hidden rounded-lg border border-border/60 bg-card/50"
        >
          <CollapsibleTrigger asChild>
            <button type="button" className={panelTriggerClass}>
              <span className="inline-flex items-center gap-2">
                <ImageUp aria-hidden="true" className="size-4 text-muted-foreground" />
                {t("batch.heading")}
              </span>
              <ChevronDown aria-hidden="true" className={chevronClass} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border/60 p-4">
              <BatchUploadDropzone
                collectionId={collection.id}
                collectionSlug={collection.slug}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible className="overflow-hidden rounded-lg border border-border/60 bg-card/50">
          <CollapsibleTrigger asChild>
            <button type="button" className={panelTriggerClass}>
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                {t("settingsHeading")}
              </span>
              <ChevronDown aria-hidden="true" className={chevronClass} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid gap-8 border-t border-border/60 p-4 lg:grid-cols-2">
              <div className="grid content-start gap-3">
                <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("collectionForm")}
                </h3>
                <CollectionForm
                  action={updateCollectionAction}
                  collection={collection}
                  labels={{ ...collectionLabels, submit: t("save") }}
                  successMessage={tAdmin("saved")}
                  hiddenFields={
                    <input type="hidden" name="id" value={collection.id} />
                  }
                  cancelHref={`/${locale}/admin/gallery`}
                />
              </div>
              <div className="grid content-start gap-3">
                <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {t("newItem")}
                </h3>
                <ItemForm
                  action={createItemAction}
                  collectionId={collection.id}
                  showImage
                  labels={{ ...itemLabels, submit: t("addItem") }}
                  successMessage={tAdmin("saved")}
                  cancelHref={`/${locale}/admin/gallery/${collection.slug}`}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-destructive/20 bg-destructive/5 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-destructive">
                  {t("dangerZone")}
                </p>
                <p className="text-[0.7rem] text-muted-foreground">
                  {t("deleteWarning")}
                </p>
              </div>
              <form action={deleteCollectionAction} className="shrink-0">
                <input type="hidden" name="id" value={collection.id} />
                <DeleteButton
                  variant="outline"
                  size="sm"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  confirmMessage={t("deleteCollectionConfirm", {
                    title: collection.title,
                  })}
                >
                  {t("deleteCollection")}
                </DeleteButton>
              </form>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Photo grid — the hero, full width */}
        <CollectionItemsManager
          items={managerItems}
          collections={otherCollections}
          locale={locale}
          statusOptions={statusOptions}
          setStatusAction={setItemStatusAction}
          setFeaturedAction={setItemFeaturedAction}
          reorderAction={reorderItemAction}
          bulkStatusAction={bulkSetItemStatusAction}
          bulkDeleteAction={bulkDeleteItemsAction}
          moveAction={moveItemsAction}
        />
      </div>
    </>
  );
}
