"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  Eye,
  GripVertical,
  Pencil,
  Search,
  Star,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { adminInputClass } from "../form-kit";
import { cn, FOCUS_RING } from "@/lib/utils";
import {
  useCollectionItemsManager,
  type GalleryManagerItem,
} from "./use-collection-items-manager";

export type { GalleryManagerItem };

export interface GalleryManagerCollection {
  id: string;
  title: string;
}

interface Props {
  items: GalleryManagerItem[];
  /** Collections offered as move-to targets. */
  collections: GalleryManagerCollection[];
  locale: Locale;
  statusOptions: { value: string; label: string }[];
  /** Drag-to-reorder — off for the cross-collection library view, where a
   * mixed order has no meaning. Defaults to on. */
  enableReorder?: boolean;
  /** Show each tile's owning collection — on for the library view. */
  showCollection?: boolean;
  setStatusAction: (id: string, status: string) => Promise<void>;
  setFeaturedAction: (id: string, featured: boolean) => Promise<void>;
  setAltAction: (id: string, alt: string) => Promise<void>;
  reorderAction: (id: string, direction: "up" | "down") => Promise<void>;
  bulkStatusAction: (ids: string[], status: string) => Promise<void>;
  bulkDeleteAction: (ids: string[]) => Promise<void>;
  moveAction: (ids: string[], targetCollectionId: string) => Promise<void>;
}

/**
 * Photo-management surface for one collection: a dense, multi-select
 * thumbnail grid with a bulk bar (set status / move to another collection /
 * delete), per-tile quick actions (featured toggle, status, edit, delete),
 * and drag-to-reorder. The "move" path is the organize core — it reassigns
 * items to another collection (metadata only; the stored object keeps its
 * key, so its public URL still resolves).
 *
 * All stateful logic lives in {@link useCollectionItemsManager}; this
 * component is the view.
 */
