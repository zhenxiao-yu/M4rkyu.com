"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BlogToolbar } from "@/components/blog/blog-toolbar";
import { useViewMode } from "@/components/blog/use-view-mode";
import { PostListItem } from "@/components/cards/post-list-item";
import { PostCard } from "@/components/cards/post-card";
import type { Post } from "@/content/schemas";

interface BlogTimelineProps {
  posts: Post[];
}

/**
 * Client wrapper around the `/logs` timeline. Owns:
 *
 * - URL-synced filter state (`?q=` + `?tag=`).
 * - Substring search over `title + excerpt + tags`.
 *
 * All filtered posts render at once. The previous IntersectionObserver
 * batched-paging approach grew the document height as the user scrolled,
 * which made the scrollbar handle deceptive — the user would scroll to
 * what looked like the end, only for more cards to load below them.
 * Stable layout > marginal initial-render savings for ~50-post archives.
 */
export function BlogTimeline({ posts }: BlogTimelineProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("Blog");
  const [viewMode, setViewMode] = useViewMode();

  // Rank tags by frequency so the toolbar's top-N slot picks the
  // ones that actually filter useful slices of the archive.
  const rankedTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [posts]);

  const knownTags = useMemo(
    () => new Set(rankedTags.map((entry) => entry.tag)),
    [rankedTags],
  );

  const tagParam = searchParams.get("tag");
  const activeTag = tagParam && knownTags.has(tagParam) ? tagParam : null;
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  function updateUrl(next: { tag?: string | null; q?: string }) {
    const params = new URLSearchParams(searchParams);
    if ("tag" in next) {
      if (next.tag) params.set("tag", next.tag);
      else params.delete("tag");
    }
    if ("q" in next) {
      const value = next.q?.trim();
      if (value) params.set("q", value);
      else params.delete("q");
    }
    startTransition(() => {
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    });
  }

  function setTag(tag: string | null) {
    updateUrl({ tag });
  }

  function setQ(value: string) {
    setQuery(value);
    updateUrl({ q: value });
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeTag && !post.tags.includes(activeTag)) return false;
      if (!normalized) return true;
      const hay = [post.title, post.excerpt, post.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return hay.includes(normalized);
    });
  }, [posts, activeTag, query]);

  return (
    <>
      <BlogToolbar
        query={query}
        onQueryChange={setQ}
        rankedTags={rankedTags}
        activeTag={activeTag}
        onTagChange={setTag}
        filteredCount={filtered.length}
        totalCount={posts.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filtered.length === 0 ? (
        <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
          {t("noMatches")}
        </p>
      ) : (
        <>
          {viewMode === "grid" ? (
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((post, i) => (
                <li key={post.slug} className="h-full">
                  {/* First two cards above the fold get priority cover
                      preloads; the rest fall back to next/image's
                      default lazy-loading. */}
                  <PostCard post={post} priority={i < 2} />
                </li>
              ))}
            </ol>
          ) : (
            <ol className="mt-8 grid gap-1 divide-y divide-border/60">
              {filtered.map((post) => (
                <li key={post.slug}>
                  <PostListItem post={post} />
                </li>
              ))}
            </ol>
          )}
          <p className="mt-8 text-center font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
            {t("endOfResults", { count: filtered.length })}
          </p>
        </>
      )}
    </>
  );
}

