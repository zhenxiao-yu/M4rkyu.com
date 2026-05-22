"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * Headless client-side pagination. Slices a (memoised) array into pages
 * and resets to page 1 whenever the list size changes — so a filter that
 * narrows results never strands the viewer on an empty page. Pair the
 * returned `page` / `pageCount` / `setPage` with <Pagination/>.
 *
 * Keeps host pages statically renderable: all data is already in the
 * RSC payload, the slice happens in the browser. No request cookies, no
 * search-param round-trips.
 */
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const [trackedLength, setTrackedLength] = useState(items.length);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 when the list size changes (e.g. a filter narrows
  // results) so the viewer never lands on a stale or empty page. Done
  // during render per React's "adjusting state on prop change" guidance
  // — no effect, so no cascading-render lint trip.
  if (trackedLength !== items.length) {
    setTrackedLength(items.length);
    setPage(1);
  }

  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { page: safePage, setPage, pageCount, pageItems };
}

// Compact page list with ellipses: always show first + last, plus the
// current page and its immediate neighbours. Small page counts (<= 7)
// list every page.
function pageRange(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const left = Math.max(2, page - 1);
  const right = Math.min(pageCount - 1, page + 1);
  const range: (number | "gap")[] = [1];
  if (left > 2) range.push("gap");
  for (let i = left; i <= right; i += 1) range.push(i);
  if (right < pageCount - 1) range.push("gap");
  range.push(pageCount);
  return range;
}

interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Accessible pager control. Renders nothing for a single page, so it's
 * safe to mount on short lists that may grow later. Token-styled; the
 * current page is marked `aria-current="page"`.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: PaginationProps) {
  const t = useTranslations("Pagination");
  if (pageCount <= 1) return null;

  const cell =
    "inline-flex size-9 items-center justify-center rounded-md font-mono text-xs tabular-nums transition-colors duration-(--motion-fast) ease-(--ease-premium)";
  const ghost =
    "text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label={t("label")}
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label={t("previous")}
        className={cn(cell, ghost, FOCUS_RING)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>

      {pageRange(page, pageCount).map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className={cn(cell, "text-muted-foreground/50")}
          >
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-label={t("goToPage", { page: entry })}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              cell,
              entry === page
                ? "bg-foreground text-background"
                : ghost,
              FOCUS_RING,
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label={t("next")}
        className={cn(cell, ghost, FOCUS_RING)}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
