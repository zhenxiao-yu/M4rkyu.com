"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Project } from "@/content/schemas";

export const FILTERS: { labelKey: string; value: Project["category"] | null }[] =
  [
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

export const ALL_YEARS = "__all__";
export const SORT_MODES = ["newest", "oldest", "alpha"] as const;
export type SortMode = (typeof SORT_MODES)[number];
export const DEFAULT_SORT: SortMode = "newest";

// GRID = the mission-dossier card deck (cover-led browsing). INDEX = the
// numbered accession-register ledger (data-led scanning). STRIP = the
// draggable depth film-strip (cinematic horizontal browse). Persisted to the
// URL like every other view setting so a shared link restores it.
export const VIEW_MODES = ["grid", "index", "strip"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];
const DEFAULT_VIEW: ViewMode = "grid";

export function useWorkFilters(projects: Project[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

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

  return {
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
  };
}
