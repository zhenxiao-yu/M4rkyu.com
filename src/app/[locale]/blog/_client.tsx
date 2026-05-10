"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BlogToolbar } from "@/components/blog/blog-toolbar";
import { PostListItem } from "@/components/cards/post-list-item";
import type { Post } from "@/content/schemas";

interface BlogTimelineProps {
  posts: Post[];
}

const PAGE_SIZE = 10;

/**
 * Client wrapper around the `/blog` timeline. Owns:
 *
 * - URL-synced filter state (`?q=` + `?tag=`).
 * - Substring search over `title + excerpt + tags`.
 * - Batched render (`PAGE_SIZE` rows at a time) gated by an
 *   `IntersectionObserver` sentinel so the DOM never holds all
 *   ~50 posts at once on first paint.
 */
export function BlogTimeline({ posts }: BlogTimelineProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("Blog");

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

  // --- Batched render via IntersectionObserver ---------------------
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Reset the window when the filter signature changes so the user
  // doesn't end up with `visible > filtered.length` for the new slice.
  // The "setState during render" pattern documented at
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  // — cheaper than an effect + no cascading render warning.
  const filterSig = `${activeTag ?? ""}::${query}`;
  const [trackedSig, setTrackedSig] = useState(filterSig);
  if (trackedSig !== filterSig) {
    setTrackedSig(filterSig);
    setVisible(PAGE_SIZE);
  }

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visible >= filtered.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
            break;
          }
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, filtered.length]);

  const slice = filtered.slice(0, visible);
  const exhausted = visible >= filtered.length;

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
      />

      {filtered.length === 0 ? (
        <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
          {t("noMatches")}
        </p>
      ) : (
        <>
          <ol className="mt-8 grid gap-1 divide-y divide-border/60">
            {slice.map((post) => (
              <li key={post.slug}>
                <PostListItem post={post} />
              </li>
            ))}
          </ol>
          {exhausted ? (
            <p className="mt-8 text-center font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
              {t("endOfResults", { count: filtered.length })}
            </p>
          ) : (
            <div
              ref={sentinelRef}
              aria-hidden="true"
              className="mt-8 h-px w-full"
            />
          )}
        </>
      )}
    </>
  );
}
