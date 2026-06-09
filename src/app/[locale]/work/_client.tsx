"use client";

import {
  ChevronDown,
  FilterX,
  LayoutGrid,
  List,
  Search,
  Star,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/cards/project-card";
import { WorkIndexLedger } from "@/components/work/work-index-ledger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkDeckReveal } from "@/components/sections/work-deck-reveal";
import type { Project } from "@/content/schemas";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING, FOCUS_RING_INSET } from "@/lib/utils";
import { ActiveChip, FacetChip } from "./_chips";
import {
  ALL_YEARS,
  DEFAULT_SORT,
  FILTERS,
  SORT_MODES,
  VIEW_MODES,
  useWorkFilters,
  type SortMode,
} from "./use-work-filters";

export function ProjectsClient({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Categories");

  const {
    activeCategory,
    activeYear,
    featuredOnly,
    activeSort,
    activeView,
    query,
    setQuery,
    yearCounts,
    yearOptions,
    categoryCounts,
    featuredCount,
    filtered,
    production,
    drafts,
    hasActiveFilters,
    updateUrl,
    clearAllFilters,
  } = useWorkFilters(projects);

  return (
    <>
      {/* ── Filter console ── A single command deck: identity + readout +
          view switch up top, faceted tag chips, a refine row, and the
          active-filter stack folded in as a footer. */}
      <section
        aria-label={t("filtersLabel")}
        className="overflow-hidden rounded-xl border border-border bg-card/50"
      >
        {/* Top hairline accent — quiet brand tick, matches the ledger. */}
        <span
          aria-hidden="true"
          className="block h-px w-full bg-linear-to-r from-transparent via-ring/40 to-transparent"
        />

        {/* Header: section identity · live readout · GRID/INDEX switch. */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-muted-foreground">
            <span aria-hidden="true" className="inline-block h-2.5 w-0.5 bg-ring" />
            {t("filtersEyebrow")}
          </span>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              <span className="text-foreground">{filtered.length}</span>
              <span className="px-1 text-muted-foreground/45">/</span>
              {projects.length}
            </span>

            {/* GRID / INDEX view toggle — console segmented control. */}
            <div
              role="group"
              aria-label={t("viewLabel")}
              className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background/60 p-0.5"
            >
              {VIEW_MODES.map((mode) => {
                const active = activeView === mode;
                const Icon = mode === "grid" ? LayoutGrid : List;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateUrl({ view: mode })}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-colors duration-(--motion-fast) ease-(--ease-premium)",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground",
                      FOCUS_RING,
                    )}
                  >
                    <Icon aria-hidden="true" className="size-3.5" />
                    {t(mode === "grid" ? "viewGrid" : "viewIndex")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Facets: category registers (with global counts) + featured. */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 px-4 py-3 sm:px-5">
          {FILTERS.map(({ labelKey, value }) => {
            const count =
              value === null
                ? projects.length
                : (categoryCounts.get(value) ?? 0);
            return (
              <FacetChip
                key={labelKey}
                label={value === null ? t("filterAll") : tCategories(value)}
                count={count}
                active={activeCategory === value}
                disabled={value !== null && count === 0}
                onClick={() => updateUrl({ category: value })}
              />
            );
          })}

          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px self-center bg-border sm:block"
          />

          <FacetChip
            label={t("featuredOn")}
            count={featuredCount}
            active={featuredOnly}
            onClick={() => updateUrl({ featured: !featuredOnly })}
            icon={
              <Star
                aria-hidden="true"
                className={cn("size-3", featuredOnly && "fill-current")}
              />
            }
          />
        </div>

        {/* Refine: year · sort · search. */}
        <div className="grid gap-3 border-t border-border/60 px-4 py-4 sm:px-5 md:grid-cols-[9rem_9rem_minmax(0,1fr)] md:items-end">
          <label className="grid min-w-0 gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">
              {t("yearLabel")}
            </span>
            <Select
              value={activeYear}
              onValueChange={(value) => updateUrl({ year: value })}
            >
              <SelectTrigger aria-label={t("yearLabel")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_YEARS}>
                  {t("yearAll")}
                  <span className="ml-1 text-muted-foreground">
                    ({projects.length})
                  </span>
                </SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                    <span className="ml-1 text-muted-foreground">
                      ({yearCounts.get(year) ?? 0})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid min-w-0 gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">
              {t("sortLabel")}
            </span>
            <Select
              value={activeSort}
              onValueChange={(value) => updateUrl({ sort: value as SortMode })}
            >
              <SelectTrigger aria-label={t("sortLabel")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {t(`sort.${mode}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid min-w-0 gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">
              {t("searchLabel")}
            </span>
            <span className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                className="pl-9 pr-9"
                name="project-search"
                autoComplete="off"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("clearSearch")}
                  className={cn(
                    "absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted hover:text-foreground",
                    FOCUS_RING_INSET,
                  )}
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              ) : null}
            </span>
          </label>
        </div>

        {/* Active filters — folded into the console as a footer stack. */}
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-muted/20 px-4 py-2.5 sm:px-5">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
              {t("activeFiltersLabel")}
            </span>
            {activeCategory ? (
              <ActiveChip
                label={tCategories(activeCategory)}
                onRemove={() => updateUrl({ category: null })}
                removeLabel={t("removeFilter")}
              />
            ) : null}
            {activeYear !== ALL_YEARS ? (
              <ActiveChip
                label={`${t("yearLabel")}: ${activeYear}`}
                onRemove={() => updateUrl({ year: null })}
                removeLabel={t("removeFilter")}
              />
            ) : null}
            {featuredOnly ? (
              <ActiveChip
                label={t("featuredOn")}
                onRemove={() => updateUrl({ featured: false })}
                removeLabel={t("removeFilter")}
              />
            ) : null}
            {query.trim() ? (
              <ActiveChip
                label={`"${query.trim()}"`}
                onRemove={() => setQuery("")}
                removeLabel={t("removeFilter")}
              />
            ) : null}
            {activeSort !== DEFAULT_SORT ? (
              <ActiveChip
                label={`${t("sortLabel")}: ${t(`sort.${activeSort}`)}`}
                onRemove={() => updateUrl({ sort: DEFAULT_SORT })}
                removeLabel={t("removeFilter")}
              />
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-auto h-7 px-2 text-xs"
            >
              {t("clearFilters")}
            </Button>
          </div>
        ) : null}
      </section>

      {production.length === 0 && drafts.length === 0 ? (
        <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <div
            aria-hidden="true"
            className="grid size-12 place-items-center rounded-full border border-border bg-background text-muted-foreground"
          >
            <FilterX className="size-5" />
          </div>
          <div className="space-y-1.5">
            <p className="font-mono text-sm uppercase tracking-[0.16em] text-foreground">
              {t("noMatches")}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("noMatchesHint")}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="mt-1"
            >
              {t("clearFilters")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {production.length > 0 ? (
        activeView === "index" ? (
          // Re-key on chip / year / sort so the ledger restages cleanly.
          // Search query is excluded for the same reason as the deck.
          <WorkIndexLedger
            key={`ledger-${activeCategory ?? "all"}-${activeYear}-${featuredOnly ? "f" : "n"}-${activeSort}`}
            projects={production}
            locale={locale}
          />
        ) : (
          // Re-key on chip / year changes so the deck restages cleanly.
          // Search query is intentionally excluded — keystrokes would
          // otherwise re-mount the grid mid-typing and steal focus state.
          <WorkDeckReveal
            key={`deck-${activeCategory ?? "all"}-${activeYear}-${featuredOnly ? "f" : "n"}-${activeSort}`}
          >
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {production.map((project) => (
                <div data-deck-card key={project.slug}>
                  <ProjectCard project={project} locale={locale} />
                </div>
              ))}
            </div>
          </WorkDeckReveal>
        )
      ) : null}

      {production.length === 0 && drafts.length > 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {t("noProductionMatches", { count: drafts.length })}
        </p>
      ) : null}

      {drafts.length > 0 ? (
        <details className="mt-12 group rounded-lg border border-dashed border-border bg-muted/20">
          <summary
            className={cn(
              "flex cursor-pointer items-center justify-between gap-3 p-5 font-medium text-foreground",
              FOCUS_RING,
            )}
          >
            <span className="flex items-center gap-3">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                {t("draftsHeading")}
              </span>
              <span className="text-sm text-muted-foreground">
                {t("draftsCount", { count: drafts.length })}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-(--motion-fast) ease-(--ease-premium) group-open:rotate-180"
            />
          </summary>
          <div className="border-t p-5">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {drafts.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </details>
      ) : null}
    </>
  );
}
