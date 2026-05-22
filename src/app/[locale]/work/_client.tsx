"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, FilterX, Search, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/cards/project-card";
import { Badge } from "@/components/ui/badge";
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

  function updateUrl(next: {
    category?: Project["category"] | null;
    year?: string | null;
    q?: string;
    featured?: boolean;
    sort?: SortMode;
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

  // Debounce the URL sync so router.replace doesn't fire per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {FILTERS.map(({ labelKey, value }) => {
            const active = activeCategory === value;
            return (
              <Button
                key={labelKey}
                onClick={() => updateUrl({ category: value })}
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto rounded-full p-0 hover:bg-transparent focus-visible:ring-offset-1"
                aria-pressed={active}
              >
                <Badge
                  variant={active ? "success" : "outline"}
                  className={cn(
                    "cursor-pointer transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
                    !active &&
                      "hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {value === null ? t("filterAll") : tCategories(value)}
                </Badge>
              </Button>
            );
          })}
          <Button
            type="button"
            onClick={() => updateUrl({ featured: !featuredOnly })}
            variant="ghost"
            size="sm"
            className="h-auto rounded-full p-0 hover:bg-transparent focus-visible:ring-offset-1"
            aria-pressed={featuredOnly}
          >
            <Badge
              variant={featuredOnly ? "success" : "outline"}
              className={cn(
                "cursor-pointer gap-1 transition-[color,border-color,background-color] duration-(--motion-fast) ease-(--ease-premium)",
                !featuredOnly &&
                  "hover:border-foreground/40 hover:text-foreground",
              )}
            >
              <Star
                aria-hidden="true"
                className={cn("size-3", featuredOnly && "fill-current")}
              />
              {t("featuredOn")}
            </Badge>
          </Button>
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {filtered.length} / {projects.length}
          </span>
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-[8rem_8rem_minmax(0,1fr)]">
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
      </div>

      {hasActiveFilters ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
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
