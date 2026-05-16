"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { DEFAULT_BLOG_SORT, type BlogSortMode } from "@/content/blog-page";

interface BlogActiveFiltersProps {
  activeCategory: string | null;
  activeTag: string | null;
  query: string;
  sortMode: BlogSortMode;
  sortLabel: string;
  labels: {
    activeFilters: string;
  };
  onCategoryClear: () => void;
  onTagClear: () => void;
  onQueryClear: () => void;
  onSortClear: () => void;
}

export function BlogActiveFilters({
  activeCategory,
  activeTag,
  query,
  sortMode,
  sortLabel,
  labels,
  onCategoryClear,
  onTagClear,
  onQueryClear,
  onSortClear,
}: BlogActiveFiltersProps) {
  const trimmedQuery = query.trim();

  if (
    !activeCategory &&
    !activeTag &&
    !trimmedQuery &&
    sortMode === DEFAULT_BLOG_SORT
  ) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-foreground">
        <SlidersHorizontal aria-hidden="true" className="size-3.5" />
        {labels.activeFilters}
      </span>
      {activeCategory ? (
        <RemovableChip label={activeCategory} onRemove={onCategoryClear} />
      ) : null}
      {activeTag ? (
        <RemovableChip label={`#${activeTag}`} onRemove={onTagClear} />
      ) : null}
      {trimmedQuery ? (
        <RemovableChip label={`"${trimmedQuery}"`} onRemove={onQueryClear} />
      ) : null}
      {sortMode !== DEFAULT_BLOG_SORT ? (
        <RemovableChip label={sortLabel} onRemove={onSortClear} />
      ) : null}
    </div>
  );
}

function RemovableChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-ring/35 bg-ring/10 px-2.5 py-1 text-xs font-medium text-foreground transition-[border-color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/70 hover:bg-ring/15 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="truncate">{label}</span>
      <X aria-hidden="true" className="size-3" />
    </button>
  );
}