export function CollectionItemsManager({
  items,
  collections,
  locale,
  statusOptions,
  enableReorder = true,
  showCollection = false,
  setStatusAction,
  setFeaturedAction,
  setAltAction,
  reorderAction,
  bulkStatusAction,
  bulkDeleteAction,
  moveAction,
}: Props) {
  const t = useTranslations("AdminGallery");
  const tAdmin = useTranslations("Admin");
  const {
    filtered,
    filtering,
    selected,
    selectedIds,
    allSelected,
    dragEnabled,
    pendingId,
    optimisticStatus,
    optimisticFeatured,
    optimisticAlt,
    altEditId,
    setAltEditId,
    altDraft,
    setAltDraft,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    flagFilter,
    setFlagFilter,
    busy,
    sensors,
    toggleOne,
    toggleAll,
    clearSelection,
    runItem,
    runBulk,
    changeStatus,
    toggleFeatured,
    openAlt,
    saveAlt,
    handleDragEnd,
  } = useCollectionItemsManager({
    items,
    enableReorder,
    setStatusAction,
    setFeaturedAction,
    setAltAction,
    reorderAction,
  });

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-card/40 py-12 text-center text-sm text-muted-foreground">
        {t("noItems")}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <label
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground hover:border-ring/50 hover:text-foreground"
          title={tAdmin("list.bulk.selectAllAria")}
        >
          <input
            type="checkbox"
            className="size-4 accent-ring"
            checked={allSelected}
            onChange={toggleAll}
            aria-label={tAdmin("list.bulk.selectAllAria")}
          />
          {t("manager.selectAll")}
        </label>

        <div className="relative min-w-40 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tAdmin("list.search")}
            className={cn(adminInputClass, "h-9 pl-8")}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label={tAdmin("list.status")}
          className={cn(adminInputClass, "h-9 w-auto")}
        >
          <option value="all">{tAdmin("list.allStatuses")}</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={flagFilter}
          onChange={(e) =>
            setFlagFilter(e.target.value as "all" | "featured" | "needsAlt")
          }
          aria-label={t("manager.filterFlag")}
          className={cn(adminInputClass, "h-9 w-auto")}
        >
          <option value="all">{t("manager.filterAll")}</option>
          <option value="featured">{t("manager.filterFeatured")}</option>
          <option value="needsAlt">{t("manager.filterNeedsAlt")}</option>
        </select>

        <p className="ml-auto font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          {filtering
            ? `${filtered.length} / ${items.length}`
            : t("itemsHeading", { count: items.length })}
        </p>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 ? (
        <div
          className={cn(
            "sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-md border border-ring/40 bg-card/95 p-2 shadow-sm backdrop-blur",
            busy && "pointer-events-none opacity-60",
          )}
        >
          <span className="px-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground">
            {tAdmin("list.bulk.selected", { count: selectedIds.length })}
          </span>

          <select
            value=""
            disabled={busy}
            aria-label={tAdmin("list.bulk.setStatus")}
            onChange={(e) => {
              const status = e.target.value;
              if (status) runBulk(() => bulkStatusAction(selectedIds, status));
            }}
            className={cn(adminInputClass, "h-8 w-auto py-1 text-xs")}
          >
            <option value="">{tAdmin("list.bulk.setStatus")}</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {collections.length > 0 ? (
            <select
              value=""
              disabled={busy}
              aria-label={t("manager.moveTo")}
              onChange={(e) => {
                const target = e.target.value;
                if (target)
                  runBulk(async () => {
                    await moveAction(selectedIds, target);
                    toast.success(t("manager.moveDone"));
                  });
              }}
              className={cn(adminInputClass, "h-8 w-auto py-1 text-xs")}
            >
              <option value="">{t("manager.moveTo")}</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => runBulk(() => bulkStatusAction(selectedIds, "ready"))}
          >
            <Eye className="size-3.5" aria-hidden="true" />
            {t("manager.publish")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              const message = tAdmin("list.bulk.confirmDelete", {
                count: selectedIds.length,
              });
              if (window.confirm(message))
                runBulk(() => bulkDeleteAction(selectedIds));
            }}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {tAdmin("list.bulk.deleteSelected")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={clearSelection}
          >
            <X className="size-3.5" aria-hidden="true" />
            {tAdmin("list.bulk.clearSelection")}
          </Button>
        </div>
      ) : null}

      {/* Thumbnail grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/60 bg-card/40 py-10 text-center text-sm text-muted-foreground">
          {tAdmin("list.noMatches")}
        </div>
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filtered.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6">
            {filtered.map((item) => {
              const isSelected = selected.has(item.id);
              const itemBusy = pendingId === item.id;
              const status = optimisticStatus[item.id] ?? item.status;
              const featured = optimisticFeatured[item.id] ?? item.featured;
              const alt = optimisticAlt[item.id] ?? item.alt;
              const altMissing = alt.trim().length === 0;
              const editingAlt = altEditId === item.id;
              return (
                <SortableTile key={item.id} id={item.id} disabled={!dragEnabled}>
                  {({ setNodeRef, style, handleProps, isDragging }) => (
                    <li ref={setNodeRef} style={style}>
                      <div
                        className={cn(
                          "group relative grid overflow-hidden rounded-lg border bg-card/80 transition-shadow",
                          isSelected
                            ? "border-ring ring-1 ring-ring/40"
                            : "border-border/60",
                          itemBusy && "pointer-events-none opacity-60",
                          isDragging && "opacity-80 shadow-lg",
                        )}
                      >
                        <div className="relative aspect-4/5 overflow-hidden bg-muted/30">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.alt || item.title}
                              fill
                              sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 50vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-center text-[0.65rem] text-muted-foreground">
                              {t("noImage")}
                            </div>
                          )}

                          <label
                            className="absolute left-1.5 top-1.5 inline-flex size-6 cursor-pointer items-center justify-center rounded-md bg-background/80 backdrop-blur"
                            title={tAdmin("list.bulk.selectAria", {
                              title: item.title,
                            })}
                          >
                            <input
                              type="checkbox"
                              className="size-4 accent-ring"
                              checked={isSelected}
                              onChange={() => toggleOne(item.id)}
                              aria-label={tAdmin("list.bulk.selectAria", {
                                title: item.title,
                              })}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => toggleFeatured(item.id, featured)}
                            disabled={itemBusy}
                            aria-pressed={featured}
                            aria-label={t("manager.toggleFeatured")}
                            title={t("manager.toggleFeatured")}
                            className={cn(
                              "absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-md bg-background/80 backdrop-blur transition-colors",
                              featured
                                ? "text-ring"
                                : "text-muted-foreground hover:text-foreground",
                              FOCUS_RING,
                            )}
                          >
                            <Star
                              className="size-3.5"
                              aria-hidden="true"
                              fill={featured ? "currentColor" : "none"}
                            />
                          </button>

                          {dragEnabled ? (
                            <button
                              type="button"
                              {...(handleProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                              aria-label={t("manager.dragHandle")}
                              title={t("manager.dragHandle")}
                              className={cn(
                                "absolute bottom-1.5 right-1.5 inline-flex size-6 cursor-grab items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity active:cursor-grabbing group-hover:opacity-100 focus-visible:opacity-100",
                                FOCUS_RING,
                              )}
                            >
                              <GripVertical
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            </button>
                          ) : null}
                        </div>

                        <div className="grid gap-2 p-2.5">
                          <div className="grid">
                            <p className="truncate text-xs font-medium text-foreground">
                              {item.title}
                            </p>
                            {showCollection ? (
                              <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground/70">
                                {item.collectionTitle}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label
                              className="sr-only"
                              htmlFor={`gi-status-${item.id}`}
                            >
                              {tAdmin("list.status")}
                            </label>
                            <select
                              id={`gi-status-${item.id}`}
                              value={status}
                              disabled={itemBusy}
                              onChange={(e) =>
                                changeStatus(item.id, status, e.target.value)
                              }
                              className={cn(
                                adminInputClass,
                                "h-7 w-auto flex-1 py-0.5 text-[0.7rem]",
                              )}
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => openAlt(item.id, alt)}
                              disabled={itemBusy}
                              aria-label={t("manager.altEdit")}
                              title={
                                altMissing
                                  ? t("manager.altMissing")
                                  : t("manager.altEdit")
                              }
                              className={cn(
                                "inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-40",
                                altMissing
                                  ? "text-destructive hover:bg-destructive/10"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                FOCUS_RING,
                              )}
                            >
                              <Type className="size-3.5" aria-hidden="true" />
                            </button>
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="size-7 shrink-0 p-0"
                            >
                              <Link
                                href={`/admin/gallery/${item.collectionSlug}/${item.slug}`}
                                locale={locale}
                                aria-label={t("editItem")}
                                title={t("editItem")}
                              >
                                <Pencil className="size-3.5" aria-hidden="true" />
                              </Link>
                            </Button>
                            <button
                              type="button"
                              disabled={itemBusy}
                              onClick={() => {
                                const msg = t("deleteItemConfirm", {
                                  title: item.title,
                                });
                                if (window.confirm(msg))
                                  runItem(item.id, () =>
                                    bulkDeleteAction([item.id]),
                                  );
                              }}
                              aria-label={t("deleteItem")}
                              title={t("deleteItem")}
                              className={cn(
                                "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40",
                                FOCUS_RING,
                              )}
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </button>
                          </div>

                          {editingAlt ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                autoFocus
                                value={altDraft}
                                onChange={(e) => setAltDraft(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    saveAlt(item.id, alt);
                                  } else if (e.key === "Escape") {
                                    e.preventDefault();
                                    setAltEditId(null);
                                  }
                                }}
                                placeholder={t("manager.altPlaceholder")}
                                className={cn(
                                  adminInputClass,
                                  "h-7 flex-1 py-0.5 text-[0.7rem]",
                                )}
                              />
                              <button
                                type="button"
                                onClick={() => saveAlt(item.id, alt)}
                                aria-label={t("save")}
                                title={t("save")}
                                className={cn(
                                  "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ring hover:bg-ring/10",
                                  FOCUS_RING,
                                )}
                              >
                                <Check className="size-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setAltEditId(null)}
                                aria-label={t("cancel")}
                                title={t("cancel")}
                                className={cn(
                                  "inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted",
                                  FOCUS_RING,
                                )}
                              >
                                <X className="size-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )}
                </SortableTile>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      )}
    </div>
  );
}

function SortableTile({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: (props: {
    setNodeRef: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    handleProps: Record<string, unknown>;
    isDragging: boolean;
  }) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };
  return children({
    setNodeRef,
    style,
    handleProps: { ...attributes, ...listeners },
    isDragging,
  });
}
