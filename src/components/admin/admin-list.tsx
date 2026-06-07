"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  GripVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminInputClass } from "./form-kit";
import { cn, FOCUS_RING } from "@/lib/utils";

export interface AdminListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  badges: string[];
  subtitle?: string;
  /** Public-site URL, when the entry is viewable. */
  viewHref?: string;
}

export interface AdminListLabels {
  searchPlaceholder: string;
  statusAll: string;
  edit: string;
  view: string;
  duplicate: string;
  moveUp: string;
  moveDown: string;
  statusAria: string;
  noMatches: string;
  results: string;
  newLabel: string;
  countLabel: string;
  emptyTitle: string;
  emptyDescription: string;
}


interface AdminListProps {
  items: AdminListItem[];
  locale: Locale;
  /** Base admin path for edit links, e.g. "/admin/games". */
  editBase: string;
  /** Path for the "new" CTA, e.g. "/admin/games/new". */
  newHref: string;
  statusOptions: { value: string; label: string }[];
  labels: AdminListLabels;
  setStatusAction: (id: string, status: string) => Promise<void>;
  reorderAction: (id: string, direction: "up" | "down") => Promise<void>;
  duplicateAction: (id: string) => Promise<void>;
  /** Opt-in bulk operations — pass both to enable the multi-select bar. */
  bulkStatusAction?: (ids: string[], status: string) => Promise<void>;
  bulkDeleteAction?: (ids: string[]) => Promise<void>;
}

