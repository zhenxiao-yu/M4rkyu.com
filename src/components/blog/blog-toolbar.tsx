"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TagEntry {
  tag: string;
  count: number;
}

interface BlogToolbarProps {
  /** Query string controlled by the parent (URL-synced). */
  query: string;
  /** Setter — receives the raw input value. */
  onQueryChange: (value: string) => void;
  /** All known tags ordered by frequency (most-used first). */
  rankedTags: TagEntry[];
  /** Currently active tag, or `null` for "All". */
  activeTag: string | null;
  /** Setter — `null` clears the filter. */
  onTagChange: (tag: string | null) => void;
  /** Visible-count display: "n / total". */
  filteredCount: number;
  totalCount: number;
}

const TOP_N = 6;

/**
 * Search + tag filter strip for /blog. Top-`TOP_N` tags render
 * inline as Badge buttons; the remainder collapse behind a "More"
 * dropdown that dismisses on click-outside and Escape. URL state is
 * owned by the parent (`BlogTimeline`) so reload restores both
 * `?q=` and `?tag=`.
 */
export function BlogToolbar({
  query,
  onQueryChange,
  rankedTags,
  activeTag,
  onTagChange,
  filteredCount,
  totalCount,
}: BlogToolbarProps) {
  const t = useTranslations("Blog");
  const searchId = useId();
  const moreId = useId();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const topTags = rankedTags.slice(0, TOP_N);
  const restTags = rankedTags.slice(TOP_N);
  const activeInRest =
    activeTag !== null && restTags.some((entry) => entry.tag === activeTag);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointer(event: MouseEvent | TouchEvent) {
      if (!moreRef.current) return;
      if (!moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent"
          aria-pressed={activeTag === null}
          onClick={() => onTagChange(null)}
        >
          <Badge
            variant={activeTag === null ? "success" : "outline"}
            className="cursor-pointer transition-colors"
          >
            {t("tagAll")}
          </Badge>
        </Button>
        {topTags.map(({ tag }) => (
          <Button
            key={tag}
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            aria-pressed={activeTag === tag}
            onClick={() => onTagChange(tag)}
          >
            <Badge
              variant={activeTag === tag ? "success" : "outline"}
              className="cursor-pointer transition-colors"
            >
              {tag}
            </Badge>
          </Button>
        ))}
        {restTags.length > 0 ? (
          <div ref={moreRef} className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              aria-expanded={moreOpen}
              aria-controls={moreId}
              aria-label={t("tagMoreOpen")}
              onClick={() => setMoreOpen((value) => !value)}
            >
              <Badge
                variant={activeInRest ? "success" : "outline"}
                className="cursor-pointer transition-colors"
              >
                {t("tagMore")} +{restTags.length}
              </Badge>
            </Button>
            {moreOpen ? (
              <div
                id={moreId}
                role="group"
                className="absolute left-0 top-full z-20 mt-2 flex max-h-72 w-64 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-border bg-popover p-3 shadow-md"
              >
                {restTags.map(({ tag, count }) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    aria-pressed={activeTag === tag}
                    onClick={() => {
                      onTagChange(tag);
                      setMoreOpen(false);
                    }}
                  >
                    <Badge
                      variant={activeTag === tag ? "success" : "outline"}
                      className="cursor-pointer gap-1.5 transition-colors"
                    >
                      <span>{tag}</span>
                      <span className="font-mono text-[0.55rem] text-muted-foreground">
                        {count}
                      </span>
                    </Badge>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          {filteredCount} / {totalCount}
        </span>
      </div>

      <label htmlFor={searchId} className="block">
        <span className="sr-only">{t("searchLabel")}</span>
        <span className="relative block lg:w-72">
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
            className="pl-9 pr-9"
          />
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Clear search"
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2 rounded-sm p-0 hover:bg-muted"
              onClick={() => onQueryChange("")}
            >
              <X aria-hidden="true" className="size-3.5" />
            </Button>
          ) : null}
        </span>
      </label>
    </div>
  );
}
