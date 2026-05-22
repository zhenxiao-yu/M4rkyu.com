"use client";

import { Children, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginatedProps {
  /**
   * The full list of already-rendered items (e.g. server-rendered
   * cards). They live in the RSC payload; only the current page mounts.
   */
  children: ReactNode;
  pageSize: number;
  /** Class applied to the grid/list wrapper holding the current page. */
  className?: string;
}

/**
 * Drops a page slice of `children` into a grid + an accessible pager,
 * for server-rendered lists that want client-side pagination without
 * giving up static rendering. Page changes scroll the list back into
 * view (instant under reduced-motion).
 */
export function Paginated({ children, pageSize, className }: PaginatedProps) {
  const items = Children.toArray(children);
  const { page, setPage, pageCount, pageItems } = usePagination(
    items,
    pageSize,
  );
  const reduceMotion = useReducedMotion();
  const anchorRef = useRef<HTMLDivElement>(null);

  function goto(next: number) {
    setPage(next);
    anchorRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div>
      <div ref={anchorRef} className={cn("scroll-mt-24", className)}>
        {pageItems}
      </div>
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={goto}
        className="mt-10"
      />
    </div>
  );
}