export function AdminList({
  items,
  locale,
  editBase,
  newHref,
  statusOptions,
  labels,
  setStatusAction,
  reorderAction,
  duplicateAction,
  bulkStatusAction,
  bulkDeleteAction,
}: AdminListProps) {
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

  const newButton = (
    <Button asChild size="sm">
      <Link href={newHref} locale={locale}>
        <Plus className="size-4" aria-hidden="true" />
        {labels.newLabel}
      </Link>
    </Button>
  );

  if (items.length === 0) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {labels.countLabel}
          </p>
          {newButton}
        </div>
        <Card className="bg-card/80 py-8 text-center">
          <p className="text-sm text-muted-foreground">{labels.emptyTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground/80">
            {labels.emptyDescription}
          </p>
          <div className="mt-4 flex justify-center">{newButton}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {labels.countLabel}
        </p>
        {newButton}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {bulkEnabled ? (
          <label
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:border-ring/50"
            title={tBulk("list.bulk.selectAllAria")}
          >
            <input
              type="checkbox"
              className="size-4 accent-[var(--ring)]"
              checked={allVisibleSelected}
              onChange={toggleAll}
              aria-label={tBulk("list.bulk.selectAllAria")}
            />
          </label>
        ) : null}
        <div className="relative min-w-48 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchPlaceholder}
            className={cn(adminInputClass, "pl-8")}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label={labels.statusAria}
          className={cn(adminInputClass, "w-auto")}
        >
          <option value="all">{labels.statusAll}</option>
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="ml-auto font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
          {filtered.length} {labels.results}
        </p>
      </div>

      {bulkEnabled && selectedIds.length > 0 ? (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 rounded-md border border-ring/40 bg-card/90 p-2",
            bulkBusy && "pointer-events-none opacity-60",
          )}
        >
          <span className="px-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground">
            {tBulk("list.bulk.selected", { count: selectedIds.length })}
          </span>
          <label className="sr-only" htmlFor="bulk-status">
            {tBulk("list.bulk.setStatus")}
          </label>
          <select
            id="bulk-status"
            value=""
            disabled={bulkBusy}
            onChange={(event) => {
              const status = event.target.value;
              if (status) runBulk(() => bulkStatusAction!(selectedIds, status));
            }}
            className={cn(adminInputClass, "h-8 w-auto py-1 text-xs")}
          >
            <option value="">{tBulk("list.bulk.setStatus")}</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={bulkBusy}
            onClick={() => {
              const message = tBulk("list.bulk.confirmDelete", {
                count: selectedIds.length,
              });
              if (window.confirm(message)) {
                runBulk(() => bulkDeleteAction!(selectedIds));
              }
            }}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            {tBulk("list.bulk.deleteSelected")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={bulkBusy}
            onClick={clearSelection}
          >
            <X className="size-3.5" aria-hidden="true" />
            {tBulk("list.bulk.clearSelection")}
          </Button>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <Card className="bg-card/80 py-8 text-center text-sm text-muted-foreground">
          {labels.noMatches}
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((listItem) => listItem.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="grid gap-2">
              {filtered.map((item) => {
                const index = ordered.indexOf(item);
                const isFirst = index === 0;
                const isLast = index === ordered.length - 1;
                const busy = pendingId === item.id;
                return (
                  <SortableRow
                    key={item.id}
                    id={item.id}
                    disabled={!dragEnabled}
                  >
                    {({ setNodeRef, style, handleProps, isDragging }) => (
                      <li ref={setNodeRef} style={style}>
                <Card
                  className={cn(
                    "flex min-h-19 flex-col gap-3 bg-card/80 p-4 transition-opacity sm:flex-row sm:items-center",
                    busy && "pointer-events-none opacity-60",
                    bulkEnabled && selected.has(item.id) && "border-ring/50",
                    isDragging && "opacity-80 shadow-lg ring-1 ring-ring/40",
                  )}
                >
                  {dragEnabled ? (
                    <button
                      type="button"
                      {...(handleProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
                      aria-label={tBulk("list.dragHandle")}
                      title={tBulk("list.dragHandle")}
                      className={cn(
                        "hidden shrink-0 cursor-grab touch-none items-center self-center text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing sm:inline-flex",
                        FOCUS_RING,
                      )}
                    >
                      <GripVertical className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                  {bulkEnabled ? (
                    <label
                      className="inline-flex items-center self-start sm:self-center"
                      title={tBulk("list.bulk.selectAria", { title: item.title })}
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-[var(--ring)]"
                        checked={selected.has(item.id)}
                        onChange={() => toggleOne(item.id)}
                        aria-label={tBulk("list.bulk.selectAria", {
                          title: item.title,
                        })}
                      />
                    </label>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      {item.badges.map((badge, badgeIndex) => (
                        <Badge
                          key={`${badge}-${badgeIndex}`}
                          variant="outline"
                          className="font-mono text-[0.6rem]"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/80">
                      /{item.slug}
                      {item.subtitle ? (
                        <span className="ml-2 normal-case tracking-normal">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Inline status toggle — change visibility without opening the editor. */}
                    <label className="sr-only" htmlFor={`status-${item.id}`}>
                      {labels.statusAria}
                    </label>
                    <select
                      id={`status-${item.id}`}
                      value={optimisticStatus[item.id] ?? item.status}
                      disabled={busy}
                      onChange={(event) =>
                        changeStatus(
                          item.id,
                          optimisticStatus[item.id] ?? item.status,
                          event.target.value,
                        )
                      }
                      className={cn(adminInputClass, "h-8 w-auto py-1 text-xs")}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {!filtering ? (
                      <>
                        <IconButton
                          label={labels.moveUp}
                          disabled={isFirst || busy}
                          onClick={() =>
                            run(item.id, () => reorderAction(item.id, "up"))
                          }
                        >
                          <ArrowUp className="size-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton
                          label={labels.moveDown}
                          disabled={isLast || busy}
                          onClick={() =>
                            run(item.id, () => reorderAction(item.id, "down"))
                          }
                        >
                          <ArrowDown className="size-4" aria-hidden="true" />
                        </IconButton>
                      </>
                    ) : null}

                    <IconButton
                      label={labels.duplicate}
                      disabled={busy}
                      onClick={() =>
                        run(item.id, () => duplicateAction(item.id))
                      }
                    >
                      <Copy className="size-4" aria-hidden="true" />
                    </IconButton>

                    {item.viewHref ? (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                      >
                        <a
                          href={item.viewHref}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={labels.view}
                        >
                          <ExternalLink className="size-4" aria-hidden="true" />
                        </a>
                      </Button>
                    ) : null}

                    <Button asChild variant="outline" size="sm">
                      <Link href={`${editBase}/${item.slug}`} locale={locale}>
                        <Pencil className="size-3.5" aria-hidden="true" />
                        {labels.edit}
                      </Link>
                    </Button>
                  </div>
                </Card>
                      </li>
                    )}
                  </SortableRow>
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// Wraps one row in dnd-kit's sortable wiring and hands the drag bindings to
// its render-prop child, keeping the (large) row markup inline in the map
// rather than threading every handler through props.
function SortableRow({
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });
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

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-ring/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}
