"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const FILTERS: { labelKey: string; value: Project["category"] | null }[] = [
  { labelKey: "all", value: null },
  { labelKey: "web-app", value: "web-app" },
  { labelKey: "game-dev", value: "game-dev" },
  { labelKey: "ai-tool", value: "ai-tool" },
  { labelKey: "art-film", value: "art-film" },
  { labelKey: "experiment", value: "experiment" },
];

const CATEGORY_VALUES = new Set(
  FILTERS.map((filter) => filter.value).filter(
    Boolean,
  ) as Project["category"][],
);

const ALL_YEARS = "__all__";
const SORT_MODES = ["newest", "oldest", "alpha"] as const;
type SortMode = (typeof SORT_MODES)[number];
const DEFAULT_SORT: SortMode = "newest";

// GRID = the mission-dossier card deck (cover-led browsing). INDEX = the
// numbered accession-register ledger (data-led scanning). Persisted to
// the URL like every other view setting so a shared link restores it.
const VIEW_MODES = ["grid", "index"] as const;
type ViewMode = (typeof VIEW_MODES)[number];
const DEFAULT_VIEW: ViewMode = "grid";

export function ProjectsClient({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("Projects");
  const tCategories = useTranslations("Categories");

  const categoryParam = searchParams.get("category");
  const activeCategory = CATEGORY_VALUES.has(
    categoryParam as Project["category"],
  )
    ? (categoryParam as Project["category"])
    : null;
  const yearParam = searchParams.get("year");
  const featuredOnly = searchParams.get("featured") === "true";
  const sortParam = searchParams.get("sort") as SortMode | null;
  const activeSort: SortMode = SORT_MODES.includes(sortParam as SortMode)
    ? (sortParam as SortMode)
    : DEFAULT_SORT;
  const viewParam = searchParams.get("view") as ViewMode | null;
  const activeView: ViewMode = VIEW_MODES.includes(viewParam as ViewMode)
    ? (viewParam as ViewMode)
    : DEFAULT_VIEW;
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  // Filter against the deferred value so typing fast doesn't re-run
  // the full project filter + re-mount cards on every keystroke.
  const deferredQuery = useDeferredValue(query);

  // Year counts memoized once per project list — used both as the year
  // dropdown badges and as the active-chip label suffix.
  const yearCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const project of projects) {
      map.set(project.year, (map.get(project.year) ?? 0) + 1);
    }
    return map;
  }, [projects]);

  const yearOptions = useMemo(
    () => Array.from(yearCounts.keys()).sort((a, b) => b.localeCompare(a)),
    [yearCounts],
  );
  const activeYear = yearOptions.includes(yearParam ?? "")
    ? (yearParam as string)
    : ALL_YEARS;

  // Per-facet counts (global, like yearCounts) — surfaced on each tag chip
  // so the taxonomy reads as a populated index. Empty categories still show
  // (taxonomy is real) but render disabled rather than as dead clicks.
  const categoryCounts = useMemo(() => {
    const map = new Map<Project["category"], number>();
    for (const project of projects) {
      map.set(project.category, (map.get(project.category) ?? 0) + 1);
    }
    return map;
  }, [projects]);
  const featuredCount = useMemo(
    () => projects.filter((project) => project.featured).length,
    [projects],
  );

  function updateUrl(next: {
    category?: Project["category"] | null;
    year?: string | null;
    q?: string;
    featured?: boolean;
    sort?: SortMode;
    view?: ViewMode;
  }) {
    const params = new URLSearchParams(searchParams);
    if ("category" in next) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    if ("year" in next) {
      if (next.year && next.year !== ALL_YEARS) params.set("year", next.year);
      else params.delete("year");
    }
    if ("q" in next) {
      const value = next.q?.trim();
      if (value) params.set("q", value);
      else params.delete("q");
    }
    if ("featured" in next) {
      if (next.featured) params.set("featured", "true");
      else params.delete("featured");
    }
    if ("sort" in next) {
      if (next.sort && next.sort !== DEFAULT_SORT)
        params.set("sort", next.sort);
      else params.delete("sort");
    }
    if ("view" in next) {
      if (next.view && next.view !== DEFAULT_VIEW)
        params.set("view", next.view);
      else params.delete("view");
    }
    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }

  const filtered = useMemo(() => {
    let result = projects;
    if (activeCategory !== null) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (activeYear !== ALL_YEARS) {
      result = result.filter((p) => p.year === activeYear);
    }
    if (featuredOnly) {
      result = result.filter((p) => p.featured);
    }
    if (deferredQuery.trim()) {
      const q = deferredQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortPitch.toLowerCase().includes(q) ||
          p.stack.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (activeSort === "alpha") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      const direction = activeSort === "newest" ? -1 : 1;
      result = [...result].sort(
        (a, b) => a.year.localeCompare(b.year) * direction,
      );
    }
    return result;
  }, [
    projects,
    activeCategory,
    activeYear,
    featuredOnly,
    deferredQuery,
    activeSort,
  ]);

  // Always-current params, reachable from the debounced timer without
  // putting `searchParams` in its deps (which would re-arm the debounce).
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Debounce the URL sync so router.replace doesn't fire per keystroke.
  // Build from the live searchParams (not window.location, which could be
  // a stale snapshot from before a facet change landed mid-debounce and
  // would clobber it).
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParamsRef.current.toString());
      const trimmed = query.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      startTransition(() => {
        const nextQuery = params.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
      });
    }, 250);
    return () => clearTimeout(id);
  }, [query, pathname, router]);

  const production = useMemo(
    () => filtered.filter((p) => p.contentStatus === "ready"),
    [filtered],
  );
  const drafts = useMemo(
    () => filtered.filter((p) => p.contentStatus !== "ready"),
    [filtered],
  );

  // True when the user has narrowed from the default view — drives the
  // active-chip row visibility and the inline / empty-state Clear CTAs.
  const hasActiveFilters =
    activeCategory !== null ||
    activeYear !== ALL_YEARS ||
    featuredOnly ||
    query.trim() !== "" ||
    activeSort !== DEFAULT_SORT;

  function clearAllFilters() {
    setQuery("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

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

function ActiveChip({
  label,
  onRemove,
  removeLabel,
}: {
  label: string;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/80 py-0.5 pl-2.5 pr-1 text-xs text-foreground">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${label}`}
        className={cn(
          "-mr-0.5 grid size-7 place-items-center rounded-full text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted hover:text-foreground",
          FOCUS_RING_INSET,
        )}
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
  );
}

// Console "register" facet — a monospace tag with its global count. Active
// fills solid (monochrome, so the single --ring accent stays reserved);
// empty categories render disabled rather than as dead clicks.
function FacetChip({
  label,
  count,
  active,
  disabled = false,
  onClick,
  icon,
}: {
  label: string;
  count?: number;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
        FOCUS_RING,
        disabled
          ? "cursor-not-allowed border-dashed border-border/60 text-muted-foreground/35"
          : active
            ? "border-foreground bg-foreground text-background"
            : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {icon}
      <span>{label}</span>
      {typeof count === "number" ? (
        <span
          className={cn(
            "tabular-nums",
            disabled
              ? "text-muted-foreground/35"
              : active
                ? "text-background/55"
                : "text-muted-foreground/50",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
