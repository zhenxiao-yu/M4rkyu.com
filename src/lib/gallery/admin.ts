// Barrel for the gallery CMS admin server actions. Implementations live in
// sibling modules under ./admin/ (each carries its own "use server"
// directive); shared NON-action helpers live in ./admin/shared.ts without the
// directive. This barrel is a plain re-export with NO "use server" of its own
// — a Server Actions module that only re-exports yields no usable exports
// under Turbopack. The public import path "@/lib/gallery/admin" and every
// exported name are preserved exactly.

export {
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
  setCollectionStatusAction,
  reorderCollectionAction,
  duplicateCollectionAction,
} from "./admin/collections";

export {
  createItemAction,
  updateItemAction,
  deleteItemAction,
  setItemStatusAction,
  setItemFeaturedAction,
  setItemAltAction,
  reorderItemAction,
  bulkSetItemStatusAction,
  bulkDeleteItemsAction,
  createGalleryItemsBatchAction,
  moveItemsAction,
} from "./admin/items";
