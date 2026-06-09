"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

export interface GalleryManagerItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  type: string;
  featured: boolean;
  alt: string;
  caption: string;
  imageUrl: string | null;
  /** Owning collection — drives the per-item edit link (items can span
   * collections in the library view). */
  collectionSlug: string;
  collectionTitle: string;
}

interface UseCollectionItemsManagerArgs {
  items: GalleryManagerItem[];
  /** Drag-to-reorder — off for the cross-collection library view. */
  enableReorder: boolean;
  setStatusAction: (id: string, status: string) => Promise<void>;
  setFeaturedAction: (id: string, featured: boolean) => Promise<void>;
  setAltAction: (id: string, alt: string) => Promise<void>;
  reorderAction: (id: string, direction: "up" | "down") => Promise<void>;
}

/**
 * Controller for {@link CollectionItemsManager}: owns all selection,
 * optimistic-update, alt-editing, filter, and drag-reorder state plus the
 * handlers that mutate it. Returns a flat bag the presentational component
 * destructures — keeps the view free of stateful logic without prop-drilling.
 */
export function useCollectionItemsManager({
  items,
  enableReorder,
  setStatusAction,
  setFeaturedAction,
  setAltAction,
  reorderAction,
}: UseCollectionItemsManagerArgs) {
  const tAdmin = useTranslations("Admin");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<
    Record<string, string>
  >({});
  const [optimisticFeatured, setOptimisticFeatured] = useState<
    Record<string, boolean>
  >({});
  const [optimisticAlt, setOptimisticAlt] = useState<Record<string, string>>(
    {},
  );
  const [altEditId, setAltEditId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flagFilter, setFlagFilter] = useState<"all" | "featured" | "needsAlt">(
    "all",
  );
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ordered = useMemo(() => {
    if (!orderOverride) return items;
    const byId = new Map(items.map((item) => [item.id, item]));
    const next = orderOverride
      .map((id) => byId.get(id))
      .filter((item): item is GalleryManagerItem => Boolean(item));
    return next.length === items.length ? next : items;
  }, [items, orderOverride]);

  const filtering =
    query.trim().length > 0 || statusFilter !== "all" || flagFilter !== "all";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordered.filter((item) => {
      const alt = optimisticAlt[item.id] ?? item.alt;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (flagFilter === "featured" && !item.featured) return false;
      if (flagFilter === "needsAlt" && alt.trim().length > 0) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        alt.toLowerCase().includes(q)
      );
    });
  }, [ordered, query, statusFilter, flagFilter, optimisticAlt]);

  const selectedIds = useMemo(
    () => filtered.filter((i) => selected.has(i.id)).map((i) => i.id),
    [filtered, selected],
  );
  const allSelected =
    filtered.length > 0 && selectedIds.length === filtered.length;
  // Reorder maps positions to real DB rows, so it must run against the full,
  // unfiltered list — disabled while filtering/searching.
  const dragEnabled = enableReorder && !busy && !filtering && filtered.length > 1;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((i) => i.id)));
  }
  function clearSelection() {
    setSelected(new Set());
  }

  function runItem(id: string, fn: () => Promise<void>, onError?: () => void) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await fn();
      } catch {
        toast.error(tAdmin("list.actionFailed"));
        onError?.();
      } finally {
        setPendingId(null);
      }
    });
  }

  function runBulk(fn: () => Promise<void>) {
    setBusy(true);
    startTransition(async () => {
      try {
        await fn();
        clearSelection();
      } catch {
        toast.error(tAdmin("list.actionFailed"));
      } finally {
        setBusy(false);
      }
    });
  }

  function changeStatus(id: string, prev: string, next: string) {
    setOptimisticStatus((m) => ({ ...m, [id]: next }));
    runItem(
      id,
      () => setStatusAction(id, next),
      () => setOptimisticStatus((m) => ({ ...m, [id]: prev })),
    );
  }

  function toggleFeatured(id: string, current: boolean) {
    const next = !current;
    setOptimisticFeatured((m) => ({ ...m, [id]: next }));
    runItem(
      id,
      () => setFeaturedAction(id, next),
      () => setOptimisticFeatured((m) => ({ ...m, [id]: current })),
    );
  }

  function openAlt(id: string, current: string) {
    setAltDraft(current);
    setAltEditId(id);
  }

  function saveAlt(id: string, prev: string) {
    const next = altDraft.trim();
    setAltEditId(null);
    if (next === prev.trim()) return;
    setOptimisticAlt((m) => ({ ...m, [id]: next }));
    runItem(
      id,
      () => setAltAction(id, next),
      () => setOptimisticAlt((m) => ({ ...m, [id]: prev })),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = filtered.map((i) => i.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    setOrderOverride(arrayMove(ids, oldIndex, newIndex));
    setBusy(true);
    const id = String(active.id);
    const direction = newIndex > oldIndex ? "down" : "up";
    const steps = Math.abs(newIndex - oldIndex);
    startTransition(async () => {
      try {
        for (let i = 0; i < steps; i++) await reorderAction(id, direction);
      } catch {
        toast.error(tAdmin("list.actionFailed"));
      } finally {
        setBusy(false);
        setOrderOverride(null);
      }
    });
  }

  return {
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
  };
}
