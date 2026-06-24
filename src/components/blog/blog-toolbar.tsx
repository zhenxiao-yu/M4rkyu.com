"use client";

import { useId } from "react";
import {
  Clock,
  Flame,
  Layers,
  MessageCircle,
  RotateCcw,
  Search,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { BlogActiveFilters } from "@/components/blog/blog-active-filters";
import { BlogTagRail } from "@/components/blog/blog-tag-rail";
import { BlogViewModeToggle } from "@/components/blog/blog-view-mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_BLOG_SORT, type BlogSortMode } from "@/content/blog-page";
import type { CountEntry } from "@/lib/blog/filter-posts";
import type { BlogViewMode } from "./use-view-mode";

interface BlogToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  rankedTags: CountEntry[];
  categories: CountEntry[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  sortMode: BlogSortMode;
  onSortModeChange: (sort: BlogSortMode) => void;
  filteredCount: number;
  totalCount: number;
  isPending: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  viewMode: BlogViewMode;
  onViewModeChange: (mode: BlogViewMode) => void;
}

const ALL_CATEGORIES_VALUE = "__all_categories__";

export function BlogToolbar({
  query,
  onQueryChange,
  rankedTags,
  categories,
  activeTag,
  onTagChange,
  activeCategory,
  onCategoryChange,
  sortMode,
  onSortModeChange,
  filteredCount,
  totalCount,
  isPending,
  hasActiveFilters,
  onClearFilters,
  viewMode,
  onViewModeChange,
}: BlogToolbarProps) {
  const t = useTranslations("Blog");
  const searchId = useId();
  const categoryValue = activeCategory ?? ALL_CATEGORIES_VALUE;
  const sortLabels: Record<BlogSortMode, string> = {
    newest: t("sortNewest"),
    popular: t("sortPopular"),
    discussed: t("sortDiscussed"),
    quick: t("sortQuick"),
  };
  const sortDescriptions: Record<BlogSortMode, string> = {
    newest: t("sortNewestDescription"),
    popular: t("sortPopularDescription"),
    discussed: t("sortDiscussedDescription"),
    quick: t("sortQuickDescription"),
  };
  const sortIcons: Record<BlogSortMode, LucideIcon> = {
    newest: Clock,
    popular: Flame,
    discussed: MessageCircle,
    quick: Zap,
  };
  const totalCategoryCount = categories.reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  return (
    <section
      aria-label={t("filterPanelLabel")}
      aria-busy={isPending}
      className="border-y border-border/70 py-4"
    >
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <label htmlFor={searchId} className="block min-w-0">
          <span className="sr-only">{t("searchLabel")}</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={searchId}
              type="search"
              autoComplete="off"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="h-11 rounded-md border-border/80 bg-background pl-9 pr-10 text-base sm:text-sm"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={t("clearSearch")}
                className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 rounded-md p-0 hover:bg-muted"
                onClick={() => onQueryChange("")}
              >
                <X aria-hidden="true" className="size-3.5" />
              </Button>
            ) : null}
          </span>
        </label>

        <div className="grid gap-2 sm:grid-cols-[minmax(11rem,1fr)_minmax(10rem,0.8fr)_auto] xl:w-[31rem]">
          <Select
            value={categoryValue}
            onValueChange={(value) =>
              onCategoryChange(value === ALL_CATEGORIES_VALUE ? null : value)
            }
          >
            <SelectTrigger
              aria-label={t("categoryLabel")}
              className="h-11 rounded-md bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value={ALL_CATEGORIES_VALUE}
                icon={<Layers className="size-3.5" aria-hidden="true" />}
                trailing={totalCategoryCount}
              >
                {t("categoryAll")}
              </SelectItem>
              {categories.map(({ value, count }) => (
                <SelectItem key={value} value={value} trailing={count}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortMode}
            onValueChange={(value) => onSortModeChange(value as BlogSortMode)}
          >
            <SelectTrigger
              aria-label={t("sortLabel")}
              className="h-11 rounded-md bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["newest", "popular", "discussed", "quick"] as const).map(
                (mode) => {
                  const Icon = sortIcons[mode];
                  return (
                    <SelectItem
                      key={mode}
                      value={mode}
                      icon={<Icon className="size-3.5" aria-hidden="true" />}
                      description={sortDescriptions[mode]}
                    >
                      {sortLabels[mode]}
                    </SelectItem>
                  );
                },
              )}
            </SelectContent>
          </Select>

          <BlogViewModeToggle
            value={viewMode}
            onChange={onViewModeChange}
            label={t("viewModeLabel")}
            listLabel={t("viewModeList")}
            gridLabel={t("viewModeGrid")}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 lg:flex-row lg:items-start lg:justify-between">
        <BlogTagRail
          rankedTags={rankedTags}
          activeTag={activeTag}
          onTagChange={onTagChange}
          labels={{
            all: t("tagAll"),
            more: t("tagMore"),
            moreOpen: t("tagMoreOpen"),
          }}
        />

        <div className="flex shrink-0 items-center gap-2 text-left lg:justify-end">
          <span
            className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
            aria-live="polite"
          >
            {t("resultsSummary", {
              filtered: filteredCount,
              total: totalCount,
            })}
          </span>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 rounded-full px-3 text-[0.7rem]"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              {t("clearFilters")}
            </Button>
          ) : null}
        </div>
      </div>

      {hasActiveFilters ? (
        <BlogActiveFilters
          activeCategory={activeCategory}
          activeTag={activeTag}
          query={query}
          sortMode={sortMode}
          sortLabel={sortLabels[sortMode]}
          labels={{ activeFilters: t("activeFilters") }}
          onCategoryClear={() => onCategoryChange(null)}
          onTagClear={() => onTagChange(null)}
          onQueryClear={() => onQueryChange("")}
          onSortClear={() => onSortModeChange(DEFAULT_BLOG_SORT)}
        />
      ) : null}
    </section>
  );
}
