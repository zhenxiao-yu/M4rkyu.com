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
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { BlogResults } from "@/components/blog/blog-results";
import { BlogToolbar } from "@/components/blog/blog-toolbar";
import { useViewMode } from "@/components/blog/use-view-mode";
import type { BlogSortMode } from "@/content/blog-page";
import type { Post } from "@/content/schemas";
import {
  DEFAULT_BLOG_SORT,
  countValues,
  filterAndSortPosts,
  isBlogSortMode,
  sanitizeBlogQuery,
  type BlogFilterState,
} from "@/lib/blog/filter-posts";

interface BlogTimelineProps {
  posts: Post[];
}

// Archive timeline page size. Featured posts live in the rotator above,
// so this paginates only the long-tail archive.
const ARCHIVE_PAGE_SIZE = 9;

/**
 * Client wrapper around the `/logs` timeline. Data stays server-loaded;
 * this island owns only URL-synced filtering, sorting, and view state.
 */
export function BlogTimeline({ posts }: BlogTimelineProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Blog");
  const [viewMode, setViewMode] = useViewMode();

  const rankedTags = useMemo(
    () => countValues(posts.flatMap((post) => post.tags)),
    [posts],
  );
  const categories = useMemo(
    () => countValues(posts.map((post) => post.category)),
    [posts],
  );
  const knownTags = useMemo(
    () => new Set(rankedTags.map((entry) => entry.value)),
    [rankedTags],
  );
  const knownCategories = useMemo(
    () => new Set(categories.map((entry) => entry.value)),
    [categories],
  );

  const tagParam = searchParams.get("tag");
  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");
  const queryParam = sanitizeBlogQuery(searchParams.get("q") ?? "");

  const activeTag = tagParam && knownTags.has(tagParam) ? tagParam : null;
  const activeCategory =
    categoryParam && knownCategories.has(categoryParam) ? categoryParam : null;
  const sortMode = isBlogSortMode(sortParam) ? sortParam : DEFAULT_BLOG_SORT;
  const [query, setQueryState] = useState(queryParam);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    function syncQueryFromHistory() {
      const params = new URLSearchParams(window.location.search);
      setQueryState(sanitizeBlogQuery(params.get("q") ?? ""));
    }

    window.addEventListener("popstate", syncQueryFromHistory);
    return () => {
      window.removeEventListener("popstate", syncQueryFromHistory);
    };
  }, []);

  function updateUrl(next: {
    tag?: string | null;
    category?: string | null;
    q?: string;
    sort?: BlogSortMode;
  }) {
    const params = new URLSearchParams(window.location.search);

    if ("tag" in next) {
      if (next.tag) params.set("tag", next.tag);
      else params.delete("tag");
    }
    if ("category" in next) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    if ("q" in next) {
      const value = sanitizeBlogQuery(next.q ?? "").trim();
      if (value) params.set("q", value);
      else params.delete("q");
    }
    if ("sort" in next) {
      if (next.sort && next.sort !== DEFAULT_BLOG_SORT) {
        params.set("sort", next.sort);
      } else {
        params.delete("sort");
      }
    }

    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }

  function setQuery(value: string) {
    const next = sanitizeBlogQuery(value);
    setQueryState(next);
    updateUrl({ q: next });
  }

  function clearFilters() {
    setQueryState("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  const filters = useMemo<BlogFilterState>(
    () => ({
      query: deferredQuery,
      activeTag,
      activeCategory,
      sortMode,
    }),
    [deferredQuery, activeTag, activeCategory, sortMode],
  );
  const filtered = useMemo(
    () => filterAndSortPosts(posts, filters),
    [posts, filters],
  );
  const {
    page,
    setPage,
    pageCount,
    pageItems: pagedPosts,
  } = usePagination(filtered, ARCHIVE_PAGE_SIZE);
  const reduceMotion = useReducedMotion();
  const resultsRef = useRef<HTMLDivElement>(null);

  function goToPage(next: number) {
    setPage(next);
    resultsRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  const hasActiveFilters =
    Boolean(query.trim()) ||
    activeTag !== null ||
    activeCategory !== null ||
    sortMode !== DEFAULT_BLOG_SORT;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
            {t("allPostsHeading")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
            {t("allPostsDescription")}
          </p>
        </div>
      </div>

      <BlogToolbar
        query={query}
        onQueryChange={setQuery}
        rankedTags={rankedTags}
        categories={categories}
        activeTag={activeTag}
        onTagChange={(tag) => updateUrl({ tag })}
        activeCategory={activeCategory}
        onCategoryChange={(category) => updateUrl({ category })}
        sortMode={sortMode}
        onSortModeChange={(sort) => updateUrl({ sort })}
        filteredCount={filtered.length}
        totalCount={posts.length}
        isPending={isPending || deferredQuery !== query}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div ref={resultsRef} className="scroll-mt-24">
        <BlogResults
          posts={pagedPosts}
          viewMode={viewMode}
          onClearFilters={clearFilters}
        />
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={goToPage}
        className="mt-4"
      />
    </div>
  );
}
