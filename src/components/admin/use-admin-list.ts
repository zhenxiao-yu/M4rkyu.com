"use client";

import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
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
import type { AdminListItem } from "./admin-list";

interface UseAdminListArgs {
  items: AdminListItem[];
  statusOptions: { value: string; label: string }[];
  setStatusAction: (id: string, status: string) => Promise<void>;
  reorderAction: (id: string, direction: "up" | "down") => Promise<void>;
  duplicateAction: (id: string) => Promise<void>;
  /** Opt-in bulk operations — pass both to enable the multi-select bar. */
  bulkStatusAction?: (ids: string[], status: string) => Promise<void>;
  bulkDeleteAction?: (ids: string[]) => Promise<void>;
}

/**
 * Controller for {@link AdminList}: owns search/status filtering, selection,
 * optimistic status + drag-order state, pending/busy flags, dnd-kit sensors,
 * and every handler that mutates them. Returns a flat bag the presentational
 * component destructures — keeps the view free of stateful logic.
 */
export function useAdminList({
  items,
  statusOptions,
  setStatusAction,
  reorderAction,
  duplicateAction,
  bulkStatusAction,
  bulkDeleteAction,
}: UseAdminListArgs) {
  const tBulk = useTranslations("Admin");
  // Seed the search + status filter from the URL so deep links like
  // /admin/projects?status=draft (e.g. from the dashboard's "needs
  // attention" panel) land pre-filtered. Unknown status values fall back
  // to "all" rather than showing an empty list with no explanation.
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState(() => {
    const requested = searchParams.get("status");
    return requested && statusOptions.some((o) => o.value === requested)
      ? requested
      : "all";
  });
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Optimistic status overrides: a row's select reflects the new value the
  // instant it's chosen, then reconciles with revalidated props on success
  // or rolls back on failure.
  const [optimisticStatus, setOptimisticStatus] = useState<
    Record<string, string>
  >({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  // While a drag is being persisted, this holds the optimistic id order so
  // the list stays in its dropped arrangement across the (single-step)
  // server round-trips before props catch up.
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    // A small activation distance keeps clicks on the row's buttons from
    // being swallowed as drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const bulkEnabled = Boolean(bulkStatusAction && bulkDeleteAction);
  const filtering = query.trim().length > 0 || statusFilter !== "all";

  // Apply any optimistic drag order on top of the server-provided items.
  const ordered = useMemo(() => {
    if (!orderOverride) return items;
    const byId = new Map(items.map((item) => [item.id, item]));
    const next = orderOverride
      .map((id) => byId.get(id))
      .filter((item): item is AdminListItem => Boolean(item));
    return next.length === items.length ? next : items;
  }, [items, orderOverride]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordered.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.subtitle?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [ordered, query, statusFilter]);

  // Drag reordering only makes sense against the full, unfiltered list —
  // indices must map to real DB positions. Disabled while searching/filtering
  // (the up/down arrows are also hidden then) and during an in-flight persist.
  const dragEnabled = !filtering && !reorderBusy && items.length > 1;

  // Selection only ever references rows currently visible; prune anything
  // that filtering or a refresh removed so counts never lie.
  const visibleIds = useMemo(() => new Set(filtered.map((i) => i.id)), [filtered]);
  const selectedIds = useMemo(
    () => filtered.filter((i) => selected.has(i.id)).map((i) => i.id),
    [filtered, selected],
  );
  const allVisibleSelected =
    filtered.length > 0 && selectedIds.length === filtered.length;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allVisibleSelected ? new Set() : new Set(visibleIds));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function runBulk(fn: () => Promise<void>) {
    setBulkBusy(true);
    startTransition(async () => {
      try {
        await fn();
        clearSelection();
      } catch {
        toast.error(tBulk("list.actionFailed"));
      } finally {
        setBulkBusy(false);
      }
    });
  }

  function run(id: string, fn: () => Promise<void>) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await fn();
      } catch {
        toast.error(tBulk("list.actionFailed"));
      } finally {
        setPendingId(null);
      }
    });
  }

  // Status changes are optimistic: paint the new value immediately, keep it
  // on success (revalidated props will match), roll back + toast on failure.
  function changeStatus(id: string, prev: string, next: string) {
    setOptimisticStatus((map) => ({ ...map, [id]: next }));
    setPendingId(id);
    startTransition(async () => {
      try {
        await setStatusAction(id, next);
      } catch {
        toast.error(tBulk("list.actionFailed"));
        setOptimisticStatus((map) => ({ ...map, [id]: prev }));
      } finally {
        setPendingId(null);
      }
    });
  }

  // Persist a drag move by replaying the existing single-step reorder action
  // |delta| times. A handful of round-trips for a hand-curated portfolio; a
  // batch "set order" action could replace this if a list ever grew large.
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = filtered.map((item) => item.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    setOrderOverride(arrayMove(ids, oldIndex, newIndex));
    setReorderBusy(true);
    const id = String(active.id);
    const direction = newIndex > oldIndex ? "down" : "up";
    const steps = Math.abs(newIndex - oldIndex);
    startTransition(async () => {
      try {
        for (let i = 0; i < steps; i++) {
          await reorderAction(id, direction);
        }
      } catch {
        toast.error(tBulk("list.actionFailed"));
      } finally {
        setReorderBusy(false);
        setOrderOverride(null);
      }
    });
  }

  return {
    tBulk,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    pendingId,
    optimisticStatus,
    selected,
    bulkBusy,
    sensors,
    bulkEnabled,
    filtering,
    ordered,
    filtered,
    dragEnabled,
    selectedIds,
    allVisibleSelected,
    toggleOne,
    toggleAll,
    clearSelection,
    runBulk,
    run,
    changeStatus,
    handleDragEnd,
    duplicateAction,
    reorderAction,
    bulkStatusAction,
    bulkDeleteAction,
  };
}
